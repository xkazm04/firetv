package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.graphics.glutils.*
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.core.*
import kotlin.math.*

/** Static scenery is synthesized once per course into one texture; there are no image assets. */
class TrackScene(private val course: Course) {
    private val textureSize=VisualTuning["sceneryTextureSize"].toInt()
    private val buffer=FrameBuffer(Pixmap.Format.RGBA8888,textureSize,textureSize,false)
    private val region=TextureRegion(buffer.colorBufferTexture).apply { flip(false,true);texture.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear) }
    private val margin=VisualTuning["sceneryMarginM"]
    private val left=(course.minX-margin).toFloat();private val bottom=(course.minY-margin).toFloat()
    private val width=(course.maxX-course.minX+margin*2).toFloat();private val height=(course.maxY-course.minY+margin*2).toFloat()
    val center=FloatArray((VisualTuning["roadSamples"].toInt()+1)*2)
    val samples=VisualTuning["roadSamples"].toInt()
    init {
        val r=ShapeRenderer(24000);val point=TrackPoint();val q=TrackPoint();val rand=java.util.Random(VisualTuning["scenerySeed"].toLong())
        buffer.begin();Gdx.gl.glViewport(0,0,textureSize,textureSize)
        val desert=course.theme=="desert";val wet=course.theme=="wetland"
        ScreenUtils.clear(if(desert).29f else .13f,if(desert).25f else .19f,if(wet).20f else .15f,1f)
        r.projectionMatrix=Matrix4().setToOrtho2D(left,bottom,width,height)
        r.begin(ShapeRenderer.ShapeType.Filled)
        // Ground grain, stones and scrub: seeded decoration, never simulation randomness.
        repeat(VisualTuning["groundGrainCount"].toInt()) {
            val x=left+rand.nextFloat()*width;val y=bottom+rand.nextFloat()*height;val v=rand.nextFloat()*.055f
            r.setColor((if(desert).32f else .15f)+v,(if(desert).28f else .21f)+v,(if(wet).23f else .17f)+v,1f)
            r.rect(x,y,.25f+rand.nextFloat()*1.4f,.15f+rand.nextFloat()*.8f)
        }
        // Outer shoulders underneath a continuous asphalt ribbon.
        fun ribbon(extra: Double,layer: Int) {
            for(i in 0 until samples) {
                val s=course.lengthM*i/samples;val next=course.lengthM*(i+1)/samples
                val w=course.widthAt(s)+extra;val wn=course.widthAt(next)+extra
                val surf=course.surfaces[course.index(s)].id
                when(layer) {
                    0 -> r.setColor(.095f,.12f,.12f,1f)
                    1 -> r.setColor(.33f,.34f,.29f,1f)
                    else -> when(surf) {
                        "Gravel" -> r.setColor(.42f,.35f,.25f,1f)
                        "Ice" -> r.setColor(.34f,.47f,.50f,1f)
                        else -> r.setColor(.245f,.27f,.28f,1f)
                    }
                }
                course.sample(s,w,point);val ax=point.x.toFloat();val ay=point.y.toFloat()
                course.sample(s,-w,point);val bx=point.x.toFloat();val by=point.y.toFloat()
                course.sample(next,-wn,point);val cx=point.x.toFloat();val cy=point.y.toFloat()
                course.sample(next,wn,point);val dx=point.x.toFloat();val dy=point.y.toFloat()
                r.triangle(ax,ay,bx,by,cx,cy);r.triangle(ax,ay,cx,cy,dx,dy)
            }
        }
        ribbon(2.2,0);ribbon(1.1,1);ribbon(0.0,2)
        repeat(VisualTuning["roadGrainCount"].toInt()) {
            val s=rand.nextDouble()*course.lengthM;val lateral=(rand.nextDouble()*2-1)*(course.widthAt(s)-.7)
            course.sample(s,lateral,point);val v=.24f+rand.nextFloat()*.065f
            when(course.surfaces[course.index(s)].id) {
                "Gravel" -> r.setColor(v+.15f,v+.08f,v-.02f,1f)
                "Ice" -> r.setColor(v+.09f,v+.21f,v+.24f,1f)
                else -> r.setColor(v,v+.025f,v+.035f,1f)
            }
            r.rect(point.x.toFloat(),point.y.toFloat(),.16f+rand.nextFloat()*.35f,.1f+rand.nextFloat()*.25f)
        }
        for(i in 0..samples) {
            val s=course.lengthM*i/samples;course.sample(s,0.0,point);center[i*2]=point.x.toFloat();center[i*2+1]=point.y.toFloat()
            if(i==samples)continue
            val next=course.lengthM*(i+1)/samples
            for(side in -1..1 step 2) {
                val w=course.widthAt(s);val wn=course.widthAt(next)
                course.sample(s,side*(w-Movement.vergeWidthM),point);course.sample(next,side*(wn-Movement.vergeWidthM),q)
                if(i%4<2)r.setColor(.87f,.80f,.65f,1f) else r.setColor(.63f,.20f,.13f,1f)
                r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),Movement.kerbWidthM.toFloat())
                course.sample(s,side*(w+.5),point);course.sample(next,side*(wn+.5),q)
                r.setColor(.50f,.55f,.52f,1f);r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.32f)
                if(i%6==0) { r.setColor(.15f,.18f,.17f,1f);r.circle(point.x.toFloat()+.3f,point.y.toFloat()-.3f,.65f,8);r.setColor(.45f,.49f,.45f,1f);r.circle(point.x.toFloat(),point.y.toFloat(),.48f,8) }
            }
            if(i%9<3) { course.sample(s,0.0,point);course.sample(next,0.0,q);r.setColor(.46f,.48f,.43f,1f);r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.16f) }
        }
        val start=course.startFraction*course.lengthM
        val w=course.widthAt(start)-Movement.vergeWidthM
        var lane=-w
        var checker=0
        while(lane<w) {
            for(row in 0..1) {
                course.sample(start+row*.9,lane,point);course.sample(start+row*.9,min(w,lane+.9),q)
                val v=if((checker+row)%2==0).87f else .10f;r.setColor(v,v,v,1f)
                r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.9f)
            };lane+=.9;checker++
        }
        for(spot in course.spots) {
            val s=(course.startFraction+spot.fraction)*course.lengthM;course.sample(s,spot.laneM,point)
            if(spot.kind=="grid") {
                val gl=CarShapes.all.maxOf { it.lengthM }*.5;val gw=(CarShapes.all.maxOf { it.widthM }+TrackRules["gridClearanceM"])*.5
                course.sample(s-gl,spot.laneM-gw,q);val ax=q.x.toFloat();val ay=q.y.toFloat()
                course.sample(s+gl,spot.laneM-gw,q);r.setColor(.68f,.68f,.58f,1f);r.rectLine(ax,ay,q.x.toFloat(),q.y.toFloat(),.18f)
                course.sample(s-gl,spot.laneM+gw,q);r.rectLine(ax,ay,q.x.toFloat(),q.y.toFloat(),.18f)
            }
            if(spot.kind=="hazard") { r.setColor(.08f,.12f,.14f,1f);r.ellipse(point.x.toFloat()-3,point.y.toFloat()-1.8f,6f,3.6f,24);r.setColor(.15f,.22f,.25f,1f);r.ellipse(point.x.toFloat()-1.8f,point.y.toFloat()-.7f,3.4f,1.4f,18) }
        }
        // Recognizable infield landmarks, placed only well clear of the road.
        val projection=Projection()
        repeat(VisualTuning["landmarkCount"].toInt()) {
            val x=left+rand.nextFloat()*width;val y=bottom+rand.nextFloat()*height
            course.project(x.toDouble(),y.toDouble(),projection)
            if(abs(projection.distance)>course.widthAt(projection.s)+12) {
                r.setColor(.075f,.10f,.10f,1f);r.rect(x+1,y-1,8f,5f)
                r.setColor(.32f,.36f,.34f,1f);r.rect(x,y,8f,5f)
                r.setColor(.43f,.47f,.43f,1f);r.rect(x+.3f,y+3.8f,7.4f,.8f)
                r.setColor(.22f,.27f,.25f,1f);for(j in 1..5)r.rect(x+j*1.25f,y+.3f,.15f,4.2f)
            }
        }
        // Repeated grandstand steps and service bays give the start area an authored landmark.
        for(side in -1..1 step 2)for(row in 0..4) {
            val laneM=side*(course.widthAt(start)+5+row*1.1)
            course.sample(start-22,laneM,point);course.sample(start+18,laneM,q)
            r.setColor(.07f,.09f,.10f,1f);r.rectLine(point.x.toFloat()+.7f,point.y.toFloat()-.8f,q.x.toFloat()+.7f,q.y.toFloat()-.8f,1.3f)
            r.setColor(.30f+row*.025f,.34f+row*.02f,.34f+row*.015f,1f);r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.95f)
            for(seat in 0..20) { course.sample(start-21+seat*1.85,laneM,point);r.setColor(if(seat%3==0).72f else .28f,.35f,.24f,1f);r.circle(point.x.toFloat(),point.y.toFloat(),.30f,6) }
        }
        // Direction chevrons at the approach to sharper bends are visible at driving scale.
        for(i in 0 until course.count step 20)if(course.curvature[i]>TrackRules["straightCurvature"]) {
            for(j in 0..2) {
                course.sample(course.arc[i]-8-j*3,0.0,point)
                val cx=cos(point.heading);val cy=sin(point.heading);val px=point.x;val py=point.y
                r.setColor(.70f,.68f,.47f,1f)
                r.rectLine((px-cx*1.3-cy).toFloat(),(py-cy*1.3+cx).toFloat(),px.toFloat(),py.toFloat(),.18f)
                r.rectLine((px-cx*1.3+cy).toFloat(),(py-cy*1.3-cx).toFloat(),px.toFloat(),py.toFloat(),.18f)
            }
        }
        r.end();buffer.end();r.dispose()
    }
    fun draw(batch: SpriteBatch) { batch.draw(region,left,bottom,width,height) }
    fun dispose()=buffer.dispose()
}

