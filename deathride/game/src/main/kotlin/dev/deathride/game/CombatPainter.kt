package dev.deathride.game

import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import dev.deathride.core.*
import kotlin.math.*

/** Geometry only: no game-art assets, growing collections or per-frame effect objects. */
class CombatPainter {
    private fun ring(r: ShapeRenderer,x: Float,y: Float,radius: Float,width: Float) {
        val u=UnitRing.SEGMENTS_24
        for(i in 0 until 24)r.rectLine(x+u.cos[i].toFloat()*radius,y+u.sin[i].toFloat()*radius,x+u.cos[i+1].toFloat()*radius,y+u.sin[i+1].toFloat()*radius,width)
    }
    fun ground(r: ShapeRenderer,w: World,view: ViewBounds=ViewBounds.ALL) {
        val combat=w.combat
        for(p in combat.pickups)if(p.cooldownSeconds<=0 && view.sees(p.x,p.y,p.type.radiusM+1.5)) {
            val x=p.x.toFloat();val y=p.y.toFloat();val radius=p.type.radiusM.toFloat()
            r.setColor(.015f,.035f,.04f,.6f);r.circle(x+.3f,y-.4f,radius,12)
            if(p.type.id=="repair")r.setColor(.22f,.84f,.57f,.85f) else r.setColor(.45f,.76f,1f,.85f)
            ring(r,x,y,radius,.16f);r.rect(x-1.25f,y-1.25f,2.5f,2.5f)
            r.setColor(.04f,.10f,.14f,1f)
            if(p.type.id=="repair"){r.rect(x-.22f,y-.85f,.44f,1.7f);r.rect(x-.85f,y-.22f,1.7f,.44f)}
            else for(i in -1..1)r.rect(x+i*.55f-.12f,y-.7f,.24f,1.4f)
        }
        val mine=Weapons.all[Weapons.MINE]
        val mineRadius=mine.radiusM.toFloat();val bodyScale=min(1f,mineRadius/1.3f)
        for(m in combat.mines)if(m.active && view.sees(m.x,m.y,mine.radiusM+1.0)) {
            val x=m.x.toFloat();val y=m.y.toFloat();val armed=m.ageSeconds>=mine.armingSeconds
            val pulse=(.5+.5*sin(w.seconds*12)).toFloat()
            if(armed)r.setColor(1f,.30f,.13f,.18f) else r.setColor(1f,.74f,.26f,.12f)
            r.circle(x,y,mine.radiusM.toFloat(),24)
            if(armed)r.setColor(1f,.37f,.18f,.7f) else r.setColor(1f,.78f,.30f,.35f+pulse*.35f)
            ring(r,x,y,mineRadius,min(.16f,mineRadius*.15f))
            r.setColor(.04f,.045f,.045f,1f);r.circle(x+.15f*bodyScale,y-.2f*bodyScale,1.05f*bodyScale,10)
            r.setColor(.40f,.43f,.37f,1f);r.circle(x,y,.85f*bodyScale,10)
            r.setColor(1f,if(armed).16f else .72f,.06f,1f);r.circle(x,y,(.18f+pulse*.12f)*bodyScale,8)
            if(!armed)ring(r,x,y,(mine.radiusM*(m.ageSeconds/mine.armingSeconds)).toFloat(),min(.12f,mineRadius*.15f))
        }
    }
    fun air(r: ShapeRenderer,w: World,art: AtlasArt?=null) {
        val spriteSmoke=art?.available("effects/smoke")==true
        val spriteBlast=art?.available("effects/explosion")==true
        val spriteMuzzle=art?.available("effects/muzzle")==true
        val combat=w.combat
        for(p in combat.projectiles)if(p.active) {
            val x=p.x.toFloat();val y=p.y.toFloat();val dx=(p.vx/Weapons.all[1].speedMps).toFloat();val dy=(p.vy/Weapons.all[1].speedMps).toFloat()
            val trail=(Weapons.all[1].speedMps*Weapons.all[1].traceSeconds).toFloat()
            r.setColor(1f,.36f,.10f,.32f);r.rectLine(x-dx*trail,y-dy*trail,x,y,1.2f)
            r.setColor(1f,.86f,.40f,1f);r.rectLine(x-dx*1.4f,y-dy*1.4f,x+dx*.5f,y+dy*.5f,.55f)
        }
        for(i in w.cars.indices)if(combat.traceSeconds[i]>0) {
            val alpha=(combat.traceSeconds[i]/Weapons.all[0].traceSeconds).toFloat()
            r.setColor(1f,.78f,.36f,alpha*.85f)
            r.rectLine(combat.traceX[i].toFloat(),combat.traceY[i].toFloat(),combat.traceEndX[i].toFloat(),combat.traceEndY[i].toFloat(),.12f)
            if(!spriteMuzzle)r.circle(combat.traceX[i].toFloat(),combat.traceY[i].toFloat(),.55f*alpha,8)
        }
        for(b in combat.blasts)if(b.remainingSeconds>0) {
            val life=Weapons.all[2].traceSeconds;val age=(1-b.remainingSeconds/life).toFloat();val radius=b.radiusM.toFloat()
            if(!spriteBlast){r.setColor(1f,.36f,.08f,(1-age)*.5f);r.circle(b.x.toFloat(),b.y.toFloat(),radius*(.3f+age*.7f),24)}
            r.setColor(1f,.84f,.38f,(1-age)*.8f);ring(r,b.x.toFloat(),b.y.toFloat(),radius*(.2f+age*.8f),min(.25f,radius*.15f))
            if(!spriteBlast)for(i in 0..11){val a=i*PI/6;val distance=radius*age*.7f;val end=distance+radius*.3f;r.rectLine((b.x+cos(a)*distance).toFloat(),(b.y+sin(a)*distance).toFloat(),(b.x+cos(a)*end).toFloat(),(b.y+sin(a)*end).toFloat(),min(.14f,radius*.15f))}
        }
        for(c in w.cars) {
            if(!c.entered)continue
            val hp=(combat.health(c.id)/combat.maxHealth(c.id)).toFloat();val x=c.x.toFloat();val y=c.y.toFloat()
            if(!spriteSmoke && hp<CombatRules["smokeHpFraction"])for(i in 0..3) {
                val age=((w.seconds*.8+i*.25)%1).toFloat()
                r.setColor(.11f,.13f,.14f,(1-age)*.38f)
                r.circle(x+age*2+sin(w.seconds+i).toFloat()*.4f,y+age*3,.4f+age*1.7f,10)
            }
            if(hp<1 || c.human) {
                val py=y-(c.spec.circleRadiusM+c.spec.circleOffsetM+1).toFloat();val width=c.spec.circleRadiusM.toFloat()*2
                r.setColor(.025f,.035f,.045f,.9f);r.rect(x-width*.5f-.1f,py-.1f,width+.2f,.55f)
                r.setColor(1-hp,hp*.75f+.15f,.22f,1f);r.rect(x-width*.5f,py,width*hp,.35f)
            }
        }
    }
}
