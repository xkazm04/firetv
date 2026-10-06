package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import dev.deathride.core.*
import kotlin.math.min

/** Course shape for menus: the same centreline the minimap draws, sampled once per course. No art, no geometry change. */
object CoursePreview {
    private const val SAMPLES=96
    private val cache=HashMap<String,Array<FloatArray>>()
    /** Index 0 is the main centreline (closed loop), the rest are alternate passages. */
    fun lines(course: Course): Array<FloatArray> = cache.getOrPut(course.id) {
        val p=TrackPoint()
        val main=FloatArray((SAMPLES+1)*2)
        for(i in 0..SAMPLES){course.sample(course.lengthM*(i%SAMPLES)/SAMPLES,0.0,p);main[i*2]=p.x.toFloat();main[i*2+1]=p.y.toFloat()}
        val rest=course.branches.map{b->FloatArray(65*2).also{v->for(i in 0..64){b.alternative.sample((b.altStart+(b.altEnd-b.altStart)*i/64)*b.alternative.lengthM,0.0,p);v[i*2]=p.x.toFloat();v[i*2+1]=p.y.toFloat()}}}
        arrayOf(main)+rest
    }
    fun draw(r: ShapeRenderer,course: Course,x: Float,y: Float,w: Float,h: Float,main: Color,branch: Color,startMark: Color) {
        val lines=lines(course)
        val w0=(course.maxX-course.minX).coerceAtLeast(1.0);val h0=(course.maxY-course.minY).coerceAtLeast(1.0)
        val scale=min(w/w0,h/h0).toFloat()
        val ox=x+w*.5f-((course.minX+course.maxX)*.5).toFloat()*scale;val oy=y+h*.5f-((course.minY+course.maxY)*.5).toFloat()*scale
        for((n,line) in lines.withIndex()) {
            r.color=if(n==0)main else branch
            for(i in 0 until line.size/2-1)r.rectLine(ox+line[i*2]*scale,oy+line[i*2+1]*scale,ox+line[(i+1)*2]*scale,oy+line[(i+1)*2+1]*scale,if(n==0)4f else 2.5f)
        }
        // Start/finish marker on the centreline.
        val p=TrackPoint();course.sample(course.startFraction*course.lengthM,0.0,p)
        r.color=startMark;r.circle(ox+p.x.toFloat()*scale,oy+p.y.toFloat()*scale,6f,12)
    }
}
