package dev.deathride.core

import java.io.File
import kotlin.math.*

private fun number(x: Double)=if(x.isFinite())(round(x*1e6)/1e6).toString() else ""
fun main(args: Array<String>) {
    val output=File(args.firstOrNull()?:"build/reports/drift-lab").apply{mkdirs()}
    val parameters=DriftParameters.defaults.copy()
    val selected=CarCatalog.all.indices.filter{args.getOrNull(2).isNullOrBlank() || CarCatalog.all[it].id==args[2]}
    require(selected.isNotEmpty()){"Unknown class ${args[2]}"}
    val traces=args.getOrNull(3)!="false"
    val specs=Array(CarCatalog.all.size){CarCatalog.all[it].spec()}
    args.getOrNull(4)?.takeIf{it.isNotBlank()}?.let { path ->
        val lines=File(path).readLines().filter{it.isNotBlank() && !it.startsWith("#")}
        val keys=lines.first().split(',');val seen=HashSet<String>()
        for(line in lines.drop(1)) {
            val values=line.split(',');require(values.size==keys.size);val row=keys.zip(values).toMap();val id=row.getValue("id");require(seen.add(id))
            val i=CarCatalog.all.indexOfFirst{it.id==id};require(i>=0);specs[i]=specs[i].copy(driftGeometry=DriftGeometry.fromRow(row))
        }
    }
    args.getOrNull(1)?.takeIf{it.isNotBlank()}?.let { path ->
        val lines=File(path).readLines().filter{it.isNotBlank() && !it.startsWith("#")}.drop(1)
        parameters.setAll(lines.associate{val cells=it.split(',');cells[0] to cells[1].toDouble()})
    }
    val summary=File(output,"summary.csv").bufferedWriter()
    val trace=File(output,"traces.csv").bufferedWriter()
    summary.appendLine("class,profile,surface,exercise,requestedEntryMps,entryMps,releaseSeconds,peakSlipDeg,releaseSlipDeg,retainedAtRelease,rotationSeconds,recoverySeconds,firstSpinSeconds,observedSpinDeg,spinEvents,exitSpeedMps,finalSpeedMps,driftSeconds,peakQuality,distanceM,speedAfterOneSecondMps")
    trace.appendLine("class,exercise,entryMps,seconds,steer,throttle,brake,handbrake,slipDeg,frontSlipDeg,rearSlipDeg,speedMps,yaw,quality,spunOut,x,y")
    for(i in selected)for(speed in DriftLabRules.entrySpeeds)for(exercise in DriftExercise.entries) {
        val e=DriftExperiment(i,exercise,speed,parameters,specOverride=specs[i])
        while(e.seconds<DriftLabRules["durationSeconds"]-1e-9) {
            e.step()
            if(traces && e.steps%DriftLabRules["traceSampleSteps"].toInt()==0) {
                val c=e.car;val u=e.input
                trace.appendLine(listOf(c.carClass!!.id,exercise.name,number(e.entryMps),number(e.seconds),number(u.steer),number(u.throttle),number(u.brake),number(u.handbrake),number(c.slipRadians*180/PI),number(c.frontSlipRadians*180/PI),number(c.rearSlipRadians*180/PI),number(c.speedMps),number(c.yaw),number(c.driftQuality),c.spunOut,number(c.x),number(c.y)).joinToString(","))
            }
        }
        summary.appendLine(listOf(e.car.carClass!!.id,e.profile.id,e.surface.id,e.exercise.name,number(e.requestedEntryMps),number(e.entryMps),number(e.releaseSeconds),number(e.peakSlipRadians*180/PI),number(e.releaseSlipRadians*180/PI),number(e.retainedAtRelease),number(e.rotationSeconds),number(e.recoverySeconds),number(e.firstSpinSeconds),number(e.observedSpinRadians*180/PI),e.car.spinEvents,number(e.exitSpeedMps),number(e.car.speedMps),number(e.driftSeconds),number(e.peakQuality),number(e.distanceM),number(e.speedAfterOneSecondMps)).joinToString(","))
    }
    summary.close();trace.close()
    File(output,"spin-sweep.csv").bufferedWriter().use { writer ->
        writer.appendLine("class,entryMps,holdSeconds,firstSpinSeconds,observedSpinDeg,peakSlipDeg,recoverySeconds,exitSpeedMps")
        for(i in selected)for(speed in DriftLabRules.entrySpeeds) {
            val steps=(DriftLabRules["holdSweepMaximumSeconds"]/DriftLabRules["holdSweepStepSeconds"]).toInt()
            for(n in 1..steps) {
                val e=DriftExperiment(i,DriftExercise.HANDBRAKE,speed,parameters,holdSeconds=n*DriftLabRules["holdSweepStepSeconds"],specOverride=specs[i]);e.run()
                writer.appendLine(listOf(e.car.carClass!!.id,number(e.entryMps),number(e.releaseSeconds),number(e.firstSpinSeconds),number(e.observedSpinRadians*180/PI),number(e.peakSlipRadians*180/PI),number(e.recoverySeconds),number(e.exitSpeedMps)).joinToString(","))
            }
        }
    }
    File(output,"geometry.csv").bufferedWriter().use { writer ->
        writer.appendLine("class,massKg,lengthM,widthM,wheelbaseM,trackM,cgHeightM,frontLoadFraction,inertiaKgM2,gripLoadScale")
        for((i,type) in CarCatalog.all.withIndex()){val s=specs[i];val g=s.driftGeometry!!;writer.appendLine(listOf(type.id,s.massKg,s.lengthM,s.widthM,g.wheelbaseM,g.trackM,g.cgHeightM,g.frontLoadFraction,s.yawInertiaKgM2,DriftDynamics.gripScale(s,parameters)).joinToString(","))}
    }
    File(output,"parameters.csv").bufferedWriter().use { writer ->
        writer.appendLine("key,value,min,max,unit")
        for((i,row) in DriftParameters.rows.withIndex())writer.appendLine("${row.getValue("key")},${parameters.value(i)},${row.getValue("min")},${row.getValue("max")},${row.getValue("unit")}")
    }
    val digest=java.security.MessageDigest.getInstance("SHA-256")
    for(name in listOf("DriftDynamics","SlipHandling","DriftExperiment","CarSpec","StrictTrig")) {
        val bytes=requireNotNull(DriftExperiment::class.java.getResourceAsStream("$name.class")).use{it.readBytes()};digest.update(bytes)
    }
    val fingerprint=digest.digest().joinToString(""){"%02x".format(it)}
    File(output,"run.json").writeText("""{"model":"D3 axle drift","solverClassSha256":"$fingerprint","java":"${System.getProperty("java.version")}","stepSeconds":${Tuning.STEP_SECONDS},"scenarioCount":${selected.size*DriftLabRules.entrySpeeds.size*DriftExercise.entries.size},"traceEverySteps":${DriftLabRules["traceSampleSteps"].toInt()},"tracesEnabled":$traces,"basis":"Open plane; scripted ordinary inputs; no walls or combat; not owner-felt"}
""")
    println("Drift Lab: ${selected.size*DriftLabRules.entrySpeeds.size*DriftExercise.entries.size} scenarios; ${selected.size*DriftLabRules.entrySpeeds.size*(DriftLabRules["holdSweepMaximumSeconds"]/DriftLabRules["holdSweepStepSeconds"]).toInt()} hold probes; output ${output.absolutePath}")
}
