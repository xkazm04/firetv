package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.graphics.glutils.*
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import dev.deathride.core.*
import kotlin.math.*

/** One reusable GPU target and renderer; never allocate/delete them at a course change. */
class SceneryCanvas(val cacheRoadMarks: Boolean=true) {
    val roadMarks=RoadMarkMesh()
    /** HUD minimap road lines: 360 centre-line segments and every branch, 6 vertices each, retained on the GPU. */
    val minimap=RoadMarkMesh(6*(VisualTuning["roadSamples"].toInt()+8*128+16),roadMarks.program)
    var minimapOwner: Any?=null
    val regionShader=RegionShader.create()
    val markMatrix=Matrix4()
    val textureSize=VisualTuning["sceneryTextureSize"].toInt()
    val buffer=FrameBuffer(Pixmap.Format.RGBA8888,textureSize,textureSize,false)
    val renderer=ShapeRenderer(24000)
    val sprites=PolygonSpriteBatch()
    private val vertices=FloatArray(20)
    private val indices=shortArrayOf(0,1,2,2,3,0)
    private val signLayout=GlyphLayout()
    fun tile(texture: Texture?,ax: Float,ay: Float,bx: Float,by: Float,cx: Float,cy: Float,dx: Float,dy: Float,tint: Color=Color.WHITE) {
        if(texture==null)return
        renderer.end();sprites.projectionMatrix=renderer.projectionMatrix;sprites.begin()
        val color=tint.toFloatBits()
        fun vertex(n: Int,x: Float,y: Float){vertices[n]=x;vertices[n+1]=y;vertices[n+2]=color;vertices[n+3]=x/8f;vertices[n+4]=-y/8f}
        vertex(0,ax,ay);vertex(5,bx,by);vertex(10,cx,cy);vertex(15,dx,dy)
        sprites.draw(texture,vertices,0,20,indices,0,6);sprites.end();renderer.begin(ShapeRenderer.ShapeType.Filled)
    }
    fun sprite(art: AtlasArt,key: String,x: Float,y: Float,w: Float,h: Float,degrees: Float=0f) {
        if(!art.available(key))return
        renderer.end();sprites.projectionMatrix=renderer.projectionMatrix;sprites.begin()
        art.draw(sprites,key,x,y,w,h,degrees);sprites.end();renderer.begin(ShapeRenderer.ShapeType.Filled)
    }
    fun slogan(font: BitmapFont,text: String,x: Float,y: Float,w: Float,h: Float) {
        val sx=font.data.scaleX;val sy=font.data.scaleY;val color=font.color.toFloatBits()
        signLayout.setText(font,text)
        val scale=minOf(w/maxOf(1f,signLayout.width),h/maxOf(1f,signLayout.height))
        renderer.end();sprites.projectionMatrix=renderer.projectionMatrix;sprites.begin()
        try {
            font.data.setScale(sx*scale,sy*scale);font.setColor(.09f,.08f,.07f,1f)
            font.draw(sprites,text,x-w/2,y+h/2,w,com.badlogic.gdx.utils.Align.center,false)
        } finally {
            font.data.setScale(sx,sy);Color.abgr8888ToColor(font.color,color)
            sprites.end();renderer.begin(ShapeRenderer.ShapeType.Filled)
        }
    }
    fun dispose() { regionShader.dispose();roadMarks.dispose();minimap.dispose();sprites.dispose();renderer.dispose();buffer.dispose() }
}
/** Static geometry and asset placement are generated in bounded render-thread slices. */
class TrackScene(private val course: Course,private val canvas: SceneryCanvas,private val art: AtlasArt,private val signageFont: BitmapFont?=null,
                 val regionDefinition: RegionDefinition=course.region,private val regionEnabled: Boolean=true,
                 candidates: Boolean=true) {
    private val look=if(regionEnabled)RegionLook(regionDefinition) else null
    private val barrierKey=(look?.barrier(course.boundaryMaterial)?:"").let{k->if(k.isNotEmpty() && art.available(k))k else if(course.boundaryMaterial==BoundaryMaterial.METAL)"barriers/metal-straight" else "barriers/concrete-straight"}
    init { canvas.roadMarks.clear();art.selectRegion(if(regionEnabled)regionDefinition else null,candidates) }
    private val region=TextureRegion(canvas.buffer.colorBufferTexture).apply { flip(false,true);texture.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear) }
    var ready=false;private set
    private var buildFrames=0
    private var buildCpuMs=0.0
    private var buildMaxMs=0.0
    private val margin=VisualTuning["sceneryMarginM"]
    private val left=(course.minX-margin).toFloat();private val bottom=(course.minY-margin).toFloat()
    private val width=(course.maxX-course.minX+margin*2).toFloat();private val height=(course.maxY-course.minY+margin*2).toFloat()
    val center=FloatArray((VisualTuning["roadSamples"].toInt()+1)*2)
    val samples=VisualTuning["roadSamples"].toInt()
    val branchCenters=course.branches.map { branch -> FloatArray(258).also { values -> val p=TrackPoint();for(i in 0..128){branch.alternative.sample((branch.altStart+(branch.altEnd-branch.altStart)*i/128)*branch.alternative.lengthM,0.0,p);values[i*2]=p.x.toFloat();values[i*2+1]=p.y.toFloat()} } }
    private val projectionMatrix=Matrix4().setToOrtho2D(left,bottom,width,height)
    // Repeat-addressed road stays sharp at the following camera's density. The low-resolution
    // scenery target is only a static background/fallback, never the source of road texel density.
    private val liveRoad=buildMap<Texture,FloatArray> {
        val grouped=LinkedHashMap<Texture,ArrayList<Float>>()
        val p=TrackPoint()
        fun quad(texture: Texture?,a: Double,b: Double,loA: Double,hiA: Double,loB: Double,hiB: Double,road: Course=course,slot: String="asphalt") {
            if(texture==null)return
            val vertices=grouped.getOrPut(texture){ArrayList()}
            fun vertex(s: Double,lane: Double){road.sample(s,lane,p);vertices.add(p.x.toFloat());vertices.add(p.y.toFloat());vertices.add(look?.tileColor(slot,art.hasRegionVariant(slot))?.toFloatBits()?:Color.WHITE_FLOAT_BITS);vertices.add(p.x.toFloat()/8f);vertices.add(-p.y.toFloat()/8f)}
            vertex(a,loA);vertex(b,loB);vertex(b,hiB);vertex(a,hiA)
        }
        for(i in 0 until samples) {
            val a=course.lengthM*i/samples;val b=course.lengthM*(i+1)/samples
            val key=when(course.surfaces[course.index(a)].id){"Gravel"->"tiles/gravel";"Ice"->"tiles/ice";"Oil"->"tiles/oil";else->"tiles/asphalt-worn"}
            quad(art.tile(key),a,b,-course.widthAt(a),course.widthAt(a),-course.widthAt(b),course.widthAt(b),slot=look?.slot(course.surfaces[course.index(a)].id)?:"asphalt")
        }
        for(branch in course.branches)for(i in 0 until 128) {
            val road=branch.alternative;val a=road.lengthM*(branch.altStart+(branch.altEnd-branch.altStart)*i/128);val b=road.lengthM*(branch.altStart+(branch.altEnd-branch.altStart)*(i+1)/128)
            val key=when(road.surfaces[road.index(a)].id){"Gravel"->"tiles/gravel";"Ice"->"tiles/ice";"Oil"->"tiles/oil";else->"tiles/asphalt-worn"}
            quad(art.tile(key),a,b,-road.widthAt(a),road.widthAt(a),-road.widthAt(b),road.widthAt(b),road,look?.slot(road.surfaces[road.index(a)].id)?:"asphalt")
        }
        // Preserve compositing order: shortcuts are separate from the base surface batches.
        for((t,v) in grouped)put(t,v.toFloatArray())
    }
    private val marks=ArrayList<FloatArray>()
    private val oils=ArrayList<FloatArray>()
    private val shortcuts=ArrayList<FloatArray>()
    private fun mark(ax: Float,ay: Float,bx: Float,by: Float,width: Float,r: Float,g: Float,b: Float) { marks.add(floatArrayOf(ax,ay,bx,by,width,r,g,b));canvas.roadMarks.line(ax,ay,bx,by,width,r,g,b) }
    private val baking=sequence {
        val r=canvas.renderer;val point=TrackPoint();val q=TrackPoint();val rand=java.util.Random(VisualTuning["scenerySeed"].toLong())
        val desert=course.theme=="desert";val wet=course.theme=="wetland"
        if(look!=null)ScreenUtils.clear(look.color(look.groundSlot)) else ScreenUtils.clear(if(desert).29f else .13f,if(desert).25f else .19f,if(wet).20f else .15f,1f)
        val groundTile=art.tile(if(look!=null)RegionMaterials.tileSlots.getValue(look.groundSlot) else if(desert)"tiles/dirt" else if(course.theme=="alpine")"tiles/ice" else "tiles/grass")
        // Opaque material art already supplies grain. Retain procedural specks only for fallback.
        if(groundTile==null)repeat(VisualTuning["groundGrainCount"].toInt()) {
            val x=left+rand.nextFloat()*width;val y=bottom+rand.nextFloat()*height;val v=rand.nextFloat()*.055f
            if(look!=null){val c=look.color(look.groundSlot);r.setColor(c.r+v,c.g+v,c.b+v,1f)} else r.setColor((if(desert).32f else .15f)+v,(if(desert).28f else .21f)+v,(if(wet).23f else .17f)+v,1f)
            r.rect(x,y,.25f+rand.nextFloat()*1.4f,.15f+rand.nextFloat()*.8f);yield(Unit)
        }
        canvas.tile(groundTile,left,bottom,left+width,bottom,left+width,bottom+height,left,bottom+height,look?.tileColor(look.groundSlot,art.hasRegionVariant(look.groundSlot))?:Color.WHITE)
        // Distant silhouettes stay beyond every playable road/branch, baked into the existing target.
        look?.backdrop(r,left,bottom+height-margin.toFloat()*.8f,width,margin.toFloat()*.7f)
        // Outer shoulders underneath a continuous asphalt ribbon.
        suspend fun SequenceScope<Unit>.ribbon(extra: Double,layer: Int,road: Course=course,from: Double=0.0,to: Double=1.0) {
            val n=ceil(samples*(to-from)).toInt().coerceAtLeast(16)
            for(i in 0 until n) {
                val s=road.lengthM*(from+(to-from)*i/n);val next=road.lengthM*(from+(to-from)*(i+1)/n)
                val w=road.widthAt(s)+extra;val wn=road.widthAt(next)+extra
                val surf=road.surfaces[road.index(s)].id
                if(look!=null)r.color=look.color(when(layer){0->"oil";1->"gravel";else->look.slot(surf)}) else when(layer) {
                    0 -> r.setColor(.095f,.12f,.12f,1f)
                    1 -> r.setColor(.33f,.34f,.29f,1f)
                    else -> when(surf) {
                        "Gravel" -> r.setColor(.42f,.35f,.25f,1f)
                        "Ice" -> r.setColor(.34f,.47f,.50f,1f)
                        else -> r.setColor(.245f,.27f,.28f,1f)
                    }
                }
                road.sample(s,w,point);val ax=point.x.toFloat();val ay=point.y.toFloat()
                road.sample(s,-w,point);val bx=point.x.toFloat();val by=point.y.toFloat()
                road.sample(next,-wn,point);val cx=point.x.toFloat();val cy=point.y.toFloat()
                road.sample(next,wn,point);val dx=point.x.toFloat();val dy=point.y.toFloat()
                r.triangle(ax,ay,bx,by,cx,cy);r.triangle(ax,ay,cx,cy,dx,dy)
                yield(Unit)
            }
        }
        // Road material art is drawn live; do not bake hundreds of duplicate texture passes.
        ribbon(2.2,0);ribbon(1.1,1);ribbon(0.0,2)
        for(branch in course.branches)ribbon(0.0,2,branch.alternative,branch.altStart,branch.altEnd)
        // Draw the actual authored shortcut bands: art never defines collision or changes the route.
        for(f in course.features)if(f.kind=="shortcut") {
            val count=ceil((f.end-f.start)*samples).toInt().coerceAtLeast(1)
            for(i in 0 until count) {
                val a=(f.start+(f.end-f.start)*i/count)*course.lengthM;val b=(f.start+(f.end-f.start)*(i+1)/count)*course.lengthM
                course.sample(a,f.laneM-f.widthM*.5,point);val ax=point.x.toFloat();val ay=point.y.toFloat()
                course.sample(b,f.laneM-f.widthM*.5,point);val bx=point.x.toFloat();val by=point.y.toFloat()
                course.sample(b,f.laneM+f.widthM*.5,point);val cx=point.x.toFloat();val cy=point.y.toFloat()
                course.sample(a,f.laneM+f.widthM*.5,point);val dx=point.x.toFloat();val dy=point.y.toFloat()
                if(look!=null)r.color=look.color("gravel") else r.setColor(.43f,.36f,.25f,1f);r.triangle(ax,ay,bx,by,cx,cy);r.triangle(ax,ay,cx,cy,dx,dy)
                val white=look?.tileColor("gravel",art.hasRegionVariant("gravel"))?.toFloatBits()?:Color.WHITE_FLOAT_BITS
                shortcuts.add(floatArrayOf(ax,ay,white,ax/8,-ay/8,bx,by,white,bx/8,-by/8,cx,cy,white,cx/8,-cy/8,dx,dy,white,dx/8,-dy/8))
                // The cached live quad supplies material art; these triangles are its fallback.
                yield(Unit)
            }
        }
        val missingRoadArt=course.surfaces.any{art.tile(when(it.id){"Gravel"->"tiles/gravel";"Ice"->"tiles/ice";"Oil"->"tiles/oil";else->"tiles/asphalt-worn"})==null}
        if(missingRoadArt)repeat(VisualTuning["roadGrainCount"].toInt()) {
            val s=rand.nextDouble()*course.lengthM;val lateral=(rand.nextDouble()*2-1)*(course.widthAt(s)-.7)
            course.sample(s,lateral,point);val v=.24f+rand.nextFloat()*.065f
            if(look!=null){val c=look.color(look.slot(course.surfaces[course.index(s)].id));r.setColor(c.r+v*.12f,c.g+v*.12f,c.b+v*.12f,1f)} else when(course.surfaces[course.index(s)].id) {
                "Gravel" -> r.setColor(v+.15f,v+.08f,v-.02f,1f)
                "Ice" -> r.setColor(v+.09f,v+.21f,v+.24f,1f)
                else -> r.setColor(v,v+.025f,v+.035f,1f)
            }
            r.rect(point.x.toFloat(),point.y.toFloat(),.16f+rand.nextFloat()*.35f,.1f+rand.nextFloat()*.25f);yield(Unit)
        }
        for(i in 0..samples) {
            val s=course.lengthM*i/samples;course.sample(s,0.0,point);center[i*2]=point.x.toFloat();center[i*2+1]=point.y.toFloat()
            if(i==samples || TrackJunctions.nearPassage(course,s) || TrackBranches.merging(course,s))continue
            val next=course.lengthM*(i+1)/samples
            for(side in -1..1 step 2) {
                if(TrackBranches.boundaryCovered(course,s,side))continue
                val w=course.widthAt(s);val wn=course.widthAt(next)
                course.sample(s,side*(w-Movement.vergeWidthM),point);course.sample(next,side*(wn-Movement.vergeWidthM),q)
                if(look!=null)r.color=look.color(if(i%4<2)"kerb" else "accent") else if(i%4<2)r.setColor(.87f,.80f,.65f,1f) else r.setColor(.63f,.20f,.13f,1f)
                r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),Movement.kerbWidthM.toFloat())
                mark(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),Movement.kerbWidthM.toFloat(),r.color.r,r.color.g,r.color.b)
                course.sample(s,side*(w+.5),point);course.sample(next,side*(wn+.5),q)
                r.setColor(.50f,.55f,.52f,1f);r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.32f)
                if(i%3==0)canvas.sprite(art,barrierKey,point.x.toFloat(),point.y.toFloat(),5f,1.8f,(point.heading*180/PI).toFloat())
                if(i%6==0) { r.setColor(.15f,.18f,.17f,1f);r.circle(point.x.toFloat()+.3f,point.y.toFloat()-.3f,.65f,8);r.setColor(.45f,.49f,.45f,1f);r.circle(point.x.toFloat(),point.y.toFloat(),.48f,8) }
            }
            if(i%9<3) { course.sample(s,0.0,point);course.sample(next,0.0,q);r.setColor(.46f,.48f,.43f,1f);r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.16f);mark(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.16f,.46f,.48f,.43f) };yield(Unit)
        }
        yield(Unit)
        // Draw the alternate passage's outer wall; omit only edges inside the main ribbon.
        // This load-time query deliberately ignores route projection, which chooses the nearest occupied ribbon.
        fun insideMain(px: Double,py: Double): Boolean {
            var best=Double.POSITIVE_INFINITY;var width=0.0
            for(i in 0 until course.count) {
                val dx=course.x[i+1]-course.x[i];val dy=course.y[i+1]-course.y[i]
                val t=(((px-course.x[i])*dx+(py-course.y[i])*dy)/(dx*dx+dy*dy)).coerceIn(0.0,1.0)
                val x=px-course.x[i]-t*dx;val y=py-course.y[i]-t*dy;val d=x*x+y*y
                if(d<best){best=d;width=course.width[i]+t*(course.width[i+1]-course.width[i])}
            }
            return best<(width-.2)*(width-.2)
        }
        for(branch in course.branches)for(i in 0 until 128) {
            val road=branch.alternative;val a=road.lengthM*(branch.altStart+(branch.altEnd-branch.altStart)*i/128);val b=road.lengthM*(branch.altStart+(branch.altEnd-branch.altStart)*(i+1)/128)
            for(side in listOf(-1,1)) {
                road.sample(a,side*(road.widthAt(a)+.5),point);road.sample(b,side*(road.widthAt(b)+.5),q)
                if(insideMain(point.x,point.y) || insideMain(q.x,q.y))continue
                r.setColor(.5f,.55f,.52f,1f);r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.32f)
                mark(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.32f,.5f,.55f,.52f)
                if(i%3==0)canvas.sprite(art,barrierKey,point.x.toFloat(),point.y.toFloat(),5f,1.8f,(point.heading*180/PI).toFloat())
            }
            yield(Unit)
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
                mark(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.9f,v,v,v)
            };lane+=.9;checker++;yield(Unit)
        }
        for(spot in course.spots) {
            val s=(course.startFraction+spot.fraction)*course.lengthM;course.sample(s,spot.laneM,point)
            if(spot.kind=="grid") {
                val gl=CarShapes.all.maxOf { it.lengthM }*.5;val gw=(CarShapes.all.maxOf { it.widthM }+TrackRules["gridClearanceM"])*.5
                course.sample(s-gl,spot.laneM-gw,q);val ax=q.x.toFloat();val ay=q.y.toFloat()
                course.sample(s+gl,spot.laneM-gw,q);r.setColor(.68f,.68f,.58f,1f);r.rectLine(ax,ay,q.x.toFloat(),q.y.toFloat(),.18f)
                mark(ax,ay,q.x.toFloat(),q.y.toFloat(),.18f,.68f,.68f,.58f)
                course.sample(s-gl,spot.laneM+gw,q);r.rectLine(ax,ay,q.x.toFloat(),q.y.toFloat(),.18f)
                mark(ax,ay,q.x.toFloat(),q.y.toFloat(),.18f,.68f,.68f,.58f)
            }
            if(spot.kind=="hazard") { r.setColor(.08f,.12f,.14f,1f);r.ellipse(point.x.toFloat()-3,point.y.toFloat()-1.8f,6f,3.6f,24);r.setColor(.15f,.22f,.25f,1f);r.ellipse(point.x.toFloat()-1.8f,point.y.toFloat()-.7f,3.4f,1.4f,18) }
            if(spot.kind=="hazard") { oils.add(floatArrayOf(point.x.toFloat(),point.y.toFloat(),(point.heading*180/PI).toFloat()));canvas.sprite(art,"decals/oil",point.x.toFloat(),point.y.toFloat(),6f,3.6f,(point.heading*180/PI).toFloat()) }
        }
        for(f in course.features) {
            course.sample(f.start*course.lengthM-f.warningM,course.widthAt(f.start*course.lengthM)+5,point)
            canvas.sprite(art,f.landmark,point.x.toFloat(),point.y.toFloat(),8f,8f);yield(Unit)
        }
        for(junction in course.junctions)for(fraction in listOf(junction.first,junction.second)) {
            val s=fraction*course.lengthM-junction.warningM;course.sample(s,course.widthAt(s)+5,point)
            canvas.sprite(art,TrackContent.themes.single { it.id==course.theme }.props.last(),point.x.toFloat(),point.y.toFloat(),8f,8f);yield(Unit)
        }
        if(course.raceProfile!=null)for(i in 0 until course.count)if(course.surfaces[i].id!="Asphalt" && course.surfaces[i]!==course.surfaces[(i+course.count-1)%course.count]) {
            val s=course.arc[i]-45;course.sample(s,course.widthAt(s)+5,point)
            canvas.sprite(art,TrackContent.themes.single { it.id==course.theme }.props.last(),point.x.toFloat(),point.y.toFloat(),8f,8f);yield(Unit)
        }
        yield(Unit)
        // Recognizable infield landmarks, placed only well clear of the road.
        val projection=Projection()
        repeat(VisualTuning["landmarkCount"].toInt()) {
            val x=left+rand.nextFloat()*width;val y=bottom+rand.nextFloat()*height
            course.project(x.toDouble(),y.toDouble(),projection)
            if(abs(projection.distance)>course.widthAt(projection.s)+12) {
                val props=look?.definition?.props?:art.themeProps(course.theme).toList()
                val key=props[it%props.size]
                if(art.available(key)) {
                    canvas.sprite(art,key,x+4,y+2.5f,8f,6f)
                    if(key=="environment/league-hoarding" && signageFont!=null)
                        canvas.slogan(signageFont,EnvironmentArt.slogans[it%EnvironmentArt.slogans.size],x+4,y+2.5f,5.5f,1.6f)
                }
                else if(look!=null)look.prop(r,x,y) else EnvironmentArt.fallback(r,course.theme,x,y)
            }
            yield(Unit)
        }
        yield(Unit)
        // Repeated grandstand steps and service bays give the start area an authored landmark.
        for(side in -1..1 step 2)for(row in 0..4) {
            val laneM=side*(course.widthAt(start)+5+row*1.1)
            course.sample(start-22,laneM,point);course.sample(start+18,laneM,q)
            r.setColor(.07f,.09f,.10f,1f);r.rectLine(point.x.toFloat()+.7f,point.y.toFloat()-.8f,q.x.toFloat()+.7f,q.y.toFloat()-.8f,1.3f)
            r.setColor(.30f+row*.025f,.34f+row*.02f,.34f+row*.015f,1f);r.rectLine(point.x.toFloat(),point.y.toFloat(),q.x.toFloat(),q.y.toFloat(),.95f)
            for(seat in 0..20) { course.sample(start-21+seat*1.85,laneM,point);r.setColor(if(seat%3==0).72f else .28f,.35f,.24f,1f);r.circle(point.x.toFloat(),point.y.toFloat(),.30f,6) };yield(Unit)
        }
        yield(Unit)
        // Direction chevrons at the approach to sharper bends are visible at driving scale.
        for(i in 0 until course.count step 20)if(course.curvature[i]>TrackRules["straightCurvature"]) {
            for(j in 0..2) {
                course.sample(course.arc[i]-8-j*3,0.0,point)
                val cx=cos(point.heading);val cy=sin(point.heading);val px=point.x;val py=point.y
                r.setColor(.70f,.68f,.47f,1f)
                r.rectLine((px-cx*1.3-cy).toFloat(),(py-cy*1.3+cx).toFloat(),px.toFloat(),py.toFloat(),.18f)
                r.rectLine((px-cx*1.3+cy).toFloat(),(py-cy*1.3-cx).toFloat(),px.toFloat(),py.toFloat(),.18f)
                mark((px-cx*1.3-cy).toFloat(),(py-cy*1.3+cx).toFloat(),px.toFloat(),py.toFloat(),.18f,.70f,.68f,.47f)
                mark((px-cx*1.3+cy).toFloat(),(py-cy*1.3-cx).toFloat(),px.toFloat(),py.toFloat(),.18f,.70f,.68f,.47f)
            }
        }
    }.iterator()
    fun advance() {
        if(ready)return
        val started=System.nanoTime();val deadline=started+(VisualTuning["sceneryBuildBudgetMs"]*1e6).toLong()
        canvas.buffer.begin();Gdx.gl.glViewport(0,0,canvas.textureSize,canvas.textureSize)
        val r=canvas.renderer;r.projectionMatrix=projectionMatrix;r.begin(ShapeRenderer.ShapeType.Filled)
        do {
            if(!baking.hasNext()) { canvas.roadMarks.upload();ready=true;break }
            baking.next()
        } while(System.nanoTime()<deadline)
        r.end();canvas.buffer.end();buildFrames++;val sliceMs=(System.nanoTime()-started)/1e6;buildCpuMs+=sliceMs;buildMaxMs=max(buildMaxMs,sliceMs)
        if(ready)Gdx.app.log("DeathRide","sceneryBake ${course.id} slicedFrames=$buildFrames totalCpuMs=$buildCpuMs maxSliceMs=$buildMaxMs")
    }
    fun draw(batch: SpriteBatch) {
        val previous=batch.shader
        if(look!=null){batch.shader=canvas.regionShader;val g=regionDefinition.grade;canvas.regionShader.setUniformf("u_regionGrade",g[0].toFloat(),g[1].toFloat(),g[2].toFloat())}
        batch.draw(region,left,bottom,width,height)
        for((texture,vertices) in liveRoad)batch.draw(texture,vertices,0,vertices.size)
        art.tile("tiles/gravel")?.let{t->for(v in shortcuts)batch.draw(t,v,0,v.size)}
        for(p in oils)art.draw(batch,"decals/oil",p[0],p[1],6f,3.6f,p[2])
        if(look!=null)batch.shader=previous
    }
    private var minimapFits=true
    /** Draws the HUD minimap road lines from the retained mesh; false (nothing drawn) when they do not fit, so the caller keeps the immediate path. */
    fun drawMinimapRoad(matrix: Matrix4,r: Float,g: Float,b: Float): Boolean {
        if(!ready || !minimapFits)return false
        if(canvas.minimapOwner!==this) {
            val lines=samples+branchCenters.sumOf{it.size/2-1}
            if(!canvas.minimap.let{it.clear();it.fits(lines)}){minimapFits=false;return false}
            val scale=min(166/(course.maxX-course.minX),112/(course.maxY-course.minY)).toFloat()
            val ox=1144f-((course.minX+course.maxX)*.5).toFloat()*scale;val oy=469f-((course.minY+course.maxY)*.5).toFloat()*scale
            val m=canvas.minimap
            for(i in 0 until samples)m.line(ox+center[i*2]*scale,oy+center[i*2+1]*scale,ox+center[(i+1)*2]*scale,oy+center[(i+1)*2+1]*scale,3f,r,g,b)
            for(line in branchCenters)for(i in 0 until line.size/2-1)m.line(ox+line[i*2]*scale,oy+line[i*2+1]*scale,ox+line[(i+1)*2]*scale,oy+line[(i+1)*2+1]*scale,3f,r,g,b)
            m.upload();canvas.minimapOwner=this
        }
        canvas.minimap.draw(matrix);return true
    }
    fun drawRoadMarks(r: ShapeRenderer) {
        if(liveRoad.isEmpty())return
        if(art.tile("tiles/gravel")==null)for(v in shortcuts){r.setColor(.43f,.36f,.25f,1f);r.triangle(v[0],v[1],v[5],v[6],v[10],v[11]);r.triangle(v[0],v[1],v[10],v[11],v[15],v[16])}
        if(ready && canvas.cacheRoadMarks){
            r.end();canvas.roadMarks.draw(canvas.markMatrix.set(r.projectionMatrix).mul(r.transformMatrix));r.begin(ShapeRenderer.ShapeType.Filled)
        }else for(p in marks){r.setColor(p[5],p[6],p[7],1f);r.rectLine(p[0],p[1],p[2],p[3],p[4])}
        for(p in oils)if(!art.available("decals/oil")){r.setColor(.08f,.12f,.14f,1f);r.ellipse(p[0]-3,p[1]-1.8f,6f,3.6f,24)}
    }

}

