package dev.deathride.core

import java.io.File
import java.util.concurrent.Executors
import java.util.zip.GZIPOutputStream
import kotlin.math.*

fun candidateQuantiles(values:List<Double>):Map<String,Any?> {
    val sorted=values.sorted();fun q(f:Double)=if(sorted.isEmpty())null else sorted[((sorted.size-1)*f).roundToInt()]
    return mapOf("n" to values.size,"min" to sorted.firstOrNull(),"p10" to q(.1),"p50" to q(.5),"p90" to q(.9),"max" to sorted.lastOrNull())
}
fun candidateProofDigest(c:Course,tier:Int,laps:Int)=TrackQuality.digest(TrackQuality.json(TrackLabCodec.csv(c))+"|${c.startFraction}|$tier|$laps|R3-proof-v3-route-projection")
fun main(args:Array<String>) {
    val seeds=args.firstOrNull()?.toInt()?:12;val filters=(args.getOrNull(1)?:"").split(',');val threads=args.getOrNull(2)?.toInt()?:4
    val folder=CandidateAuthor.folder;val rows=(TrackQuality.csv(File(folder,"manifest.csv").readText())+mapOf("candidate" to "switchback-4-runoff","slot" to "switchback-4")).filter{row->filters.any{row.getValue("candidate").startsWith(it)}}
    val arenaLaps="--arena-laps" in args
    val out=File(folder,"proof-$seeds"+if(arenaLaps)"-traversal" else "").apply{mkdirs()};val executor=Executors.newFixedThreadPool(threads)
    try {
        val work=rows.map { row -> executor.submit<String> {
            val id=row.getValue("candidate");val selected=CandidateAuthor.slots.single{it.id==row.getValue("slot")};val accepted=selected.role=="accepted";val slot=if(accepted)selected.copy(laps=selected.oldLaps,min=0.0,max=600.0)else selected
            val c=if(accepted)Courses.all.single{it.id=="runoff"}else CandidateAuthor.compose(slot,File(folder,"recipes/$id.csv").readText(),id).course
            val geometry=qualityGeometry(c)
            check((geometry.detail.getValue("lint") as List<*>).isEmpty()){id+geometry.detail["lint"]}
            if(!accepted)check(shapeGates(trackShape(c).metrics).all{it["status"]=="pass"}){"$id shape gate"}
            if(!accepted)check(TrackQuality.gates(geometry.values,setOf("geometry","lap")).all{it["status"]=="pass"}){"$id geometry quality gate"}
            val digest=candidateProofDigest(c,slot.tier,slot.laps)
            val file=File(out,"$id.json")
            if(file.exists() && file.readText().contains("\"digest\":\"$digest\""))return@submit "CACHED $id"
            val arena=slot.role=="arena" && !arenaLaps;val trials=mutableListOf<QualityTrial>()
            for(seedIndex in 0 until seeds)for(rotation in 0..5)trials+=qualityTrial(c,7319+seedIndex*104729,rotation,arena,limitSeconds=if(arena)360.0 else 600.0,tier=slot.tier,laps=slot.laps)
            val clean=(0..2).map { qualityTrial(c,2971+it*65537,it,limitSeconds=600.0,tier=slot.tier,laps=slot.laps,combatEnabled=false) }
            val repeated=qualityTrial(c,trials.first().seed,trials.first().rotation,arena,limitSeconds=if(arena)360.0 else 600.0,tier=slot.tier,laps=slot.laps)
            val original=trials.first();val replay=original.hash==repeated.hash && original.trajectoryHash==repeated.trajectoryHash
            fun rotate(course:Course):Course=Course(course.id,course.name,course.lesson,course.startFraction,course.theme,course.nodes.map{it.copy(x=-it.y,y=it.x)},course.spots,course.features,course.obstaclePlacements,course.junctions,course.branches.map{it.copy(alternative=rotate(it.alternative))},course.raceProfile)
            val rotated=rotate(c)
            val reference=if(arena)null else qualityReference(c,slot.tier,limitSeconds=600.0)
            val rotationReference=if(arena)null else qualityReference(rotated,slot.tier,limitSeconds=600.0)
            val rotationDifference=if(reference==null)null else abs((reference["flyingLapSeconds"] as? Double?:9999.0)-(rotationReference!!["flyingLapSeconds"] as? Double?:9999.0))
            val winners=trials.mapNotNull { t->t.results.filter{it["finishKind"]==(if(arena)"ELIMINATION" else "LAPS")}.mapNotNull{it["finishSeconds"] as? Double}.minOrNull() }
            val earlyWins=trials.count { t->!arena && t.results.any{it["finishKind"]=="ELIMINATION"} }
            val aggregate=qualityAggregate(trials);val metrics=aggregate.getValue("metrics") as Map<*,*>
            val finishTimes=clean.flatMap{it.results}.mapNotNull{it["finishSeconds"] as? Double}
            val cleanMedian=finishTimes.sorted().let{if(it.isEmpty())null else it[it.size/2]}
            val median=winners.sorted().let{if(it.isEmpty())null else it[it.size/2]}
            val flags=mutableListOf<String>()
            if(!replay)flags+="deterministic replay"
            if(rotationDifference!=null && rotationDifference>TrackQuality["rotationToleranceSeconds"])flags+="rotation reference"
            if(clean.any{it.finished!=6 || it.stuckCount>0} || cleanMedian==null || !arena && cleanMedian !in slot.min..slot.max)flags+="six-car clean traversal/pacing"
            if(!arena && (median==null || median !in slot.min..slot.max || winners.size<trials.size*.8))flags+="combat lap-win pacing"
            if(arena && winners.size<trials.size*.9)flags+="arena resolution"
            if(trials.any{it.stoppingReason=="right-censored-timeout"})flags+="unresolved race"
            for(g in aggregate.getValue("gates") as List<*>) {val gate=g as Map<*,*>;if(gate["status"]!="pass")flags+="${gate["metric"]}"}
            val hunter=mapOf("huntDecisions" to trials.sumOf{it.hunter["huntDecisions"]?.toLong()?:0},"huntIntentDamage" to trials.sumOf{it.hunter["huntIntentDamage"]?.toDouble()?:0.0},"hunterRoleDamage" to trials.sumOf{it.hunter["hunterRoleDamage"]?.toDouble()?:0.0},"leaderDamage" to trials.sumOf{it.hunter["leaderDamage"]?.toDouble()?:0.0})
            val result=mapOf("candidate" to id,"digest" to digest,"proofMode" to if(arenaLaps)"six-car lap traversal of arena" else if(arena)"artificial six-car elimination stress" else "six-car lap race","seeds" to seeds,"rotations" to 6,"sixCarTrials" to trials.size,"tier" to slot.tier,"laps" to slot.laps,"arena" to arena,"aggregate" to aggregate,
                "clean" to clean.map{it.data()},"cleanFinishSeconds" to candidateQuantiles(finishTimes),"lapWinnerSeconds" to candidateQuantiles(winners),"eliminationInsteadOfLaps" to earlyWins,
                "repeatHashMatches" to replay,"rotationReferenceDifferenceSeconds" to rotationDifference,"hunter" to hunter,"flags" to flags.distinct(),"status" to if(flags.isEmpty())"proved" else "flagged")
            file.writeText(TrackQuality.json(result))
            GZIPOutputStream(File(out,"$id-trials.ndjson.gz").outputStream()).bufferedWriter().use { writer->trials.forEach { writer.appendLine(TrackQuality.json(it.data(true))) } }
            println("PROOF $id ${trials.size} trials clean=$cleanMedian combat=$median early=${metrics["earlyLeadWreckRate"]} stuck=${trials.sumOf{it.stuckCount}} hunter=${hunter["huntIntentDamage"]} flags=$flags")
            "$id done"
        } }
        work.forEach{println(it.get())}
    }finally{executor.shutdown()}
}
