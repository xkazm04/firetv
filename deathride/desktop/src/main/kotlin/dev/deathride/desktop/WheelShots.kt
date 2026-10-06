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

/**
 * Desktop screenshot mode for the front-wheel overlay. Env: DEATHRIDE_WHEEL_OUT (dir), DEATHRIDE_WHEEL_TAG,
 * DEATHRIDE_WHEEL_OVERLAY=0|1, DEATHRIDE_WHEEL_PPM, DEATHRIDE_WHEEL_CARS=Line,Comet,... Writes
 * <tag>-turn.png (cars at left/straight/right lock), <tag>-reversal.png (4-frame left-to-right strip) and <tag>-procedural.png.
 */
class WheelShots: ApplicationAdapter() {
    override fun create() {
        val out=File(System.getenv("DEATHRIDE_WHEEL_OUT")?:"build/wheel-shots").also{it.mkdirs()}
        val tag=System.getenv("DEATHRIDE_WHEEL_TAG")?:"after";val overlay=System.getenv("DEATHRIDE_WHEEL_OVERLAY")!="0"
        val ppm=System.getenv("DEATHRIDE_WHEEL_PPM")?.toFloatOrNull()?:26f
        val cars=(System.getenv("DEATHRIDE_WHEEL_CARS")?:"Line,Bastion,Comet,Trail").split(",")
        val art=AtlasArt(Gdx.files.internal("phase2-states"));check(art.failures==0)
        val batch=SpriteBatch();val shape=ShapeRenderer();val painter=CarPainter();val rig=WheelRig(4);rig.init()
        val screen=Matrix4().setToOrtho2D(0f,0f,1280f,720f)
        fun clear(){ScreenUtils.clear(.2f,.22f,.2f,1f);Gdx.gl.glEnable(GL20.GL_BLEND);Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)}
        fun save(name: String){
            val pix=Pixmap.createFromFrameBuffer(0,0,1280,720);val up=Pixmap(1280,720,Pixmap.Format.RGBA8888)
            for(y in 0 until 720)for(x in 0 until 1280)up.drawPixel(x,719-y,pix.getPixel(x,y))
            PixmapIO.writePNG(Gdx.files.absolute(File(out,name).absolutePath),up);pix.dispose();up.dispose()
        }
        fun drawCar(id: String,cx: Float,cy: Float,heading: Double,slot: Int,angle: Float) {
            val s=CarShapes.forId(id);val m=Matrix4(screen).translate(cx,cy,0f).scale(ppm,ppm,1f)
            rig.angle[slot]=angle;rig.tread[slot]=.3f
            val key=art.carKey(id,1f,false,0)!!
            batch.projectionMatrix=m;batch.begin();art.car(batch,key,0f,0f,s.lengthM.toFloat(),s.widthM.toFloat(),heading,Color.WHITE,false)
            if(overlay)rig.draw(batch,slot,id,0f,0f,s.lengthM.toFloat(),s.widthM.toFloat(),heading);batch.end()
        }
        if(System.getenv("DEATHRIDE_WHEEL_GRID")=="1") {
            // Calibration sheets: tenths of body length/width as grid lines, nose to the right.
            for(chunk in cars.chunked(2)) {
                clear()
                for((row,id) in chunk.withIndex()) {
                    val s=CarShapes.forId(id);val cx=640f;val cy=540f-row*340f
                    drawCar(id,cx,cy,0.0,0,0f)
                    val l=s.lengthM.toFloat()*ppm;val wd=s.widthM.toFloat()*ppm
                    shape.projectionMatrix=screen;shape.begin(ShapeRenderer.ShapeType.Line)
                    for(i in -5..5){shape.setColor(if(i==0)1f else .4f,.3f,.3f,1f);shape.line(cx+i*.1f*l,cy-wd*.6f,cx+i*.1f*l,cy+wd*.6f)}
                    for(i in -5..5){shape.setColor(.3f,.3f,if(i==0)1f else .5f,1f);shape.line(cx-l*.55f,cy+i*.1f*wd,cx+l*.55f,cy+i*.1f*wd)}
                    shape.end()
                }
                save("$tag-grid-${chunk.joinToString("-")}.png")
            }
            art.dispose();rig.dispose();Gdx.app.exit();return
        }
        // Mid-turn: left lock, straight, right lock; heading tilted slightly so rotation is exercised.
        clear()
        for((row,id) in cars.withIndex())for((col,a) in listOf(.5f,0f,-.5f).withIndex())drawCar(id,230f+col*410f,640f-row*(700f/cars.size),.12,0,a)
        save("$tag-turn.png")
        // Reversal strip: steer input ramps -1 to +1; the visual angle follows through the real smoothing step.
        clear();val times=floatArrayOf(0f,.05f,.10f,.22f);val strip=ArrayList<Float>()
        for((r,id) in listOf(cars[0],cars.getOrElse(1){cars[0]}).withIndex()) {
            var angle=WheelSteer.target(-1f,20f,0f);var steer=-1f;val dt=1f/240f;var t=0f;var next=0;val frames=ArrayList<Float>()
            while(frames.size<4){
                if(t>=times[next]-1e-4f){frames.add(angle);next++;if(next==4)break}
                steer=(steer+12f*dt).coerceAtMost(1f)   // rising steer input, like the stick going hard over
                angle=WheelSteer.step(angle,WheelSteer.target(steer,20f,0f),dt);t+=dt
            }
            for((i,a) in frames.withIndex())drawCar(id,170f+i*310f,520f-r*300f,0.0,0,a)
            if(r==0)strip.addAll(frames)
        }
        save("$tag-reversal.png")
        println("DeathRide wheelStrip ${strip.map{"%.2f".format(it)}}")
        // Procedural fallback: same angles.
        clear();shape.projectionMatrix=Matrix4(screen).translate(640f,360f,0f).scale(ppm*.8f,ppm*.8f,1f)
        shape.begin(ShapeRenderer.ShapeType.Filled)
        val w=World(track=Track(course=Courses.all[0]));CarCatalog.apply(w.cars[0],0)
        for((col,a) in listOf(.5f,0f,-.5f).withIndex())painter.draw(shape,w.cars[0],(-14f+col*14f),0f,.12,Color.SKY,false,wheelAngle=if(overlay)a else 0f,tread=.3f)
        shape.end();save("$tag-procedural.png")
        art.dispose();rig.dispose();Gdx.app.exit()
    }
}
