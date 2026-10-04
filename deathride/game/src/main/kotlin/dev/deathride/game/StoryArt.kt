package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.Batch
import com.badlogic.gdx.graphics.g2d.NinePatch
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.JsonValue
import dev.deathride.core.*
import java.security.MessageDigest

/** Optional, exact-byte owner selections. Rejection never changes gameplay or the fallback layout. */
class StoryArt(private val root: FileHandle, private val headroom: () -> Long) {
    private val entries=HashMap<String,JsonValue>()
    private val textures=HashMap<String,Texture>()
    private val patches=HashMap<String,NinePatch>()
    private var selection=emptySet<String>()
    var textureBytes=0L; private set
    var failures=0; private set
    init {
        try {
            if(root.child("catalog.json").exists())for(e in JsonReader().parse(root.child("catalog.json")).get("assets")) {
                if(eligible(e))entries[e.getString("key")]=e
            }
        } catch(e: Exception) { failures++;Gdx.app.log("DeathRide","story catalog fallback: ${e.message}") }
    }
    fun select(keys: Set<String>) {
        if(keys==selection)return
        selection=keys.toSet()
        for(key in textures.keys.toList())if(key !in keys) {
            val t=textures.remove(key)!!;textureBytes-=t.width.toLong()*t.height*4;t.dispose();patches.remove(key)
        }
        for(key in keys)if(key !in textures) {
            val e=entries[key]?:continue
            try {
                val file=root.child(e.getString("file"));val raw=file.readBytes()
                require(matches(e,raw)){"story export hash changed"}
                val bytes=raw.inputStream().use{TextureBudget.pngBytes(it,512)}
                val header=java.nio.ByteBuffer.wrap(raw)
                require(validInterior(e,header.getInt(16),header.getInt(20))){"story meter interior"}
                require(textureBytes+bytes<=MAX_BYTES && bytes<=headroom()){ "story texture budget" }
                val t=Texture(file);t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
                textures[key]=t;textureBytes+=bytes
            } catch(x: Exception) { failures++;Gdx.app.log("DeathRide","story fallback $key: ${x.message}") }
        }
    }
    fun available(key: String?)=key!=null && key in textures
    /** Fit, never stretch a portrait or panel. Preserve the caller's tint. */
    fun draw(batch: Batch,key: String?,x: Float,y: Float,width: Float,height: Float): Boolean {
        val t=textures[key]?:return false
        val scale=minOf(width/t.width,height/t.height);val w=t.width*scale;val h=t.height*scale
        val color=batch.packedColor;batch.color=Color.WHITE
        batch.draw(t,x+(width-w)/2,y+(height-h)/2,w,h);batch.packedColor=color;return true
    }
    fun meter(batch: Batch,x: Float,y: Float,width: Float,height: Float): Boolean {
        val key="debt-meter";val t=textures[key]?:return false
        val b=entries[key]?.get("interior")?.asIntArray()?:return false
        if(b.size!=4 || b[0]<0 || b[1]<0 || b[2]<=b[0] || b[3]<=b[1] || b[2]>t.width || b[3]>t.height)return false
        val patch=patches.getOrPut(key){NinePatch(t,b[0],t.width-b[2],b[1],t.height-b[3]).apply{scale(.25f,.25f)}}
        if(width<patch.leftWidth+patch.rightWidth || height<patch.topHeight+patch.bottomHeight)return false
        patch.draw(batch,x,y,width,height);return true
    }
    fun dispose(){textures.values.forEach{it.dispose()};textures.clear();patches.clear();textureBytes=0;selection=emptySet()}
    companion object {
        const val MAX_BYTES=3*TextureBudget.MIB/2
        private val hash=Regex("[a-f0-9]{64}")
        private val file=Regex("[a-z0-9-]+\\.png")
        fun eligible(e: JsonValue): Boolean = try {
            e.getBoolean("owner_approved",false) && e.getBoolean("technical_eligible",false) && FaceArt.screened(e) &&
                e.getString("owner_evidence","").isNotBlank() && file.matches(e.getString("file","")) &&
                hash.matches(e.getString("source_sha256","")) && hash.matches(e.getString("sha256","")) &&
                e.getString("approved_source_sha256","")==e.getString("source_sha256") &&
                e.getString("approved_export_sha256","")==e.getString("sha256")
        } catch(_: Exception){false}
        fun matches(e: JsonValue,bytes: ByteArray)=eligible(e) &&
            MessageDigest.getInstance("SHA-256").digest(bytes).joinToString(""){"%02x".format(it)}==e.getString("sha256")
        fun validInterior(e: JsonValue,width: Int,height: Int): Boolean = try {
            if(e.getString("key","")!="debt-meter")true else {
                val b=e.get("interior").asIntArray()
                b.size==4 && b[0]>=0 && b[1]>=0 && b[2]>b[0] && b[3]>b[1] && b[2]<=width && b[3]<=height &&
                    (b[0]+width-b[2])*.25f<=250f && (b[1]+height-b[3])*.25f<=18f
            }
        } catch(_: Exception){false}
        fun ledgerIcon(p: Profile)=when {
            p.campaign.finale==2 -> "icon-cancelled"
            p.campaign.exposed -> "icon-recovery"
            else -> "icon-diversion"
        }
        fun panel(p: Profile,phase: String,campaignRace: Boolean): String? {
            if(phase=="results" && campaignRace && p.campaign.finale==2)return "ending"
            if(phase=="countdown" && campaignRace && DeathDuel.seized(p))return "final-duel"
            if(phase!="career")return null
            val pending=Campaign.pending(p)
            if(pending>=0)return "ally-"+Campaign.allies[pending].id
            if(DeathDuel.seized(p))return "car-seizure"
            return when(Career.events[p.careerRound].story.id) {
                "scrap-1","scrap-2","scrap-6","foundry-2","foundry-5","switchback-2","crown-3" -> "debt-contract"
                "foundry-1" -> "ally-rook"
                "salt-1" -> "ally-ox"
                "switchback-1" -> "ally-vex"
                "crown-1" -> "ally-mica"
                "crown-4","crown-6" -> "rig-reveal"
                "crown-7" -> "car-seizure"
                else -> null
            }
        }
    }
}
