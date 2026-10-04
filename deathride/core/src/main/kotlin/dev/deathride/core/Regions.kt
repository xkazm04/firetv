package dev.deathride.core

/** Content only. Region presentation must never change a Surface or consume simulation RNG. */
data class RegionWeather(val kind: String,val cap: Int,val rate: Double,val life: Double,val pixels: Double,val alpha: Double) {
    init {
        require(kind in setOf("ash","embers","salt-glints","dust","sleet","snow","fog"))
        require(cap in 1..24 && rate.isFinite() && rate in .1..12.0 && life.isFinite() && life in .1..8.0)
        require(pixels.isFinite() && pixels in 1.0..128.0 && alpha.isFinite() && alpha in .01..0.6)
        require(rate*life<=cap+.00001) { "Weather lifetime/rate exceeds family cap" }
    }
}
class RegionDefinition(row: Map<String,String>) {
    val id=row.getValue("id");val name=row.getValue("name");val division=row.getValue("division")
    val defaultCourses=row.getValue("defaultCourses").split(';').filter{it.isNotBlank()}.toSet()
    val defaultTheme=row.getValue("defaultTheme")
    val palette=(listOf("accent")+MATERIALS+"kerb").associateWith { key ->
        val value=row.getValue(key);require(value.matches(Regex("#[0-9A-F]{6}")));value.drop(1).toInt(16)
    }
    val variants=row.getValue("groundVariants").split(';').filter{it.isNotBlank()}.associate { item ->
        val p=item.split(':');require(p.size==2 && p[0] in MATERIALS && p[1].matches(Regex("[a-z0-9-]+")));p[0] to p[1]
    }
    val grade=row.getValue("grade").split(';').map{it.toDouble()}
    val vignette=row.number("vignette");val fog=row.number("fog")
    val weather=row.getValue("weather").split(';').filter{it.isNotBlank()}.map {
        val p=it.split(':');require(p.size==6);RegionWeather(p[0],p[1].toInt(),p[2].toDouble(),p[3].toDouble(),p[4].toDouble(),p[5].toDouble())
    }
    val weatherCap=row.getValue("weatherCap").toInt()
    val props=row.getValue("propBias").split(';').flatMap {
        val p=it.split(':');require(p.size==2 && p[0] in KEPT_PROPS);val weight=p[1].toInt();require(weight in 1..4);List(weight){p[0]}
    }
    val backdrop=row.getValue("backdrop");val ambience=row.getValue("ambience").split(';')
    val boss=row.getValue("boss");val climate=row.getValue("climate");val plot=row.getValue("plot")
    init {
        require(id.matches(Regex("[a-z]+")) && division.matches(Regex("[a-z]+")) && name.isNotBlank())
        require(defaultTheme in setOf("industrial","quarry","desert","alpine","wetland"))
        require(grade.size==3 && grade.all{it.isFinite() && it in .85..1.08})
        require(vignette in 0.0..0.08 && fog in 0.0..0.10)
        require(weather.size<=2 && weather.map{it.kind}.distinct().size==weather.size)
        require(weatherCap in 0..24 && weather.sumOf{it.cap}<=weatherCap)
        // Conservative rectangle coverage at 1080p, before lifetime fade or sparse silhouettes.
        require(weather.sumOf{it.cap*it.pixels*it.pixels*it.alpha}/(1920*1080)<=.04)
        require(props.isNotEmpty() && props.size<=16)
        require(backdrop in setOf("sorting-sheds","cast-halls","mineral-terraces","bare-ridges","empty-stands"))
        require(ambience.all{it.matches(Regex("region[.][a-z.-]+"))} && plot.isNotBlank())
    }
    companion object {
        val MATERIALS=listOf("asphalt","dirt","gravel","sand","salt","ice","snow","oil")
        val KEPT_PROPS=setOf("environment/scrap-pile","environment/oil-drums","environment/rust-pylon","environment/league-gantry")
    }
}
object Regions {
    val all=Content.table("region").map(::RegionDefinition)
    init {
        require(all.size==5 && all.map{it.id}.distinct().size==all.size)
        require(all.map{it.division}.distinct().size==all.size && all.map{it.defaultTheme}.distinct().size==all.size)
        val courses=all.flatMap{it.defaultCourses};require(courses.distinct().size==courses.size)
    }
    fun named(id: String)=all.single{it.id==id}
    fun forDivision(id: String)=all.single{it.division==id}
    fun forCourse(id: String,theme: String): RegionDefinition =
        all.singleOrNull{id in it.defaultCourses}?:all.singleOrNull{id.matches(Regex("${it.division}-[1-7]-[abc]"))}?:all.single{it.defaultTheme==theme}
}
