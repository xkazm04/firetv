package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.g2d.Batch
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import dev.deathride.core.*

/** Uses core's immutable transforms. Shadow and crown never enlarge the physical footprint. */
class ObstaclePainter {
    fun shapes(shape: ShapeRenderer,world: World,art: AtlasArt,tall: Boolean) {
        if(!world.obstacles.enabled)return
        for(o in world.obstacles.all) {
            val d=o.definition;val x=o.x.toFloat();val y=o.y.toFloat()
            if(!tall && !art.available("fusion-render-shadow")) {
                shape.setColor(.035f,.045f,.04f,d.shadowAlpha.toFloat())
                val sx=x+(d.height*d.shadowX).toFloat();val sy=y+(d.height*d.shadowY).toFloat()
                shape.ellipse(sx-d.visualWidth.toFloat()*.5f,sy-d.visualHeight.toFloat()*.5f,
                    d.visualWidth.toFloat(),d.visualHeight.toFloat(),(o.heading*180/Math.PI).toFloat(),24)
            }
            if((d.height>=3)!=tall || art.available(art.obstacleKey(d.id,d.art)))continue
            if(d.effect==ObstacleEffect.DRAG)shape.setColor(.35f,.34f,.20f,1f) else shape.setColor(.30f,.33f,.29f,1f)
            shape.ellipse(x-d.visualWidth.toFloat()*.5f,y-d.visualHeight.toFloat()*.5f,
                d.visualWidth.toFloat(),d.visualHeight.toFloat(),(o.heading*180/Math.PI).toFloat(),12)
            shape.setColor(.48f,.46f,.34f,1f)
            shape.circle(x,y,(minOf(d.rx,d.ry)*.45).toFloat(),8)
        }
    }
    fun sprites(batch: Batch,world: World,art: AtlasArt,tall: Boolean) {
        if(!world.obstacles.enabled)return
        batch.color=Color.WHITE
        for(o in world.obstacles.all) {
            val d=o.definition
            if(!tall && art.available("fusion-render-shadow")) {
                batch.setColor(.035f,.045f,.04f,d.shadowAlpha.toFloat())
                art.draw(batch,"fusion-render-shadow",(o.x+d.height*d.shadowX).toFloat(),(o.y+d.height*d.shadowY).toFloat(),
                    d.visualWidth.toFloat(),d.visualHeight.toFloat(),(o.heading*180/Math.PI).toFloat())
                batch.color=Color.WHITE
            }
            if((d.height>=3)!=tall)continue
            art.draw(batch,art.obstacleKey(d.id,d.art),o.x.toFloat(),o.y.toFloat(),d.visualWidth.toFloat(),d.visualHeight.toFloat(),(o.heading*180/Math.PI).toFloat())
        }
    }
}
