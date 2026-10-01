package dev.deathride.core

import java.io.File
import java.io.FileOutputStream
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.nio.file.AtomicMoveNotSupportedException
import java.util.zip.CRC32

/** Versioned human-readable save. No wall clock/randomness; never called from World.step. */
object ProfileCodec {
    private const val HEADER="DEATHRIDE_PROFILE 2"
    private fun checksum(body: String)=CRC32().apply { update(body.toByteArray(Charsets.UTF_8)) }.value.toString(16)
    fun encode(p: Profile): String {
        val body="$HEADER\nid=${p.id}\ncredits=${p.credits}\ncar=${CarCatalog.all[p.selectedCar].id}\nstarted=${p.startedRaces}\nsettled=${p.settledRace}\nraces=${p.races}\nwins=${p.wins}\ntiers=${p.tiers.joinToString(",")}\nreceipt=${p.lastReceipt?.encode()?:"none"}\ncareer=${p.careerRound},${p.careerCleared},${p.careerPoints},${p.careerSeasons},${p.careerDifficulty}\ntrophies=${p.careerTrophies.joinToString(",")}\n"
        return body+"checksum=${checksum(body)}\n"
    }
    fun decode(text: String,expectedId: String): Profile {
        require(validProfileId(expectedId) && text.toByteArray(Charsets.UTF_8).size<=EconomyRules["saveMaxBytes"])
        val legacy=text.startsWith("DEATHRIDE_PROFILE 1\n")
        require((legacy || text.startsWith(HEADER+"\n")) && text.endsWith("\n")) { "Unsupported or truncated save" }
        val split=text.lastIndexOf("checksum=");require(split>0)
        val body=text.substring(0,split);require(text.substring(split).trim()=="checksum=${checksum(body)}") { "Save checksum mismatch" }
        val rows=body.lines().drop(1).filter{it.isNotBlank()}.map { it.split('=',limit=2).also { cells->require(cells.size==2) } }
        require(rows.map{it[0]}.distinct().size==rows.size)
        val fields=rows.associate { it[0] to it[1] }
        val keys=setOf("id","credits","car","started","settled","races","wins","tiers","receipt")
        require(fields.keys==if(legacy)keys else keys+setOf("career","trophies"))
        require(fields.getValue("id")==expectedId)
        val p=Profile(expectedId)
        p.credits=fields.getValue("credits").toInt();require(p.credits in 0..EconomyRules["creditCap"].toInt())
        p.selectedCar=CarCatalog.all.indexOfFirst { it.id==fields.getValue("car") };require(p.selectedCar>=0)
        p.startedRaces=fields.getValue("started").toLong();p.settledRace=fields.getValue("settled").toLong()
        require(p.startedRaces in 0..EconomyRules["profileRaceLimit"].toLong() && p.settledRace in 0..p.startedRaces)
        p.races=fields.getValue("races").toInt();p.wins=fields.getValue("wins").toInt();require(p.races.toLong() in 0..p.settledRace && p.wins in 0..p.races)
        val tiers=fields.getValue("tiers").split(',').map{it.toInt()};require(tiers.size==p.tiers.size || tiers.size==5*Parts.all.size) // Phase 1 positional prefix is append-only.
        for(i in tiers.indices){require(tiers[i] in 0..Parts.all[i%Parts.all.size].maxTier);p.tiers[i]=tiers[i]}
        if(!legacy) {
            val c=fields.getValue("career").split(',').map{it.toInt()};require(c.size==5)
            p.careerRound=c[0];p.careerCleared=c[1];p.careerPoints=c[2];p.careerSeasons=c[3];p.careerDifficulty=c[4]
            require(p.careerRound in Career.events.indices && p.careerCleared in p.careerRound..Career.events.size && p.careerDifficulty in Career.difficulties.indices)
            require(p.careerSeasons in 0..EconomyRules["profileRaceLimit"].toInt() && (p.careerSeasons==0 || p.careerCleared==Career.events.size))
            val cup=Career.events[p.careerRound].cupIndex
            val priorRounds=Career.events.take(p.careerRound).count{it.cupIndex==cup}
            require(p.careerPoints in 0..priorRounds*Career.points.max())
            val trophies=fields.getValue("trophies").split(',').map{it.toInt()};require(trophies.size==p.careerTrophies.size && trophies.all{it in 0..3})
            for(i in trophies.indices)p.careerTrophies[i]=trophies[i]
        }
        if(fields.getValue("receipt")!="none") {
            val r=fields.getValue("receipt").split(',');require(r.size==9)
            val numbers=r.drop(1).map { it.toInt() };require(numbers.all{it in 0..EconomyRules["creditCap"].toInt()})
            p.lastReceipt=Receipt(r[0].toLong(),numbers[0],numbers[1],numbers[2],numbers[3],numbers[4],numbers[5],numbers[6],numbers[7])
            val receipt=p.lastReceipt!!;require(receipt.race==p.settledRace && receipt.position in 1..Tuning.CAR_COUNT && receipt.kills in 0 until Tuning.CAR_COUNT)
            require(receipt.gross-receipt.repair==receipt.net && receipt.banked<=receipt.net)
        }
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
