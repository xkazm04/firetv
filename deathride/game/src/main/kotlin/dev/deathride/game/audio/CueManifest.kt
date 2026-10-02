package dev.deathride.game.audio

import com.badlogic.gdx.utils.JsonReader

data class Cue(
    val id: String, val bus: String, val group: String, val priority: Int,
    val cooldownMs: Int, val loop: Boolean, val durationSeconds: Double,
    val spatial: Boolean, val gain: Float, val path: String, val decodedBytes: Long,
    val pitchMin: Float=.75f, val pitchMax: Float=1.5f, val stream: Boolean=false,
    val caption: String=""
)

data class CueManifest(
    val cues: Map<String,Cue>, val maxVoices: Int, val decodedBudgetBytes: Long,
    val groupCaps: Map<String,Int>, val buses: Map<String,Float>,
    val duckMusicDb: Double=-6.0, val duckEnginesDb: Double=-3.0,
    val duckAttack: Double=.06, val duckRelease: Double=.35,
    val nearM: Double=4.0, val farM: Double=45.0, val cutoffM: Double=60.0
) {
    companion object {
        fun parse(text: String): CueManifest {
            val root=JsonReader().parse(text)
            require(root.getInt("schemaVersion")==1)
            val max=root.getInt("maxVoices");require(max in 1..8)
            val budget=root.getLong("decodedBudgetBytes");require(budget in 1..6L*1024*1024)
            require(root.getLong("residentBudgetBytes")<=12L*1024*1024)
            val caps=root.get("groupCaps").associate{it.name to it.asInt()}
            require(caps.values.all{it in 1..max})
            val buses=root.get("buses").associate{it.name to it.asFloat()}
            require("master" in buses && buses.values.all{it.isFinite() && it in 0f..1f})
            val cues=linkedMapOf<String,Cue>()
            for(r in root.get("cues")) {
                val id=r.getString("id")
                val file=r.getString("path")
                require(id.isNotBlank() && id !in cues)
                require(file.isEmpty() || file.startsWith("audio/") && ".." !in file && ':' !in file && '\\' !in file)
                val priority=r.getInt("priority");require(priority in 0..3)
                val seconds=r.getDouble("durationSeconds");require(seconds.isFinite() && seconds>0 && seconds<=180)
                val bytes=r.getLong("decodedBytes");require(bytes>=0)
                val min=r.getFloat("pitchMin",.75f);val maxPitch=r.getFloat("pitchMax",1.5f)
                require(min.isFinite() && maxPitch.isFinite() && min in .5f..2f && maxPitch in min..2f)
                val cue=Cue(id,r.getString("bus"),r.getString("group"),priority,r.getInt("cooldownMs"),
                    r.getBoolean("loop"),seconds,r.getBoolean("spatial"),r.getFloat("gain"),
                    if(r.getString("status")=="technical-pass")file else "",bytes,min,maxPitch,
                    r.getBoolean("stream",id.startsWith("music.")),r.getString("caption",""))
                require(cue.bus in buses && cue.group in caps && cue.cooldownMs>=0 && cue.gain.isFinite() && cue.gain in 0f..1f)
                require(cue.path.isEmpty() || cue.stream || cue.decodedBytes in 1..budget)
                cues[id]=cue
            }
            val duck=root.get("ducking");val spatial=root.get("spatial")
            val attack=duck.getDouble("attackSeconds");val release=duck.getDouble("releaseSeconds")
            val music=duck.getDouble("musicDb");val engines=duck.getDouble("enginesDb")
            require(attack.isFinite() && release.isFinite() && attack>0 && release>0)
            require(music.isFinite() && engines.isFinite() && music<=0 && engines<=0)
            val near=spatial.getDouble("nearM");val far=spatial.getDouble("farM");val cutoff=spatial.getDouble("cutoffM")
            require(near.isFinite() && far.isFinite() && cutoff.isFinite() && near>=0 && far>near && cutoff>=far)
            return CueManifest(cues,max,budget,caps,buses,music,engines,attack,release,near,far,cutoff)
        }
        fun silent()=CueManifest(emptyMap(),8,6L*1024*1024,emptyMap(),mapOf("master" to 0f))
    }
}
