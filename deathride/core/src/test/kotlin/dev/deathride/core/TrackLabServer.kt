package dev.deathride.core

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import java.io.ByteArrayOutputStream
import java.io.File
import java.net.InetSocketAddress
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.util.concurrent.Executors
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/** Only builds in-memory candidates; there is deliberately no save-to-repository endpoint. */
object TrackLabCodec {
    fun fields(body: String): Map<String, String> = body.split('&').filter { it.isNotEmpty() }.associate {
        val pair = it.split('=', limit = 2)
        URLDecoder.decode(pair[0], StandardCharsets.UTF_8) to URLDecoder.decode(pair.getOrElse(1) { "" }, StandardCharsets.UTF_8)
    }
    fun course(fields: Map<String,String>): Course = TrackDraft.course(fields)
    fun csv(c: Course): Map<String, String> = linkedMapOf(
        "nodes" to ("xM,yM,halfWidthM,surface,aiLaneM\n" + c.nodes.joinToString("\n", postfix = "\n") { "${it.x},${it.y},${it.width},${it.surface.id},${it.lane}" }),
        "spots" to ("kind,fraction,laneM\n" + c.spots.joinToString("\n", postfix = "\n") { "${it.kind},${it.fraction},${it.laneM}" }),
        "features" to ("course,kind,start,end,laneM,widthM,surface,landmark,warningM\n" + c.features.joinToString("\n", postfix = "\n") { "${c.id},${it.kind},${it.start},${it.end},${it.laneM},${it.widthM},${it.surface.id},${it.landmark},${it.warningM}" }),
        "obstacles" to ("course,definition,fraction,lane,heading,seed\n" + c.obstaclePlacements.joinToString("\n", postfix = "\n") { "${c.id},${it.definition},${it.fraction},${it.lane},${it.heading},${it.seed}" }),
        "junctions" to ("first,second,warningM\n"+c.junctions.joinToString("\n",postfix="\n") { "${it.first},${it.second},${it.warningM}" }),
        "branches" to ("start,end,altStart,altEnd,nodeKey\n"+c.branches.mapIndexed { i,b -> "${b.start},${b.end},${b.altStart},${b.altEnd},branchNodes$i" }.joinToString("\n",postfix="\n")),
        "race" to ("laps,tier,budgetSeconds\n"+(c.raceProfile?.let{"${it.laps},${it.tier},${it.budgetSeconds}\n"}?:"")))+
        c.branches.mapIndexed { i,b -> "branchNodes$i" to ("xM,yM,halfWidthM,surface,aiLaneM\n"+b.alternative.nodes.joinToString("\n",postfix="\n") { "${it.x},${it.y},${it.width},${it.surface.id},${it.lane}" }) }.toMap()
    fun candidate(c: Course): Map<String, Any?> {
        val geometry = qualityGeometry(c)
        return mapOf("course" to qualityCourseData(c), "geometry" to geometry.detail, "csv" to csv(c), "digest" to TrackQuality.digest(TrackQuality.json(qualityCourseData(c))),
            "gates" to TrackQuality.gates(geometry.values, setOf("geometry", "lap")), "shape" to trackShape(c).data())
    }
    fun zip(c: Course, recipe: String? = null): ByteArray {
        val bytes = ByteArrayOutputStream(); val csv = csv(c)
        ZipOutputStream(bytes).use { zip ->
            val files = linkedMapOf("tracks/${c.id}.csv" to csv.getValue("nodes"), "tracks/${c.id}-spots.csv" to csv.getValue("spots"),
                "track-features.csv" to csv.getValue("features"), "track-obstacles.csv" to csv.getValue("obstacles"),"tracks/${c.id}-junctions.csv" to csv.getValue("junctions"),
                "tracks-row.csv" to "id,name,lesson,startFraction,theme\n${c.id},${c.name},${c.lesson},${c.startFraction},${c.theme}\n",
                "region-membership.csv" to "course,division,region\n${c.id},${c.region.division},${c.region.id}\n",
                "README.txt" to "Track Lab draft only. Existing CSV format. The features and obstacles tables contain ONLY rows for ${c.id}; replace that course's rows when later authorized, never overwrite the full shared tables. Node and spot files are complete for the selected course. No game data was written by this tool.\n",
                "validation.json" to TrackQuality.json(candidate(c)))
            if(recipe!=null) { files["design-recipe.csv"]=recipe;files["recipe-note.txt"]="Recipe provenance. If the control points were edited after compilation, the exported node/spot/feature/obstacle CSVs are the current draft authority. Recompile the recipe to regenerate its original result.\n" }
            files["tracks/${c.id}-branches.csv"]="start,end,altStart,altEnd,nodeFile\n"+c.branches.mapIndexed { i,b -> "${b.start},${b.end},${b.altStart},${b.altEnd},${c.id}-branch-$i" }.joinToString("\n",postfix="\n")
            c.branches.indices.forEach { i -> files["tracks/${c.id}-branch-$i.csv"]=csv.getValue("branchNodes$i") }
            if(c.raceProfile!=null)files["tracks/${c.id}-race.csv"]=csv.getValue("race")
            for ((name, contents) in files) { zip.putNextEntry(ZipEntry(name).also { it.time = 0 }); zip.write(contents.toByteArray()); zip.closeEntry() }
        }
        return bytes.toByteArray()
    }
}

