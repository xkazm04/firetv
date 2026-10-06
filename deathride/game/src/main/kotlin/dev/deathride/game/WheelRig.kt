package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.Batch
import dev.deathride.core.CarShapes
import dev.deathride.core.DriftGeometry
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/** Pure front-wheel angle logic. Visual only; the sim's steering is never written. All angles are radians, CCW positive in the car frame. */
object WheelSteer {
    const val MAX_ANGLE=0.61f          // ~35 degrees
    const val HIGH_SPEED_SCALE=.45f    // share of lock removed at full speed
    const val FULL_SPEED_MPS=45f
    const val FOLLOW_PER_SECOND=12f    // exponential catch-up rate
    const val SLEW_RAD_PER_SECOND=14f  // hard rate limit
    const val REVERSE_BOOST=2.4f       // swing through centre faster than a normal follow
    const val DRIFT_SLIP_START=.12f
    const val DRIFT_SLIP_FULL=.45f
    const val WRECK_TILT=.30f

    fun maxAngle(speedMps: Float)=MAX_ANGLE*(1f-HIGH_SPEED_SCALE*(speedMps/FULL_SPEED_MPS).coerceIn(0f,1f))

    /** Sim filtered steer is positive for a clockwise (right) turn, so the wheel angle is its negation. */
    fun target(filteredSteer: Float,speedMps: Float,slipRadians: Float): Float {
        val limit=maxAngle(speedMps)
        val steer=(-filteredSteer).coerceIn(-1f,1f)*limit
        if(speedMps<4f)return steer
        // Drift: wheels follow the velocity vector (opposite lock) once the body slips sideways.
        val s=abs(slipRadians)
        if(s<=DRIFT_SLIP_START || s>1.5f)return steer
        val k=((s-DRIFT_SLIP_START)/(DRIFT_SLIP_FULL-DRIFT_SLIP_START)).coerceIn(0f,1f)
        val along=slipRadians.coerceIn(-limit,limit)
        return steer+(along-steer)*(k*k*(3f-2f*k))
    }

    /** One smoothing step. A sign change swings through centre with boosted follow and slew so wheels never lag across zero. */
    fun step(angle: Float,target: Float,dt: Float): Float {
        if(!(dt>0f))return angle
        val d=min(dt,.1f)
        val reversing=angle*target<0f && abs(angle)>.02f
        val boost=if(reversing)REVERSE_BOOST else 1f
        var move=(target-angle)*(1f-exp(-FOLLOW_PER_SECOND*boost*d))
        val slew=SLEW_RAD_PER_SECOND*boost*d
        if(move>slew)move=slew else if(move<-slew)move=-slew
        return (angle+move).coerceIn(-MAX_ANGLE,MAX_ANGLE)
    }

    fun slip(vx: Double,vy: Double,heading: Double): Float {
        if(vx*vx+vy*vy<16.0)return 0f
        var d=atan2(vy,vx)-heading
        while(d>Math.PI)d-=2*Math.PI
        while(d<-Math.PI)d+=2*Math.PI
        return d.toFloat()
    }
}

/**
 * Front tyre overlays for atlas cars and rolling state shared with the procedural painter.
 * Preallocated per car slot; draw() and update() allocate nothing.
 */
class WheelRig(slots: Int=16) {
    val angle=FloatArray(slots)
    val tread=FloatArray(slots)        // metres of travel modulo stripe spacing
    val braking=FloatArray(slots)      // 0..1 smoothed brake darkening
    private val wreckTilt=FloatArray(slots)
    private var pixel: Texture?=null
    private val tmp=Color()
    /** The shared 1x1 white texture, so mounts drawn after the tyres stay on the same texture (no extra switch). */
    val pixelTexture: Texture? get()=pixel

    fun init() {
        if(pixel!=null)return
        val p=Pixmap(1,1,Pixmap.Format.RGBA8888);p.setColor(Color.WHITE);p.fill()
        pixel=Texture(p);p.dispose()
    }
    fun dispose() { pixel?.dispose();pixel=null }
    fun reset() { angle.fill(0f);tread.fill(0f);braking.fill(0f);wreckTilt.fill(0f) }

