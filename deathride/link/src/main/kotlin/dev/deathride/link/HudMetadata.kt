package dev.deathride.link

/** Reliable ordered WebSocket deltas, opt-in. Dynamic driving state is never cached here. */
class HudMetadata(private val delta: Boolean) {
    companion object { /** The socket is reliable and ordered, so the periodic full snapshot is only a safety net. */ const val REFRESH_MS=60000.0 }
    private val previous=arrayOfNulls<String>(6)
    private var lastPhase=""
    private var fullAt=Double.NEGATIVE_INFINITY
    var fullSnapshots=0L;private set
    private val out=StringBuilder(28000)
    private fun field(index: Int,name: String,value: String,full: Boolean) {
        if(full || previous[index]!=value)out.append(",\"").append(name).append("\":").append(value)
        previous[index]=value
    }
    fun json(phase: String,nowMs: Double,hostCareer: String,career: String,garage: String,car: String,track: String,feel: String): String {
        out.setLength(0)
        val full=!delta || phase!=lastPhase || nowMs-fullAt>=REFRESH_MS
        if(full){fullAt=nowMs;fullSnapshots++}
        lastPhase=phase
        field(0,"hostCareer",hostCareer,full);field(1,"career",career,full)
        field(2,"garage",garage,full);field(3,"car",car,full)
        field(4,"track",track,full);field(5,"feel",feel,full)
        return out.toString()
    }
}
