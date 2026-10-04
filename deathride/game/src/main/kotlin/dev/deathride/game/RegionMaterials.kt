package dev.deathride.game

import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.JsonValue
import dev.deathride.core.RegionDefinition
import java.security.MessageDigest

/** Candidate status is explicit; Reject is never eligible even when candidate previews are on. */
object RegionMaterials {
    val tileSlots=mapOf("asphalt" to "tiles/asphalt-worn","dirt" to "tiles/dirt","gravel" to "tiles/gravel","ice" to "tiles/ice")
    fun eligible(entry: JsonValue,region: RegionDefinition,slot: String,candidates: Boolean): Boolean = try {
        entry.getString("id","")==region.variants[slot] && entry.getString("region","")==region.id &&
            entry.getBoolean("technicalEligible",false) && candidates && when(entry.getString("status","")) {
                "candidate","Maybe" -> candidates
                "Keep" -> entry.getString("ownerEvidence","").isNotBlank()
                else -> false
            }
    } catch(_: Exception) { false }
    fun verifiedFile(root: FileHandle,entry: JsonValue): FileHandle {
        val id=entry.getString("id");require(id.matches(Regex("[a-z0-9-]+")))
        val file=root.child("$id.png")
        require(file.read().use{TextureBudget.pngBytes(it,256)}==256L*256*4)
        val digest=MessageDigest.getInstance("SHA-256").digest(file.readBytes()).joinToString(""){"%02x".format(it)}
        require(digest==entry.getString("sha256")){"Region candidate hash mismatch"}
        return file
    }
    fun manifest(root: FileHandle)=JsonReader().parse(root.child("materials.json")).get("assets")
}
