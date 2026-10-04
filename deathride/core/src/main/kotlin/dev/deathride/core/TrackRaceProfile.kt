package dev.deathride.core

/** Optional authored long-road envelope. Legacy courses retain their existing pacing tables. */
data class TrackRaceProfile(val laps:Int,val tier:Int,val budgetSeconds:Double) {
    init { require(laps in 1..12 && tier in 0..4 && budgetSeconds.isFinite() && budgetSeconds in 120.0..900.0) }
    companion object {
        fun load(id:String):TrackRaceProfile? {
            val stream=TrackRaceProfile::class.java.getResourceAsStream("/data/tracks/$id-race.csv")?:return null
            val values=stream.bufferedReader().use{it.readLines()}.filter{it.isNotBlank()}.drop(1)
            if(values.isEmpty())return null
            require(values.size==1);val p=values.single().split(',');require(p.size==3)
            return TrackRaceProfile(p[0].toInt(),p[1].toInt(),p[2].toDouble())
        }
    }
}