/** Fixed-size visual history; motion effects are cosmetic and do not feed physics. */
class MotionEffects {
    private val skids=FloatArray(VisualTuning["skidCapacity"].toInt()*6)
    private val dust=FloatArray(VisualTuning["particleCapacity"].toInt()*5)
    private var skidNext=0;private var dustNext=0;private var skidClock=0.0;private var dustClock=0.0
    private val lastX=DoubleArray(6);private val lastY=DoubleArray(6)
    fun clear() { skids.fill(0f);dust.fill(0f);lastX.fill(Double.NaN);lastY.fill(Double.NaN) }
    fun draw(r: ShapeRenderer,world: World,dt: Double) {
        skidClock+=dt;dustClock+=dt
        val mark=skidClock>=VisualTuning["skidIntervalSeconds"];val puff=dustClock>=VisualTuning["particleIntervalSeconds"]
        if(mark)skidClock=0.0;if(puff)dustClock=0.0
        for(c in world.cars) {
            if(mark) {
                if((c.drifting || c.loadTransfer>.3) && lastX[c.id].isFinite() && hypot(c.x-lastX[c.id],c.y-lastY[c.id])<8) {
                    for(side in -1..1 step 2) {
                        val n=skidNext*6;skidNext=(skidNext+1)%(skids.size/6)
                        val ox=-sin(c.heading)*c.spec.circleRadiusM*.8*side;val oy=cos(c.heading)*c.spec.circleRadiusM*.8*side
                        skids[n]=(lastX[c.id]+ox).toFloat();skids[n+1]=(lastY[c.id]+oy).toFloat();skids[n+2]=(c.x+ox).toFloat();skids[n+3]=(c.y+oy).toFloat();skids[n+4]=VisualTuning["skidLifeSeconds"].toFloat()
                    }
                };lastX[c.id]=c.x;lastY[c.id]=c.y
            }
            if(puff && c.speedMps>5 && (c.drifting || c.surface!==Surfaces.asphalt)) {
                val n=dustNext*5;dustNext=(dustNext+1)%(dust.size/5)
                dust[n]=(c.x-cos(c.heading)*c.spec.circleOffsetM).toFloat();dust[n+1]=(c.y-sin(c.heading)*c.spec.circleOffsetM).toFloat();dust[n+2]=VisualTuning["particleLifeSeconds"].toFloat();dust[n+3]=if(c.surface.id=="Gravel" || c.surface===Surfaces.offtrack)1f else 0f;dust[n+4]=c.id.toFloat()
            }
        }
        for(n in skids.indices step 6)if(skids[n+4]>0) { skids[n+4]-=dt.toFloat();r.setColor(.04f,.045f,.045f,.40f*(skids[n+4]/VisualTuning["skidLifeSeconds"]).toFloat());r.rectLine(skids[n],skids[n+1],skids[n+2],skids[n+3],.30f) }
        for(n in dust.indices step 5)if(dust[n+2]>0) {
            dust[n+2]-=dt.toFloat();val age=1f-(dust[n+2]/VisualTuning["particleLifeSeconds"]).toFloat()
            r.setColor(if(dust[n+3]>0).65f else .75f,if(dust[n+3]>0).54f else .78f,if(dust[n+3]>0).37f else .79f,(1-age)*.30f)
            r.circle(dust[n]+age*.6f,dust[n+1]+age*.7f,.35f+age*1.5f,10)
        }
    }
}