    fun update(slot: Int,dt: Float,filteredSteer: Float,vx: Double,vy: Double,heading: Double,longitudinalAcc: Double,wrecked: Boolean) {
        if(slot !in angle.indices)return
        if(wrecked) {
            // Frozen and splayed: settle to a crooked toe-out, nothing rolls.
            if(wreckTilt[slot]==0f)wreckTilt[slot]=(if(slot%2==0)1f else -1f)*WheelSteer.WRECK_TILT
            angle[slot]=WheelSteer.step(angle[slot],wreckTilt[slot],dt);braking[slot]=0f
            return
        }
        wreckTilt[slot]=0f
        val speed=sqrt(vx*vx+vy*vy).toFloat()
        val slip=WheelSteer.slip(vx,vy,heading)
        angle[slot]=WheelSteer.step(angle[slot],WheelSteer.target(filteredSteer,speed,slip),dt)
        val forward=(vx*cos(heading)+vy*sin(heading)).toFloat()
        tread[slot]=(tread[slot]+forward*dt)%SPACING
        val b=if(longitudinalAcc<-6.0 && speed>3f)1f else 0f
        braking[slot]+=(b-braking[slot])*(1f-exp(-14f*min(dt,.1f)))
    }

    private fun rect(batch: Batch,cx: Float,cy: Float,w: Float,h: Float,degrees: Float,co: Float,si: Float,ox: Float,oy: Float,c: Color) {
        // (cx,cy) wheel centre; (ox,oy) offset in the wheel's rotated frame (co/si = its cos/sin).
        val t=pixel?:return
        val px=cx+ox*co-oy*si;val py=cy+ox*si+oy*co
        batch.setColor(c.r,c.g,c.b,c.a)
        batch.draw(t,px-w*.5f,py-h*.5f,w*.5f,h*.5f,w,h,1f,1f,degrees,0,0,1,1,false,false)
    }

    private fun tyre(batch: Batch,cx: Float,cy: Float,l: Float,w: Float,degrees: Float,co: Float,si: Float,oy: Float,c: Color) {
        rect(batch,cx,cy,l*.80f,w,degrees,co,si,0f,oy,c);rect(batch,cx,cy,l,w*.70f,degrees,co,si,0f,oy,c)
    }

    /** x,y,heading: car centre and heading (radians). length/width: the body size the art is drawn at (metres). */
    fun draw(batch: Batch,slot: Int,id: String,x: Float,y: Float,length: Float,width: Float,heading: Double) {
        if(pixel==null || slot !in angle.indices)return
        val g=Geometry.of(id)
        val axle=g.axleX*length;val half=g.halfTrack*width
        val tl=g.tyreLength*length;val tw=g.tyreWidth*width
        val ch=cos(heading).toFloat();val sh=sin(heading).toFloat()
        val wa=heading+angle[slot]
        val deg=Math.toDegrees(wa).toFloat();val co=cos(wa).toFloat();val si=sin(wa).toFloat()
        val dark=braking[slot]
        // Straight wheels are the painted art; the overlay fades in as lock appears so only a visibly turned tyre is drawn.
        val fade=((abs(angle[slot])-FADE_START)/FADE_SPAN).coerceIn(0f,1f)
        if(fade<=0f){batch.setColor(1f,1f,1f,1f);return}
        for(k in 0..1) {
            val side=k*2-1
            val ly=side*half
            val cx=x+axle*ch-ly*sh;val cy=y+axle*sh+ly*ch
            // Outline, grey-brown rubber, scrolling tread lines, hub dot. Rounded ends are two overlapping rects.
            tmp.set(.30f,.27f,.24f,fade);tyre(batch,cx,cy,tl*1.08f,tw*1.12f,deg,co,si,0f,tmp)
            val rub=.14f-dark*.07f
            tmp.set(rub,rub*.88f,rub*.78f,fade);tyre(batch,cx,cy,tl,tw,deg,co,si,0f,tmp)
            val sp=tl/STRIPES
            val shade=.24f-dark*.10f
            tmp.set(shade,shade*.9f,shade*.8f,fade)
            for(i in 0 until STRIPES) {
                val o=((tread[slot]/SPACING)*sp+i*sp)%tl-tl*.5f
                if(o>-tl*.36f && o<tl*.36f)rect(batch,cx,cy,sp*.24f,tw*.62f,deg,co,si,o,0f,tmp)
            }
            tmp.set(.50f,.46f,.40f,fade);rect(batch,cx,cy,tw*.30f,tw*.30f,deg,co,si,0f,0f,tmp)
            if(dark>.05f){tmp.set(.9f,.2f,.1f,dark*.55f*fade);rect(batch,cx,cy,tl*.14f,tw*.8f,deg,co,si,-tl*.38f,0f,tmp)}
        }
        batch.setColor(1f,1f,1f,1f)
    }

