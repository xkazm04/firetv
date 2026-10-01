package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import dev.deathride.core.Snapshot
import dev.deathride.core.VisualTuning
import kotlin.math.*

/** Fixed visual pools, fed only by the read-only simulation snapshot. */
class AtlasEffects(private val art: AtlasArt) {
    private val keys=arrayOf("effects/muzzle","effects/explosion","effects/sparks","effects/smoke","effects/fire","decals/skid","decals/scorch")
    private val pool=FloatArray(96*7)
    private val trace=DoubleArray(6);private val flash=DoubleArray(6);private val smoke=DoubleArray(6)
    private val driftSmoke=DoubleArray(6)
    private val wreck=BooleanArray(6);private var blasts=IntArray(0)
    private var next=0;private var skidClock=0.0
    var driftSmokeEmitted=0L;private set
    var driftSkidsEmitted=0L;private set
    val activeCount: Int get() { var count=0;for(n in pool.indices step 7)if(pool[n+6]>0)count++;return count }
    fun clear() { pool.fill(0f);trace.fill(0.0);flash.fill(0.0);smoke.fill(0.0);driftSmoke.fill(0.0);wreck.fill(false);blasts.fill(0);next=0;skidClock=0.0;driftSmokeEmitted=0;driftSkidsEmitted=0 }
    private fun emit(kind: Int,x: Double,y: Double,size: Double,heading: Double=0.0,life: Double=art.duration(keys[kind])): Boolean {
        if(!art.available(keys[kind]) || life<=0)return false
        val n=next*7;next=(next+1)%96
        pool[n]=kind.toFloat();pool[n+1]=x.toFloat();pool[n+2]=y.toFloat();pool[n+3]=size.toFloat();pool[n+4]=(heading*180/PI).toFloat();pool[n+5]=0f;pool[n+6]=life.toFloat()
        return true
    }
    fun update(s: Snapshot,dt: Double) {
        if(blasts.size!=s.blastCount)blasts=IntArray(s.blastCount) // course transition only
        for(n in pool.indices step 7)if(pool[n+6]>0){pool[n+5]+=dt.toFloat();if(pool[n+5]>=pool[n+6])pool[n+6]=0f}
        skidClock+=dt;val skid=skidClock>=.10;if(skid)skidClock=0.0
        for(i in 0..5)if(s.entered(i)) {
            if(s.traceSeconds(i)>trace[i])emit(0,s.traceX(i),s.traceY(i),3.0,s.heading(i))
            if(s.flash(i)>flash[i])emit(2,s.x(i),s.y(i),4.0,s.heading(i))
            if(s.wrecked(i) && !wreck[i])emit(6,s.x(i),s.y(i),9.0,life=20.0)
            smoke[i]+=dt
            if(s.healthFraction(i)<.35 && smoke[i]>=.4){smoke[i]=0.0;emit(3,s.x(i),s.y(i),5.0)}
            driftSmoke[i]+=dt
            if(s.drifting(i) && !s.wrecked(i) && s.speed(i)>5) {
                val quality=s.driftQuality(i)
                if(skid && emit(5,s.x(i),s.y(i),3.0+quality*VisualTuning["driftSkidSizeGain"],s.heading(i),8.0))driftSkidsEmitted++
                if(driftSmoke[i]>=VisualTuning["driftSmokeIntervalSeconds"]/(1+quality)) {
                    driftSmoke[i]=0.0
                    if(emit(3,s.x(i)-cos(s.heading(i))*2,s.y(i)-sin(s.heading(i))*2,VisualTuning["driftSmokeSizeM"]*(1+quality)))driftSmokeEmitted++
                }
            }
            trace[i]=s.traceSeconds(i);flash[i]=s.flash(i);wreck[i]=s.wrecked(i)
        }
        for(i in 0 until s.blastCount)if(s.blastRemaining(i)>0 && s.blastActivation(i)!=blasts[i]) {
            blasts[i]=s.blastActivation(i);emit(1,s.blastX(i),s.blastY(i),s.blastRadius(i)*2)
        }
    }
    fun ground(batch: SpriteBatch,s: Snapshot) {
        for(n in pool.indices step 7)if(pool[n+6]>0 && pool[n]>=5)draw(batch,n)
        for(i in 0 until s.pickupCount)if(s.pickupReady(i))art.draw(batch,"pickups/"+s.pickupId(i),s.pickupX(i).toFloat(),s.pickupY(i).toFloat(),s.pickupRadius(i).toFloat()*2,s.pickupRadius(i).toFloat()*2)
    }
    private fun draw(batch: SpriteBatch,n: Int) {
        val kind=pool[n].toInt();val age=pool[n+5].toDouble()
        if(kind>=5)batch.setColor(1f,1f,1f,(1-pool[n+5]/pool[n+6]).coerceIn(0f,1f))
        art.draw(batch,keys[kind],pool[n+1],pool[n+2],pool[n+3],pool[n+3],pool[n+4],if(kind>=5)0.0 else age)
        batch.color=Color.WHITE
    }
    fun air(batch: SpriteBatch,s: Snapshot,seconds: Double) {
        for(n in pool.indices step 7)if(pool[n+6]>0 && pool[n]<5)draw(batch,n)
        for(i in 0..5)if(s.entered(i) && s.wrecked(i))art.draw(batch,"effects/fire",s.x(i).toFloat(),s.y(i).toFloat(),5f,5f,seconds=seconds)
    }
}
