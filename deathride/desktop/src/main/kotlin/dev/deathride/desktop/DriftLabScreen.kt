package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.math.Vector3
import com.badlogic.gdx.utils.ScreenUtils
import com.badlogic.gdx.utils.viewport.FitViewport
import dev.deathride.core.*
import dev.deathride.game.CarPainter
import java.io.File
import java.util.Locale
import kotlin.math.*

/** A calibration instrument, not an alternate gameplay physics path. All edits are session-local. */
class DriftLabScreen(private val audit: Boolean=false,private val duration: Double=0.0) : ApplicationAdapter() {
    private val view=FitViewport(1280f,720f)
    private lateinit var shapes: ShapeRenderer
    private lateinit var batch: SpriteBatch
    private lateinit var font: BitmapFont
    private lateinit var small: BitmapFont
    private val painter=CarPainter()
    private val cursor=Vector3()
    private var parameters=DriftParameters.defaults.copy()
    private var specs=Array(CarCatalog.all.size){CarCatalog.all[it].spec()}
    private var classIndex=0;private var profileIndex=FeelProfiles.all.indexOf(FeelProfiles.default);private var surfaceIndex=0;private var exerciseIndex=DriftExercise.HANDBRAKE.ordinal
    private var entrySpeed=DriftLabRules["middleEntryMps"]
    private var experiment=makeExperiment()
    private var scripted=false;private var paused=false;private var geometryPage=false
    private var scroll=0;private var dragging=-1
    private var accumulator=0.0;private var elapsed=0.0;private var auditDone=false
    private val history=FloatArray(600*4);private var next=0;private var count=0
    private var notice="Session values only. E exports CSV; L loads the last export."
    private val exportDir=File("build/drift-calibration/last")
    private val accent=Color.valueOf("F9AE6C");private val cyan=Color.valueOf("73C7E8");private val muted=Color.valueOf("A5BAC7")
    private val geometryNames=DriftGeometry.fields.map{it.getValue("key")}.toTypedArray()
    private val geometryMin=DoubleArray(geometryNames.size){DriftGeometry.fields[it].number("min")}
    private val geometryMax=DoubleArray(geometryNames.size){DriftGeometry.fields[it].number("max")}
    private val visibleRows=19
    private val sliderLeft=1080f;private val sliderWidth=168f
    private val rowTop=563f;private val rowHeight=22f
    private fun makeExperiment()=DriftExperiment(classIndex,DriftExercise.entries[exerciseIndex],entrySpeed,parameters,FeelProfiles.all[profileIndex],Surfaces.all[surfaceIndex],specOverride=specs[classIndex])
    private fun reset() {experiment=makeExperiment();accumulator=0.0;count=0;next=0;paused=false}
    private fun f(value: Double,digits: Int=2)=String.format(Locale.ROOT,"%.${digits}f",value)
    override fun create() {
        shapes=ShapeRenderer();batch=SpriteBatch();font=nativeFont(18);small=nativeFont(14)
        Gdx.input.inputProcessor=object:InputAdapter() {
            override fun keyDown(key: Int): Boolean {
                when(key) {
                    Input.Keys.C -> {classIndex=(classIndex+1)%CarCatalog.all.size;reset()}
                    Input.Keys.F -> {profileIndex=(profileIndex+1)%FeelProfiles.all.size;reset()}
                    Input.Keys.V -> {surfaceIndex=(surfaceIndex+1)%Surfaces.all.size;reset()}
                    Input.Keys.X -> {exerciseIndex=(exerciseIndex+1)%DriftExercise.entries.size;scripted=true;reset()}
                    Input.Keys.R -> reset()
                    Input.Keys.P -> paused=!paused
                    Input.Keys.F1 -> {scripted=!scripted;reset()}
                    Input.Keys.G -> {geometryPage=!geometryPage;scroll=0}
                    Input.Keys.E -> export()
                    Input.Keys.L -> load()
                    Input.Keys.T -> {parameters=DriftParameters.defaults.copy();specs=Array(CarCatalog.all.size){CarCatalog.all[it].spec()};reset();notice="Restored authored CSV values."}
                    else -> return false
                }
                return true
            }
            override fun touchDown(screenX: Int,screenY: Int,pointer: Int,button: Int): Boolean {
                view.unproject(cursor.set(screenX.toFloat(),screenY.toFloat(),0f))
                if(cursor.x<sliderLeft-10 || cursor.x>sliderLeft+sliderWidth+10)return false
                if(abs(cursor.y-620)<14){dragging=-2;setEntry(cursor.x);return true}
                val row=((rowTop+10-cursor.y)/rowHeight).toInt()
                if(cursor.y>rowTop+10 || row !in 0 until visibleRows || row+scroll>=rowCount())return false
                dragging=row+scroll;setSlider(dragging,cursor.x);return true
            }
            override fun touchDragged(screenX: Int,screenY: Int,pointer: Int): Boolean {
                if(dragging== -1)return false
                view.unproject(cursor.set(screenX.toFloat(),screenY.toFloat(),0f))
                if(dragging== -2)setEntry(cursor.x) else setSlider(dragging,cursor.x)
                return true
            }
            override fun touchUp(screenX: Int,screenY: Int,pointer: Int,button: Int): Boolean {dragging=-1;return true}
            override fun scrolled(amountX: Float,amountY: Float): Boolean {scroll=(scroll+amountY.toInt()*3).coerceIn(0,max(0,rowCount()-visibleRows));return true}
        }
    }
    private fun rowCount()=if(geometryPage)geometryNames.size else DriftParameters.rows.size
    private fun setEntry(x: Float) {entrySpeed=5.0+((x-sliderLeft)/sliderWidth).coerceIn(0f,1f).toDouble()*35;notice="Entry speed applies on R / next replay."}
    private fun geometryValue(index: Int,spec: CarSpec=specs[classIndex]): Double {
        val g=spec.driftGeometry!!
        return when(index){0->g.wheelbaseM/spec.lengthM;1->g.trackM/spec.widthM;2->g.cgHeightM;3->g.frontLoadFraction;else->g.inertiaScale}
    }
    private fun changeGeometry(index: Int,value: Double) {
        val s=specs[classIndex];val g=s.driftGeometry!!
        specs[classIndex]=s.copy(driftGeometry=when(index){0->g.copy(wheelbaseM=s.lengthM*value);1->g.copy(trackM=s.widthM*value);2->g.copy(cgHeightM=value);3->g.copy(frontLoadFraction=value);else->g.copy(inertiaScale=value)})
        experiment.car.spec=specs[classIndex]
    }
    private fun setSlider(index: Int,x: Float) {
        val t=((x-sliderLeft)/sliderWidth).coerceIn(0f,1f).toDouble()
        try {
            if(geometryPage)changeGeometry(index,geometryMin[index]+t*(geometryMax[index]-geometryMin[index]))
            else {val row=DriftParameters.rows[index];parameters.set(index,row.number("min")+t*(row.number("max")-row.number("min")))}
            notice="Live values changed. E exports; T restores authored data."
        } catch(e: IllegalArgumentException){notice=e.message?:"Invalid parameter relationship"}
    }
    private fun export() {
        try {
            exportDir.mkdirs()
            File(exportDir,"drift.csv").bufferedWriter().use { w->
                w.appendLine("key,value,min,max,unit")
                for((i,r) in DriftParameters.rows.withIndex())w.appendLine("${r.getValue("key")},${parameters.value(i)},${r.getValue("min")},${r.getValue("max")},${r.getValue("unit")}")
            }
            File(exportDir,"drift-geometry.csv").bufferedWriter().use { w->
                w.appendLine("id,"+geometryNames.joinToString(","))
                for(i in specs.indices)w.appendLine(CarCatalog.all[i].id+","+geometryNames.indices.joinToString(","){geometryValue(it,specs[i]).toString()})
            }
            File(exportDir,"session.txt").writeText("Simulated calibration; owner acceptance not recorded.\nClass=${CarCatalog.all[classIndex].id}\nProfile=${FeelProfiles.all[profileIndex].id}\nSurface=${Surfaces.all[surfaceIndex].id}\nEntryMps=$entrySpeed\nExercise=${DriftExercise.entries[exerciseIndex]}\n")
            notice="Exported build/drift-calibration/last (authored resources unchanged)."
        }catch(e:Exception){notice="Export failed: ${e.message}"}
    }
    private fun load() {
        try {
            val nextParameters=DriftParameters.defaults.copy()
            nextParameters.setAll(File(exportDir,"drift.csv").readLines().drop(1).filter{it.isNotBlank()}.associate{val r=it.split(',');r[0] to r[1].toDouble()})
            val nextSpecs=specs.copyOf()
            val rows=File(exportDir,"drift-geometry.csv").readLines().drop(1).filter{it.isNotBlank()}
            require(rows.size==CarCatalog.all.size)
            val seen=HashSet<String>()
            for(line in rows) {
                val r=line.split(',');require(seen.add(r[0]));val index=CarCatalog.all.indexOfFirst{it.id==r[0]};require(index>=0 && r.size==6)
                val v=DoubleArray(5){r[it+1].toDouble().also{value->require(value.isFinite() && value in geometryMin[it]..geometryMax[it])}}
                val s=nextSpecs[index];nextSpecs[index]=s.copy(driftGeometry=DriftGeometry(s.lengthM*v[0],s.widthM*v[1],v[2],v[3],v[4]))
            }
            parameters=nextParameters;specs=nextSpecs;reset();notice="Loaded last exported CSV values."
        }catch(e:Exception){notice="Load failed; current tuning kept: ${e.message}"}
    }
    override fun resize(width: Int,height: Int) {view.update(width,height,true)}
    override fun render() {
        val dt=min(Gdx.graphics.deltaTime.toDouble(),.1);elapsed+=dt
        if(!paused) {
            accumulator+=dt
            while(accumulator>=Tuning.STEP_SECONDS) {
                if(scripted && experiment.seconds>=DriftLabRules["durationSeconds"]){paused=true;break}
                if(scripted)experiment.step() else {
                    val u=experiment.input
                    u.set((if(Gdx.input.isKeyPressed(Input.Keys.D))1.0 else 0.0)-(if(Gdx.input.isKeyPressed(Input.Keys.A))1.0 else 0.0),if(Gdx.input.isKeyPressed(Input.Keys.W))1.0 else 0.0,if(Gdx.input.isKeyPressed(Input.Keys.S))1.0 else 0.0)
                    u.handbrake=if(Gdx.input.isKeyPressed(Input.Keys.SHIFT_LEFT) || Gdx.input.isKeyPressed(Input.Keys.SHIFT_RIGHT))1.0 else 0.0
                    experiment.integrate()
                }
                captureSample()
                accumulator-=Tuning.STEP_SECONDS
            }
        }
        draw()
        if(audit && elapsed>1 && !auditDone)runAudit()
        if(duration>0 && elapsed>=duration)Gdx.app.exit()
    }
    private fun captureSample() {val c=experiment.car;val n=next*4;history[n]=c.x.toFloat();history[n+1]=c.y.toFloat();history[n+2]=c.slipRadians.toFloat();history[n+3]=c.speedMps.toFloat();next=(next+1)%600;count=min(600,count+1)}
    private fun label(text: String,x: Float,y: Float,color: Color=Color.WHITE,tiny: Boolean=false) {val f=if(tiny)small else font;f.color=color;f.draw(batch,text,x,y)}
    private fun draw() {
        ScreenUtils.clear(.035f,.06f,.08f,1f);view.apply();shapes.projectionMatrix=view.camera.combined;batch.projectionMatrix=view.camera.combined
        val c=experiment.car;val scale=7f
        fun px(x: Double)=400f+(x-c.x).toFloat()*scale
        fun py(y: Double)=390f+(y-c.y).toFloat()*scale
        shapes.begin(ShapeRenderer.ShapeType.Filled)
        shapes.setColor(.08f,.13f,.16f,1f);shapes.rect(800f,15f,465f,690f)
        shapes.setColor(.11f,.17f,.20f,1f)
        for(i in -7..7){val x=px((floor(c.x/10)+i)*10);if(x in 20f..780f)shapes.rect(x,210f,1f,390f);val y=py((floor(c.y/10)+i)*10);if(y in 210f..600f)shapes.rect(20f,y,760f,1f)}
        shapes.color=muted
        for(k in 1 until count) {
            val a=((next-count+k-1+600)%600)*4;val b=((next-count+k+600)%600)*4
            val x1=px(history[a].toDouble());val y1=py(history[a+1].toDouble());val x2=px(history[b].toDouble());val y2=py(history[b+1].toDouble())
            if(x1 in 20f..780f && x2 in 20f..780f && y1 in 210f..600f && y2 in 210f..600f)shapes.rectLine(x1,y1,x2,y2,2f)
        }
        painter.draw(shapes,c,400f,390f,c.heading,accent,false,scale=scale)
        shapes.color=cyan;shapes.rectLine(400f,390f,400f+c.vx.toFloat()*3,390f+c.vy.toFloat()*3,2f)
        // Fixed time window: orange slip (-90..90 deg), cyan speed (0..40 m/s).
        shapes.setColor(.13f,.20f,.23f,1f);shapes.rect(20f,35f,760f,110f)
        for(k in 1 until count) {
            val a=((next-count+k-1+600)%600)*4;val b=((next-count+k+600)%600)*4
            val x1=20f+(k-1)*760f/600;val x2=20f+k*760f/600
            shapes.color=accent;shapes.rectLine(x1,90+history[a+2].coerceIn(-1.57f,1.57f)*32,x2,90+history[b+2].coerceIn(-1.57f,1.57f)*32,1.5f)
            shapes.color=cyan;shapes.rectLine(x1,35+history[a+3]*2.5f,x2,35+history[b+3]*2.5f,1.5f)
        }
        drawSlider(620f,(entrySpeed-5)/35)
        for(r in 0 until min(visibleRows,rowCount()-scroll)) {
            val i=r+scroll;val min=if(geometryPage)geometryMin[i] else DriftParameters.rows[i].number("min");val max=if(geometryPage)geometryMax[i] else DriftParameters.rows[i].number("max")
            drawSlider(rowTop-r*rowHeight,((if(geometryPage)geometryValue(i) else parameters.value(i))-min)/(max-min))
        }
        shapes.end()
        batch.begin()
        label("DRIFT LAB  /  ${if(scripted)"SCRIPT REPLAY" else "MANUAL DRIVE"}${if(paused)"  [PAUSED]" else ""}",20f,701f,accent)
        label("W GO   A/D steer   S brake   Shift handbrake   R reset   P pause   F1 manual/replay",20f,671f,muted,true)
        label("C ${c.carClass!!.id}    F ${c.feel.id}    V ${c.surface.id}",20f,644f)
        label("X ${experiment.exercise.name.lowercase().replace('_',' ')}    ${f(experiment.seconds)} s",20f,620f,muted,true)
        label("Slip ${f(c.slipRadians*180/PI,1)} deg    ${f(c.speedMps,1)} m/s    Retained ${f(c.driftSpeedRetained*100,0)}%",20f,201f)
        label("Quality ${f(c.driftQuality)}   Held ${f(c.driftHeldSeconds)} s   ${if(c.spunOut)"SPIN / CATCH AND SETTLE" else if(c.drifting)"SLIDING" else "GRIP"}",20f,175f,if(c.spunOut)Color.SALMON else accent,true)
        label("SLIP -90..90 deg / SPEED 0..40 m/s   (last 10 s)",25f,132f,muted,true)
        label("${f(c.spec.massKg,0)} kg   ${f(c.spec.lengthM,1)} x ${f(c.spec.widthM,1)} m   Iz ${f(c.spec.yawInertiaKgM2,0)} kg m2",20f,23f,muted,true)
        label("LIVE ${if(geometryPage)"CLASS GEOMETRY" else "DRIFT PARAMETERS"}",817f,680f,accent)
        label("G change page   Wheel scroll   T restore CSV",817f,653f,muted,true)
        label("Entry speed (reset) ${f(entrySpeed,1)}",817f,625f,tiny=true)
        label("Drag a slider; values affect the next tick.",817f,594f,muted,true)
        for(r in 0 until min(visibleRows,rowCount()-scroll)) {
            val i=r+scroll;val name=if(geometryPage)geometryNames[i] else DriftParameters.rows[i].getValue("key")
            val value=if(geometryPage)geometryValue(i) else parameters.value(i)
            label(name,817f,rowTop-r*rowHeight+5,muted,true);label(f(value,3),1080f,rowTop-r*rowHeight+16,tiny=true)
        }
        label("E export CSV     L load last export",817f,107f,accent,true)
        label("Exports: build/drift-calibration/last",817f,82f,muted,true)
        label("Authored values are hypotheses. Owner feel is unmeasured.",20f,153f,muted,true)
        // Wrap feedback on words; no message runs underneath the neighboring controls.
        var y=59f;val words=notice.split(' ');var line=""
        for(word in words){if((line+word).length>58){label(line,817f,y,muted,true);y-=17;line=""};line+="$word "};label(line,817f,y,muted,true)
        batch.end()
    }
    private fun drawSlider(y: Float,fraction: Double) {shapes.setColor(.24f,.33f,.37f,1f);shapes.rect(sliderLeft,y-2,sliderWidth,4f);shapes.color=accent;shapes.circle(sliderLeft+fraction.coerceIn(0.0,1.0).toFloat()*sliderWidth,y,5f,12)}
    private fun runAudit() {
        auditDone=true
        try {
            fun drag(index: Int) {
                view.project(cursor.set(sliderLeft+sliderWidth,rowTop-index*rowHeight,0f))
                val x=cursor.x.toInt();val y=Gdx.graphics.height-cursor.y.toInt()
                Gdx.input.inputProcessor.touchDown(x,y,0,Input.Buttons.LEFT);Gdx.input.inputProcessor.touchUp(x,y,0,Input.Buttons.LEFT)
            }
            val index=DriftParameters.indices.getValue("peakSlipRadians");val before=DriftDynamics.curve(.16,parameters)
            drag(index);check(parameters.value(index)>.35);check(DriftDynamics.curve(.16,parameters)<before)
            Gdx.input.inputProcessor.keyDown(Input.Keys.G);val inertia=experiment.car.spec.yawInertiaKgM2;drag(4);check(experiment.car.spec.yawInertiaKgM2>inertia*1.9)
            Gdx.input.inputProcessor.keyDown(Input.Keys.E);parameters.set(index,.16);load();check(parameters.value(index)>.35)
            Gdx.input.inputProcessor.keyDown(Input.Keys.F);check(experiment.car.feel===FeelProfiles.all[profileIndex])
            scripted=true;repeat(90){experiment.step();captureSample()};check(experiment.car.speedMps.isFinite())
            File("build/drift-calibration/desktop-check.json").writeText("{\"sliderInput\":true,\"curveChanged\":true,\"inertiaChanged\":true,\"exportImport\":true,\"profileSwitch\":true,\"replay\":true,\"ownerFelt\":false}\n")
            draw();val pixmap=Pixmap.createFromFrameBuffer(0,0,Gdx.graphics.width,Gdx.graphics.height)
            val png=PixmapIO.PNG();png.setFlipY(true);png.write(Gdx.files.local("build/drift-calibration/desktop-check.png"),pixmap);png.dispose();pixmap.dispose()
            println("DriftLab desktop audit passed")
        }catch(e:Exception){File("build/drift-calibration").mkdirs();File("build/drift-calibration/desktop-error.txt").writeText(e.stackTraceToString());throw e}
    }
    override fun dispose() {shapes.dispose();batch.dispose();font.dispose();small.dispose()}
}
