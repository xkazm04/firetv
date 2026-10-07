package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.graphics.glutils.FrameBuffer
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.BufferUtils
import com.badlogic.gdx.utils.NumberUtils
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.core.*
import dev.deathride.game.*
import org.lwjgl.opengl.GL11
import java.io.File
import java.security.MessageDigest
import kotlin.math.max
import kotlin.math.min

/** P9: every texel and vertex the scenery pass draws with blending off is opaque, and the shipping
 *  TrackScene renders byte-identical RGBA frames with and without the opaque road. Desktop GL, not Stick proof. */
class BlendAudit: ApplicationAdapter() {
    /** Records what each draw binds, whether blending is on, and the lowest vertex alpha byte. */
    private class RecordingBatch: SpriteBatch() {
        class Draw(val texture: Texture,val blending: Boolean,val minVertexAlpha: Int,val u: Float,val v: Float,val u2: Float,val v2: Float)
        val draws=ArrayList<Draw>()
        var recording=false
        private fun alpha(packed: Float)=(NumberUtils.floatToIntColor(packed) ushr 24) and 0xff
        override fun draw(texture: Texture,vertices: FloatArray,offset: Int,count: Int) {
            if(recording) {
                var a=255;var u=1f;var v=1f;var u2=0f;var v2=0f
                var i=offset;while(i<offset+count){a=min(a,alpha(vertices[i+2]));u=min(u,vertices[i+3]);v=min(v,vertices[i+4]);u2=max(u2,vertices[i+3]);v2=max(v2,vertices[i+4]);i+=5}
                // Repeat-addressed tiles use world-space UVs: the whole texture is sampled.
                draws.add(if(texture.uWrap==Texture.TextureWrap.Repeat)Draw(texture,isBlendingEnabled,a,0f,0f,1f,1f) else Draw(texture,isBlendingEnabled,a,u,v,u2,v2))
            }
            super.draw(texture,vertices,offset,count)
        }
        override fun draw(region: TextureRegion,x: Float,y: Float,width: Float,height: Float) {
            if(recording)draws.add(Draw(region.texture,isBlendingEnabled,alpha(packedColor),region.u,region.v,region.u2,region.v2))
            super.draw(region,x,y,width,height)
        }
        override fun draw(region: TextureRegion,x: Float,y: Float,originX: Float,originY: Float,width: Float,height: Float,scaleX: Float,scaleY: Float,rotation: Float) {
            if(recording)draws.add(Draw(region.texture,isBlendingEnabled,alpha(packedColor),region.u,region.v,region.u2,region.v2))
            super.draw(region,x,y,originX,originY,width,height,scaleX,scaleY,rotation)
        }
    }
    // One course per region/theme (the P9 soak cycle), plus runoff: the only playable course with an oil hazard decal.
    private val ids=listOf("scrap-1-c","foundry-1-c","salt-1-b","switchback-1-a","crown-1-a","runoff")
    private val raw=File(System.getenv("P9_RAW_DIR")?:"build/p9-blend").apply{mkdirs()}
    private val shots=File("evidence/perf/p9/blend").apply{mkdirs()}
    private lateinit var canvas: SceneryCanvas
    private lateinit var art: AtlasArt
    private lateinit var font: BitmapFont
    private lateinit var batch: RecordingBatch
    private lateinit var shape: ShapeRenderer
    private lateinit var target: FrameBuffer
    private lateinit var scene: TrackScene
    private lateinit var course: Course
    private val matrix=Matrix4()
    private val bounds=ViewBounds()
    private var index=0
    private var frames=0
    private val records=ArrayList<String>()
    private val opaqueTextures=HashMap<Texture,IntArray>()
    private var comparedPixels=0L
    private var differentPixels=0L
    private var savedShots=0
    override fun create() {
        canvas=SceneryCanvas();batch=RecordingBatch();shape=ShapeRenderer();font=nativeFont(HudTheme.BODY)
        art=AtlasArt(Gdx.files.internal("phase2-states"))
        target=FrameBuffer(Pixmap.Format.RGBA8888,1920,1080,false)
        select()
    }
    private fun select() {
        course=Courses.all.single{it.id==ids[index]}
        scene=TrackScene(course,canvas,art,font,course.region,true,true)
    }
    /** Alpha bytes below 255 inside the texel rectangle a draw samples (whole texture for repeat tiles). */
    private fun translucent(texture: Texture,u: Float,v: Float,u2: Float,v2: Float): IntArray {
        val w=texture.width;val h=texture.height
        val pixels=BufferUtils.newByteBuffer(w*h*4)
        texture.bind();GL11.glGetTexImage(GL11.GL_TEXTURE_2D,0,GL11.GL_RGBA,GL11.GL_UNSIGNED_BYTE,pixels)
        val x0=(min(u,u2)*w).toInt().coerceIn(0,w-1);val x1=(max(u,u2)*w).toInt().coerceIn(x0+1,w)
        val y0=(min(v,v2)*h).toInt().coerceIn(0,h-1);val y1=(max(v,v2)*h).toInt().coerceIn(y0+1,h)
        var below=0;var lowest=255
        for(y in y0 until y1)for(x in x0 until x1){val a=pixels.get((y*w+x)*4+3).toInt() and 0xff;if(a<255){below++;lowest=min(lowest,a)}}
        return intArrayOf(below,lowest,(x1-x0)*(y1-y0))
    }
    private fun frame(opaqueRoad: Boolean,x: Float,y: Float,ppm: Float): Pixmap {
        target.begin();ScreenUtils.clear(HudTheme.soot)
        matrix.setToOrtho2D(0f,0f,1280f,720f).translate(640f,350f,0f).scale(ppm,ppm,1f).translate(-x,-y,0f)
        bounds.set(x.toDouble(),y.toDouble(),ppm.toDouble())
        batch.projectionMatrix=matrix;batch.recording=opaqueRoad;batch.begin();scene.draw(batch,bounds,opaqueRoad);batch.end();batch.recording=false
        // The next pass in drawWorld: GL state left by the scenery pass must not change it.
        shape.projectionMatrix=matrix;shape.begin(ShapeRenderer.ShapeType.Filled);scene.drawRoadMarks(shape);shape.end()
        val pixels=Pixmap.createFromFrameBuffer(0,0,1920,1080);target.end()
        return pixels
    }
    override fun render() {
        frames++;check(frames<20000){"Scene did not finish"}
        if(!scene.ready){scene.advance();return}
        // The baked scenery target: alpha below 255 here means its quad must keep blending.
        val fbo=translucent(canvas.buffer.colorBufferTexture,0f,0f,1f,1f)
        val p=TrackPoint();val views=ArrayList<FloatArray>()
        val start=course.startFraction*course.lengthM
        course.sample(start,0.0,p);views.add(floatArrayOf(p.x.toFloat(),p.y.toFloat(),9f))
        views.add(floatArrayOf(((course.minX+course.maxX)*.5).toFloat(),((course.minY+course.maxY)*.5).toFloat(),min(1180.0/(course.maxX-course.minX),490.0/(course.maxY-course.minY)).toFloat()))
        for(k in 0 until 8){course.sample(start+course.lengthM*k/8,0.0,p);views.add(floatArrayOf(p.x.toFloat(),p.y.toFloat(),if(k%2==0)17f/1.5f else 12.8f/1.5f))}
        for(spot in course.spots)if(spot.kind=="hazard"){course.sample((course.startFraction+spot.fraction)*course.lengthM,spot.laneM,p);views.add(floatArrayOf(p.x.toFloat(),p.y.toFloat(),17f/1.5f))}
        for(f in course.features)if(f.kind=="shortcut"){course.sample((f.start+f.end)*.5*course.lengthM,f.laneM,p);views.add(floatArrayOf(p.x.toFloat(),p.y.toFloat(),17f/1.5f))}
        var different=0L;var maxDelta=0;var blendedOff=0;var blendedOn=0
        val hazards=course.spots.count{it.kind=="hazard"};val shortcuts=course.features.count{it.kind=="shortcut"}
        for((n,view) in views.withIndex()) {
            batch.draws.clear()
            val reference=frame(false,view[0],view[1],view[2])
            val opaque=frame(true,view[0],view[1],view[2])
            for(d in batch.draws) {
                if(d.blending){blendedOn++;continue}
                blendedOff++
                check(d.minVertexAlpha>=254){"${course.id}: opaque draw with vertex alpha ${d.minVertexAlpha}"}
                val audit=if(d.texture.uWrap==Texture.TextureWrap.Repeat)opaqueTextures.getOrPut(d.texture){translucent(d.texture,0f,0f,1f,1f)} else translucent(d.texture,d.u,d.v,d.u2,d.v2)
                check(audit[0]==0){"${course.id}: opaque draw samples ${audit[0]} texels with alpha below 255 (lowest ${audit[1]})"}
            }
            val a=reference.pixels;val b=opaque.pixels
            for(i in 0 until a.limit() step 4) {
                var delta=0
                for(c in 0..3)delta=max(delta,Math.abs((a.get(i+c).toInt() and 0xff)-(b.get(i+c).toInt() and 0xff)))
                if(delta>0){different++;maxDelta=max(maxDelta,delta)}
            }
            comparedPixels+=a.limit()/4
            val name="${course.id}-view$n"
            // Full-size captures for the first three views (lobby, overview, race) stay outside git; every view is hashed.
            if(n<3) {
                PixmapIO.writePNG(Gdx.files.absolute(File(raw,"$name-reference.png").path),reference,-1,true)
                PixmapIO.writePNG(Gdx.files.absolute(File(raw,"$name-opaque.png").path),opaque,-1,true)
            }
            if(n==2 && savedShots<5) {
                // One downscaled race view per course for the committed evidence.
                val small=Pixmap(480,270,Pixmap.Format.RGBA8888);small.filter=Pixmap.Filter.BiLinear
                small.drawPixmap(opaque,0,0,1920,1080,0,0,480,270);PixmapIO.writePNG(Gdx.files.local(File(shots,"${course.id}-race.png").path),small,-1,true);small.dispose();savedShots++
            }
            fun hash(p: Pixmap)=MessageDigest.getInstance("SHA-256").apply{update(p.pixels.duplicate().apply{rewind()})}.digest().joinToString(""){"%02x".format(it)}
            records.add("{\"course\":\"${course.id}\",\"region\":\"${course.region.id}\",\"theme\":\"${course.theme}\",\"view\":$n,\"x\":${view[0]},\"y\":${view[1]},\"pixelsPerM\":${view[2]},"+
                "\"referenceRgbaSha256\":\"${hash(reference)}\",\"opaqueRgbaSha256\":\"${hash(opaque)}\",\"savedPng\":${n<3}}")
            reference.dispose();opaque.dispose()
        }
        differentPixels+=different
        records.add("{\"course\":\"${course.id}\",\"summary\":true,\"views\":${views.size},\"hazards\":$hazards,\"shortcuts\":$shortcuts,\"differentPixels\":$different,\"maxChannelDelta\":$maxDelta,"+
            "\"opaqueDraws\":$blendedOff,\"blendedDraws\":$blendedOn,\"sceneryTargetTexelsBelow255\":${fbo[0]},\"sceneryTargetLowestAlpha\":${fbo[1]},\"sceneryTargetTexels\":${fbo[2]}}")
        index++
        if(index<ids.size){select();return}
        val textures=opaqueTextures.entries.joinToString(","){(t,a)->"{\"width\":${t.width},\"height\":${t.height},\"repeat\":${t.uWrap==Texture.TextureWrap.Repeat},\"sampledTexels\":${a[2]},\"below255\":${a[0]}}"}
        val pass=differentPixels==0L
        File(shots.parentFile,"blend-audit.json").writeText("{\"pass\":$pass,\"source\":\"desktop GL ${Gdx.gl.glGetString(GL20.GL_RENDERER)}, shipping TrackScene.draw + drawRoadMarks into a 1920x1080 RGBA8888 target; not Stick proof\","+
            "\"comparedPixels\":$comparedPixels,\"differentPixels\":$differentPixels,\"channels\":\"RGBA\",\"opaqueTextures\":[$textures],\"captures\":[${records.joinToString(",")}]}\n")
        check(pass){"$differentPixels pixels differ"}
        Gdx.app.exit()
    }
    override fun dispose(){target.dispose();canvas.dispose();art.dispose();batch.dispose();shape.dispose();font.dispose()}
}
