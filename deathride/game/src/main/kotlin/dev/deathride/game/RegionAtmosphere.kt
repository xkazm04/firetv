package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import dev.deathride.core.RegionDefinition
import dev.deathride.core.VisualTuning
import kotlin.math.min

/** 24 fixed presentation slots reserved from MotionEffects' existing dust budget.
 * No World, Snapshot, surface or simulation RNG reference is available to this object. */
class RegionAtmosphere {
    companion object {
        const val CAPACITY=24
        const val MIN_VEHICLE_RESERVE=72
        val VEHICLE_CAPACITY=(VisualTuning["particleCapacity"].toInt()-CAPACITY).also{require(it>=MIN_VEHICLE_RESERVE)}
    }
    private val x=FloatArray(CAPACITY);private val y=FloatArray(CAPACITY)
    private val age=DoubleArray(CAPACITY);private val family=IntArray(CAPACITY){-1}
    private val clocks=DoubleArray(2)
    private var definition: RegionDefinition?=null
    private var look: RegionLook?=null
    private var random=0x524547
    val activeCount get()=family.count{it>=0}
    var spawned=0L;private set
    fun familyCount(index: Int)=family.count{it==index}
    fun select(region: RegionDefinition?) {
        definition=region;look=region?.let(::RegionLook);family.fill(-1);clocks.fill(0.0);age.fill(0.0)
        random=0x524547;spawned=0
    }
    private fun random(): Float { random=random xor (random shl 13);random=random xor (random ushr 17);random=random xor (random shl 5);return (random ushr 8)/16777216f }
    /** Long pauses expire old particles but never repay a backlog of weather spawns. */
    fun update(dt: Double) {
        val region=definition?:return
        if(!dt.isFinite() || dt<=0)return
        for(i in family.indices)if(family[i]>=0) {
            val f=region.weather[family[i]];age[i]+=dt
            if(age[i]>=f.life){family[i]=-1;continue}
            val step=min(dt,.1).toFloat()
            x[i]=(x[i]+step*when(f.kind){"sleet"->.075f;"dust","fog"->.028f;else->.012f})%1f
            y[i]=(y[i]+1+step*when(f.kind){"embers"->.04f;"sleet"->-.20f;"fog","dust"->.002f;else->-.035f})%1f
        }
        for(k in region.weather.indices) {
            val f=region.weather[k];clocks[k]+=min(dt,.1)*f.rate
            while(clocks[k]>=1) {
                clocks[k]-=1
                if(familyCount(k)>=f.cap || activeCount>=region.weatherCap)continue
                val i=family.indexOfFirst{it<0};if(i<0)continue
                family[i]=k;age[i]=0.0;x[i]=random();y[i]=random();spawned++
            }
        }
    }
    /** Conservative projected alpha coverage at the actual destination viewport. */
    fun coverage(width: Float,height: Float): Double {
        val r=definition?:return 0.0
        if(width<=0 || height<=0)return 0.0
        val scale=min(width/1920f,height/1080f)
        return r.weather.sumOf{it.cap*it.pixels*it.pixels*scale*scale*it.alpha}/(width*height)
    }
    fun draw(r: ShapeRenderer,width: Float=1280f,height: Float=720f) {
        val region=definition?:return;val colors=look?:return
        val scale=min(width/1920f,height/1080f)
        for(i in family.indices)if(family[i]>=0) {
            val f=region.weather[family[i]];val size=(f.pixels*scale).toFloat()
            val fade=min(1.0,age[i]*4)*min(1.0,(f.life-age[i])*2)
            val color=colors.color(if(f.kind=="embers")"accent" else if(f.kind=="dust")"sand" else "snow")
            r.setColor(color.r,color.g,color.b,(f.alpha*fade).toFloat())
            val px=x[i]*width;val py=y[i]*height
            when(f.kind) {
                "fog","dust" -> r.ellipse(px-size*.5f,py-size*.125f,size,size*.25f,12)
                "sleet" -> r.rectLine(px,py,px+size*.30f,py-size*.85f,maxOf(.5f,scale))
                "salt-glints" -> {r.rect(px-size*.5f,py,size,scale);r.rect(px,py-size*.5f,scale,size)}
                "embers" -> r.triangle(px,py,px+size*.4f,py+size*.6f,px-size*.2f,py+size*.7f)
                else -> r.rect(px,py,size*.35f,size*.25f)
            }
        }
        // Edge-only bands share the existing shape pass, never a fullscreen target/pass.
        val edge=min(width,height)*.08f
        for(i in 0..3) {
            val a=(region.vignette*(4-i)/4).toFloat();r.setColor(.04f,.035f,.03f,a)
            val d=edge*i/4;val band=edge/4
            r.rect(d,0f,band,height);r.rect(width-d-band,0f,band,height)
            r.rect(edge,d,width-2*edge,band);r.rect(edge,height-d-band,width-2*edge,band)
        }
        val c=colors.color("snow");r.setColor(c.r,c.g,c.b,(region.fog*.5).toFloat())
        r.rect(0f,0f,width,edge*.5f)
        r.color=Color.WHITE
    }
}
