package dev.deathride.core

import java.io.File
import java.util.Random
import kotlin.math.*

data class CandidateSlot(val id:String,val base:String,val oldCourse:String,val role:String,val tier:Int,val oldLaps:Int,val laps:Int,val min:Double,val max:Double)
data class LayoutFamily(val id:String,val points:List<Pair<Double,Double>>,val junction:Pair<Double,Double>?=null,val complex:Boolean=false)
object CandidateAuthor {
    val folder=File(TrackQuality.root,"tracks/candidates").apply{mkdirs()}
    fun points(text:String)=text.split(';').map { val a=it.trim().split(' ');a[0].toDouble() to a[1].toDouble() }
    val families=listOf(
        LayoutFamily("double-hook",points("0 0;30 0;30 8.2;12 8.2;12 16.4;30 16.4;30 26;20 26;20 35;0 35;0 23;8.2 23;8.2 12;0 12")),
        LayoutFamily("fishhook",points("0 0;34 0;34 8.2;13 8.2;13 21;25 21;25 29.2;0 29.2")),
        LayoutFamily("offset-ladder",points("0 0;32 0;32 8.2;10 8.2;10 16.4;32 16.4;32 34;20 34;20 25.8;0 25.8")),
        LayoutFamily("three-prongs",points("0 0;36 0;36 28;27.8 28;27.8 11;17 11;17 35;8.8 35;8.8 17;0 17")),
        LayoutFamily("diagonal-rally",points("0 0;42 -6;53 9;28 16;46 40;32 52;16 29;-5 37;-16 23;5 13")),
        LayoutFamily("crooked-key",points("0 0;42 0;42 9;20 9;20 20;40 31;32 43;11 31;-4 31;-4 19;7 19;7 9;0 9")),
        LayoutFamily("crossed-hook",points("0 0;30 30;30 45;21.8 45;21.8 34;13.6 34;13.6 45;0 45;0 30;30 0;30 -15;0 -15"),15.0 to 15.0,true),
        LayoutFamily("in-and-out-spiral",points("0 0;60 0;60 60;0 60;0 17;43 17;43 43;17 43;17 34.5;34.5 34.5;34.5 25.5;8.5 25.5;8.5 51.5;51.5 51.5;51.5 8.5;0 8.5"),complex=true),
        LayoutFamily("staggered-bays",points("0 0;44 0;44 16;35.8 16;35.8 8.2;22 8.2;22 25;38 25;38 33.2;13.8 33.2;13.8 19;0 19")),
        LayoutFamily("long-cutback",points("0 0;50 0;50 8.2;17 8.2;17 18;39 18;39 30;29 30;29 40;8.2 40;8.2 27;0 27")),
        LayoutFamily("angled-fan",points("0 0;40 -10;52 3;28 12;38 29;29 40;17 23;2 30;-10 21;10 12")),
        LayoutFamily("nested-switchbacks",points("0 0;50 0;50 44;41.8 44;41.8 8.2;26 8.2;26 36;17.8 36;17.8 16.4;8.2 16.4;8.2 44;0 44"),complex=true),
        LayoutFamily("diagonal-courtyard",points("0 0;40 0;40 8.2;20 8.2;31 24;43 32;34 44;14 30;0 30;0 21;10 21;10 10;0 10")),
        LayoutFamily("two-peninsulas",points("0 0;38 0;38 36;29.8 36;29.8 12;18 12;18 28;9.8 28;9.8 12;0 12")),
        LayoutFamily("ribbon-stair",points("0 0;24 0;24 12;40 12;40 20.2;15.8 20.2;15.8 8.2;8.2 8.2;8.2 32;32 32;32 40.2;0 40.2"),complex=true),
        LayoutFamily("split-hook",points("0 0;30 0;30 8.2;12 8.2;12 16.4;30 16.4;30 26;20 26;20 35;0 35;0 23;8.2 23;8.2 12;0 12"),complex=true),
        LayoutFamily("crossed-double-hook",points("0 0;30 30;30 45;21.8 45;21.8 34;13.6 34;13.6 45;0 45;0 30;30 0;30 -26;21.8 -26;21.8 -12;13.6 -12;13.6 -26;0 -26"),15.0 to 15.0,true),
        LayoutFamily("split-courtyard",points("0 0;40 0;40 8.2;20 8.2;31 24;43 32;34 44;14 30;0 30;0 21;10 21;10 10;0 10"),complex=true),
        LayoutFamily("rally-coast",points("0 0;40 0;56 12;52 26;28 18;16 30;30 43;52 39;62 53;44 70;23 61;7 43;-12 39;-26 20;-12 6")),
        LayoutFamily("harbour-run",points("0 0;50 0;62 6;60 19;36 17;23 31;42 48;38 59;16 46;5 29;-14 35;-27 20;-18 5;-5 12")),
        LayoutFamily("canyon-shuttle",points("0 0;42 -12;55 1;41 14;22 7;8 22;23 38;43 27;54 40;34 59;12 51;-3 34;-20 42;-31 28;-16 12"))
    )
    val slots=Content.table("campaign").map { row ->
        val id=row.getValue("id");val visit=id.substringAfterLast('-').toInt();val old=row.getValue("course")
        val base=when(id){"foundry-1","foundry-6"->"ballast";"crown-1","crown-6"->"lowwater";"scrap-7"->"crucible";"foundry-7"->"cutface";"salt-7"->"sunspike";"switchback-7"->"summit";else->old}
        val role=when { id=="switchback-4"->"accepted";row.getValue("type")=="ELIMINATION"->"arena";visit==7->"boss";visit==6->"final";visit==1->"opening";else->"mid" }
        val lo=when(role){"opening"->120.0;"final","boss"->240.0;"arena"->0.0;else->150.0};val hi=when(role){"opening"->180.0;"final","boss","arena"->360.0;else->240.0}
        CandidateSlot(id,base,old,role,row.number("playerTier").toInt(),row.number("laps").toInt(),if(role in setOf("final","boss"))3 else 2,lo,hi)
    }
    fun lesson(slot:CandidateSlot)=when(slot.id.substringAfterLast('-')) {
        "1"->"Brake from the wide approach and commit to the return; learn the narrower road."
        "2"->"Read the surface warning and leave room to straighten the car before accelerating."
        "3"->"Choose a recovery lane without surrendering the next corner's exit."
        "4"->"Read the fold-back landmarks; the nearby opposing road is a separate passage."
        "5"->"Link direction changes and save the wide braking zone for a pass."
        "6"->"Sustain the opening lessons through a longer sequence with less predictable returns."
        else->if(slot.role=="arena")"Use the route's escape opportunities while denying a hunter a clean approach." else "Break pursuit through the returns, then attack on the wide approach."
    }
    fun variant(f:LayoutFamily,seed:Long,scale:Double=1.0):String {
        val r=Random(seed);val split=f.id.startsWith("split-");val routed=f.junction!=null || split
        val sx=if(routed).98+r.nextDouble()*.15 else .92+r.nextDouble()*.55;val sy=.92+r.nextDouble()*.55;val shear=(r.nextDouble()-.5)*.28
        val points=f.points.toMutableList();val spur=f.id in setOf("rally-coast","harbour-run","canyon-shuttle")
        // A long independent edge may acquire an extra four-corner bay. This changes the sequence,
        // rather than disguising a repeated outline by rotation, reflection or scale.
        if(f.junction==null && (spur || r.nextDouble()<.7)) {
            val eligible=points.indices.filter { i->val a=points[i];val b=points[(i+1)%points.size];(!split || i>=4) && hypot(b.first-a.first,b.second-a.second)>34 }
            if(eligible.isNotEmpty()) {
                val i=eligible[r.nextInt(eligible.size)];val a=points[i];val b=points[(i+1)%points.size];val length=hypot(b.first-a.first,b.second-a.second);val ux=(b.first-a.first)/length;val uy=(b.second-a.second)/length
                val depth=if(spur)18+r.nextDouble()*10 else 8.2+r.nextDouble()*7;val side=if(r.nextBoolean())1 else -1;val lo=12.0;val hi=if(spur)lo+8.2 else length-12.0
                fun p(d:Double,h:Double)=a.first+ux*d-uy*h to a.second+uy*d+ux*h
                points.addAll(i+1,listOf(p(lo,0.0),p(lo,side*depth),p(hi,side*depth),p(hi,0.0)))
            }
        }
        // Independent long approaches acquire one or more genuine S sequences. The centreline
        // crosses its original straight but never crosses another road unless the hard linter permits it.
        if(f.junction==null)repeat(1+r.nextInt(3)) {
            val eligible=points.indices.filter { i->val a=points[i];val b=points[(i+1)%points.size];(!split || i>=4) && hypot(b.first-a.first,b.second-a.second)>24 }
            if(eligible.isNotEmpty()) {
                val i=eligible[r.nextInt(eligible.size)];val a=points[i];val b=points[(i+1)%points.size];val length=hypot(b.first-a.first,b.second-a.second);val ux=(b.first-a.first)/length;val uy=(b.second-a.second)/length
                val amp=(2.5+r.nextDouble()*3.5)*(if(r.nextBoolean())1 else -1)
                points.addAll(i+1,listOf(a.first+ux*length*.34-uy*amp to a.second+uy*length*.34+ux*amp,a.first+ux*length*.67+uy*amp to a.second+uy*length*.67-ux*amp))
            }
        }
        val shortEdges=points.indices.map { i->points[i] to points[(i+1)%points.size] }.filter{(a,b)->hypot(b.first-a.first,b.second-a.second)<12}
        val stretchX=shortEdges.count{(a,b)->abs(b.second-a.second)>abs(b.first-a.first)}>=shortEdges.size/2.0
        fun transform(p:Pair<Double,Double>)=(p.first*sx+p.second*shear)*(if(stretchX)scale else 1.0) to p.second*sy*(if(stretchX)1.0 else scale)
        val transformed=points.map(::transform);val n=points.size
        val edge=DoubleArray(n){i->val a=transformed[i];val b=transformed[(i+1)%n];hypot(b.first-a.first,b.second-a.second)}
        val cut=DoubleArray(n){i->val a=transformed[(i+n-1)%n];val p=transformed[i];val b=transformed[(i+1)%n];tan(abs(wrapAngle(atan2(b.second-p.second,b.first-p.first)-atan2(p.second-a.second,p.first-a.first)))/2)}
        val radii=DoubleArray(n){3.55+r.nextDouble()*.35}
        for(i in (0 until n).toMutableList().also { java.util.Collections.shuffle(it,r) }) {
            val previous=(i+n-1)%n;val next=(i+1)%n
            val cap=min((edge[previous]-radii[previous]*cut[previous]-.8)/cut[i],(edge[i]-radii[next]*cut[next]-.8)/cut[i])
            if(cap>=7.0)radii[i]=min(cap,7.1+r.nextDouble()*1.3)
        }
        val ops=points.mapIndexed { i,p ->
            val a=points[(i+points.size-1)%points.size]
            val radius=radii[i]
            val width=when { routed->if(i%7==5)4.3 else 5.15;i%5==2->3.7;hypot(p.first-a.first,p.second-a.second)>15->5.15;else->4.3 }
            val q=transform(p);DesignPrimitive("anchor",q.first,q.second,radius,width)
        }.toMutableList()
        f.junction?.let { val p=transform(it);ops+=DesignPrimitive("junction",p.first,p.second,6.0,4.8) }
        if(split) {
            val main=TrackComposer.compile(Courses.all.first(),TrackComposer.csv(ops),false).course;val q=Projection()
            val a=transform(12.0 to 0.0);main.project(a.first*TrackQuality.longest,a.second*TrackQuality.longest,q);val start=q.s/main.lengthM
            val b=transform((if(f.id=="split-courtyard")28.0 else 20.0) to 8.2);main.project(b.first*TrackQuality.longest,b.second*TrackQuality.longest,q);val end=q.s/main.lengthM
            val alternative=ops.mapIndexed { i,p->if(i==1 || i==2)p.copy(a=p.a+12*scale)else p }
            return TrackComposer.csv(ops+DesignPrimitive("split",start,end)+alternative+DesignPrimitive("rejoin",0.0))
        }
        return TrackComposer.csv(ops)
    }
    fun compose(slot:CandidateSlot,recipe:String,id:String?=null):ComposedTrack {
        val composed=TrackComposer.compile(Courses.all.single{it.id==slot.base},recipe)
        var c=composed.course
        val launch=File(folder,"launch-overrides.csv").takeIf{it.exists()}?.let{TrackQuality.csv(it.readText()).singleOrNull{row->row["candidate"]==id}}
        if(launch!=null) {
            val runs=qualityRuns(c){if(c.curvature[it]<.0025)1 else 0}.filter{it.lengthM>=12.5*TrackQuality.longest && c.curvature[it.indices.first()]<.0025}.sortedByDescending{it.lengthM}
            val run=runs[launch.getValue("straightRank").toInt()];val start=c.phase(run.startM+run.lengthM-launch.number("approachL")*TrackQuality.longest)/c.lengthM
            c=Course(c.id,c.name,c.lesson,start,c.theme,c.nodes,c.spots,c.features,c.obstaclePlacements,c.junctions,c.branches)
        }
        // The long road provides spaced recovery choices, not more weapon power.
        val recovery=File(folder,"recovery.csv").takeIf{it.exists()}?.let{TrackQuality.csv(it.readText()).singleOrNull{row->row["candidate"]==id}}
        val arenaSupplies=File(folder,"arena-supplies.csv").takeIf{it.exists()}?.let{TrackQuality.csv(it.readText()).singleOrNull{row->row["candidate"]==id}}
        val repairFractions=(if(recovery?.get("earlyPairs")=="3")listOf(.012,.036,.06)else emptyList())+
            (if(slot.role=="arena")arenaSupplies?.get("repairSites")?.toInt()?.let{n->(0 until n).map{(it+.5)/n}}?:listOf(.25,.75) else recovery?.get("count")?.toInt()?.let{n->(0 until n).map{(it+.55)/n}}?:listOf(.08,.22,.36,.50,.64,.78,.92))
        // Separation exceeds two pickup-trigger radii including the widest car's body circle.
        // A centre-running car must not consume both recovery choices in one pass.
        val lanes=if(recovery?.get("lanes")=="dual")listOf(-5.2,5.2)else listOf(0.0)
        val placed=repairFractions.map { fraction->
            if(lanes.size==1)fraction else {
                val point=TrackPoint()
                val offsets=listOf(0.0)+(1..20).flatMap{listOf(it*8.0,-it*8.0)}
                val at=offsets.firstOrNull { offset->
                    val s=(c.startFraction+fraction)*c.lengthM+offset
                    c.widthAt(s)-Movement.vergeWidthM-TrackQuality.widest/2>=5.3 && lanes.all{lane->
                        c.sample(s,lane,point);c.obstacles.none{it.definition.effect==ObstacleEffect.SOLID && it.contains(point.x,point.y,TrackQuality.widest/2+.2)}
                    }
                }?:error("No clear wide recovery zone within 160 m")
                (fraction+at/c.lengthM).mod(1.0)
            }
        }
        val ammo=arenaSupplies?.get("ammoSites")?.toInt()?.let{n->(0 until n).map{TrackSpot("ammo",(it+.5)/n,if(it%2==0)-2.5 else 2.5)}}?:listOf(TrackSpot("ammo",.24,-3.0))
        val spots=c.spots.filter{it.kind !in setOf("ammo","repair","cash")}+ammo+TrackSpot("cash",.68,3.0)+
            placed.flatMap{fraction->lanes.map{lane->TrackSpot("repair",fraction,lane)}}
        val zones=mutableListOf<Triple<Double,Double,Surface>>()
        val straights=qualityRuns(c){if(c.curvature[it]<.0025)1 else 0}.filter{it.lengthM>120 && c.curvature[it.indices.first()]<.0025}.sortedByDescending{it.lengthM}
        for(run in straights) {
            if(zones.size==2)break
            val from=c.phase(run.startM+run.lengthM*.55);val length=if(zones.isEmpty())36.0 else 27.0;val to=from+length
            if(to>c.lengthM || c.grid.any{g->val s=c.phase((c.startFraction+g.fraction)*c.lengthM);s in from-60..to+50} || c.features.any{f->f.start*c.lengthM<to+30 && f.end*c.lengthM>from-30} || c.junctions.any{j->listOf(j.first,j.second).any{it*c.lengthM in from-60..to+60}} || c.branches.any{b->b.start*c.lengthM<to+30 && b.end*c.lengthM>from-30})continue
            val surface=when { c.theme=="alpine" && zones.isEmpty()->"Ice";c.theme in setOf("industrial","wetland") && zones.isNotEmpty()->"Oil";else->"Gravel" }
            zones+=Triple(from,to,Surfaces.all.single{it.id==surface})
        }
        val stride=c.count/(c.nodes.size-1);val nodes=c.nodes.dropLast(1).mapIndexed{i,node->val s=c.arc[i*stride];node.copy(surface=zones.firstOrNull{s in it.first..it.second}?.third?:node.surface)}
        val budget=File(folder,"race-overrides.csv").takeIf{it.exists()}?.let{TrackQuality.csv(it.readText()).singleOrNull{row->row["candidate"]==id}?.number("budgetSeconds")}?:if(slot.role=="arena")360.0 else slot.max+60
        return composed.copy(course=Course(c.id,c.name,lesson(slot),c.startFraction,c.theme,nodes+nodes.first(),spots,c.features,c.obstaclePlacements,c.junctions,c.branches,TrackRaceProfile(slot.laps,slot.tier,budget),Regions.forDivision(slot.id.substringBefore('-'))))
    }
    fun reviewCourse(c:Course):Map<String,Any?> = qualityCourseData(c)+("ribbon" to (0..512).map { i->val s=i*c.lengthM/512;val p=TrackPoint();c.sample(s,0.0,p);listOf(p.x,p.y,c.widthAt(s),s) })
    fun design(limit:Int=102) {
        val manifest=File(folder,"manifest.csv");val header="candidate,slot,base,role,tier,laps,minSeconds,maxSeconds,family,seed,scale,referenceSeconds\n"
        val rows=if(manifest.exists())TrackQuality.csv(manifest.readText()).toMutableList()else mutableListOf()
        val shapes=rows.map { row-> val slot=slots.single{it.id==row.getValue("slot")};try {trackShape(TrackComposer.compile(Courses.all.single{it.id==slot.base},File(folder,"recipes/${row.getValue("candidate")}.csv").readText(),false).course)}catch(e:Exception){error("${row["candidate"]}: ${e.message}")} }.toMutableList()
        val failures=linkedMapOf<String,Int>();var made=rows.size
        File(folder,"recipes").mkdirs();File(folder,"bundles").mkdirs();File(folder,"drafts").mkdirs()
        fun save(){manifest.writeText(header+rows.joinToString("\n",postfix="\n"){ row->header.trim().split(',').joinToString(","){row.getValue(it)} });File(folder,"search-failures.json").writeText(TrackQuality.json(failures))}
        for((slotIndex,slot) in slots.withIndex())if(slot.role!="accepted")for(choice in 0..2) {
            val id="${slot.id}-${('a'.code+choice).toChar()}";if(rows.any{it["candidate"]==id})continue;if(made>=limit){save();return}
            val used=rows.filter{it["slot"]==slot.id}.map{it.getValue("family")}.toSet()
            var accepted=false
            for(attempt in 0 until 1600) {
                if(attempt%25==0){println("SEARCH $id attempt=$attempt failures=$failures");File(folder,"search-failures.json").writeText(TrackQuality.json(failures))}
                val required=File(folder,"family-overrides.csv").takeIf{it.exists()}?.let{TrackQuality.csv(it.readText()).singleOrNull{row->row["candidate"]==id}?.get("family")}
                    ?:when(id){"crown-7-a"->"crossed-double-hook";"crown-7-b"->"split-courtyard";else->null}
                val f=if(required==null)families[(slotIndex*7+choice*5+attempt)%families.size]else families.single{it.id==required};if(f.id in used)continue
                val uFamilies=setOf("three-prongs","two-peninsulas")
                if(f.id in uFamilies && used.any{it in uFamilies})continue
                if(f.complex && slot.role in setOf("opening","mid") && attempt<400)continue
                val seed=904001L+slotIndex*100003+choice*11003+attempt*1009;var scale=1.0
                try {
                    var recipe=variant(f,seed);var composed=TrackComposer.compile(Courses.all.single{it.id==slot.base},recipe,false)
                    var shape=trackShape(composed.course)
                    val bad=shapeGates(shape.metrics).filter{it["status"]!="pass"};if(bad.isNotEmpty()){val key="shape:"+bad.first()["metric"];failures[key]=(failures[key]?:0)+1;continue}
                    if(TrackLinter.errors(composed.course).isNotEmpty()){failures["physical"]=(failures["physical"]?:0)+1;continue}
                    var ref=qualityReference(composed.course,slot.tier,limitSeconds=600.0)
                    fun duration()=(ref["standingLapSeconds"] as? Double ?:9999.0)+(slot.laps-1)*(ref["flyingLapSeconds"] as? Double ?:9999.0)
                    if(slot.role!="arena") {
                        val target=(slot.min+slot.max)/2
                        if(duration()<target) {scale=(target/duration()).pow(1.6).coerceAtMost(3.5);recipe=variant(f,seed,scale);composed=TrackComposer.compile(Courses.all.single{it.id==slot.base},recipe,false);ref=qualityReference(composed.course,slot.tier,limitSeconds=600.0)}
                        if(duration() !in slot.min+5..slot.max-5){failures["duration"]=(failures["duration"]?:0)+1;continue}
                    }
                    shape=trackShape(composed.course)
                    if(shapeGates(shape.metrics).any{it["status"]!="pass"})continue
                    if(shapes.any { prior-> OutlineRules.similar(shapeSimilarity(prior,shape)) }) {failures["duplicate"]=(failures["duplicate"]?:0)+1;continue}
                    if(slot.role in setOf("final","boss") && (shape.metrics.getValue("absoluteTurnDegrees")<1200 || shape.corners.size<8)){failures["final-complexity"]=(failures["final-complexity"]?:0)+1;continue}
                    composed=compose(slot,recipe,id);val c=composed.course;val geometry=qualityGeometry(c)
                    if((geometry.detail.getValue("lint") as List<*>).isNotEmpty()){failures["decorated-physical"]=(failures["decorated-physical"]?:0)+1;continue}
                    val gates=TrackQuality.gates(geometry.values,setOf("geometry","lap"))
                    if(gates.any{it["status"]!="pass"}) {val key="quality:"+gates.first{it["status"]!="pass"}["metric"];failures[key]=(failures[key]?:0)+1;continue}
                    val row=linkedMapOf("candidate" to id,"slot" to slot.id,"base" to slot.base,"role" to slot.role,"tier" to "${slot.tier}","laps" to "${slot.laps}","minSeconds" to "${slot.min}","maxSeconds" to "${slot.max}","family" to f.id,"seed" to "$seed","scale" to "$scale","referenceSeconds" to "${duration()}")
                    rows+=row;shapes+=shape;made++;File(folder,"recipes/$id.csv").writeText(recipe)
                    val data=mapOf("id" to id,"slot" to slot.id,"role" to slot.role,"tier" to slot.tier,"laps" to slot.laps,"oldLaps" to slot.oldLaps,"minSeconds" to slot.min,"maxSeconds" to slot.max,"family" to f.id,"reference" to ref,"referenceSeconds" to duration(),"course" to reviewCourse(c),"before" to reviewCourse(Courses.all.single{it.id==slot.oldCourse}),"shape" to shape.data(),"geometry" to geometry.detail,"gates" to gates,"recipe" to recipe,"csv" to TrackLabCodec.csv(c),"spans" to composed.spans)
                    File(folder,"drafts/$id.json").writeText(TrackQuality.json(data));File(folder,"bundles/$id.zip").writeBytes(TrackLabCodec.zip(c,recipe));save()
                    println("DESIGNED $made $id ${f.id} ${c.lengthM.roundToInt()} m ${duration().roundToInt()} s; ${shape.metrics}")
                    accepted=true;break
                }catch(e:Exception){val key=e.message?.substringBefore(':')?.take(70)?:e.javaClass.simpleName;failures[key]=(failures[key]?:0)+1}
            }
            check(accepted){"No valid design for $id; $failures"}
        }
        save()
    }
}
fun main(args:Array<String>){CandidateAuthor.design(args.firstOrNull()?.toInt()?:102)}
