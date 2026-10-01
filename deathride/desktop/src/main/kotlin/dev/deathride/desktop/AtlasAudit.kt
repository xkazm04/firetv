package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.game.AtlasArt
import java.io.File

/** Real GL upload, draw and isolated failure injection. Never mutates the accepted bundle. */
class AtlasAudit: ApplicationAdapter() {
    override fun create() {
        val a=AtlasArt();check(a.failures==0 && a.regionCount==78);check(a.textureBytes==11272192L)
        val batch=SpriteBatch();batch.projectionMatrix=Matrix4().setToOrtho2D(0f,0f,1280f,720f)
        ScreenUtils.clear(.1f,.1f,.1f,1f);batch.begin()
        for(i in 0..5)check(a.draw(batch,"effects/explosion",120f+i*180,420f,160f,160f,seconds=listOf(.0,.05,.11,.18,.25,.35)[i]))
        check(a.draw(batch,"rival-marrow",180f,160f,180f,180f));check(a.draw(batch,"pickups/repair",450f,160f,100f,100f))
        check(!a.draw(batch,"missing",0f,0f,1f,1f));batch.end()
        val pix=Pixmap.createFromFrameBuffer(0,0,1280,720);var vivid=0
        for(y in 0 until pix.height)for(x in 0 until pix.width){val c=pix.getPixel(x,y);if((c ushr 24)>70)vivid++}
        check(vivid>10000){"uploaded atlas did not draw visible content: $vivid"}
        val output=Gdx.files.local("evidence/phase2/i1-atlas-gl.png");output.parent().mkdirs();PixmapIO.writePNG(output,pix);pix.dispose()
        a.selectBackdrop("backdrops/industrial");check(a.textureBytes==15466496L)
        a.selectBackdrop("backdrops/alpine");check(a.textureBytes==15466496L)
        a.selectBackdrop(null);check(a.textureBytes==11272192L)
        check(a.carKey("Line",1f,false)==null);a.dispose()
        val temp=java.nio.file.Files.createTempDirectory(File("build").toPath(),"atlas-failure-audit-").toFile()
        val root=Gdx.files.absolute(temp.absolutePath)
        val absent=AtlasArt(root);check(absent.regionCount==0 && absent.failures==1);absent.dispose()
        // Only copy metadata; both page loads fail and individual tiles fail independently.
        Gdx.files.internal("phase2-v1/catalog.json").copyTo(root.child("catalog.json"))
        Gdx.files.internal("phase2-v1/world.atlas").copyTo(root.child("world.atlas"))
        root.child("ui.atlas").writeString("broken atlas",false)
        val broken=AtlasArt(root);check(broken.regionCount==0 && broken.failures>=2);check(!broken.available("pickups/repair"));broken.dispose()
        batch.dispose()
        File("evidence/phase2/i1-atlas-gl.json").writeText("""{"regions":78,"residentBytes":11272192,"oneBackdropBytes":4194304,"visiblePixels":$vivid,"missingCatalogFallback":true,"failedPagesFallback":true,"carApprovalFallback":true,"heading":"runtime rotation; production cars unavailable"}""")
        Gdx.app.log("DeathRide","atlas GL audit passed visiblePixels=$vivid");Gdx.app.exit()
    }
}
