package dev.deathride.desktop

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.game.*

/** Direct review pixels only; production lookups must preserve existing portraits and deny candidates. */
object FaceArtAudit {
    fun render(root: FileHandle,output: FileHandle) {
        val manifest=JsonReader().parse(root.child("manifest.json"))
        val expected=manifest.get("face_rework")?.getInt("portrait_candidates")?:return
        val catalog=JsonReader().parse(root.child("catalog.json"))
        val portraits=catalog.get("assets").filter{it.getString("logical_name").startsWith("face-first/")}
        check(expected>0 && portraits.size==expected)
        val art=AtlasArt(root);check(art.failures==0)
        for(e in portraits) {
            check(FaceArt.screened(e) && !e.getBoolean("owner_approved"))
            check(!art.available(e.getString("logical_name")) && art.region(e.getString("asset_id"))==null)
        }
        for(v in catalog.get("content_portrait_aliases")) {
            check(art.region(v.name)!=null && art.region(v.name)===art.region(v.asString()))
        }
        val runtimeBytes=art.textureBytes;art.dispose()
        val storyRoot=Gdx.files.internal("story-art")
        val story=JsonReader().parse(storyRoot.child("catalog.json")).get("assets")
        val panels=story.filter{it.getBoolean("face_required",false) && it.getString("key")!="mechanic"}
        val loader=StoryArt(storyRoot){StoryArt.MAX_BYTES}
        loader.select(story.map{it.getString("key")}.toSet());check(loader.textureBytes==0L)
        check(story.none{loader.available(it.getString("key"))});loader.dispose()
        val atlas=TextureAtlas(root.child("ui.atlas"));val batch=SpriteBatch();val font=nativeFont(16)
        batch.projectionMatrix=Matrix4().setToOrtho2D(0f,0f,1280f,720f)
        ScreenUtils.clear(.12f,.10f,.085f,1f);val textures=ArrayList<Texture>()
        batch.begin();font.draw(batch,"UNAPPROVED FACES / EXACT ATLAS + STORY PIXELS / 60px PORTRAITS, 112px CARDS",20f,700f)
        for((i,e) in portraits.withIndex()) {
            val r=atlas.findRegion(e.getString("asset_id"));check(r!=null)
            val x=20f+i*180f
            batch.draw(r,x,550f,96f,96f);batch.draw(r,x+98f,550f,60f,60f)
            font.draw(batch,e.getString("logical_name").substringAfter('/'),x,536f)
        }
        for((i,e) in panels.withIndex()) {
            check(FaceArt.screened(e) && !e.getBoolean("owner_approved"))
            val t=Texture(storyRoot.child(e.getString("file")));t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear);textures.add(t)
            val x=20f+(i%4)*315f;val y=300f-(i/4)*220f
            batch.draw(t,x,y,176f,176f);batch.draw(t,x+181f,y,112f,112f)
            font.draw(batch,e.getString("key"),x,y-10f)
        }
        batch.end()
        val board=Pixmap.createFromFrameBuffer(0,0,1280,720)
        PixmapIO.writePNG(output.child("faces-atlas.png"),board,-1,true);board.dispose()
        textures.forEach{it.dispose()};atlas.dispose();batch.dispose();font.dispose()
        output.child("faces-gl.json").writeString("""{"status":"pass","portraitCandidates":${portraits.size},"storyFacePanels":${panels.size},"ownerApproved":0,"candidateLookupDenied":true,"sixLegacyPortraitAliasesPreserved":true,"storyCandidatesDisabled":true,"runtimeArtBytes":$runtimeBytes,"scope":"Local desktop GL and native pixel review only; no device or owner claim"}""",false)
    }
}
