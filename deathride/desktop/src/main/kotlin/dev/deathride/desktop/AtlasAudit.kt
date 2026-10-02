package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.JsonWriter
import dev.deathride.game.AtlasArt
import java.io.File

/** Real GL upload, draw and isolated failure injection. Never mutates the accepted bundle. */
class AtlasAudit: ApplicationAdapter() {
    override fun create() {
        val prefix=System.getenv("DEATHRIDE_ATLAS_AUDIT_PREFIX")?:"i1-atlas-gl"
        val bundle=System.getenv("DEATHRIDE_ATLAS_BUNDLE")?:"phase2-v1"
        val expectedRegions=if(bundle=="phase2-hud")98 else 78
        val a=AtlasArt(Gdx.files.internal(bundle));check(a.failures==0 && a.regionCount==expectedRegions);check(a.textureBytes==11272192L)
        val batch=SpriteBatch();batch.projectionMatrix=Matrix4().setToOrtho2D(0f,0f,1280f,720f)
        ScreenUtils.clear(.1f,.1f,.1f,1f);batch.begin()
        for(i in 0..5)check(a.draw(batch,"effects/explosion",120f+i*180,420f,160f,160f,seconds=listOf(.0,.05,.11,.18,.25,.35)[i]))
        check(a.draw(batch,"rival-marrow",180f,160f,180f,180f));check(a.draw(batch,"pickups/repair",450f,160f,100f,100f))
        check(!a.draw(batch,"missing",0f,0f,1f,1f))
        if(bundle=="phase2-hud") {
            check(a.frame(batch,"hud/frame-instrument",25f,20f,400f,90f))
            check(a.frame(batch,"hud/frame-meter",450f,40f,200f,28f))
            for((i,d) in dev.deathride.core.AbilityCatalog.all.withIndex())check(a.draw(batch,"hud/ability-"+d.id,70f+i*120,630f,96f,96f))
        }
        batch.end()
        val pix=Pixmap.createFromFrameBuffer(0,0,1280,720);var vivid=0
        for(y in 0 until pix.height)for(x in 0 until pix.width){val c=pix.getPixel(x,y);if((c ushr 24)>70)vivid++}
        check(vivid>10000){"uploaded atlas did not draw visible content: $vivid"}
        val output=Gdx.files.local("evidence/phase2/$prefix.png");output.parent().mkdirs();PixmapIO.writePNG(output,pix);pix.dispose()
        a.selectBackdrop("backdrops/industrial");check(a.textureBytes==15466496L)
        a.selectBackdrop("backdrops/alpine");check(a.textureBytes==15466496L)
        a.selectBackdrop(null);check(a.textureBytes==11272192L)
        check(a.carKey("Line",1f,false)==null);a.dispose()
        File("build").mkdirs()
        val temp=java.nio.file.Files.createTempDirectory(File("build").toPath(),"atlas-failure-audit-").toFile()
        val root=Gdx.files.absolute(temp.absolutePath)
        val absent=AtlasArt(root);check(absent.regionCount==0 && absent.failures==1);absent.dispose()
        // Only copy metadata; both page loads fail and individual tiles fail independently.
        Gdx.files.internal("$bundle/catalog.json").copyTo(root.child("catalog.json"))
        Gdx.files.internal("$bundle/world.atlas").copyTo(root.child("world.atlas"))
        root.child("ui.atlas").writeString("broken atlas",false)
        val broken=AtlasArt(root);check(broken.regionCount==0 && broken.failures>=2);check(!broken.available("pickups/repair"));broken.dispose()
        val denied=AtlasArt(Gdx.files.internal(bundle),0)
        check(denied.textureBytes==0L && denied.regionCount==0 && denied.failures>0)
        check(!denied.available("pickups/repair"));denied.dispose()
        // A valid page with invalid entry metadata must fall back only for that entry.
        File("assets/$bundle").copyRecursively(temp,overwrite=true)
        val catalog=JsonReader().parse(root.child("catalog.json"))
        val healthId=catalog.get("assets").first{it.getString("logical_name")=="hud/frame-health"}.getString("asset_id")
        val muzzle=catalog.get("assets").first{it.getString("logical_name")=="effects/muzzle"}
        for(key in listOf("frames","durations_ms")){muzzle.remove(key);muzzle.addChild(key,JsonReader().parse("[]"))}
        root.child("catalog.json").writeString(catalog.toJson(JsonWriter.OutputType.json),false)
        val metadata=JsonReader().parse(root.child("ui.json"))
        val health=metadata.get("regions").first{it.getString("id")==healthId}
        health.remove("hud_interior_px");health.addChild("hud_interior_px",JsonReader().parse("[0,0,0,1]"))
        root.child("ui.json").writeString(metadata.toJson(JsonWriter.OutputType.json),false)
        val invalid=AtlasArt(root)
        check(!invalid.available("hud/frame-health") && !invalid.available("effects/muzzle"))
        check(invalid.failures>=2 && invalid.available("pickups/repair"));invalid.dispose()
        batch.dispose()
        File("evidence/phase2/$prefix.json").writeText("""{"regions":$expectedRegions,"residentBytes":11272192,"oneBackdropBytes":4194304,"visiblePixels":$vivid,"missingCatalogFallback":true,"failedPagesFallback":true,"carApprovalFallback":true,"budgetFallback":true,"invalidMetadataFallback":true,"heading":"runtime rotation; production cars unavailable"}""")
        Gdx.app.log("DeathRide","atlas GL audit passed visiblePixels=$vivid");Gdx.app.exit()
    }
}
