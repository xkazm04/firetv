package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.glutils.*
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.game.RoadMarkMesh
import java.io.File
import java.util.Random

/** Compare actual GL pixels against the existing renderer, not a duplicate formula. */
class RoadMarkAudit: ApplicationAdapter() {
    override fun create(){
        val output=File("evidence/perf/p5/pixels").apply{mkdirs()}
        val random=Random(17)
        val lines=Array(1000){FloatArray(8){i->when(i){in 0..3->random.nextFloat()*256;4->random.nextFloat()*8;else->random.nextFloat()}}}
        lines[0]=floatArrayOf(8f,8f,8f,8f,2f,1f,0f,0f)
        val cached=RoadMarkMesh();val shape=ShapeRenderer(7000)
        val target=FrameBuffer(Pixmap.Format.RGBA8888,256,256,false)
        var compared=0L
        for(pass in 0..2){
            val matrix=Matrix4().setToOrtho2D(0f,0f,256f,256f)
            if(pass==1)matrix.translate(15f,-20f,0f).scale(.7f,1.2f,1f)
            if(pass==2)matrix.rotate(0f,0f,1f,11f)
            cached.clear();for(p in lines)cached.line(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]);cached.upload()
            target.begin();ScreenUtils.clear(.1f,.2f,.3f,1f)
            shape.projectionMatrix=matrix;shape.begin(ShapeRenderer.ShapeType.Filled)
            for(p in lines){shape.setColor(p[5],p[6],p[7],1f);shape.rectLine(p[0],p[1],p[2],p[3],p[4])}
            shape.end();val before=Pixmap.createFromFrameBuffer(0,0,256,256);target.end()
            target.begin();ScreenUtils.clear(.1f,.2f,.3f,1f);cached.draw(matrix)
            val after=Pixmap.createFromFrameBuffer(0,0,256,256);target.end()
            var different=0
            for(y in 0..255)for(x in 0..255){compared++;if(before.getPixel(x,y)!=after.getPixel(x,y))different++}
            PixmapIO.writePNG(Gdx.files.local("${output.path}/reference-$pass.png"),before)
            PixmapIO.writePNG(Gdx.files.local("${output.path}/cached-$pass.png"),after)
            before.dispose();after.dispose();check(different==0){"Pass $pass: $different different pixels"}
        }
        File(output,"result.json").writeText("{\"pass\":true,\"comparedPixels\":$compared,\"differentPixels\":0,\"meshCapacityBytes\":${cached.capacityBytes},\"scope\":\"Desktop GL, 1000 lines, zero-length and three transforms\"}")
        cached.dispose();shape.dispose();target.dispose();Gdx.app.exit()
    }
}
