package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.core.*
import dev.deathride.game.*
import java.io.File

/** Actual production obstacle painter, atlas upload and missing-art fallback, in real desktop GL. */
class ObstacleAudit: ApplicationAdapter() {
    override fun create() {
        val art=AtlasArt(Gdx.files.internal("phase2-states"));check(art.failures==0)
        val fallback=AtlasArt(Gdx.files.internal("missing-obstacle-audit"));check(fallback.regionCount==0)
        val batch=SpriteBatch();val shape=ShapeRenderer();val painter=ObstaclePainter();val carPainter=CarPainter()
        val font=nativeFont(18);val screen=Matrix4().setToOrtho2D(0f,0f,1280f,720f)
        ScreenUtils.clear(.12f,.17f,.15f,1f)
        Gdx.gl.glEnable(GL20.GL_BLEND);Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)
        val ids=listOf("brush","rock-field","dead-tree","rock-spire")
        for(row in 0..1)for(col in ids.indices) {
            val c=Courses.all[0];val id=ids[col]
            val course=Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,c.spots,emptyList(),listOf(ObstaclePlacement(id,.4,0.0,0.0,71)))
            val w=World(track=Track(course=course));CarCatalog.apply(w.cars[0],0);val o=w.obstacles.all[0]
            val selected=if(row==0)art else fallback
            val matrix=Matrix4(screen).translate(155f+col*320,535f-row*340,0f).scale(29f,29f,1f).translate(-o.x.toFloat(),-o.y.toFloat(),0f)
            shape.projectionMatrix=matrix;batch.projectionMatrix=matrix
            Gdx.gl.glEnable(GL20.GL_BLEND);Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)
            shape.begin(ShapeRenderer.ShapeType.Filled);painter.shapes(shape,w,selected,false);shape.end()
            batch.begin();painter.sprites(batch,w,selected,false);batch.end()
            Gdx.gl.glEnable(GL20.GL_BLEND);Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)
            shape.begin(ShapeRenderer.ShapeType.Filled)
            carPainter.draw(shape,w.cars[0],o.x.toFloat()-1.5f,o.y.toFloat()-1.3f,o.heading,Color.SKY,false)
            painter.shapes(shape,w,selected,true);shape.end()
            batch.begin();painter.sprites(batch,w,selected,true);batch.end()
            batch.projectionMatrix=screen;batch.begin()
            font.draw(batch,"${if(row==0)"ATLAS" else "FALLBACK"}: $id",15f+col*320,695f-row*340)
            font.draw(batch,"${o.definition.effect} / ${o.definition.height} m tall",15f+col*320,669f-row*340)
            batch.end()
        }
        check(art.draws>=8);check(fallback.draws==0L)
        val dir=File("evidence/gameplay/obstacles").apply{mkdirs()}
        val pixels=Pixmap.createFromFrameBuffer(0,0,Gdx.graphics.width,Gdx.graphics.height)
        val png=PixmapIO.PNG();png.setFlipY(true);png.write(Gdx.files.local("${dir.path}/desktop.png"),pixels);png.dispose();pixels.dispose()
        File(dir,"desktop.json").writeText("""{"realDesktopGL":true,"atlasDraws":${art.draws},"fallbackDraws":${fallback.draws},"atlasFailures":${art.failures},"newTextures":0,"scope":"Production painter: low props and shadows below car; tall props above. Owner and Stick checks pending."}""")
        font.dispose();shape.dispose();batch.dispose();art.dispose();fallback.dispose();Gdx.app.exit()
    }
}