fun main(args: Array<String>) {
    val port = args.firstOrNull()?.toInt() ?: 8794; require(port in 1024..65535)
    val server = HttpServer.create(InetSocketAddress("127.0.0.1", port), 0)
    server.executor = Executors.newFixedThreadPool(2)
    fun send(exchange: HttpExchange, code: Int, type: String, bytes: ByteArray) {
        exchange.responseHeaders.set("Content-Type", type)
        exchange.responseHeaders.set("Cache-Control", "no-store")
        exchange.sendResponseHeaders(code, bytes.size.toLong()); exchange.responseBody.use { it.write(bytes) }
    }
    server.createContext("/") { x ->
        try {
            val origin = x.requestHeaders.getFirst("Origin")
            if (origin != null && origin != "null" && origin != "http://127.0.0.1:$port" && origin != "http://localhost:$port") {
                send(x, 403, "text/plain", "Local Track Lab only".toByteArray()); return@createContext
            }
            if (origin != null) x.responseHeaders.set("Access-Control-Allow-Origin", origin)
            x.responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            x.responseHeaders.set("Access-Control-Allow-Headers", "Content-Type")
            x.responseHeaders.set("Access-Control-Allow-Private-Network", "true")
            if (x.requestMethod == "OPTIONS") { x.sendResponseHeaders(204, -1); x.close(); return@createContext }
            val path = x.requestURI.path
            if (path == "/api/catalog" && x.requestMethod == "GET") {
                val catalog = mapOf("version" to TrackQuality.VERSION, "courses" to Courses.all.map { mapOf("course" to qualityCourseData(it), "csv" to TrackLabCodec.csv(it)) },
                    "composerExample" to TrackComposer.example(),
                    "surfaces" to Surfaces.all.map { it.id }, "obstacles" to ObstacleContent.definitions.values.map { mapOf("id" to it.id, "effect" to it.effect.name) },
                    "themes" to TrackContent.themes.map { mapOf("id" to it.id, "surfaces" to it.surfaces.toList(), "landmarks" to it.props.toList()) })
                send(x, 200, "application/json", TrackQuality.json(catalog).toByteArray())
            } else if (path == "/api/compose" && x.requestMethod == "POST") {
                val bytes=x.requestBody.readNBytes(262145);require(bytes.size<=262144)
                val fields=TrackLabCodec.fields(String(bytes,StandardCharsets.UTF_8))
                val base=Courses.all.single { it.id==fields["id"] }
                val composed=TrackComposer.compile(base,fields.getValue("recipe"))
                val result=TrackLabCodec.candidate(composed.course)+mapOf("recipe" to composed.recipe,"primitives" to TrackComposer.csv(composed.primitives),"spans" to composed.spans)
                send(x,200,"application/json",TrackQuality.json(result).toByteArray())
            } else if (path in setOf("/api/analyze", "/api/race", "/api/export") && x.requestMethod == "POST") {
                val bytes = x.requestBody.readNBytes(262145); require(bytes.size <= 262144) { "Candidate request exceeds 256 KiB" }
                val fields = TrackLabCodec.fields(String(bytes, StandardCharsets.UTF_8)); val c = TrackLabCodec.course(fields)
                if (path == "/api/export") {
                    x.responseHeaders.set("Content-Disposition", "attachment; filename=${c.id}-draft.zip")
                    send(x, 200, "application/zip", TrackLabCodec.zip(c,fields["recipe"]))
                } else {
                    val candidate = TrackLabCodec.candidate(c).toMutableMap()
                    if (path == "/api/race") {
                        require(TrackLinter.errors(c).isEmpty()) { "Fix structural lint before starting a race" }
                        val seed = fields["seed"]?.toIntOrNull() ?: 7319
                        val tier=fields["tier"]?.toInt()?.also { require(it in 0..4) };val laps=fields["laps"]?.toInt()?.also { require(it in 1..12) };val arena=fields["arena"]=="true"
                        val trial = qualityTrial(c, seed, 0, arena, captureReplay = true,limitSeconds=if(tier!=null || laps!=null)if(arena)360.0 else 600.0 else TrackQuality[if(arena)"arenaLimitSeconds" else "raceLimitSeconds"],tier=tier,laps=laps)
                        candidate["simulation"] = qualityAggregate(listOf(trial)); candidate["trial"] = trial.data()
                        candidate["referenceLap"] = qualityReference(c, tier?:c.pool.minTier,limitSeconds=600.0)
                    }
                    send(x, 200, "application/json", TrackQuality.json(candidate).toByteArray())
                }
            } else if (x.requestMethod == "GET") {
                val allowed = mapOf("/" to "tracks/lab/index.html", "/index.html" to "tracks/lab/index.html", "/lab.js" to "tracks/lab/lab.js",
                    "/track-view.js" to "tracks/track-view.js", "/tracks.css" to "tracks/tracks.css", "/report.css" to "audio/report.css",
                    "/tracks/lab/index.html" to "tracks/lab/index.html", "/tracks/lab/lab.js" to "tracks/lab/lab.js",
                    "/tracks/track-view.js" to "tracks/track-view.js", "/tracks/tracks.css" to "tracks/tracks.css", "/audio/report.css" to "audio/report.css",
                    "/tracks/atlas/index.html" to "tracks/atlas/index.html", "/tracks/atlas/atlas.js" to "tracks/atlas/atlas.js",
                    "/tracks/atlas/data.js" to "tracks/atlas/data.js", "/tracks/atlas/data.json" to "tracks/atlas/data.json",
                    "/tracks/atlas/gate-proof.json" to "tracks/atlas/gate-proof.json", "/tracks/atlas/trials.ndjson.gz" to "tracks/atlas/trials.ndjson.gz", "/tracks/review.js" to "tracks/review.js",
                    "/docs/concepts/deathride/T0-track-design-research.md" to "../docs/concepts/deathride/T0-track-design-research.md",
                    "/docs/concepts/deathride/T1-track-instruments.md" to "../docs/concepts/deathride/T1-track-instruments.md")
                val relative = allowed[path]?:if(path.matches(Regex("/tracks/candidates/drafts/[a-z]+-[1-7]-[a-f]\\.json")))path.drop(1)else null
                val file = relative?.let { File(TrackQuality.root, it) }
                if (file == null || !file.isFile) send(x, 404, "text/plain", "Not found".toByteArray())
                else send(x, 200, when (file.extension) { "html" -> "text/html; charset=utf-8"; "js" -> "text/javascript; charset=utf-8"; "css" -> "text/css; charset=utf-8"; "json" -> "application/json"; "gz" -> "application/gzip"; else -> "text/plain; charset=utf-8" }, file.readBytes())
            } else send(x, 405, "text/plain", "Method not allowed".toByteArray())
        } catch (e: Exception) {
            send(x, 400, "application/json", TrackQuality.json(mapOf("error" to (e.message ?: e.javaClass.simpleName))).toByteArray())
        }
    }
    server.start()
    println("Track Lab ready: http://127.0.0.1:$port/tracks/lab/index.html — in-memory drafts only; Ctrl+C stops server")
}
