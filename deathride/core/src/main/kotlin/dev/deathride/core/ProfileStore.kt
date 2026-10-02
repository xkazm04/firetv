package dev.deathride.core

import java.io.File
import java.io.FileOutputStream
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.nio.file.AtomicMoveNotSupportedException
import java.util.zip.CRC32

/** Versioned human-readable save. No wall clock/randomness; never called from World.step. */
object ProfileCodec {
    private const val HEADER="DEATHRIDE_PROFILE 5"
    private fun checksum(body: String)=CRC32().apply { update(body.toByteArray(Charsets.UTF_8)) }.value.toString(16)
    fun encode(p: Profile): String {
        val body="$HEADER\ncampaign=${p.campaign.encode()}\nid=${p.id}\ncredits=${p.credits}\ncar=${CarCatalog.all[p.selectedCar].id}\nstarted=${p.startedRaces}\nsettled=${p.settledRace}\nraces=${p.races}\nwins=${p.wins}\ntiers=${p.tiers.joinToString(",")}\nreceipt=${p.lastReceipt?.encode()?:"none"}\ncareer=${p.careerRound},${p.careerCleared},${p.careerPoints},${p.careerSeasons},${p.careerDifficulty}\ntrophies=${p.careerTrophies.joinToString(",")}\nowned=${p.owned.joinToString(","){if(it)"1" else "0"}}\ncondition=${p.condition.joinToString(",")}\nmarket=${p.inventory},${p.raceItems},${p.debt},${p.winStreak},${p.contract},${p.contractWins},${p.lastBonus},${p.lastDebtPayment},${if(p.manualService)1 else 0},${p.marketRevision}\nash=${p.legacyCarryPoints},${p.rivalPreparedSerial},${p.rivalSettledTicket}\ngrudges=${p.grudges.joinToString(",")}\nrivals=${if(p.rivalProfiles.isEmpty())"none" else p.rivalProfiles.joinToString(";"){java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(encode(it).toByteArray(Charsets.UTF_8))}}\n"
        return body+"checksum=${checksum(body)}\n"
    }
    fun decode(text: String,expectedId: String,withRivals: Boolean=true): Profile {
        require(validProfileId(expectedId) && text.toByteArray(Charsets.UTF_8).size<=EconomyRules["saveMaxBytes"])
        val versionFour=text.startsWith("DEATHRIDE_PROFILE 4\n")
        val versionThree=text.startsWith("DEATHRIDE_PROFILE 3\n")
        val legacy=text.startsWith("DEATHRIDE_PROFILE 1\n")
        val versionTwo=text.startsWith("DEATHRIDE_PROFILE 2\n")
        require((legacy || versionTwo || versionThree || versionFour || text.startsWith(HEADER+"\n")) && text.endsWith("\n")) { "Unsupported or truncated save" }
        val split=text.lastIndexOf("checksum=");require(split>0)
        val body=text.substring(0,split);require(text.substring(split).trim()=="checksum=${checksum(body)}") { "Save checksum mismatch" }
        val rows=body.lines().drop(1).filter{it.isNotBlank()}.map { it.split('=',limit=2).also { cells->require(cells.size==2) } }
        require(rows.map{it[0]}.distinct().size==rows.size)
        val fields=rows.associate { it[0] to it[1] }
        val keys=setOf("id","credits","car","started","settled","races","wins","tiers","receipt")
        require(fields.keys==if(legacy)keys else if(versionTwo)keys+setOf("career","trophies") else if(versionThree)keys+setOf("career","trophies","owned","condition","market") else keys+setOf("career","trophies","owned","condition","market","ash","grudges","rivals")+(if(versionFour)emptySet() else setOf("campaign")))
        require(fields.getValue("id")==expectedId)
        val p=Profile(expectedId,withRivals)
        p.credits=fields.getValue("credits").toInt();require(p.credits in 0..EconomyRules["creditCap"].toInt())
        p.selectedCar=CarCatalog.all.indexOfFirst { it.id==fields.getValue("car") };require(p.selectedCar>=0)
        p.startedRaces=fields.getValue("started").toLong();p.settledRace=fields.getValue("settled").toLong()
        require(p.startedRaces in 0..EconomyRules["profileRaceLimit"].toLong() && p.settledRace in 0..p.startedRaces)
        p.races=fields.getValue("races").toInt();p.wins=fields.getValue("wins").toInt();require(p.races.toLong() in 0..p.settledRace && p.wins in 0..p.races)
        val tiers=fields.getValue("tiers").split(',').map{it.toInt()};require(tiers.size==p.tiers.size || tiers.size==5*Parts.all.size) // Phase 1 positional prefix is append-only.
        for(i in tiers.indices){require(tiers[i] in 0..Parts.all[i%Parts.all.size].maxTier);p.tiers[i]=tiers[i]}
        if(!legacy) {
            val c=fields.getValue("career").split(',').map{it.toInt()};require(c.size==5)
            if(versionTwo || versionThree)require(c[0] in 0..11 && c[1] in c[0]..12 && c[2] in 0..30)
            p.careerRound=if(versionTwo || versionThree)c[0]*Career.events.size/12 else c[0]
            p.careerCleared=if(versionTwo || versionThree)c[1]*Career.events.size/12 else c[1]
            p.careerPoints=c[2];p.careerSeasons=c[3];p.careerDifficulty=c[4]
            if(versionTwo || versionThree)p.legacyCarryPoints=c[2]
            else { val ash=fields.getValue("ash").split(',').map{it.toLong()};require(ash.size==3 && ash[0] in 0..30 && ash[1] in -1..Int.MAX_VALUE.toLong() && ash[2] in 0..p.startedRaces);p.legacyCarryPoints=ash[0].toInt();p.rivalPreparedSerial=ash[1].toInt();p.rivalSettledTicket=ash[2] }
            require(p.careerRound in Career.events.indices && p.careerCleared in p.careerRound..Career.events.size && p.careerDifficulty in Career.difficulties.indices)
            require(p.careerSeasons in 0..EconomyRules["profileRaceLimit"].toInt() && (p.careerSeasons==0 || p.careerCleared==Career.events.size))
            val cup=Career.events[p.careerRound].cupIndex
            val priorRounds=Career.events.take(p.careerRound).count{it.cupIndex==cup}
            require(p.careerPoints in 0..(priorRounds*Career.points.max()+p.legacyCarryPoints))
            val trophies=fields.getValue("trophies").split(',').map{it.toInt()};require(trophies.size==(if(versionTwo || versionThree)4 else p.careerTrophies.size) && trophies.all{it in 0..3})
            for(i in trophies.indices)p.careerTrophies[if(versionTwo || versionThree)intArrayOf(0,1,3,4)[i] else i]=trophies[i]
        }
        if(legacy || versionTwo) {
            p.debt=0
            val oldCleared=if(legacy)0 else fields.getValue("career").split(',')[1].toInt()
            val earned=Content.table("legacy-unlocks").filter{it.getValue("kind")=="car" && it.number("afterRounds")<=oldCleared}.map{it.getValue("id")}.toSet()
            for(i in p.owned.indices)p.owned[i]=i==p.selectedCar || CarCatalog.all[i].id in earned || Parts.all.indices.any{p.tier(i,it)>0}
        } else {
            val owned=fields.getValue("owned").split(',').map{it.toInt()};require(owned.size==p.owned.size && owned.all{it in 0..1} && owned.any{it==1})
            val condition=fields.getValue("condition").split(',').map{it.toInt()};require(condition.size==p.condition.size && condition.all{it in 0..100})
            for(i in owned.indices){p.owned[i]=owned[i]==1;p.condition[i]=condition[i]}
            val m=fields.getValue("market").split(',').map{it.toLong()};require(m.size==10)
            require(m[0] in 0..15 && m[1] in 0..15 && Integer.bitCount(m[0].toInt())<=3 && Integer.bitCount(m[1].toInt())<=3 && m[2] in 0..MarketRules["debtCap"].toLong())
            require(m[3] in 0..p.races.toLong() && m[4] in -1 until Contracts.all.size.toLong() && m[5] in 0..p.races.toLong())
            require(m[6] in 0..EconomyRules["creditCap"].toLong() && m[7] in 0..MarketRules["debtCap"].toLong() && m[8] in 0..1 && m[9] in 0 until Long.MAX_VALUE)
            p.inventory=m[0].toInt();p.raceItems=m[1].toInt();p.debt=m[2].toInt();p.winStreak=m[3].toInt();p.contract=m[4].toInt();p.contractWins=m[5].toInt()
            p.lastBonus=m[6].toInt();p.lastDebtPayment=m[7].toInt();p.manualService=m[8]==1L;p.marketRevision=m[9]
        }
        if((versionTwo || versionThree) && withRivals) {
            // New NPC garages have no old race ledger. Fund a declared division snapshot, not invented wins.
            val grant=Career.events[p.careerRound].cupIndex*AshRules["legacyRivalCreditsPerAct"].toInt()
            for(npc in p.rivalProfiles)npc.credits=minOf(EconomyRules["creditCap"].toInt(),npc.credits+grant)
            if(p.careerSeasons>0 && p.owned.indices.none{p.owned[it] && CarCatalog.all[it].tierRank==0}) {
                val starter=EconomyRules["startingCarIndex"].toInt();p.owned[starter]=true;p.condition[starter]=100
            }
        }
        if(!legacy && !versionTwo && !versionThree) {
            val grudges=fields.getValue("grudges").let{if(it.isEmpty())emptyList() else it.split(',').map{v->v.toInt()}}
            require(grudges.size==p.grudges.size && grudges.all{it in -1..1});for(i in grudges.indices)p.grudges[i]=grudges[i]
            val nested=fields.getValue("rivals")
            if(withRivals) {
                val records=nested.split(';');require(records.size==p.rivalProfiles.size)
                for(i in records.indices) {
                    val decoded=String(java.util.Base64.getUrlDecoder().decode(records[i]),Charsets.UTF_8)
                    p.rivalProfiles[i]=decode(decoded,"rival-${RivalEconomy.plans[i].id}",false)
                }
            } else require(nested=="none")
        }
        if(fields.getValue("receipt")!="none") {
            val r=fields.getValue("receipt").split(',');require(r.size==9)
            val numbers=r.drop(1).map { it.toInt() };require(numbers.all{it in 0..EconomyRules["creditCap"].toInt()})
            p.lastReceipt=Receipt(r[0].toLong(),numbers[0],numbers[1],numbers[2],numbers[3],numbers[4],numbers[5],numbers[6],numbers[7])
            val receipt=p.lastReceipt!!;require(receipt.race==p.settledRace && receipt.position in 1..Tuning.CAR_COUNT && receipt.kills in 0 until Tuning.CAR_COUNT)
            require(receipt.gross-receipt.repair==receipt.net && receipt.banked<=receipt.net)
        }
        if(legacy || versionTwo || versionThree || versionFour)Campaign.migrate(p) else p.campaign.decode(fields.getValue("campaign"))
        return p
    }
}
data class LoadedProfile(val profile: Profile,val status: String)
class ProfileStore(private val root: File) {
    private fun path(id: String,suffix: String="sav"): File {
        require(validProfileId(id));val file=File(root,"$id.$suffix")
        require(file.canonicalFile.parentFile==root.canonicalFile)
        return file
    }
    fun load(id: String): LoadedProfile {
        val main=path(id);val backup=path(id,"bak")
        if(!main.exists() && !backup.exists())return LoadedProfile(Profile(id),"New profile")
        if(main.exists())runCatching { ProfileCodec.decode(main.readText(),id) }.getOrNull()?.let { return LoadedProfile(it,"Saved") }
        if(backup.exists())runCatching { ProfileCodec.decode(backup.readText(),id) }.getOrNull()?.let { return LoadedProfile(it,"Recovered previous save") }
        error("Save damaged - persistence disabled")
    }
    fun save(profile: Profile) {
        check(root.isDirectory || root.mkdirs()) { "Profile folder unavailable" }
        val main=path(profile.id);val temporary=path(profile.id,"tmp");val backup=path(profile.id,"bak")
        val encoded=ProfileCodec.encode(profile)
        ProfileCodec.decode(encoded,profile.id) // Never replace a valid save with invalid state.
        FileOutputStream(temporary).use { it.write(encoded.toByteArray(Charsets.UTF_8));it.fd.sync() }
        if(main.exists()) {
            if(runCatching { ProfileCodec.decode(main.readText(),profile.id) }.isSuccess)main.copyTo(backup,overwrite=true)
            else { val corrupt=path(profile.id,"corrupt");if(!corrupt.exists())main.copyTo(corrupt) }
        }
        try { Files.move(temporary.toPath(),main.toPath(),StandardCopyOption.ATOMIC_MOVE,StandardCopyOption.REPLACE_EXISTING) }
        catch(_: AtomicMoveNotSupportedException) { Files.move(temporary.toPath(),main.toPath(),StandardCopyOption.REPLACE_EXISTING) }
    }
}