    /** World centres of the two front-tyre overlays (written to xs/ys at [at] and [at]+1) and one radius that bounds every rect [draw] paints around them. */
    fun tyreDiscs(id: String,length: Float,width: Float,x: Float,y: Float,heading: Double,xs: FloatArray,ys: FloatArray,at: Int): Float {
        val g=Geometry.of(id)
        val axle=g.axleX*length;val half=g.halfTrack*width
        val ch=cos(heading).toFloat();val sh=sin(heading).toFloat()
        for(k in 0..1) {
            val ly=(k*2-1)*half
            xs[at+k]=x+axle*ch-ly*sh;ys[at+k]=y+axle*sh+ly*ch
        }
        val l=g.tyreLength*length*1.08f;val w=g.tyreWidth*width*1.12f
        return .5f*sqrt(l*l+w*w)+.05f
    }

    /** Front tyre centre/size as fractions of the drawn body length/width (x forward of centre, y per side). */
    class Geometry(val axleX: Float,val halfTrack: Float,val tyreLength: Float,val tyreWidth: Float) {
        companion object {
            // Measured off the shipped atlas sprites (48 px/m calibration grid): the painted front wheels. The overlay matches the painted wheel and fades in with lock.
            private val measured=mapOf(
                "Needle" to floatArrayOf(.22f,.43f,.15f,.10f),"Line" to floatArrayOf(.27f,.44f,.14f,.13f),
                "Bastion" to floatArrayOf(.195f,.37f,.19f,.26f),"Comet" to floatArrayOf(.17f,.42f,.14f,.21f),
                "Trail" to floatArrayOf(.26f,.43f,.17f,.15f),"Flint" to floatArrayOf(.205f,.37f,.205f,.15f),
                "Quill" to floatArrayOf(.18f,.39f,.14f,.16f),"Vandal" to floatArrayOf(.28f,.40f,.14f,.13f),
                "Kestrel" to floatArrayOf(.225f,.43f,.13f,.14f),"Bulwark" to floatArrayOf(.18f,.42f,.16f,.15f))
            private val cache=HashMap<String,Geometry>()
            fun of(id: String): Geometry=cache.getOrPut(id){
                val m=measured[id]
                if(m!=null)return@getOrPut Geometry(m[0],m[1]-.015f,m[2],m[3]*.92f)
                val s=CarShapes.forId(id);val g=DriftGeometry.forClass(id)
                // Unmeasured art: front axle one front-arm ahead of the centre of mass, track from the drift geometry.
                Geometry((g.frontArmM/s.lengthM).toFloat().coerceIn(.15f,.35f),(g.trackM/s.widthM*.5).toFloat().coerceIn(.30f,.47f),.17f,.16f)
            }
        }
    }
    companion object { const val FADE_START=.03f;const val FADE_SPAN=.07f;const val SPACING=.9f;const val STRIPES=6 }
}
