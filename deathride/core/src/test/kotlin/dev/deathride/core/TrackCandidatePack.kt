package dev.deathride.core

import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

fun main(args:Array<String>) {
    val folder=CandidateAuthor.folder;val rows=TrackQuality.csv(File(folder,"manifest.csv").readText());val campaign=Content.table("campaign")
    val filters=args.firstOrNull()?.split(',')
    val previous=File(folder,"candidate-assignments.csv").takeIf{it.exists()}?.readLines()?.drop(1)?.filter{it.isNotBlank()}?.associateBy{it.split(',')[1]}?:emptyMap()
    val assignment=StringBuilder("event,candidate,sourceBase,theme,role,tier,laps,budgetSeconds\n")
    for(row in rows) {
        if(filters!=null && filters.none{row.getValue("candidate").startsWith(it)}) {assignment.append(previous.getValue(row.getValue("candidate"))+"\n");continue}
        val id=row.getValue("candidate");val slot=CandidateAuthor.slots.single{it.id==row.getValue("slot")};val recipe=File(folder,"recipes/$id.csv").readText();val composed=CandidateAuthor.compose(slot,recipe,id);val c=composed.course
        val geometry=qualityGeometry(c);val shape=trackShape(c);check((geometry.detail.getValue("lint") as List<*>).isEmpty()){id+geometry.detail["lint"]}
        check(shapeGates(shape.metrics).all{it["status"]=="pass"}){"$id shape gate after final authoring passes"}
        val references=(0..4).map{qualityReference(c,it,limitSeconds=600.0)};check(references.none{it["timeout"]==true}){"$id reference timeout"}
        val reference=references[slot.tier];val duration=(reference.getValue("standingLapSeconds") as Double)+(slot.laps-1)*(reference.getValue("flyingLapSeconds") as Double)
        val digest=candidateProofDigest(c,slot.tier,slot.laps)
        val data=mapOf("id" to id,"slot" to slot.id,"region" to c.region.id,"role" to slot.role,"tier" to slot.tier,"laps" to slot.laps,"oldLaps" to slot.oldLaps,"minSeconds" to slot.min,"maxSeconds" to slot.max,"family" to row.getValue("family"),"reference" to reference,"references" to references,"referenceSeconds" to duration,"proofDigest" to digest,
            "course" to CandidateAuthor.reviewCourse(c),"before" to CandidateAuthor.reviewCourse(Courses.all.single{it.id==slot.oldCourse}),"shape" to shape.data(),"geometry" to geometry.detail,"gates" to TrackQuality.gates(geometry.values,setOf("geometry","lap")),"recipe" to recipe,"csv" to TrackLabCodec.csv(c),"spans" to composed.spans)
        File(folder,"drafts/$id.json").writeText(TrackQuality.json(data));val csv=TrackLabCodec.csv(c)
        val imported=TrackDraft.course(csv+mapOf("id" to c.id,"startFraction" to c.startFraction.toString()))
        check(TrackLabCodec.csv(imported)==csv){"$id native/Lab import differs from the proved CSV"}
        val fields=linkedMapOf("tracks/$id.csv" to csv.getValue("nodes"),"tracks/$id-spots.csv" to csv.getValue("spots"),"tracks/$id-junctions.csv" to csv.getValue("junctions"),"tracks/$id-race.csv" to csv.getValue("race"),
            "track-features-row.csv" to csv.getValue("features").replace(Regex("(?m)^${Regex.escape(c.id)},"),"$id,"),"track-obstacles-row.csv" to csv.getValue("obstacles").replace(Regex("(?m)^${Regex.escape(c.id)},"),"$id,"),
            "tracks-row.csv" to "id,name,lesson,startFraction,theme\n$id,R3 $id,${c.lesson.replace(',',';')},${c.startFraction},${c.theme}\n",
            "track-pools-row.csv" to "course,minTier,maxTier\n$id,${slot.tier},${slot.tier}\n",
            "design-recipe.csv" to recipe,
            "region-membership.csv" to "course,division,region\n$id,${c.region.division},${c.region.id}\n",
            "tracks/$id-branches.csv" to ("start,end,altStart,altEnd,nodeFile\n"+c.branches.mapIndexed{i,b->"${b.start},${b.end},${b.altStart},${b.altEnd},$id-branch-$i"}.joinToString("\n",postfix="\n")))
        c.branches.indices.forEach{i->fields["tracks/$id-branch-$i.csv"]=csv.getValue("branchNodes$i")}
        val event=campaign.single{it.getValue("id")==slot.id}.toMutableMap();event["course"]=id;event["laps"]=if(slot.role=="arena")"0" else "${slot.laps}"
        fields["campaign-row.csv"]=event.keys.joinToString(",")+"\n"+event.values.joinToString(",")+"\n"
        val lapSeconds=((reference.getValue("standingLapSeconds") as Double)+(reference.getValue("flyingLapSeconds") as Double))/2
        fields["event-pacing-row.csv"]="event,targetSeconds,basis\n${slot.id},${if(slot.role=="arena")0.0 else lapSeconds*slot.laps},solo-stock-Pro-R3\n"
        val surfaceChanges=(0 until c.count).count{c.surfaces[it]!==c.surfaces[(it+c.count-1)%c.count]}
        fields["course-pacing-rows.csv"]="course,tier,referenceLapSeconds,lengthM,nodes,turnChanges,surfaceChanges,features,obstacles\n"+references.map{r->"$id,${r["tier"]},${((r.getValue("standingLapSeconds") as Double)+(r.getValue("flyingLapSeconds") as Double))/2},${c.lengthM},${c.nodes.size-1},${shape.metrics.getValue("signChanges").toInt()},$surfaceChanges,${c.features.size},${c.obstacles.size}"}.joinToString("\n",postfix="\n")
        fields["README.txt"]="OWNER CANDIDATE — NOT INSTALLED. Candidate $id belongs to stable event ${slot.id}. Add its uniquely named track files and table rows; replace ONLY that event's campaign/pacing rows after selection. Shared table fragments must be merged, never overwrite the whole tables. All 35 event IDs remain. The source base ${c.id} was used for validation vocabulary; export uses a new unique ID and includes its pool. Race sidecar supplies ${slot.laps} laps and ${c.raceProfile!!.budgetSeconds} s watchdog; timeouts are not wins. Six-car proof digest: $digest. No production data was modified.\n"
        fields["README.txt"]=fields.getValue("README.txt")+"The recipe records geometry. The final CSV files additionally contain the authored surface zones and supplies; these are authoritative for the proof. Reproduce with TrackCandidateAuthor.compose and the recovery, arena-supplies, launch-overrides and race-overrides tables, then TrackCandidatePack. Camera and vehicle/combat balance are unchanged. Arena six-car previews rehearse two laps; the actual campaign finale remains a separate two-car elimination duel.\n"
        for(table in listOf("arena-supplies","launch-overrides","race-overrides")) {
            val source=File(folder,"$table.csv");fields["$table-row.csv"]=source.readLines().first()+"\n"+source.readLines().filter{it.startsWith("$id,")}.joinToString("\n",postfix="\n")
        }
        val recovery=File(folder,"recovery.csv").readLines().filter{it.startsWith("$id,")}
        fields["recovery-row.csv"]=File(folder,"recovery.csv").readLines().first()+"\n"+recovery.joinToString("\n",postfix="\n")
        ZipOutputStream(File(folder,"bundles/$id.zip").outputStream()).use { zip->for((name,value)in fields){zip.putNextEntry(ZipEntry(name).also{it.time=0});zip.write(value.toByteArray());zip.closeEntry()} }
        assignment.append("${slot.id},$id,${c.id},${c.theme},${slot.role},${slot.tier},${slot.laps},${c.raceProfile!!.budgetSeconds}\n")
        println("PACKED $id ${c.nodes.count{it.surface.id!="Asphalt"}} surface nodes; profile ${c.raceProfile}; reference $duration s")
    }
    val runoff=CandidateAuthor.slots.single{it.role=="accepted"}
    assignment.append("${runoff.id},switchback-4-runoff,runoff,${Courses.all.single{it.id=="runoff"}.theme},accepted,${runoff.tier},${runoff.oldLaps},unchanged\n")
    File(folder,"candidate-assignments.csv").writeText(assignment.toString())
}
