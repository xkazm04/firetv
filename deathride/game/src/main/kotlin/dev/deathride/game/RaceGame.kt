package dev.deathride.game

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.utils.ScreenUtils
import com.badlogic.gdx.utils.viewport.FitViewport
import com.google.zxing.*
import com.google.zxing.qrcode.QRCodeWriter
import dev.deathride.core.*
import dev.deathride.link.RaceServer
import kotlin.math.*

class RaceGame(val assets: (String)->String, val logger: (String)->Unit, val smoke: Boolean=false, val runSeconds: Double=0.0, val soak: Boolean=false, val keyboardCheck: Boolean=false) : ApplicationAdapter() {
    private lateinit var shape: ShapeRenderer
    private lateinit var batch: SpriteBatch
    private lateinit var font: BitmapFont
    private lateinit var large: BitmapFont
    private lateinit var small: BitmapFont
    private lateinit var text: GlyphLayer
    private lateinit var headline: GlyphLayer
    private lateinit var detail: GlyphLayer
    private lateinit var server: RaceServer
    private val world=World()
    private val inputs=Array(6){InputFrame()}
    private val view=FitViewport(1280f,720f)
    private val worldMatrix=Matrix4()
    private val accent=Color(Presentation.ACCENT)
    private val colors=arrayOf(Color(Presentation.ACCENT),Color.valueOf("6ECFFF"),Color.valueOf("EC916E"),Color.valueOf("B0A0E8"),Color.valueOf("F0D583"),Color.valueOf("A1B4C3"))
    private val road=Color.valueOf("243442")
    private val infield=Color.valueOf("101F29")
    private val curb=Color.valueOf("60757B")
    private val bg=Color.valueOf("0B141E")
    private val trackPoints=FloatArray(241*4)
    private val center=FloatArray(241*2)
    private var qr: Texture?=null
    private var qrUrl=""
    private var qrPin=""
    private var qrAddress=""
    private var addressLabel=""
    private val muted=Color.valueOf("A9BDC6")
    private val warning=Color.valueOf("F0D583")
    private val digits=Array(10){it.toString()}
    private var accumulator=0.0
    private var previousNanos=0L
    private var phase="lobby"
    private var countdown=3.0
    private var stateTime=0.0
    private var uiTime=0.0
    private var keyboard=false
    private var focusX=0.0
    private var focusY=0.0
    private var cameraZoom=1.0
    private var smokeTime=0.0
    private var smokeStarted=false
    private var captured=false
    private var resultCaptured=false
    private val uiBuilder=com.badlogic.gdx.utils.StringBuilder(512)
    private var rankOrder=IntArray(6)

