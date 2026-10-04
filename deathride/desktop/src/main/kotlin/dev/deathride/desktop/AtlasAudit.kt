package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.JsonWriter
import dev.deathride.game.AtlasArt
import dev.deathride.game.GlyphLayer
import dev.deathride.game.HandCutFont
import dev.deathride.game.HudTheme
import dev.deathride.core.Career
import dev.deathride.core.AbilityCatalog
import java.io.File

/** Real GL upload, draw and isolated failure injection. Never mutates the accepted bundle. */
class AtlasAudit: ApplicationAdapter() {
    override fun create() {
        val prefix=System.getenv("DEATHRIDE_ATLAS_AUDIT_PREFIX")?:"i1-atlas-gl"
        val bundle=System.getenv("DEATHRIDE_ATLAS_BUNDLE")?:"phase2-v1"
        val hasCars=bundle=="phase2-states"
        val expectedRegions=if(hasCars)168 else if(bundle=="phase2-hud")98 else 78
        val residentBytes=11272192L+if(hasCars)8388608L else 0L
        val a=AtlasArt(Gdx.files.internal(bundle));check(a.failures==0 && a.regionCount==expectedRegions);check(a.textureBytes==residentBytes)
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
        if(hasCars) {
            ScreenUtils.clear(.1f,.1f,.1f,1f);batch.begin()
            for((row,car) in dev.deathride.core.CarCatalog.all.withIndex())for(col in 0..6) {
                val hp=when(col){1->.5f;2->.2f;else->1f}
                val key=a.carKey(car.id,hp,col==3,if(col>=4)col-3 else 0)?:error("missing ${car.id} frame $col")
                a.car(batch,key,95f+col*180,675f-row*67,155f,57f,0.0,Color.WHITE,false)
            }
            batch.end()
            check(a.carKey("missing",1f,false)==null)
        }
        if(bundle=="phase2-hud") {
            // Use actual glyph advances and the production wrapper, including the longest authored copy.
            val bodyFont=nativeFont(HudTheme.BODY);val titleFont=HandCutFont.create(HudTheme.TITLE)
            val body=GlyphLayer(bodyFont);val title=GlyphLayer(titleFont)
            val titles=Career.events.map{event->
                val width=title.width(event.name.uppercase());check(width<=677f){"Career heading overflow: ${event.name}: $width"}
                body.clear();val bottom=body.wrapped(event.story.lines.joinToString(" "),66f,453f,677f,25f)
                check(bottom>=378f){"Career story overflow: ${event.id}: $bottom"}
                """{"event":"${event.id}","titleWidth":$width,"storyNextBaseline":$bottom}"""
            }
            for(d in AbilityCatalog.all)check(body.width(d.name.uppercase())<=222f){"Ability heading overflow: ${d.name}"}
            for(laps in Career.events.map{it.laps}.distinct())for(lap in 1..laps)
                check(196f+title.width("$lap/$laps")<=359f){"Two-digit career lap counter overflows its padded frame"}
            File("evidence/phase2").mkdirs()
            File("evidence/phase2/$prefix-text.json").writeText("""{"bodyLogicalSize":${HudTheme.BODY},"body1080pNominalSize":${HudTheme.BODY*1.5},"headingLogicalSize":${HudTheme.TITLE},"allTenAbilityNamesFit":true,"career":[${titles.joinToString(",")}],"limit":"Desktop font advances; Android screens are checked separately. Nominal font size is not each glyph's ink height."}""")
            bodyFont.dispose();titleFont.dispose()
        }
        val pix=Pixmap.createFromFrameBuffer(0,0,1280,720);var vivid=0
        for(y in 0 until pix.height)for(x in 0 until pix.width){val c=pix.getPixel(x,y);if((c ushr 24)>70)vivid++}
        check(vivid>10000){"uploaded atlas did not draw visible content: $vivid"}
        val output=Gdx.files.local("evidence/phase2/$prefix.png");output.parent().mkdirs();PixmapIO.writePNG(output,pix);pix.dispose()
        a.selectBackdrop("backdrops/industrial");check(a.textureBytes==residentBytes+4194304L)
        a.selectBackdrop("backdrops/alpine");check(a.textureBytes==residentBytes+4194304L)
        a.selectBackdrop(null);check(a.textureBytes==residentBytes)
        check((a.carKey("Line",1f,false)!=null)==hasCars);a.dispose()
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
        if(hasCars) {
            val carMeta=JsonReader().parse(root.child("cars.json"))
            val id=catalog.get("assets").first{it.getString("logical_name")=="cars/needle/clean"}.getString("asset_id")
            val car=carMeta.get("regions").first{it.getString("id")==id}
            car.remove("body_bounds_px");car.addChild("body_bounds_px",JsonReader().parse("[0,0,0,1]"))
            root.child("cars.json").writeString(carMeta.toJson(JsonWriter.OutputType.json),false)
        }
        val invalid=AtlasArt(root)
        check(!invalid.available("hud/frame-health") && !invalid.available("effects/muzzle"))
        check(invalid.failures>=2 && invalid.available("pickups/repair"))
        if(hasCars)check(invalid.carKey("Needle",1f,false)==null && invalid.carKey("Needle",.5f,false)!=null)
        invalid.dispose()
        batch.dispose()
        File("evidence/phase2/$prefix.json").writeText("""{"regions":$expectedRegions,"residentBytes":$residentBytes,"oneBackdropBytes":4194304,"visiblePixels":$vivid,"missingCatalogFallback":true,"failedPagesFallback":true,"carApprovalFallback":true,"budgetFallback":true,"invalidMetadataFallback":true,"carFramesDrawn":${if(hasCars)70 else 0},"heading":"runtime rotation; desktop GL audit, not device performance"}""")
        Gdx.app.log("DeathRide","atlas GL audit passed visiblePixels=$vivid");Gdx.app.exit()
    }
}
