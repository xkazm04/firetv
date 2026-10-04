package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.graphics.g2d.NinePatch
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.core.*
import dev.deathride.game.*
import java.io.File
import java.security.MessageDigest

/** Local GL only. Verify dated owner selections plus synthetic stale/budget rejection controls. */
class StoryArtAudit: ApplicationAdapter() {
    override fun create() {
        val root=Gdx.files.internal("story-art")
        val catalog=JsonReader().parse(root.child("catalog.json"))
        val keys=catalog.get("assets").map{it.getString("key")}.toSet()
        val batch=SpriteBatch();batch.projectionMatrix=Matrix4().setToOrtho2D(0f,0f,1280f,720f)
        val disabled=StoryArt(root){StoryArt.MAX_BYTES}
        val approved=catalog.get("assets").filter{StoryArt.eligible(it)}.map{it.getString("key")}.toSet()
        for(key in keys){disabled.select(setOf(key));check(disabled.available(key)==(key in approved))}
        disabled.select(setOf("mechanic"));batch.begin();check(disabled.draw(batch,"mechanic",0f,0f,100f,100f));batch.end()
        disabled.select(emptySet());check(disabled.textureBytes==0L);disabled.dispose()
        File("build").mkdirs()
        val temp=FileHandle(java.nio.file.Files.createTempDirectory(File("build").toPath(),"story-synthetic-").toFile())
        val absent=StoryArt(temp){StoryArt.MAX_BYTES};absent.select(setOf("fixture"));check(absent.textureBytes==0L);absent.dispose()
        val pix=Pixmap(16,16,Pixmap.Format.RGBA8888);pix.setColor(Color.ORANGE);pix.fill();PixmapIO.writePNG(temp.child("fixture.png"),pix);pix.dispose()
        val digest=MessageDigest.getInstance("SHA-256").digest(temp.child("fixture.png").readBytes()).joinToString(""){"%02x".format(it)}
        fun fixture(technical: Boolean=true)=temp.child("catalog.json").writeString("""{"assets":[{"key":"fixture","file":"fixture.png","owner_approved":true,"technical_eligible":$technical,"owner_evidence":"SYNTHETIC TEST PIXELS ONLY; no real art approval","source_sha256":"$digest","sha256":"$digest","approved_source_sha256":"$digest","approved_export_sha256":"$digest"}]}""",false)
        fixture()
        val enabled=StoryArt(temp){StoryArt.MAX_BYTES};enabled.select(setOf("fixture"));check(enabled.textureBytes==1024L)
        batch.begin();check(enabled.draw(batch,"fixture",0f,0f,32f,32f));batch.end()
        enabled.select(emptySet());check(enabled.textureBytes==0L);enabled.dispose()
        val denied=StoryArt(temp){0L};denied.select(setOf("fixture"));check(denied.textureBytes==0L && denied.failures==1);denied.dispose()
        fixture(false)
        val rejected=StoryArt(temp){StoryArt.MAX_BYTES};rejected.select(setOf("fixture"));check(rejected.textureBytes==0L);rejected.dispose()
        fixture();temp.child("fixture.png").writeString("corrupt",false)
        val changed=StoryArt(temp){StoryArt.MAX_BYTES};changed.select(setOf("fixture"));check(changed.textureBytes==0L && changed.failures==1);changed.dispose()
        temp.child("catalog.json").writeString("{ malformed",false)
        val malformed=StoryArt(temp){StoryArt.MAX_BYTES};malformed.select(setOf("fixture"));check(malformed.textureBytes==0L && malformed.failures==1);malformed.dispose()

        val bodyFont=nativeFont(HudTheme.BODY);val body=GlyphLayer(bodyFont)
        val checks=ArrayList<String>()
        for(card in AshStory.cards.values) {
            body.clear()
            val width=if(card.id=="campaign-victory")705f else 548f
            val y=if(card.id=="campaign-victory")328f else 453f
            val bottom=body.wrapped(card.lines.joinToString(" "),66f,y,width,25f)
            check(bottom>=if(card.id=="campaign-victory")253f else 353f){"Story art text collision ${card.id}: $bottom"}
            checks.add("""{"card":"${card.id}","width":$width,"nextBaseline":$bottom}""")
        }
        val p=Profile("story-font-fixture")
        for(round in listOf(0,7,14,21,28,34)) {
            Profile::class.java.getDeclaredField("careerRound").apply{isAccessible=true}.setInt(p,round)
            body.clear();val bottom=body.wrapped(Campaign.mechanicLine(p),148f,175f,420f,24f)
            check(bottom>=127f){"Mechanic text collision at round $round: $bottom"}
        }
        val output=Gdx.files.local(System.getenv("DEATHRIDE_STORY_AUDIT_OUTPUT")?:"evidence/owner-decisions/art/story-gl");output.mkdirs()
        // Deliberate contact board, not an enabled-game screenshot. No approval fields are changed.
        ScreenUtils.clear(.09f,.08f,.07f,1f);body.clear();body.setColor(HudTheme.bone)
        body.addText("UNAPPROVED STORY CANDIDATES / LOCAL GL REVIEW",28f,698f)
        val textures=ArrayList<Texture>();batch.begin()
        for((i,e) in catalog.get("assets").withIndex()) {
            val key=e.getString("key");val t=Texture(root.child(e.getString("file")));textures.add(t)
            t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
            val x=28f+(i%4)*313f;val y=520f-(i/4)*150f
            val limit=if(key.startsWith("icon-"))32f else if(key=="mechanic")96f else 128f
            val scale=minOf(limit/t.width,limit/t.height)
            if(key=="debt-meter") {
                val b=e.get("interior").asIntArray()
                val patch=NinePatch(t,b[0],t.width-b[2],b[1],t.height-b[3]).apply{scale(.25f,.25f)}
                check(patch.topHeight+patch.bottomHeight<=18f)
                patch.draw(batch,x,y+45f,250f,18f)
            } else batch.draw(t,x,y,t.width*scale,t.height*scale)
            body.addText(key,x,y-10f)
        }
        body.draw(batch);batch.end()
        val board=Pixmap.createFromFrameBuffer(0,0,1280,720);PixmapIO.writePNG(output.child("candidate-gl-board.png"),board,-1,true);board.dispose()
        textures.forEach{it.dispose()};bodyFont.dispose();batch.dispose()
        output.child("gl-validation.json").writeString("""{"status":"pass","realAssetsApproved":${approved.size},"ownerGatesMatch":true,"syntheticUploadAndDraw":true,"releaseOnSceneChange":true,"missingRejectedChangedMalformedAndBudgetFallback":true,"text":[${checks.joinToString(",")}],"scope":"Desktop GL and actual font metrics; no Stick or performance claim"}""",false)
        Gdx.app.log("DeathRide","story art GL audit passed; ${approved.size} exact owner-kept assets enabled");Gdx.app.exit()
    }
}