    override fun create() {
        shape=ShapeRenderer(10000); batch=SpriteBatch()
        font=BitmapFont().apply { data.setScale(1.35f); setUseIntegerPositions(false); region.texture.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear) }
        large=BitmapFont().apply { data.setScale(3.4f); setUseIntegerPositions(false); region.texture.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear) }
        small=BitmapFont().apply { data.setScale(1.05f); setUseIntegerPositions(false); region.texture.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear) }
        text=GlyphLayer(font); headline=GlyphLayer(large); detail=GlyphLayer(small)
        server=RaceServer(assets,logger); server.start()
        val p=TrackPoint()
        for(i in 0..240) {
            val s=world.track.lengthM*i/240
            world.track.sample(s,world.track.halfWidthM,p); trackPoints[i*4]=p.x.toFloat(); trackPoints[i*4+1]=p.y.toFloat()
            world.track.sample(s,-world.track.halfWidthM,p); trackPoints[i*4+2]=p.x.toFloat(); trackPoints[i*4+3]=p.y.toFloat()
            world.track.sample(s,0.0,p); center[i*2]=p.x.toFloat(); center[i*2+1]=p.y.toFloat()
        }
        Gdx.input.setCatchKey(Input.Keys.BACK,true)
        Gdx.input.inputProcessor=object: InputAdapter() {
            override fun keyDown(keycode: Int): Boolean {
                when(keycode) {
                    Input.Keys.ENTER,Input.Keys.SPACE,Input.Keys.DPAD_CENTER,Input.Keys.BUTTON_A -> { if(phase=="lobby" || phase=="results")startRace(); return true }
                    Input.Keys.BACK,Input.Keys.ESCAPE,Input.Keys.BUTTON_B -> { if(phase!="lobby")lobby() else Gdx.app.exit(); return true }
                    Input.Keys.LEFT -> { selectFeel(-1); return true }
                    Input.Keys.RIGHT -> { selectFeel(1); return true }
                    Input.Keys.UP -> if(phase=="lobby") { server.resetPairing(); keyboard=false; return true }
                }
                if(keycode==Input.Keys.W || keycode==Input.Keys.A || keycode==Input.Keys.D || keycode==Input.Keys.S)keyboard=true
                return false
            }
        }
        previousNanos=System.nanoTime()
        rebuildUi()
    }
    private fun selectFeel(direction: Int) {
        server.feelRequest.set((FeelProfiles.all.indexOf(server.feel)+direction).mod(FeelProfiles.all.size))
    }
    private fun startRace() { world.reset(); phase="countdown"; countdown=3.0; accumulator=0.0; stateTime=0.0; server.phase=phase; logger("race countdown"); rebuildUi() }
    private fun lobby() { phase="lobby"; world.reset(); stateTime=0.0; server.phase=phase; rebuildUi() }
    override fun resize(width: Int,height: Int) { view.update(width,height,true) }
    override fun pause() { server.paused=true; server.suspendLink(); accumulator=0.0 }
    override fun resume() { if(::server.isInitialized) { server.paused=false; server.start() }; previousNanos=System.nanoTime(); accumulator=0.0 }
    override fun render() {
        val nanos=System.nanoTime(); val actual=(nanos-previousNanos)/1e9; previousNanos=nanos
        val now=server.nowMs(); server.metrics.frameMs.add(actual*1000,now); server.frameNumber++
        val elapsed=actual.coerceIn(0.0,.1); stateTime+=elapsed; uiTime+=elapsed; smokeTime+=actual
        val feelIndex=server.feelRequest.getAndSet(-1)
        if(feelIndex>=0) { server.feel=FeelProfiles.all[feelIndex]; logger("feel ${server.feel.json}") }
        for(c in world.cars)c.feel=if(c.human)server.feel else FeelProfiles.spike
        when(server.command.getAndSet(0)) { 1 -> if(phase=="lobby" || phase=="results")startRace(); 2 -> lobby() }
        if(actual>.1)server.metrics.discardedSimMs.add(((actual-.1)*1000).toLong(),now)
        if(phase=="countdown") { countdown-=elapsed; if(countdown<=0) { phase="race"; server.phase=phase; stateTime=0.0 } }
        if(phase=="lobby" || phase=="race") {
            accumulator+=elapsed
            var steps=0
            while(accumulator>=Tuning.STEP_SECONDS && steps<6) {
                for(i in 0..1) { world.cars[i].human=server.slots[i].claimed; world.cars[i].feel=if(world.cars[i].human)server.feel else FeelProfiles.spike; server.consume(i,server.nowMs(),inputs[i]) }
                if(keyboard && !server.slots[0].claimed) {
                    world.cars[0].human=true
                    val left=Gdx.input.isKeyPressed(Input.Keys.A)||Gdx.input.isKeyPressed(Input.Keys.LEFT)
                    val right=Gdx.input.isKeyPressed(Input.Keys.D)||Gdx.input.isKeyPressed(Input.Keys.RIGHT)
                    val gas=Gdx.input.isKeyPressed(Input.Keys.W)||Gdx.input.isKeyPressed(Input.Keys.UP)
                    val brake=Gdx.input.isKeyPressed(Input.Keys.S)||Gdx.input.isKeyPressed(Input.Keys.DOWN)
                    inputs[0].set((if(right)1.0 else 0.0)-(if(left)1.0 else 0.0),if(gas)1.0 else 0.0,if(brake)1.0 else 0.0)
                }
                val start=System.nanoTime(); world.step(inputs); server.metrics.simMs.add((System.nanoTime()-start)/1e6,server.nowMs())
                accumulator-=Tuning.STEP_SECONDS; steps++
            }
            if(phase=="lobby" && world.finished==6)world.reset()
            if(phase=="race") {
                var humans=0; var complete=0
                for(c in world.cars)if(c.human) { humans++; if(c.finishSeconds>=0)complete++ }
                if((humans>0 && complete==humans) || world.finished==6 || world.seconds>=180) { phase="results"; server.phase=phase; stateTime=0.0; rebuildUi() }
            }
        }
        server.raceSeconds=world.seconds
        if(uiTime>=.1) {
            uiTime=0.0
            for(i in 0..1) { val c=world.cars[i]; val s=server.slots[i]; s.speed=c.speedMps; s.lap=min(c.lap.laps+1,3); s.position=c.position; s.impact=c.impact; s.x=c.x; s.y=c.y }
            rebuildUi()
        }
        view.apply(); ScreenUtils.clear(bg)
        drawWorld(elapsed)
        drawOverlay()
        // Flash is a display event, consumed once after all other drawing.
        if(server.flash.getAndSet(false)) { Gdx.gl.glClearColor(1f,1f,1f,1f); Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT); server.flashFrames++ }
        if(soak && phase=="results" && !resultCaptured) { capture("results.png"); resultCaptured=true; logger("six-car race reached results at ${world.seconds} seconds") }
        if(soak && (phase=="lobby" || phase=="results" && stateTime>2))startRace()
        if(keyboardCheck && smokeTime>4.7 && !captured) {
            check(world.cars[0].human && keyboard) { "Keyboard did not take car 1" }
            check(world.cars[0].speedMps>3) { "Keyboard throttle did not move the car" }
            capture("keyboard.png"); captured=true
            logger("keyboard W + D verified: car1 human=${world.cars[0].human}, speedMps=${world.cars[0].speedMps}, heading=${world.cars[0].heading}")
        }
        if(runSeconds>0 && smokeTime>runSeconds) { logger("timed desktop run complete; "+server.statsJson()); Gdx.app.exit() }
        if(smoke) {
            if(smokeTime>2 && !captured) { capture("lobby.png"); captured=true }
            if(smokeTime>3 && !smokeStarted) { startRace(); smokeStarted=true }
            if(smokeTime>9) { capture("race.png"); logger("desktop smoke complete; GL ${Gdx.gl.glGetString(GL20.GL_RENDERER)}; hash ${world.stateHash()}"); Gdx.app.exit() }
        }
    }
    private fun capture(name: String) { val p=Pixmap.createFromFrameBuffer(0,0,Gdx.graphics.width,Gdx.graphics.height); val writer=PixmapIO.PNG(); writer.setFlipY(true); writer.write(Gdx.files.local("../evidence/$name"),p); writer.dispose(); p.dispose() }
    private fun drawWorld(dt: Double) {
        val alpha=(accumulator/Tuning.STEP_SECONDS).coerceIn(0.0,1.0)
        val following=Presentation.FOLLOW_CAMERA && phase!="lobby" && phase!="results"
        if(following) {
            var count=0; var x=0.0; var y=0.0; var speed=0.0
            for(c in world.cars)if(c.human) { x+=c.x+c.vx*.7; y+=c.y+c.vy*.7; speed+=c.speedMps; count++ }
            if(count==0) { val c=world.cars[0]; x=c.x+c.vx*.7; y=c.y+c.vy*.7; speed=c.speedMps; count=1 }
            val ease=1-exp(-dt*6); focusX+=(x/count-focusX)*ease; focusY+=(y/count-focusY)*ease
            val targetZoom=if(count>1)1.05 else 1.72-speed/count*.012
            cameraZoom+=(targetZoom-cameraZoom)*ease
        } else { focusX=0.0; focusY=0.0; cameraZoom=1.0 }
        worldMatrix.set(view.camera.combined).translate(640f,350f,0f).scale((4.95*cameraZoom).toFloat(),(4.95*cameraZoom).toFloat(),1f).translate(-focusX.toFloat(),-focusY.toFloat(),0f)
        shape.projectionMatrix=worldMatrix
        shape.begin(ShapeRenderer.ShapeType.Filled)
        // Infield and track are original geometric placeholders, cached point arrays.
        shape.color=infield; shape.rect(-60f,-40f,120f,80f); shape.circle(-60f,0f,40f,64); shape.circle(60f,0f,40f,64)
        shape.color=road
        for(i in 0 until 240) {
            val a=i*4; val b=(i+1)*4
            shape.triangle(trackPoints[a],trackPoints[a+1],trackPoints[a+2],trackPoints[a+3],trackPoints[b],trackPoints[b+1])
            shape.triangle(trackPoints[b],trackPoints[b+1],trackPoints[a+2],trackPoints[a+3],trackPoints[b+2],trackPoints[b+3])
        }
        for(i in 0 until 240) {
            val a=i*4; val b=(i+1)*4
            shape.color=if(i%6<3)curb else bg
            shape.rectLine(trackPoints[a],trackPoints[a+1],trackPoints[b],trackPoints[b+1],.75f)
            shape.rectLine(trackPoints[a+2],trackPoints[a+3],trackPoints[b+2],trackPoints[b+3],.6f)
            if(i%6<2) { shape.setColor(.37f,.46f,.49f,.5f); shape.rectLine(center[i*2],center[i*2+1],center[(i+1)*2],center[(i+1)*2+1],.22f) }
        }
        for(i in 0 until 12) { shape.color=if(i%2==0)Color.WHITE else bg; shape.rect(-.8f,28f+i*2,.8f,2f); shape.color=if(i%2==1)Color.WHITE else bg; shape.rect(0f,28f+i*2,.8f,2f) }
        // Painted directional chevrons.
        shape.color=curb
        for(i in -2..2) { val x=i*18f; shape.triangle(x,47f,x-2,48.1f,x-2,45.9f); shape.triangle(-x,-47f,-x+2,-48.1f,-x+2,-45.9f) }
        for(c in world.cars) {
            val prev=world.previousSnapshot; val current=world.snapshot
            val x=(prev.x(c.id)+(current.x(c.id)-prev.x(c.id))*alpha).toFloat()
            val y=(prev.y(c.id)+(current.y(c.id)-prev.y(c.id))*alpha).toFloat()
            val heading=prev.heading(c.id)+wrapAngle(current.heading(c.id)-prev.heading(c.id))*alpha
            val deg=(heading*180/PI).toFloat()
            if(c.human) { shape.color=colors[c.id]; shape.circle(x,y,3.4f,18); shape.color=road; shape.circle(x,y,2.9f,18) }
            shape.setColor(.015f,.025f,.035f,1f); shape.rect(x-2.4f+.3f,y-1.2f-.3f,2.4f,1.2f,4.8f,2.4f,1f,1f,deg)
            shape.color=if(c.impact>3 && server.frameNumber%6<3)Color.WHITE else colors[c.id]
            shape.rect(x-2.25f,y-1.08f,2.25f,1.08f,4.5f,2.16f,1f,1f,deg)
            val noseX=x+cos(heading).toFloat()*1.05f; val noseY=y+sin(heading).toFloat()*1.05f
            shape.color=bg; shape.rect(noseX-.45f,noseY-.85f,.45f,.85f,.9f,1.7f,1f,1f,deg)
            shape.color=Color.WHITE; shape.circle(x-cos(heading).toFloat()*1.15f,y-sin(heading).toFloat()*1.15f,.27f,8)
        }
        shape.end()
    }
    private fun drawOverlay() {
        shape.projectionMatrix=view.camera.combined
        shape.begin(ShapeRenderer.ShapeType.Filled)
        shape.color=bg; shape.rect(0f,637f,1280f,83f); shape.rect(0f,0f,1280f,66f)
        shape.color=accent; shape.rect(40f,650f,4f,36f)
        if(phase=="lobby") {
            shape.color=bg; shape.rect(46f,89f,392f,530f)
            shape.setColor(.16f,.23f,.27f,1f); shape.rect(47f,90f,390f,2f)
            shape.color=accent; shape.rect(70f,116f,344f,44f)
        }
        if(phase=="results") { shape.color=bg; shape.rect(300f,113f,680f,482f); shape.color=accent; shape.rect(330f,136f,620f,42f) }
        if(phase=="countdown") { shape.color=bg; shape.circle(640f,352f,66f,40); shape.color=accent; shape.rect(595f,277f,(max(0.0,countdown)%1*90).toFloat(),4f) }
        for(i in 0..5) { shape.color=colors[i]; shape.rect(44f+i*203,24f,4f,22f) }
        if(Presentation.FOLLOW_CAMERA && phase=="race")drawMinimap()
        shape.end()
        batch.projectionMatrix=view.camera.combined; batch.begin()
        if(phase=="lobby" && qr!=null)batch.draw(qr,70f,239f,160f,160f)
        text.draw(batch); headline.draw(batch); detail.draw(batch)
        batch.end()
    }
    private fun drawMinimap() {
        shape.color=bg; shape.rect(1060f,467f,182f,130f)
        shape.color=curb
        for(i in 0 until 240)shape.rectLine(1150+center[i*2]*.72f,530+center[i*2+1]*.72f,1150+center[(i+1)*2]*.72f,530+center[(i+1)*2+1]*.72f,7f)
        for(c in world.cars) { shape.color=colors[c.id]; shape.circle(1150+c.x.toFloat()*.72f,530+c.y.toFloat()*.72f,3f,10) }
    }
    private fun rebuildUi() {
        if(!::text.isInitialized)return
        text.clear(); headline.clear(); detail.clear()
        text.setColor(Color.WHITE); headline.setColor(Color.WHITE); detail.setColor(muted)
        text.addText("DEATH RIDE",59f,685f)
        detail.addText(Presentation.CONCEPT+"  /  "+Presentation.TAGLINE,59f,661f)
        detail.addText("FEEL: "+server.feel.id+"   LEFT / RIGHT TO CHANGE",59f,630f)
        detail.addText("LOCAL CIRCUIT     /     6 CARS     /     3 LAPS",873f,682f)
        detail.addText(if(phase=="lobby")"A live race. A phone in your hand." else "BACK  Lobby       W A S D  Drive       ENTER  Race",873f,660f)
        for(c in world.cars) {
            detail.setColor(colors[c.id]); uiBuilder.clear(); uiBuilder.append(c.position).append("  ").append(if(c.human)"PLAYER " else "RIVAL ").append(c.id+1)
            detail.addText(uiBuilder,55f+c.id*203,46f)
            detail.setColor(muted); uiBuilder.clear(); uiBuilder.append("LAP ").append(min(3,c.lap.laps+1)).append(" / 3   ").append((c.speedMps*3.6).toInt()).append(" km/h")
            detail.addText(uiBuilder,55f+c.id*203,27f)
        }
        when(phase) {
            "lobby" -> {
                headline.addText(Presentation.CONCEPT,70f,586f)
                text.addText("One scan. You're on the grid.",70f,523f)
                detail.addText("1  Same Wi-Fi as this screen\n2  Scan with your phone's camera\n3  Hold GO. Find the first corner.",70f,488f)
                updateQr()
                text.setColor(accent); text.addText("PAIR + DRIVE",251f,384f); text.setColor(Color.WHITE)
                detail.addText("No app to install.\nTwo phone seats.\nYour car stays yours.",251f,350f)
                uiBuilder.clear(); uiBuilder.append("PIN  ").append(server.pin); text.addText(uiBuilder,251f,276f)
                detail.addText(addressLabel,70f,215f)
                uiBuilder.clear(); if(server.running)uiBuilder.append(server.slots.count{it.connected}).append(" / 2 PHONES CONNECTED") else uiBuilder.append(server.serverStatus); detail.addText(uiBuilder,70f,188f)
                text.setColor(bg); text.addText("SELECT  /  START RACE",109f,145f); text.setColor(Color.WHITE)
                detail.addText("UP  Reset pairing     BACK  Exit",70f,106f)
            }
            "countdown" -> { headline.setColor(accent); headline.addText(digits[ceil(countdown).toInt().coerceIn(1,3)],624f,378f); detail.addText("HOLD GO",606f,317f) }
            "race" -> {
                if(stateTime<1.2) { headline.setColor(accent); headline.addText("GO",597f,389f) }
                var warned=false
                for(s in server.slots)if(s.claimed && s.stale && !warned) { detail.setColor(warning); uiBuilder.clear(); uiBuilder.append("PLAYER ").append(s.id+1).append("  LINK QUIET - COASTING"); detail.addText(uiBuilder,465f,612f); warned=true }
                detail.setColor(muted); uiBuilder.clear(); uiBuilder.append((world.seconds).toInt()).append(" s   /   ").append(world.finished).append(" finished")
                detail.addText(uiBuilder,572f,97f)
            }
            "results" -> {
                headline.addText("THE FINISH",330f,558f)
                detail.addText("THREE LAPS. SIX CARS. ONE MORE?",332f,503f)
                for(c in world.cars)rankOrder[c.position-1]=c.id
                for(rank in 0..5) {
                    val c=world.cars[rankOrder[rank]]; text.setColor(colors[c.id]); uiBuilder.clear()
                    uiBuilder.append(rank+1).append("     ").append(if(c.human)"PLAYER " else "RIVAL ").append(c.id+1)
                    text.addText(uiBuilder,345f,461f-rank*42)
                    detail.setColor(Color.WHITE); uiBuilder.clear()
                    if(c.finishSeconds>=0)uiBuilder.append((c.finishSeconds*10).toInt()/10).append('.').append((c.finishSeconds*10).toInt()%10).append(" seconds") else uiBuilder.append("LAP ").append(min(3,c.lap.laps+1)).append(" / 3 - unfinished")
                    detail.addText(uiBuilder,731f,458f-rank*42)
                }
                text.setColor(bg); text.addText("SELECT  /  REMATCH",527f,164f)
            }
        }
    }
    private fun updateQr() {
        if(server.pin==qrPin && server.address==qrAddress)return
        qrPin=server.pin; qrAddress=server.address; val url=server.pairingUrl(); addressLabel="http://${server.address}:8765"
        qrUrl=url; qr?.dispose()
        val matrix=QRCodeWriter().encode(url,BarcodeFormat.QR_CODE,240,240,mapOf(EncodeHintType.MARGIN to 3))
        val pix=Pixmap(240,240,Pixmap.Format.RGBA8888)
        for(y in 0 until 240)for(x in 0 until 240)pix.drawPixel(x,y,if(matrix[x,y])0x0b141eff else 0xffffffff.toInt())
        qr=Texture(pix); pix.dispose()
    }
    override fun dispose() { server.stop(); qr?.dispose(); shape.dispose(); batch.dispose(); font.dispose(); large.dispose(); small.dispose() }
}
