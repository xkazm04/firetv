package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.core.*
import dev.deathride.game.*
import java.io.File
import java.security.MessageDigest
import kotlin.math.min

/** Real desktop GL through the shipping scene/material/weather code. Never labelled Stick proof. */
class RegionAudit: ApplicationAdapter() {
    private lateinit var canvas: SceneryCanvas
    private lateinit var art: AtlasArt
    private lateinit var absent: AtlasArt
    private lateinit var scene: TrackScene
    private lateinit var batch: SpriteBatch
    private lateinit var shape: ShapeRenderer
    private lateinit var font: BitmapFont
    private lateinit var course: Course
    private lateinit var world: World
    private val weather=RegionAtmosphere()
    private val painter=CarPainter()
    private val matrix=Matrix4()
    private val modes=listOf("candidate","tint-fallback","procedural")
    private var index=0;private var mode=0
    private var frames=0
    private var baselineBytes=0L
    private val records=ArrayList<String>()
    private val out="evidence/regions/g2/render"
    override fun create() {
        File(out).mkdirs();canvas=SceneryCanvas();batch=SpriteBatch();shape=ShapeRenderer();font=BitmapFont()
        art=AtlasArt(Gdx.files.internal("phase2-states"));absent=AtlasArt(Gdx.files.internal("absent-region-audit"))
        baselineBytes=art.textureBytes
        val preview=TrackPreview.read(File("tracks/candidates/drafts/scrap-1-c.json").readText())
        course=preview.course;world=preview.world()
        // Fixed simulation instant for every region and every fallback mode.
        val inputs=Array(6){InputFrame()};repeat(120){world.step(inputs)}
        select()
    }
    private fun select() {
        val definition=Regions.all[index]
        val activeArt=if(mode==2)absent else art
        scene=TrackScene(course,canvas,activeArt,font,definition,true,mode==0)
        weather.select(definition);repeat(600){weather.update(1.0/60)}
        check(art.textureBytes==baselineBytes){"Region switch changed residency: ${art.textureBytes} != $baselineBytes"}
        if(mode==0)check(art.activeRegionVariants.size==definition.variants.size)
        if(mode==1)check(art.activeRegionVariants.isEmpty())
    }
    override fun render() {
        frames++;check(frames<5000){"Scene did not finish"}
        if(!scene.ready){scene.advance();return}
        val region=Regions.all[index]
        for(view in listOf("overview","driving","banner")) {
            ScreenUtils.clear(.07f,.06f,.05f,1f)
            val w=Gdx.graphics.width.toFloat();val h=Gdx.graphics.height.toFloat()
            if(view=="banner") {
                shape.projectionMatrix=matrix.setToOrtho2D(0f,0f,w,h);shape.begin(ShapeRenderer.ShapeType.Filled)
                RegionLook(region).backdrop(shape,0f,0f,w,h);shape.end()
            } else {
                val p=TrackPoint();course.sample(course.startFraction*course.lengthM+80,0.0,p)
                val scale=if(view=="overview")min((w-100)/(course.maxX-course.minX+80),(h-110)/(course.maxY-course.minY+80)).toFloat() else 12.8f*h/720f
                val x=if(view=="overview")((course.minX+course.maxX)*.5).toFloat() else (world.cars[0].x+world.cars[0].vx*.8).toFloat()
                val y=if(view=="overview")((course.minY+course.maxY)*.5).toFloat() else (world.cars[0].y+world.cars[0].vy*.8).toFloat()
                matrix.setToOrtho2D(0f,0f,w,h).translate(w/2,h/2,0f).scale(scale,scale,1f).translate(-x,-y,0f)
                batch.projectionMatrix=matrix;batch.begin();scene.draw(batch);batch.end()
                shape.projectionMatrix=matrix;shape.begin(ShapeRenderer.ShapeType.Filled);scene.drawRoadMarks(shape)
                if(mode==2)for(c in world.cars)painter.draw(shape,c,c.x.toFloat(),c.y.toFloat(),c.heading,Color.WHITE,false)
                shape.end()
                if(mode!=2){batch.begin();for(c in world.cars){val id=c.carClass!!.id;val key=art.carKey(id,1f,false,c.id)?:continue;val spec=CarShapes.forId(id);art.car(batch,key,c.x.toFloat(),c.y.toFloat(),spec.lengthM.toFloat(),spec.widthM.toFloat(),c.heading,Color.WHITE,false)};batch.end()}
                Gdx.gl.glEnable(GL20.GL_BLEND);Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)
                shape.projectionMatrix=matrix.setToOrtho2D(0f,0f,w,h);shape.begin(ShapeRenderer.ShapeType.Filled);weather.draw(shape,w,h);shape.end()
            }
            val file="$out/${region.id}-${modes[mode]}-$view.png"
            val pixels=Pixmap.createFromFrameBuffer(0,0,w.toInt(),h.toInt())
            PixmapIO.writePNG(Gdx.files.local(file),pixels,-1,true);pixels.dispose()
            val hash=MessageDigest.getInstance("SHA-256").digest(File(file).readBytes()).joinToString(""){"%02x".format(it)}
            records.add("{\"region\":\"${region.id}\",\"mode\":\"${modes[mode]}\",\"view\":\"$view\",\"path\":\"$file\",\"sha256\":\"$hash\",\"width\":${w.toInt()},\"height\":${h.toInt()},\"artBytes\":${art.textureBytes},\"weatherLive\":${weather.activeCount},\"weatherCoverage\":${weather.coverage(w,h)}}")
        }
        index++
        if(index==Regions.all.size){index=0;mode++}
        if(mode<modes.size)select() else {
            // Switching back after a complete cycle must restore a region's replacement slots.
            art.selectRegion(Regions.all.first());check(art.activeRegionVariants.size==3)
            art.selectRegion(null);check(art.textureBytes==baselineBytes && art.activeRegionVariants.isEmpty())
            File("evidence/regions/g2/render.json").writeText("{\"status\":\"pass\",\"source\":\"desktop GL shipping TrackScene; not Stick\",\"course\":\"scrap-1-c\",\"simulationHash\":\"${world.stateHash()}\",\"baselineArtBytes\":$baselineBytes,\"newFramebuffers\":0,\"captures\":[${records.joinToString(",")}]}\n")
            Gdx.app.exit()
        }
    }
    override fun dispose(){canvas.dispose();art.dispose();absent.dispose();batch.dispose();shape.dispose();font.dispose()}
}
