package dev.deathride.game

import com.badlogic.gdx.utils.JsonValue

/** Screening evidence never substitutes for the separate owner/source/export approval contract. */
object FaceArt {
    fun screened(e: JsonValue): Boolean = try {
        !e.getBoolean("face_required",false) ||
            (e.getString("face_visibility_version","")=="face-visibility-v1" &&
             e.getBoolean("face_visibility_passed",false) &&
             e.getDouble("face_height_fraction",0.0) in .4..1.0 &&
             e.getDouble("face_eye_gap_native_px",0.0)>=8.0 &&
             e.getString("face_visibility_source_sha256","").length==64 &&
             e.getString("face_visibility_source_sha256")==e.getString("source_sha256","") &&
             e.getString("face_visibility_export_sha256","").length==64 &&
             e.getString("face_visibility_export_sha256")==e.getString("export_sha256",e.getString("sha256","")))
    } catch(_: Exception){false}
}
