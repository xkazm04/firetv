package dev.deathride.game

import com.badlogic.gdx.utils.JsonValue
import com.badlogic.gdx.graphics.glutils.ShapeRenderer

/** Presentation mapping only: core obstacle footprints and effects remain authoritative. */
object EnvironmentArt {
    private val hash=Regex("[a-f0-9]{64}")
    fun eligible(e: JsonValue): Boolean = try {
        !e.getBoolean("review_required",false) ||
            (e.getBoolean("owner_approved",false) && e.getBoolean("technical_eligible",false) &&
             e.getString("owner_evidence","").isNotBlank() &&
             hash.matches(e.getString("source_sha256","")) && hash.matches(e.getString("export_sha256","")) &&
             e.getString("source_sha256")==e.getString("approved_source_sha256","") &&
             e.getString("export_sha256")==e.getString("approved_export_sha256",""))
    } catch(_: Exception){false}
    val fallbackSets=mapOf(
        "industrial" to arrayOf("props/tyres","props/drum-red","props/crate-metal"),
        "quarry" to arrayOf("props/rock-field","props/rock-spire","props/drum"),
        "desert" to arrayOf("props/soft-dune","props/brush","props/sign"),
        "wetland" to arrayOf("props/dead-tree","props/brush","landmarks/sluice"),
        "alpine" to arrayOf("props/rock-field","props/rock-spire","props/tyres-scattered"))
    val slogans=arrayOf("THE TRACK\nCOLLECTS","YOUR DEBT.\nOUR FINISH.","WIN THE HEAT.\nKEEP THE RECEIPT.")
    /** Sparse static fallback marks use the same biome; they introduce no physics objects. */
    fun fallback(r: ShapeRenderer,theme: String,x: Float,y: Float) {
        when(theme) {
            "quarry","alpine" -> {
                r.setColor(.29f,.27f,.23f,1f);r.triangle(x,y,x+7,y+1,x+3,y+5)
                r.setColor(.48f,.44f,.34f,1f);r.triangle(x+1,y+1,x+3,y+5,x+3.6f,y+1.5f)
                r.setColor(.36f,.32f,.26f,1f);r.triangle(x+5,y-1,x+8,y,x+6,y+2)
            }
            "desert" -> {
                r.setColor(.63f,.58f,.44f,1f);r.ellipse(x,y,7f,3f,12)
                r.setColor(.40f,.32f,.21f,1f);r.rectLine(x+1,y+1,x+5,y+1.8f,.18f)
                r.rectLine(x+4,y+.5f,x+3,y+2.5f,.16f)
            }
            "wetland" -> {
                r.setColor(.28f,.24f,.18f,1f);r.rectLine(x,y,x+6,y+3,.7f)
                r.rectLine(x+2,y+1,x+2,y+4,.35f);r.rectLine(x+4,y+2,x+7,y+1,.3f)
            }
            else -> {
                r.setColor(.32f,.25f,.18f,1f);r.rect(x,y,7f,4f)
                r.setColor(.48f,.34f,.22f,1f);for(j in 0..4)r.rect(x+j*1.3f,y+.3f,.7f,3.3f)
                r.setColor(.12f,.11f,.10f,1f);r.circle(x+6,y,1.1f,12)
                r.setColor(.30f,.25f,.19f,1f);r.circle(x+6,y,.5f,8)
            }
        }
    }
}
