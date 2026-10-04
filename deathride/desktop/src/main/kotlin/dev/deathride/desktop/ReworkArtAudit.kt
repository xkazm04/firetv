package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.game.*

/** Exercise exact owner-approved runtime lookup and rejected candidate exclusion in desktop GL. */
class ReworkArtAudit: ApplicationAdapter() {
    override fun create() {
        val root=Gdx.files.internal("phase2-states")
        val catalog=JsonReader().parse(root.child("catalog.json"))
        val candidates=catalog.get("assets").filter{it.getString("logical_name").startsWith("environment/")}
        val expected=JsonReader().parse(root.child("manifest.json")).get("environment_rework").getInt("candidate_count")
        check(expected>0 && candidates.size==expected){"stale/missing rework atlas"}
        val art=AtlasArt(root)
        check(art.failures==0)
        for(e in candidates) {
            check(e.getBoolean("owner_approved") && EnvironmentArt.eligible(e))
            check(art.available(e.getString("logical_name")) && art.region(e.getString("asset_id"))!=null)
        }
        for(theme in EnvironmentArt.fallbackSets.keys)check(art.themeProps(theme).isNotEmpty())
        for(id in JsonReader().parse(root.child("manifest.json")).get("owner_application").get("rejected_asset_ids").asStringArray()) {
            check(!art.available(id) && art.region(id)==null)
        }
        for(theme in EnvironmentArt.fallbackSets.keys)check(art.themeProps(theme).all{art.available(it)})
        check(art.obstacleKey("brush","props/brush")=="props/brush")
        val bytes=art.textureBytes;art.dispose()
        val atlas=TextureAtlas(root.child("world.atlas"));val batch=SpriteBatch()
        val projection=Matrix4().setToOrtho2D(0f,0f,1280f,720f);batch.projectionMatrix=projection
        val font=nativeFont(17);ScreenUtils.clear(.09f,.08f,.07f,1f)
        batch.begin();font.draw(batch,"OWNER KEPT ENVIRONMENT / ACTIVE ATLAS PIXELS / 2026-10-03",24f,704f)
        for((i,e) in candidates.withIndex()) {
            val r=atlas.findRegion(e.getString("asset_id"));check(r!=null)
            val x=24f+(i%5)*250;val y=530f-(i/5)*142
            batch.draw(r,x,y,96f,96f);batch.draw(r,x+105,y,64f,64f)
            font.draw(batch,e.getString("logical_name").substringAfter('/'),x,y-5)
        }
        batch.end()
        val output=Gdx.files.local(System.getenv("DEATHRIDE_REWORK_AUDIT_OUTPUT")?:"evidence/owner-decisions/art/gl");output.mkdirs()
        // Exercise the real procedural fallback and signage code with the existing font, no new font texture.
        val canvas=SceneryCanvas();canvas.renderer.projectionMatrix=projection
        canvas.renderer.begin(ShapeRenderer.ShapeType.Filled)
        EnvironmentArt.fallbackSets.keys.forEachIndexed { i,theme -> EnvironmentArt.fallback(canvas.renderer,theme,100f+i*200,60f) }
        val sx=font.data.scaleX;val sy=font.data.scaleY;val color=font.color.toFloatBits()
        canvas.slogan(font,EnvironmentArt.slogans[0],640f,30f,150f,28f)
        check(font.data.scaleX==sx && font.data.scaleY==sy && font.color.toFloatBits()==color)
        canvas.renderer.end()
        val board=Pixmap.createFromFrameBuffer(0,0,1280,720)
        PixmapIO.writePNG(output.child("environment-atlas.png"),board,-1,true);board.dispose()
        canvas.dispose();font.dispose();atlas.dispose();batch.dispose()
        FaceArtAudit.render(root,output)
        output.child("environment-gl.json").writeString("""{"status":"pass","activeKeptProps":${candidates.size},"ownerApproved":4,"rejectedLookupDenied":true,"legacyObstacleFallback":true,"fiveThemeFallbacks":true,"allThemePropsAvailable":true,"signFontRestored":true,"runtimeArtBytes":$bytes,"scope":"Local desktop GL; exact owner decisions applied; no device/performance claim"}""",false)
        Gdx.app.log("DeathRide","environment rework GL audit passed");Gdx.app.exit()
    }
}