class CarPainter {
    private var x=0f;private var y=0f;private var c=1f;private var s=0f
    private fun quad(r: ShapeRenderer,a: Float,b: Float,w: Float,h: Float) {
        val ax=x+a*c-b*s;val ay=y+a*s+b*c;val bx=ax+w*c;val by=ay+w*s;val cx=bx-h*s;val cy=by+h*c;val dx=ax-h*s;val dy=ay+h*c
        r.triangle(ax,ay,bx,by,cx,cy);r.triangle(ax,ay,cx,cy,dx,dy)
    }
    private fun body(r: ShapeRenderer,l: Float,w: Float,nose: Float) {
        quad(r,-l*.46f,-w*.5f,l*.75f,w)
        val ax=x+l*.29f*c+w*.5f*s;val ay=y+l*.29f*s-w*.5f*c
        val bx=x+l*.50f*c+w*nose*.5f*s;val by=y+l*.50f*s-w*nose*.5f*c
        val cx=x+l*.50f*c-w*nose*.5f*s;val cy=y+l*.50f*s+w*nose*.5f*c
        val dx=x+l*.29f*c-w*.5f*s;val dy=y+l*.29f*s+w*.5f*c
        r.triangle(ax,ay,bx,by,cx,cy);r.triangle(ax,ay,cx,cy,dx,dy)
    }
    fun draw(r: ShapeRenderer,car: Car,px: Float,py: Float,heading: Double,color: Color,flash: Boolean,scale: Float=1f) {
        val spec=CarShapes.forId(car.carClass?.id?:"Line");val l=spec.lengthM.toFloat()*scale;val w=spec.widthM.toFloat()*scale
        x=px+.35f*scale;y=py-.45f*scale;c=cos(heading).toFloat();s=sin(heading).toFloat()
        r.setColor(.025f,.035f,.04f,.65f);body(r,l*1.08f,w*1.15f,spec.noseWidth.toFloat())
        x=px;y=py
        // Four tires and their sidewalls sit outside the colored shell.
        r.setColor(.035f,.045f,.05f,1f)
        for(axle in -1..1 step 2)for(side in -1..1 step 2)quad(r,axle*l*.29f-l*.105f,side*w*.43f-w*.115f,l*.21f,w*.23f)
        r.color=if(flash)Color.WHITE else color;body(r,l,w*.87f,spec.noseWidth.toFloat())
        r.setColor(color.r*.55f,color.g*.55f,color.b*.55f,1f);quad(r,-l*.43f,-w*.43f,l*.72f,w*.09f)
        r.setColor(min(1f,color.r+.22f),min(1f,color.g+.22f),min(1f,color.b+.22f),1f);quad(r,-l*.40f,w*.30f,l*.65f,w*.08f)
        val rl=(spec.roofLength*l).toFloat();val ro=(spec.roofOffset*l).toFloat();val rw=(spec.roofWidth*w).toFloat()
        r.setColor(.055f,.10f,.13f,1f);quad(r,ro-rl*.5f-.14f,-rw*.5f,rl+.28f,rw)
        r.setColor(.25f,.46f,.53f,1f);quad(r,ro+rl*.20f,-rw*.42f,rl*.26f,rw*.84f)
        r.setColor(color.r*.85f,color.g*.85f,color.b*.85f,1f);quad(r,ro-rl*.26f,-rw*.42f,rl*.46f,rw*.84f)
        r.setColor(.20f,.31f,.35f,1f);quad(r,ro-rl*.45f,-rw*.41f,rl*.17f,rw*.82f)
        r.setColor(.78f,.85f,.80f,1f);quad(r,l*.43f,-w*.31f,l*.045f,w*.18f);quad(r,l*.43f,w*.13f,l*.045f,w*.18f)
        r.setColor(.98f,.20f,.12f,1f);quad(r,-l*.46f,-w*.34f,l*.045f,w*.20f);quad(r,-l*.46f,w*.14f,l*.045f,w*.20f)
        r.setColor(.11f,.14f,.16f,1f);quad(r,l*.28f,-w*.16f,l*.10f,w*.32f)
        if(spec.spoiler) { r.setColor(.12f,.15f,.17f,1f);quad(r,-l*.40f,-w*.49f,l*.07f,w*.98f) }
        if(spec.id=="Bastion") { r.setColor(.37f,.42f,.43f,1f);quad(r,l*.43f,-w*.40f,l*.075f,w*.8f);quad(r,-l*.49f,-w*.4f,l*.06f,w*.8f) }
        if(spec.id=="Needle") { r.setColor(.05f,.07f,.08f,1f);quad(r,-l*.4f,-w*.20f,l*.16f,w*.40f) }
    }
}
