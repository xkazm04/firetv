package dev.deathride.game

import com.badlogic.gdx.graphics.g2d.Batch
import dev.deathride.core.*
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin

/**
 * Atlas car bodies, then their steered-tyre overlays.
 *
 * The overlay has its own 1x1 texture, so the old body/tyre interleave switched textures twice per car, and the ten
 * classes sit on two atlas pages. Draw order only matters between sprites that overlap:
 *  - if no tyre disc touches a later car's visible body box, every tyre overlay follows all bodies in one batch;
 *  - if no two bodies that sit on different pages touch, the bodies are also grouped by page;
 *  - otherwise the original per-car order is kept.
 * Every branch therefore produces the same pixels as the original interleave. No allocation per frame.
 */
class CarSprites(private val art: AtlasArt,private val wheels: WheelRig) {
    private val slot=IntArray(N);private val key=arrayOfNulls<String>(N);private val spec=arrayOfNulls<CarShape>(N)
    private val x=FloatArray(N);private val y=FloatArray(N);private val heading=DoubleArray(N)
    private val length=FloatArray(N);private val width=FloatArray(N)
    private val boxX=FloatArray(N);private val boxY=FloatArray(N);private val ux=FloatArray(N);private val uy=FloatArray(N)
    private val hx=FloatArray(N);private val hy=FloatArray(N)
    private val tyreX=FloatArray(N*2);private val tyreY=FloatArray(N*2);private val tyreR=FloatArray(N)
    private val body=FloatArray(4)
    /** Bodies per frame that went through the grouped path, for audits. */
    var groupedFrames=0L;private set
    var interleavedFrames=0L;private set

    private fun projection(i: Int,ax: Float,ay: Float)=hx[i]*abs(ax*ux[i]+ay*uy[i])+hy[i]*abs(-ax*uy[i]+ay*ux[i])
    private fun apart(i: Int,j: Int,ax: Float,ay: Float,dx: Float,dy: Float)=abs(dx*ax+dy*ay)>projection(i,ax,ay)+projection(j,ax,ay)
    private fun bodiesTouch(i: Int,j: Int): Boolean {
        val dx=boxX[j]-boxX[i];val dy=boxY[j]-boxY[i]
        return !(apart(i,j,ux[i],uy[i],dx,dy) || apart(i,j,-uy[i],ux[i],dx,dy) || apart(i,j,ux[j],uy[j],dx,dy) || apart(i,j,-uy[j],ux[j],dx,dy))
    }
    private fun tyreTouchesBody(i: Int,j: Int): Boolean {
        for(side in 0..1) {
            val dx=tyreX[i*2+side]-boxX[j];val dy=tyreY[i*2+side]-boxY[j]
            val qx=abs(dx*ux[j]+dy*uy[j])-hx[j];val qy=abs(-dx*uy[j]+dy*ux[j])-hy[j]
            val ex=if(qx>0f)qx else 0f;val ey=if(qy>0f)qy else 0f
            if(ex*ex+ey*ey<tyreR[i]*tyreR[i])return true
        }
        return false
    }
    private fun body(batch: Batch,i: Int)=art.car(batch,key[i]!!,x[i],y[i],length[i],width[i],heading[i])
    private fun tyres(batch: Batch,i: Int)=wheels.draw(batch,slot[i],spec[i]!!.id,x[i],y[i],length[i],width[i],heading[i])

    fun draw(batch: Batch,world: World,alpha: Double) {
        val s=world.snapshot;val prev=world.previousSnapshot
        var n=0
        for(c in world.cars)if(c.entered && n<N) {
            if(c.ability.definition?.kind==AbilityKind.DISPATCHER)continue
            val id=c.carClass?.id?:"Line"
            val k=art.carKey(id,s.healthFraction(c.id).toFloat(),s.wrecked(c.id),c.id)?:continue
            val shape=CarShapeCache.of(id)
            slot[n]=c.id;key[n]=k;spec[n]=shape
            x[n]=(prev.x(c.id)+(s.x(c.id)-prev.x(c.id))*alpha).toFloat();y[n]=(prev.y(c.id)+(s.y(c.id)-prev.y(c.id))*alpha).toFloat()
            heading[n]=prev.heading(c.id)+wrapAngle(s.heading(c.id)-prev.heading(c.id))*alpha
            length[n]=shape.lengthM.toFloat();width[n]=shape.widthM.toFloat();n++
        }
        if(n==0)return
        var tyresLast=true;var grouped=true
        if(n>1) {
            for(i in 0 until n) {
                if(!art.carBody(key[i]!!,length[i],width[i],body)){tyresLast=false;grouped=false;break}
                val c=cos(heading[i]).toFloat();val sn=sin(heading[i]).toFloat()
                ux[i]=c;uy[i]=sn;boxX[i]=x[i]+body[0]*c-body[1]*sn;boxY[i]=y[i]+body[0]*sn+body[1]*c
                hx[i]=body[2]+MARGIN_M;hy[i]=body[3]+MARGIN_M
                tyreR[i]=wheels.tyreDiscs(spec[i]!!.id,length[i],width[i],x[i],y[i],heading[i],tyreX,tyreY,i*2)
            }
            if(tyresLast) for(i in 0 until n)for(j in i+1 until n) {
                if(tyresLast && tyreTouchesBody(i,j))tyresLast=false
                if(grouped && art.carPage(key[i]!!)!==art.carPage(key[j]!!) && bodiesTouch(i,j))grouped=false
            }
        }
        if(!tyresLast) {
            interleavedFrames++
            for(i in 0 until n){body(batch,i);tyres(batch,i)}
            return
        }
        groupedFrames++
        if(grouped) {
            val first=art.carPage(key[0]!!)
            for(pass in 0..1)for(i in 0 until n)if((art.carPage(key[i]!!)===first)==(pass==0))body(batch,i)
        } else for(i in 0 until n)body(batch,i)
        for(i in 0 until n)tyres(batch,i)
    }
    private companion object { const val N=6;const val MARGIN_M=.4f }
}
