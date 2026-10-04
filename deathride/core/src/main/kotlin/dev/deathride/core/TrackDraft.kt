package dev.deathride.core

/** Startup-only draft importer, shared by the Lab and isolated device previews. */
object TrackDraft {
    fun world(course:Course,tier:Int,arena:Boolean=false,seed:Int=7319):World {
        require(tier in 0..4);val world=World(seed,track=Track(course=course),combatEnabled=true)
        val eligible=CarCatalog.all.indices.filter{CarCatalog.all[it].tierRank==tier}
        for(car in world.cars){CarCatalog.apply(car,eligible[(car.id+seed.mod(eligible.size))%eligible.size]);car.aiSkill=AiSkills.all.single{it.id=="Pro"};car.aiStyle=Career.rivals[car.id%Career.rivals.size];car.human=false}
        if(arena)world.eventType=EventType.ELIMINATION
        world.reset();return world
    }
    fun csv(text:String):List<Map<String,String>> {
        val lines=text.lineSequence().filter{it.isNotBlank() && !it.startsWith("#")}.toList()
        require(lines.isNotEmpty());val keys=lines.first().trim().split(',');require(keys.distinct().size==keys.size)
        return lines.drop(1).map { line->val cells=line.trim().split(',');require(cells.size==keys.size){"CSV column count: $line"};keys.zip(cells).toMap() }
    }
    fun course(fields: Map<String, String>): Course {
        val original = Courses.all.singleOrNull { it.id == fields["id"] } ?: error("Choose a known course")
        val previewName=fields["previewName"]?.also { require(it.matches(Regex("[a-z]+-[1-7]-[a-f]"))) }
        val region=fields["region"]?.let(Regions::named)?:previewName?.let{Regions.forDivision(it.substringBefore('-'))}?:original.region
        fun rows(key: String, maximum: Int) = csv(fields.getValue(key)).also { require(it.size <= maximum) { "$key: too many rows" } }
        fun surface(id: String) = Surfaces.all.singleOrNull { it.id == id } ?: error("Unknown surface: $id")
        val nodes = rows("nodes", 601).map { TrackNode(it.number("xM"), it.number("yM"), it.number("halfWidthM"), surface(it.getValue("surface")), it.number("aiLaneM")) }
        require(nodes.size >= 5 && nodes.first() == nodes.last()) { "At least four nodes and an identical closing row are required" }
        require(nodes.all { it.x in -2000.0..2000.0 && it.y in -2000.0..2000.0 && it.width in 0.1..100.0 && kotlin.math.abs(it.lane) <= 100 }) { "Editor bounds: coordinates ±2000 m; half-width 0.1–100 m; lane ±100 m" }
        require(nodes.maxOf { it.x } - nodes.minOf { it.x } <= 2000 && nodes.maxOf { it.y } - nodes.minOf { it.y } <= 2000) { "Candidate extent must be at most 2000 m per axis" }
        require(nodes.zipWithNext().all { (a, b) -> kotlin.math.hypot(a.x - b.x, a.y - b.y) >= .1 }) { "Adjacent points must be separated by at least 0.1 m" }
        val spots = rows("spots", 256).map { TrackSpot(it.getValue("kind"), it.number("fraction"), it.number("laneM")) }
        val features = rows("features", 128).map {
            require(it.getValue("course") == original.id) { "Feature course id must match selection" }
            TrackFeature(it.getValue("kind"), it.number("start"), it.number("end"), it.number("laneM"), it.number("widthM"), surface(it.getValue("surface")), it.getValue("landmark"), it.number("warningM"))
        }
        val obstacles = rows("obstacles", 128).map {
            require(it.getValue("course") == original.id) { "Obstacle course id must match selection" }
            require(it.getValue("definition") in ObstacleContent.definitions) { "Unknown obstacle definition" }
            ObstaclePlacement(it.getValue("definition"), it.number("fraction"), it.number("lane"), it.number("heading"), it.getValue("seed").toLong())
        }
        val start=fields["startFraction"]?.toDoubleOrNull()?:original.startFraction
        require(start.isFinite() && start in 0.0..<1.0)
        val junctions=fields["junctions"]?.let { text -> csv(text).map { TrackJunction(it.number("first"),it.number("second"),it.number("warningM")) } }?:original.junctions
        val branches=fields["branches"]?.let { text -> csv(text).map { row ->
            val key=row.getValue("nodeKey");require(key.matches(Regex("branchNodes[0-9]+")))
            val branchNodes=rows(key,601).map { TrackNode(it.number("xM"),it.number("yM"),it.number("halfWidthM"),surface(it.getValue("surface")),it.number("aiLaneM")) }
            require(branchNodes.all { it.x in -2000.0..2000.0 && it.y in -2000.0..2000.0 && it.width in .1..100.0 })
            val alternative=Course(original.id,original.name,original.lesson,0.0,original.theme,branchNodes,emptyList(),emptyList(),emptyList(),emptyList(),emptyList(),region=region)
            TrackBranch(row.number("start"),row.number("end"),alternative,row.number("altStart"),row.number("altEnd"))
        } }?:original.branches
        val profile=fields["race"]?.let { text->
            val rows=csv(text);require(rows.size<=1){"One race profile is permitted"}
            rows.singleOrNull()?.let { r->TrackRaceProfile(r.getValue("laps").toInt(),r.getValue("tier").toInt(),r.number("budgetSeconds")) }
        }?:original.raceProfile
        return Course(original.id,previewName?.let { "R3 $it" }?:original.name,original.lesson,start,original.theme,nodes,spots,features,obstacles,junctions,branches,profile,region)
    }
}
