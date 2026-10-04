package dev.deathride.core
import java.io.File
fun main(args: Array<String>) {
    val out=File(TrackQuality.root,"tracks/composer").apply { mkdirs() }
    val recipe=args.firstOrNull()?.let { File(it).readText() }?:TrackComposer.example()
    val composed=TrackComposer.compile(Courses.all.first(),recipe)
    val data=TrackLabCodec.candidate(composed.course)+mapOf("shape" to trackShape(composed.course).data(),"recipe" to composed.recipe,"primitives" to TrackComposer.csv(composed.primitives),"spans" to composed.spans)
    File(out,"example.json").writeText(TrackQuality.json(data));File(out,"example.csv").writeText(composed.recipe)
    println("Composer: ${composed.course.lengthM} m; Rmin ${1/composed.course.curvature.max()/TrackQuality.longest} L; lint ${TrackLinter.errors(composed.course)}; shape ${trackShape(composed.course).metrics}")
}
