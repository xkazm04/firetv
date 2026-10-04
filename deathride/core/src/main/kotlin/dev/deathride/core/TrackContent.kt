package dev.deathride.core

import kotlin.math.abs

data class TrackTheme(val id: String,val surfaces: Set<String>,val paletteKey: String,val props: Set<String>,val hazards: Set<String>)
data class TrackFeature(val kind: String,val start: Double,val end: Double,val laneM: Double,val widthM: Double,val surface: Surface,val landmark: String,val warningM: Double) {
    fun contains(fraction: Double)=fraction>=start && fraction<end
}
data class TrackPool(val minTier: Int,val maxTier: Int) {
    fun allows(car: CarClass)=car.tierRank in minTier..maxTier
    fun eligible()=CarCatalog.all.indices.filter{allows(CarCatalog.all[it])}
    /** Structural operation. Practice need not call this; competitive grids must. */
    fun populate(world: World) {
        val choices=eligible();require(choices.isNotEmpty())
        for(c in world.cars)if(c.carClass?.let{allows(it)}!=true)CarCatalog.apply(c,choices[c.id%choices.size])
    }
}
object TrackContent {
    val themes=Content.table("track-themes").map { TrackTheme(it.getValue("id"),it.getValue("surfaces").split(';').toSet(),it.getValue("paletteKey"),it.getValue("propSet").split(';').toSet(),it.getValue("hazardSet").split(';').toSet()) }
    val pools=Content.table("track-pools").associate{it.getValue("course") to TrackPool(it.number("minTier").toInt(),it.number("maxTier").toInt())}
    val features=Content.table("track-features").groupBy{it.getValue("course")}.mapValues { (_,rows)->rows.map {
        TrackFeature(it.getValue("kind"),it.number("start"),it.number("end"),it.number("laneM"),it.number("widthM"),Surfaces.all.single{s->s.id==it.getValue("surface")},it.getValue("landmark"),it.number("warningM"))
    } }
    private val rules=Content.table("track-content-rules").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=rules.getValue(key)
    fun errors(c: Course): List<String> = buildList {
        val theme=themes.singleOrNull{it.id==c.theme}
        if(theme==null){add("${c.id}: unknown theme");return@buildList}
        if(c.nodes.any{it.surface.id !in theme.surfaces})add("${c.id}: surface outside theme vocabulary")
        val pool=pools[c.id]
        if(pool==null || pool.minTier>pool.maxTier || pool.eligible().size<2)add("${c.id}: invalid competitive pool")
        for(f in c.features) {
            if(f.kind !in setOf("acceleration","shortcut"))add("${c.id}: unknown feature")
            if(f.start !in 0.0..<1.0 || f.end !in 0.0..1.0 || f.start>=f.end){add("${c.id}: invalid feature interval");continue}
            if(f.landmark !in theme.props || f.warningM<get("minimumWarningM"))add("${c.id}: missing landmark warning")
            if(f.surface.id !in theme.surfaces)add("${c.id}: feature surface outside theme")
            val start=f.start*c.lengthM;val end=f.end*c.lengthM
            if(end-start<get("minimumFeatureM"))add("${c.id}: feature too short")
            var sumCurvature=0.0;var samples=0
            for(i in 0 until c.count)if(c.arc[i] in start..end) {
                samples++;sumCurvature+=c.curvature[i]
                if(f.widthM<=0 || abs(f.laneM)+f.widthM*.5>c.width[i]-Movement.vergeWidthM)add("${c.id}: feature outside road")
                if(f.kind=="acceleration" && c.curvature[i]>get("maximumAccelerationCurvature"))add("${c.id}: acceleration bend too sharp")
            }
            if(f.kind=="shortcut" && (f.laneM>=0 || sumCurvature/samples.coerceAtLeast(1)<get("minimumShortcutCurvature") || f.surface.gripScale>=Surfaces.asphalt.gripScale))add("${c.id}: shortcut lacks inside-line risk")
            for(spot in c.spots) {
                val s=c.phase((c.startFraction+spot.fraction)*c.lengthM)
                if(spot.kind=="grid" && s in start..end)add("${c.id}: feature covers grid")
                if(spot.kind=="hazard" && abs(spot.laneM-f.laneM)<(f.widthM+TrackRules["hazardWidthM"])*.5 && s in (start-get("minimumRecoveryM"))..(end+get("minimumRecoveryM")))add("${c.id}: hazard denies feature recovery")
            }
        }
        for((i,a) in c.features.withIndex())for(b in c.features.drop(i+1)) {
            val gap=if(a.end<=b.start)(b.start-a.end)*c.lengthM else if(b.end<=a.start)(a.start-b.end)*c.lengthM else -1.0
            if(gap<get("minimumRecoveryM"))add("${c.id}: features lack recovery gap")
        }
    }
}