/** Fixed-size visual history; motion effects are cosmetic and do not feed physics. */
class MotionEffects {
    private val skids=FloatArray(VisualTuning["skidCapacity"].toInt()*6)
    private val dust=FloatArray(RegionAtmosphere.VEHICLE_CAPACITY*5)
    private var skidNext=0;private var dustNext=0;private var skidClock=0.0;private var dustClock=0.0
    private val lastX=DoubleArray(6);private val lastY=DoubleArray(6)
    fun clear() { skids.fill(0f);dust.fill(0f);lastX.fill(Double.NaN);lastY.fill(Double.NaN) }
    fun draw(r: ShapeRenderer,world: World,dt: Double,skidsEnabled: Boolean=true) {
        skidClock+=dt;dustClock+=dt
        val mark=skidsEnabled && skidClock>=VisualTuning["skidIntervalSeconds"];val puff=dustClock>=VisualTuning["particleIntervalSeconds"]
        if(mark)skidClock=0.0;if(puff)dustClock=0.0
        for(c in world.cars) {
            if(mark) {
                if((c.drifting || c.loadTransfer>.3) && lastX[c.id].isFinite() && hypot(c.x-lastX[c.id],c.y-lastY[c.id])<8) {
                    for(side in -1..1 step 2) {
                        val n=skidNext*6;skidNext=(skidNext+1)%(skids.size/6)
                        val ox=-sin(c.heading)*c.spec.circleRadiusM*.8*side;val oy=cos(c.heading)*c.spec.circleRadiusM*.8*side
                        skids[n]=(lastX[c.id]+ox).toFloat();skids[n+1]=(lastY[c.id]+oy).toFloat();skids[n+2]=(c.x+ox).toFloat();skids[n+3]=(c.y+oy).toFloat();skids[n+4]=VisualTuning["skidLifeSeconds"].toFloat();skids[n+5]=c.driftQuality.toFloat()
                    }
                };lastX[c.id]=c.x;lastY[c.id]=c.y
            }
            if(puff && c.speedMps>5 && (c.drifting || c.surface!==Surfaces.asphalt)) {
                val n=dustNext*5;dustNext=(dustNext+1)%(dust.size/5)
                dust[n]=(c.x-cos(c.heading)*c.spec.circleOffsetM).toFloat();dust[n+1]=(c.y-sin(c.heading)*c.spec.circleOffsetM).toFloat();dust[n+2]=VisualTuning["particleLifeSeconds"].toFloat();dust[n+3]=if(c.surface.id=="Gravel" || c.surface===Surfaces.offtrack)1f else 0f;dust[n+4]=c.id.toFloat()
            }
        }
        if(skidsEnabled)for(n in skids.indices step 6)if(skids[n+4]>0) { skids[n+4]-=dt.toFloat();r.setColor(.04f,.045f,.045f,.40f*(skids[n+4]/VisualTuning["skidLifeSeconds"]).toFloat());r.rectLine(skids[n],skids[n+1],skids[n+2],skids[n+3],.30f*(1+skids[n+5])) }
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
    /** Quad centred on car-frame (a,b), turned by [ang] relative to the car heading: steered front tyres. */
    private fun quadTurned(r: ShapeRenderer,a: Float,b: Float,w: Float,h: Float,ang: Float) {
        val ca=cos(ang);val sa=sin(ang);val cc=c*ca-s*sa;val ss=s*ca+c*sa
        val mx=x+a*c-b*s;val my=y+a*s+b*c;val hw=w*.5f;val hh=h*.5f
        val ux=hw*cc;val uy=hw*ss;val vx=-hh*ss;val vy=hh*cc
        r.triangle(mx-ux-vx,my-uy-vy,mx+ux-vx,my+uy-vy,mx+ux+vx,my+uy+vy);r.triangle(mx-ux-vx,my-uy-vy,mx+ux+vx,my+uy+vy,mx-ux+vx,my-uy+vy)
    }
    private fun body(r: ShapeRenderer,l: Float,w: Float,nose: Float) {
        quad(r,-l*.46f,-w*.5f,l*.75f,w)
        val ax=x+l*.29f*c+w*.5f*s;val ay=y+l*.29f*s-w*.5f*c
        val bx=x+l*.50f*c+w*nose*.5f*s;val by=y+l*.50f*s-w*nose*.5f*c
        val cx=x+l*.50f*c-w*nose*.5f*s;val cy=y+l*.50f*s+w*nose*.5f*c
        val dx=x+l*.29f*c-w*.5f*s;val dy=y+l*.29f*s+w*.5f*c
        r.triangle(ax,ay,bx,by,cx,cy);r.triangle(ax,ay,cx,cy,dx,dy)
    }
    fun draw(r: ShapeRenderer,car: Car,px: Float,py: Float,heading: Double,color: Color,flash: Boolean,scale: Float=1f,healthFraction: Float=1f,wrecked: Boolean=false,wheelAngle: Float=0f,tread: Float=0f,braking: Float=0f) {
        val spec=CarShapeCache.of(car.carClass?.id?:"Line");val l=spec.lengthM.toFloat()*scale;val w=spec.widthM.toFloat()*scale
        x=px+.35f*scale;y=py-.45f*scale;c=cos(heading).toFloat();s=sin(heading).toFloat()
        r.setColor(.025f,.035f,.04f,.65f);body(r,l*1.08f,w*1.15f,spec.noseWidth.toFloat())
        x=px;y=py
        // Four tires and their sidewalls sit outside the colored shell.
        r.setColor(.035f,.045f,.05f,1f)
        for(k in 0..1)quad(r,-l*.29f-l*.105f,(k*2-1)*w*.43f-w*.115f,l*.21f,w*.23f)
        for(k in 0..1) {
            val side=k*2-1
            quadTurned(r,l*.29f,side*w*.43f,l*.21f,w*.23f,wheelAngle)
            // Hub line and one scrolling tread block say the wheel turns and rolls; brakes darken the block.
            val shade=.30f-braking*.14f
            r.setColor(shade,shade+.01f,shade+.02f,1f);quadTurned(r,l*.29f,side*w*.43f,l*.17f,w*.035f,wheelAngle)
            val o=(tread/.9f-.5f)*l*.17f
            r.setColor(shade*.8f,shade*.8f,shade*.85f,1f)
            quadTurned(r,l*.29f+o*kotlin.math.cos(wheelAngle),side*w*.43f+o*kotlin.math.sin(wheelAngle),l*.03f,w*.19f,wheelAngle)
            r.setColor(.035f,.045f,.05f,1f)
        }
        if(wrecked)r.setColor(.17f,.18f,.17f,1f) else if(flash)r.color=Color.WHITE else r.color=color;body(r,l,w*.87f,spec.noseWidth.toFloat())
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
        if(healthFraction<1) {
            r.setColor(.035f,.045f,.045f,1f)
            val dents=((1-healthFraction)*7).toInt()
            for(i in 0 until dents)quad(r,-l*.32f+i*l*.075f,-w*.32f+(i%3)*w*.22f,l*.10f,w*.055f)
        }
        if(wrecked) { r.setColor(.07f,.085f,.085f,1f);quad(r,-l*.24f,-w*.26f,l*.42f,w*.52f) }
        if(spec.id=="Needle") { r.setColor(.05f,.07f,.08f,1f);quad(r,-l*.4f,-w*.20f,l*.16f,w*.40f) }
    }
}
