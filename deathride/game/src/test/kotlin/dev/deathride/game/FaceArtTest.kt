package dev.deathride.game

import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.JsonValue
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class FaceArtTest {
    @Test fun smallHiddenOrStaleFaceEvidenceCannotBecomeEligible() {
        fun fixture()=JsonReader().parse("""{"face_required":true,"face_visibility_version":"face-visibility-v1",
          "face_visibility_passed":true,"face_height_fraction":0.5,"face_eye_gap_native_px":12,
          "source_sha256":"${"a".repeat(64)}","sha256":"${"b".repeat(64)}",
          "face_visibility_source_sha256":"${"a".repeat(64)}","face_visibility_export_sha256":"${"b".repeat(64)}"}""")
        assertTrue(FaceArt.screened(fixture()))
        assertFalse(StoryArt.eligible(fixture()),"Screening cannot supply owner approval")
        for(key in listOf("face_visibility_version","face_visibility_passed","face_height_fraction","face_eye_gap_native_px","face_visibility_source_sha256","face_visibility_export_sha256")) {
            val e=fixture();e.remove(key);assertFalse(FaceArt.screened(e),key)
        }
        val small=fixture();small.remove("face_height_fraction");small.addChild("face_height_fraction",JsonValue(.399));assertFalse(FaceArt.screened(small))
        val close=fixture();close.remove("face_eye_gap_native_px");close.addChild("face_eye_gap_native_px",JsonValue(7.99));assertFalse(FaceArt.screened(close))
        val stale=fixture();stale.get("sha256").set("c".repeat(64));assertFalse(FaceArt.screened(stale))
        assertTrue(FaceArt.screened(JsonReader().parse("{}")),"Legacy fallbacks retain their original policy")
    }
}
