package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import dev.deathride.core.*
import kotlin.math.*

/** Semantic shapes remain visible even if a future decorative atlas hook is available. */
class AbilityPainter {
    private fun ring(r: ShapeRenderer,x: Double,y: Double,radius: Double,dashed: Boolean) {
        for(i in 0 until 24)if(!dashed || i%2==0) {
            val a=i*2*PI/24;val b=(i+1)*2*PI/24
            r.rectLine((x+cos(a)*radius).toFloat(),(y+sin(a)*radius).toFloat(),(x+cos(b)*radius).toFloat(),(y+sin(b)*radius).toFloat(),.16f)
        }
    }
    fun draw(r: ShapeRenderer,s: Snapshot) {
        for(i in 0 until Tuning.CAR_COUNT)if(s.entered(i) && !s.wrecked(i)) {
            if(s.shockSeconds(i)>0){r.setColor(.25f,.9f,1f,.8f);ring(r,s.x(i),s.y(i),s.noseM(i),true)}
            val d=s.abilityDefinition(i)?:continue;val phase=s.abilityPhase(i)
            if(phase==AbilityPhase.READY)continue
            val windup=phase==AbilityPhase.WINDUP;val cooling=phase==AbilityPhase.RECOVERY
            if(cooling)r.setColor(.8f,.35f,.2f,.45f) else if(windup)r.setColor(1f,.75f,.3f,.85f) else r.setColor(.35f,.95f,1f,.95f)
            if((d.ray || d.kind==AbilityKind.PATCH) && !cooling) {
                val x=s.abilityX(i);val y=s.abilityY(i)
                if(d.kind==AbilityKind.PATCH)ring(r,x,y,d.radiusM,windup) else {
                    val ex=s.abilityEndX(i);val ey=s.abilityEndY(i);val length=hypot(ex-x,ey-y)
                    if(length>0) {
                        val nx=-(ey-y)/length*d.radiusM;val ny=(ex-x)/length*d.radiusM
                        for(side in -1..1 step 2)r.rectLine((x+nx*side).toFloat(),(y+ny*side).toFloat(),(ex+nx*side).toFloat(),(ey+ny*side).toFloat(),.12f)
                        if(!windup)r.rectLine(x.toFloat(),y.toFloat(),ex.toFloat(),ey.toFloat(),.35f)
                    }
                }
            }
            val x=s.x(i);val y=s.y(i);val heading=s.heading(i);val cx=cos(heading);val cy=sin(heading);val nose=s.noseM(i)
            // Body-state cue complements the fixed spatial cue and identifies the source in traffic.
            ring(r,x,y,s.radiusM(i)+.6,windup || cooling)
            if(!cooling && (d.kind==AbilityKind.SPIKES || d.kind==AbilityKind.CHARGE)) {
                for(end in -1..1 step 2)if(end>0 || d.kind==AbilityKind.SPIKES)for(side in -1..1) {
                    val px=x+cx*nose*end-cy*side*s.radiusM(i)*.7;val py=y+cy*nose*end+cx*side*s.radiusM(i)*.7
                    r.rectLine(px.toFloat(),py.toFloat(),(px+cx*end*1.8).toFloat(),(py+cy*end*1.8).toFloat(),.22f)
                }
            } else if(!windup && !cooling && d.engineScale>1) {
                for(side in -1..1 step 2) {
                    val px=x-cx*nose-cy*side*s.radiusM(i)*.5;val py=y-cy*nose+cx*side*s.radiusM(i)*.5
                    r.rectLine(px.toFloat(),py.toFloat(),(px-cx*nose).toFloat(),(py-cy*nose).toFloat(),.35f)
                }
            }
        }
    }
    fun art(batch: SpriteBatch,s: Snapshot,art: AtlasArt) {
        for(i in 0 until Tuning.CAR_COUNT) {
            val d=s.abilityDefinition(i)?:continue
            if(s.entered(i) && !s.wrecked(i) && s.abilityPhase(i)==AbilityPhase.ACTIVE && art.available(d.effectId)) {
                val fixed=d.ray || d.kind==AbilityKind.PATCH
                art.draw(batch,d.effectId,(if(fixed)s.abilityX(i) else s.x(i)).toFloat(),(if(fixed)s.abilityY(i) else s.y(i)).toFloat(),(s.noseM(i)*2).toFloat(),(s.noseM(i)*2).toFloat(),(s.heading(i)*180/PI).toFloat(),d.activeSeconds-s.abilityRemainingSeconds(i))
            }
        }
        batch.color=Color.WHITE
    }
}
