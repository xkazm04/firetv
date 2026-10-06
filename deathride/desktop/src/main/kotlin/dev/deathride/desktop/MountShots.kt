package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.core.*
import dev.deathride.game.*
import java.io.File

/**
 * Desktop screenshot mode for weapon mounts (`--mount-shots`), modelled on [WheelShots]. Env: DEATHRIDE_MOUNT_OUT (dir),
 * DEATHRIDE_MOUNT_TAG, DEATHRIDE_MOUNT_CARS=Line,Comet,... (default all ten), DEATHRIDE_MOUNT_GRID=1 (tenths-of-length grid, nose right,
 * for measuring attachment points). Writes per tag:
 *  - <tag>-solo-<class>.png: before (no mounts) then each weapon alone, plus all together
 *  - <tag>-overview.png: every class with every mount, nose right
 *  - <tag>-fire-<class>.png: 4-frame fire strip per weapon
 *  - <tag>-states.png: all mounts on clean, damaged-1, damaged-2 and wreck
 */
class MountShots: ApplicationAdapter() {
    override fun create() {
        val out=File(System.getenv("DEATHRIDE_MOUNT_OUT")?:"build/mount-shots").also{it.mkdirs()}
        val tag=System.getenv("DEATHRIDE_MOUNT_TAG")?:"after"
        val cars=(System.getenv("DEATHRIDE_MOUNT_CARS")?:CarCatalog.all.joinToString(","){it.id}).split(",")
        val art=AtlasArt(Gdx.files.internal("phase2-states"));check(art.failures==0)
        val batch=SpriteBatch();val rig=WheelRig(4);rig.init();val painter=MountPainter(art,{rig.pixelTexture})
        val screen=Matrix4().setToOrtho2D(0f,0f,1280f,720f)
        fun clear(){ScreenUtils.clear(.2f,.22f,.2f,1f);Gdx.gl.glEnable(GL20.GL_BLEND);Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)}
        fun save(name: String){
            val pix=Pixmap.createFromFrameBuffer(0,0,1280,720);val up=Pixmap(1280,720,Pixmap.Format.RGBA8888)
            for(y in 0 until 720)for(x in 0 until 1280)up.drawPixel(x,719-y,pix.getPixel(x,y))
            PixmapIO.writePNG(Gdx.files.absolute(File(out,name).absolutePath),up);pix.dispose();up.dispose()
        }
        val everything=MountLoadout.maskOf(MountKind.RIVET,MountKind.HAMMER,MountKind.SCATTER,MountKind.MINE,MountKind.SPIKES)
        fun drawCar(id: String,cx: Float,cy: Float,ppm: Float,mask: Int,state: Int=0,heading: Double=0.0,grid: Boolean=false) {
            val s=CarShapes.forId(id);val l=s.lengthM.toFloat();val w=s.widthM.toFloat()
            val hp=when(state){0->1f;1->.5f;2->.2f;else->.1f}
            val key=art.carKey(id,hp,state>=3,0)!!
            batch.projectionMatrix=Matrix4(screen).translate(cx,cy,0f).scale(ppm,ppm,1f);batch.begin()
            art.car(batch,key,0f,0f,l,w,heading);batch.setColor(1f,1f,1f,1f)
            painter.drawCar(batch,0,id,mask,0f,0f,heading,l,w,state)
            if(grid) {
                for(i in -5..5){batch.setColor(if(i==0)1f else .5f,.3f,.3f,.8f);batch.draw(rig.pixelTexture,i*.1f*l-.02f,-w*.6f,.04f,w*1.2f)}
                for(i in -5..5){batch.setColor(.3f,.3f,if(i==0)1f else .5f,.8f);batch.draw(rig.pixelTexture,-l*.55f,i*.1f*w-.02f,l*1.1f,.04f)}
            }
            batch.end();batch.setColor(1f,1f,1f,1f)
        }
        val grid=System.getenv("DEATHRIDE_MOUNT_GRID")=="1"
        for(id in cars) {
            val ppm=minOf(40f,380f/CarShapes.forId(id).lengthM.toFloat())
            clear()
            val cells=listOf(0 to "before",MountLoadout.maskOf(MountKind.RIVET) to "rivet",MountLoadout.maskOf(MountKind.HAMMER) to "hammer",
                MountLoadout.maskOf(MountKind.SCATTER) to "scatter",MountLoadout.maskOf(MountKind.MINE,MountKind.SPIKES) to "mine+spikes",everything to "all")
            for((i,c) in cells.withIndex())drawCar(id,213f+(i%3)*427f,540f-(i/3)*360f,ppm,c.first,0,0.0,grid)
            save("$tag-solo-$id.png")
            // Fire strip: rows are weapons, columns are four moments of the animation.
            clear()
            val rows=listOf(MountKind.RIVET,MountKind.HAMMER,MountKind.SCATTER,MountKind.MINE,MountKind.SPIKES)
            val fp=minOf(30f,250f/CarShapes.forId(id).lengthM.toFloat())
            for((r,k) in rows.withIndex())for((f,u) in listOf(0f,.15f,.4f,.8f).withIndex()) {
                painter.animator.reset();painter.animator.set(0,k,u*MountAnim.duration(k))
                if(k==MountKind.RIVET)painter.animator.set(0,k,u*MountAnim.duration(k))
                drawCar(id,170f+f*310f,650f-r*140f,fp,MountLoadout.maskOf(k),0,0.0)
            }
            save("$tag-fire-$id.png");painter.animator.reset()
        }
        clear();val ppm=24f
        for((i,id) in CarCatalog.all.map{it.id}.withIndex())drawCar(id,128f+(i%5)*256f,540f-(i/5)*300f,ppm,everything,0,0.0,grid)
        save("$tag-overview.png")
        clear()
        for(st in 0..3)drawCar(cars[0],213f+(st%2)*600f,500f-(st/2)*340f,minOf(30f,300f/CarShapes.forId(cars[0]).lengthM.toFloat()),everything,st,.35)
        save("$tag-states.png")
        art.dispose();rig.dispose();Gdx.app.exit()
    }
}
