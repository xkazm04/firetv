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

class RaceGame(val assets: (String)->String, val logger: (String)->Unit, val smoke: Boolean=false, val runSeconds: Double=0.0, val soak: Boolean=false, val keyboardCheck: Boolean=false, val fontFactory: ((Int)->BitmapFont)?=null) : ApplicationAdapter() {
    private lateinit var shape: ShapeRenderer
    private lateinit var batch: SpriteBatch
    private lateinit var font: BitmapFont
    private lateinit var large: BitmapFont
    private lateinit var small: BitmapFont
    private lateinit var text: GlyphLayer
    private lateinit var headline: GlyphLayer
    private lateinit var detail: GlyphLayer
    private lateinit var server: RaceServer
    private var world=World(track=Track(course=Courses.all[0]),combatEnabled=true)
    private lateinit var scene: TrackScene
    private val effects=MotionEffects()
    private val painter=CarPainter()
    private val combatPainter=CombatPainter()
    private var selectedTrack=0
    private val selectedCars=IntArray(6){it%CarCatalog.all.size}
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
    private lateinit var profileStore: ProfileStore
    private val profiles=Array(2){Profile("couch-$it")}
    private val saveStatus=Array(2){"New profile"}
    private val shopMessage=Array(2){"Parts stay with this car"}
    private val persistence=BooleanArray(2){true}
    private val raceTickets=LongArray(2)
    private val raceProfiles=Array(2){""}
    private var selectedPart=0

    private fun loadProfile(i: Int) {
        val loaded=runCatching{profileStore.load(server.slots[i].profileId)}
        persistence[i]=loaded.isSuccess
        profiles[i]=loaded.getOrNull()?.profile?:Profile(server.slots[i].profileId)
        saveStatus[i]=loaded.getOrNull()?.status?:"Save damaged - persistence disabled"
        selectedCars[i]=profiles[i].selectedCar;Garage.apply(profiles[i],world.cars[i]);publishGarage(i)
    }
    private fun editProfile(i: Int,edit: (Profile)->Unit): Boolean {
        if(!persistence[i]) { shopMessage[i]="Save unavailable - changes disabled";publishGarage(i);return false }
        val updated=profiles[i].copy()
        if(runCatching{edit(updated)}.isFailure) { shopMessage[i]="Profile change unavailable";publishGarage(i);return false }
        if(runCatching{profileStore.save(updated)}.isFailure) { saveStatus[i]="Save failed - change cancelled";publishGarage(i);return false }
        profiles[i]=updated;saveStatus[i]="Saved";publishGarage(i);return true
    }
    private fun publishGarage(i: Int) {
        server.slots[i].carJson=CarCatalog.all[profiles[i].selectedCar].json(profiles[i].bonuses())
        server.slots[i].garageJson=Garage.json(profiles[i],shopMessage[i],saveStatus[i])
    }
    private fun buyPart(i: Int,part: Int,tier: Int,car: Int) {
        if(phase!="garage")return
        val offer=Garage.offer(profiles[i],part)
        val rejection=when { car!=profiles[i].selectedCar->"Car changed - check the selected car";tier!=offer.tier->"Offer changed - check the installed tier";!offer.available->offer.reason;else->"" }
        if(rejection.isNotEmpty()) { shopMessage[i]=rejection;publishGarage(i);return }
        var message=""
        if(editProfile(i){message=Garage.buy(it,part,tier,expectedCar=car)}) {
            shopMessage[i]=message;Garage.apply(profiles[i],world.cars[i]);world.reset();publishGarage(i)
        }
    }
    private fun openGarage() { if(phase=="lobby" || phase=="results") { phase="garage";server.phase=phase;accumulator=0.0;rebuildUi() } }
    private fun finishRace() {
        for(i in profiles.indices)if(raceTickets[i]>0 && raceProfiles[i]==profiles[i].id) {
            val c=world.cars[i]
            if(editProfile(i){Economy.settle(it,raceTickets[i],c.position,world.combat.kills[i],world.combat.health(i))})shopMessage[i]="Pit service complete - ready to race"
            raceTickets[i]=0;publishGarage(i)
        }
        phase="results";server.phase=phase;stateTime=0.0;rebuildUi()
    }

    override fun create() {
        shape=ShapeRenderer(10000); batch=SpriteBatch()
        font=fontFactory?.invoke(20)?:BitmapFont()
        large=fontFactory?.invoke(44)?:BitmapFont()
        small=fontFactory?.invoke(16)?:BitmapFont()
        text=GlyphLayer(font); headline=GlyphLayer(large); detail=GlyphLayer(small)
        server=RaceServer(assets,logger); for(i in world.cars.indices)CarCatalog.apply(world.cars[i],selectedCars[i]);world.reset(); server.start()
        profileStore=ProfileStore(Gdx.files.local("profiles").file());for(i in profiles.indices)loadProfile(i);world.reset()
        scene=TrackScene(Courses.all[selectedTrack]);effects.clear()
        Gdx.input.setCatchKey(Input.Keys.BACK,true)
        Gdx.input.inputProcessor=object: InputAdapter() {
            override fun keyDown(keycode: Int): Boolean {
                when(keycode) {
                    Input.Keys.ENTER,Input.Keys.SPACE,Input.Keys.DPAD_CENTER,Input.Keys.BUTTON_A -> { if(phase=="garage")buyPart(0,selectedPart,profiles[0].tier(selectedCars[0],selectedPart),selectedCars[0]) else if(phase=="lobby" || phase=="results")startRace(); return true }
                    Input.Keys.BACK,Input.Keys.ESCAPE,Input.Keys.BUTTON_B -> { if(phase!="lobby")lobby() else Gdx.app.exit(); return true }
                    Input.Keys.LEFT -> { if(phase=="garage")server.slots[0].carRequest.set((selectedCars[0]-1).mod(CarCatalog.all.size)) else selectFeel(-1); return true }
                    Input.Keys.RIGHT -> { if(phase=="garage")server.slots[0].carRequest.set((selectedCars[0]+1)%CarCatalog.all.size) else selectFeel(1); return true }
                    Input.Keys.MEDIA_PLAY_PAUSE -> { openGarage();return true }
                    Input.Keys.MENU -> { if(phase=="lobby" || phase=="results")server.trackRequest.set((selectedTrack+1)%Courses.all.size); return true }
                    Input.Keys.DOWN -> if(phase=="garage") { selectedPart=(selectedPart+1)%Parts.all.size;return true } else if(phase=="lobby" || phase=="results") { server.slots[0].carRequest.set((selectedCars[0]+1)%CarCatalog.all.size); return true }
                    Input.Keys.UP -> if(phase=="garage") { selectedPart=(selectedPart-1).mod(Parts.all.size);return true } else if(phase=="lobby") { server.resetPairing(); keyboard=false; return true }
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
    private fun startRace() {
        raceTickets.fill(0)
        for(i in profiles.indices)if(server.slots[i].claimed || i==0 && keyboard) {
            var ticket=0L;if(editProfile(i){ticket=Economy.start(it)}) { raceTickets[i]=ticket;raceProfiles[i]=profiles[i].id }
        }
        world.reset(); effects.clear();phase="countdown"; countdown=3.0; accumulator=0.0; stateTime=0.0; server.phase=phase; logger("race countdown"); rebuildUi()
    }
    private fun lobby() { raceTickets.fill(0);phase="lobby"; world.reset();effects.clear(); stateTime=0.0; server.phase=phase; rebuildUi() }
    override fun resize(width: Int,height: Int) { view.update(width,height,true) }
    override fun pause() { server.paused=true; server.suspendLink(); accumulator=0.0 }
    override fun resume() { if(::server.isInitialized) { server.paused=false; server.start() }; previousNanos=System.nanoTime(); accumulator=0.0 }
    override fun render() {
        val nanos=System.nanoTime(); val actual=(nanos-previousNanos)/1e9; previousNanos=nanos
        val now=server.nowMs(); server.metrics.frameMs.add(actual*1000,now); server.frameNumber++
        val elapsed=actual.coerceIn(0.0,.1); stateTime+=elapsed; uiTime+=elapsed; smokeTime+=actual
        for(i in server.slots.indices) {
            if(server.slots[i].profileId!=profiles[i].id && phase!="race" && phase!="countdown")loadProfile(i)
            val choice=server.slots[i].carRequest.getAndSet(-1)
            if(choice>=0 && choice!=selectedCars[i] && (phase=="lobby" || phase=="results" || phase=="garage")) {
                if(editProfile(i){it.selectedCar=choice}) { selectedCars[i]=choice;Garage.apply(profiles[i],world.cars[i]);world.reset();effects.clear() }
            }
            val purchase=server.slots[i].shopRequest.getAndSet(null)
            if(purchase!=null && purchase.profileId==profiles[i].id)buyPart(i,purchase.part,purchase.tier,purchase.car)
        }
        val courseIndex=server.trackRequest.getAndSet(-1)
        if(courseIndex>=0 && (phase=="lobby" || phase=="results")) {
            selectedTrack=courseIndex;world=World(track=Track(course=Courses.all[courseIndex]),combatEnabled=true);for(i in world.cars.indices)CarCatalog.apply(world.cars[i],selectedCars[i]);world.reset()
            for(i in profiles.indices)Garage.apply(profiles[i],world.cars[i]);world.reset()
            scene.dispose();scene=TrackScene(Courses.all[courseIndex]);effects.clear();server.trackJson=Courses.all[courseIndex].json;rebuildUi()
        }
        val surfaceIndex=server.surfaceRequest.getAndSet(-1)
        if(surfaceIndex>=0) { server.surface=Surfaces.practice[surfaceIndex]; world.track.surface=server.surface; world.track.surfaceOverride=true; logger("surface ${server.surface.json}") }
        val feelIndex=server.feelRequest.getAndSet(-1)
        if(feelIndex>=0) { server.feel=FeelProfiles.all[feelIndex]; logger("feel ${server.feel.json}") }
        for(c in world.cars)c.feel=if(c.human)server.feel else FeelProfiles.spike
        when(server.command.getAndSet(0)) { 1 -> if(phase=="lobby" || phase=="results")startRace(); 2 -> lobby();3 -> openGarage() }
        // Keep release/stale state current in menus without mislabelling it as simulation-age evidence.
        if(phase=="countdown" || phase=="results" || phase=="garage")for(i in server.slots.indices)server.consume(i,server.nowMs(),inputs[i],false)
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
                    inputs[0].fire=if(Gdx.input.isKeyPressed(Input.Keys.F))1.0 else 0.0
                    inputs[0].mine=if(Gdx.input.isKeyPressed(Input.Keys.G))1.0 else 0.0
                    inputs[0].weapon=if(Gdx.input.isKeyPressed(Input.Keys.E))1 else 0
                    inputs[0].handbrake=if(Gdx.input.isKeyPressed(Input.Keys.SHIFT_LEFT))1.0 else 0.0
                    inputs[0].set((if(right)1.0 else 0.0)-(if(left)1.0 else 0.0),if(gas)1.0 else 0.0,if(brake)1.0 else 0.0)
                }
                val start=System.nanoTime(); world.step(inputs); server.metrics.simMs.add((System.nanoTime()-start)/1e6,server.nowMs())
                accumulator-=Tuning.STEP_SECONDS; steps++
            }
            if(phase=="lobby" && world.resolved==6)world.reset()
            if(phase=="race") {
                var humans=0; var complete=0
                for(c in world.cars)if(c.human) { humans++; if(c.finishSeconds>=0 || world.combat.wrecked(c.id))complete++ }
                if((humans>0 && complete==humans) || world.resolved==6 || world.seconds>=TrackRules["maxRaceSeconds"])finishRace()
            }
        }
        server.raceSeconds=world.seconds
        if(uiTime>=.1) {
            uiTime=0.0
            val combat=world.combat
            server.combatSummaryJson="{\"living\":${world.cars.size-combat.wreckCount},\"finished\":${world.finished},\"shots\":${combat.shots.sum()},\"projectiles\":${combat.projectiles.count{it.active}},\"mines\":${combat.mines.count{it.active}},\"blasts\":${combat.blasts.count{it.remainingSeconds>0}},\"poolExhaustions\":${combat.poolExhaustions}}"
            for(i in 0..1) { val c=world.cars[i]; val s=server.slots[i]; s.speed=c.speedMps; s.lap=min(c.lap.laps+1,3); s.position=c.position; s.impact=c.impact; s.drifting=c.drifting; s.loadTransfer=c.loadTransfer; s.surfaceId=c.surface.id; s.x=c.x; s.y=c.y; s.combatJson=combatJson(i) }
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
        val course=Courses.all[selectedTrack]
        val alpha=(accumulator/Tuning.STEP_SECONDS).coerceIn(0.0,1.0)
        val following=phase=="race" || phase=="countdown"
        var pixelsPerM=min(1180.0/(course.maxX-course.minX),490.0/(course.maxY-course.minY))
        if(following) {
            var count=0;var x=0.0;var y=0.0;var speed=0.0;var minX=Double.POSITIVE_INFINITY;var maxX=Double.NEGATIVE_INFINITY;var minY=Double.POSITIVE_INFINITY;var maxY=Double.NEGATIVE_INFINITY
            for(c in world.cars)if(c.human) { x+=c.x+c.vx*VisualTuning["lookAheadSeconds"];y+=c.y+c.vy*VisualTuning["lookAheadSeconds"];speed+=c.speedMps;count++;minX=min(minX,c.x);maxX=max(maxX,c.x);minY=min(minY,c.y);maxY=max(maxY,c.y) }
            if(count==0) { val c=world.cars[0];x=c.x+c.vx*VisualTuning["lookAheadSeconds"];y=c.y+c.vy*VisualTuning["lookAheadSeconds"];speed=c.speedMps;count=1 }
            val ease=1-exp(-dt*VisualTuning["cameraResponsePerSecond"])
            focusX+=(x/count-focusX)*ease;focusY+=(y/count-focusY)*ease
            var target=(VisualTuning["soloPixelsPerM"]-speed/count*VisualTuning["speedZoomPerMps"]).coerceAtLeast(VisualTuning["minPixelsPerM"])
            if(count>1)target=min(target,min(1100/(maxX-minX+VisualTuning["sharedPaddingM"]),480/(maxY-minY+VisualTuning["sharedPaddingM"])))
            cameraZoom+=(target-cameraZoom)*ease;pixelsPerM=cameraZoom
        } else { focusX=(course.minX+course.maxX)*.5;focusY=(course.minY+course.maxY)*.5;cameraZoom=VisualTuning["soloPixelsPerM"] }
        worldMatrix.set(view.camera.combined).translate(640f,350f,0f).scale(pixelsPerM.toFloat(),pixelsPerM.toFloat(),1f).translate(-focusX.toFloat(),-focusY.toFloat(),0f)
        batch.projectionMatrix=worldMatrix;batch.begin();scene.draw(batch);batch.end()
        Gdx.gl.glEnable(GL20.GL_BLEND);Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)
        shape.projectionMatrix=worldMatrix;shape.begin(ShapeRenderer.ShapeType.Filled)
        combatPainter.ground(shape,world)
        effects.draw(shape,world,dt)
        for(c in world.cars) {
            val prev=world.previousSnapshot;val current=world.snapshot
            val x=(prev.x(c.id)+(current.x(c.id)-prev.x(c.id))*alpha).toFloat();val y=(prev.y(c.id)+(current.y(c.id)-prev.y(c.id))*alpha).toFloat()
            val heading=prev.heading(c.id)+wrapAngle(current.heading(c.id)-prev.heading(c.id))*alpha
            painter.draw(shape,c,x,y,heading,colors[c.id],world.combat.damageFlashSeconds[c.id]>0 || c.impact>3 && server.frameNumber%6<3,healthFraction=(world.combat.health(c.id)/CombatRules["maxHp"]).toFloat(),wrecked=world.combat.wrecked(c.id))
            if(c.human) { val marker=(c.spec.circleRadiusM+c.spec.circleOffsetM+1).toFloat();shape.color=colors[c.id];shape.triangle(x-0.7f,y+marker+1,x+0.7f,y+marker+1,x,y+marker) }
        }
        combatPainter.air(shape,world)
        shape.end()
    }
    private fun drawOverlay() {
        shape.projectionMatrix=view.camera.combined
        shape.begin(ShapeRenderer.ShapeType.Filled)
        shape.color=bg; shape.rect(0f,637f,1280f,83f); shape.rect(0f,0f,1280f,66f)
        shape.color=accent; shape.rect(40f,650f,4f,36f)
        if(phase=="race") {
            val c=world.cars.firstOrNull { it.human }?:world.cars[0]
            val hp=(world.combat.health(c.id)/CombatRules["maxHp"]).toFloat()
            shape.color=road;shape.rect(590f,683f,130f,10f)
            shape.setColor(1-hp,hp*.7f+.2f,.22f,1f);shape.rect(590f,683f,130f*hp,10f)
        }
        if(phase=="lobby") {
            shape.color=bg; shape.rect(675f,305f,555f,290f); shape.rect(46f,89f,392f,530f)
            shape.setColor(.16f,.23f,.27f,1f); shape.rect(47f,90f,390f,2f)
            shape.color=accent; shape.rect(70f,116f,344f,44f)
            val selected=CarCatalog.all[selectedCars[0]]
            for(i in CarCatalog.statNames.indices) {
                val value=selected.stat(CarCatalog.statNames[i],profiles[0].bonuses())
                for(bar in 0 until CarCatalog.statMax) {
                    shape.color=if(bar<value)accent else road
                    shape.rect(860f+bar*10,530f-i*25,7f,11f)
                }
            }
            painter.draw(shape,world.cars[0],1100f,445f,PI*.5,colors[0],false,20f)
        }
        if(phase=="results") { shape.color=bg; shape.rect(300f,113f,680f,482f); shape.color=accent; shape.rect(330f,136f,620f,42f) }
        if(phase=="garage") {
            shape.color=bg;shape.rect(45f,90f,1190f,520f)
            shape.color=road;shape.rect(65f,456f-selectedPart*52,470f,48f)
            painter.draw(shape,world.cars[0],1090f,375f,PI*.5,colors[0],false,22f)
            val offer=Garage.offer(profiles[0],selectedPart)
            for(i in CarCatalog.statNames.indices)for(bar in 0 until CarCatalog.statMax) {
                shape.color=if(bar<offer.before[i])accent else if(bar<offer.after[i])Color.valueOf("82D5A2") else road
                if(offer.after[i]<offer.before[i] && bar>=offer.after[i] && bar<offer.before[i])shape.color=warning
                shape.rect(810f+bar*12,477f-i*24,9f,10f)
            }
        }
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
        val c=Courses.all[selectedTrack];val scale=min(166/(c.maxX-c.minX),112/(c.maxY-c.minY)).toFloat()
        val ox=1150f-((c.minX+c.maxX)*.5).toFloat()*scale;val oy=530f-((c.minY+c.maxY)*.5).toFloat()*scale
        shape.setColor(.035f,.055f,.065f,.9f);shape.rect(1055f,462f,190f,136f)
        shape.setColor(.37f,.43f,.43f,1f)
        for(i in 0 until scene.samples)shape.rectLine(ox+scene.center[i*2]*scale,oy+scene.center[i*2+1]*scale,ox+scene.center[(i+1)*2]*scale,oy+scene.center[(i+1)*2+1]*scale,3f)
        for(car in world.cars) { shape.color=colors[car.id];shape.circle(ox+car.x.toFloat()*scale,oy+car.y.toFloat()*scale,if(car.human)4f else 2.5f,10) }
    }
    private fun rebuildUi() {
        if(!::text.isInitialized)return
        text.clear(); headline.clear(); detail.clear()
        text.setColor(Color.WHITE); headline.setColor(Color.WHITE); detail.setColor(muted)
        if(phase!="race")text.addText("DEATH RIDE",59f,685f)
        else { val c=world.cars.firstOrNull{it.human}?:world.cars[0];headline.setColor(colors[c.id]);uiBuilder.clear();uiBuilder.append(c.position).append(" / 6");headline.addText(uiBuilder,59f,691f);text.addText("LAP "+min(3,c.lap.laps+1)+" / 3",260f,686f);text.addText((c.speedMps*3.6).toInt().toString()+" km/h",400f,686f) }
        if(phase=="lobby") {
            val car=CarCatalog.all[selectedCars[0]]
            text.addText(car.id+" / "+car.role,690f,575f)
            for(i in CarCatalog.statNames.indices) {
                val stat=CarCatalog.statNames[i]; val value=car.stat(stat,profiles[0].bonuses())
                uiBuilder.clear(); uiBuilder.append(stat).append("  ").append(value)
                detail.addText(uiBuilder,695f,538f-i*25)
            }
            detail.addText("DOWN: car   MENU: circuit   PLAY: garage",695f,320f)
            detail.addText(Courses.all[selectedTrack].lesson,460f,100f)
        }
        if(phase!="race")detail.addText(Presentation.CONCEPT+"  /  "+Presentation.TAGLINE,59f,655f)
        if(phase!="race")detail.addText(if(phase=="garage")"PARTS / PER CAR    -    GREEN: GAIN    AMBER: TRADE-OFF" else Courses.all[selectedTrack].name+"   /   MENU: course    /    FEEL: "+server.feel.id+"  LEFT / RIGHT",59f,630f)
        detail.addText("6 CARS    /    3 LAPS    /    "+Courses.all[selectedTrack].name.uppercase(),873f,682f)
        detail.addText(if(phase=="lobby")"A live race. A phone in your hand." else "BACK: Lobby    /    "+server.feel.id,873f,653f)
        for(c in world.cars) {
            detail.setColor(colors[c.id]); uiBuilder.clear(); uiBuilder.append(c.position).append("  ").append(if(c.human)"PLAYER " else "RIVAL ").append(c.id+1)
            detail.addText(uiBuilder,55f+c.id*203,46f)
            detail.setColor(muted); uiBuilder.clear(); if(world.combat.wrecked(c.id))uiBuilder.append("WRECKED") else uiBuilder.append("HP ").append(world.combat.health(c.id).toInt()).append("   LAP ").append(min(3,c.lap.laps+1)).append(" / 3")
            detail.addText(uiBuilder,55f+c.id*203,27f)
        }
        when(phase) {
            "garage" -> {
                val p=profiles[0];val offer=Garage.offer(p,selectedPart);val part=Parts.all[selectedPart]
                headline.addText("THE GARAGE",70f,575f);text.setColor(accent);text.addText("${p.credits} CR",440f,566f)
                text.setColor(Color.WHITE);text.addText(CarCatalog.all[p.selectedCar].id+"  /  PLAYER 1",665f,563f)
                detail.addText("LEFT / RIGHT: car",665f,536f)
                for(i in Parts.all.indices) {
                    val item=Garage.offer(p,i);text.setColor(if(i==selectedPart)accent else Color.WHITE)
                    text.addText(Parts.all[i].name+"  "+item.tier+" / "+Parts.all[i].maxTier,80f,488f-i*52)
                    detail.addText(if(item.tier==Parts.all[i].maxTier)"MAX" else "${item.price} CR",425f,487f-i*52)
                }
                for(i in CarCatalog.statNames.indices)detail.addText(CarCatalog.statNames[i]+"  ${offer.before[i]} > ${offer.after[i]}",650f,487f-i*24)
                detail.addText(part.description,650f,270f);text.setColor(if(offer.available)accent else warning)
                text.addText(if(offer.available)"SELECT: INSTALL TIER ${offer.nextTier} / ${offer.price} CR" else offer.reason,650f,225f)
                detail.addText(shopMessage[0]+" / "+saveStatus[0],650f,186f)
                detail.addText("UP / DOWN: part    BACK: lobby    Phone garage belongs to its driver",75f,123f)
            }
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
                val driver=world.cars.firstOrNull { it.human }?:world.cars[0];val combat=world.combat;val weapon=combat.selectedWeapon[driver.id]
                detail.setColor(if(combat.wrecked(driver.id))warning else muted)
                detail.addText(if(combat.wrecked(driver.id))"WRECKED - SPECTATING" else "HULL "+combat.health(driver.id).toInt()+" / "+CombatRules["maxHp"].toInt(),590f,677f)
                detail.addText(if(combat.armingSeconds>0)"ARMING "+ceil(combat.armingSeconds).toInt() else Weapons.all[weapon].id.uppercase()+"  "+combat.ammo(driver.id,weapon),743f,697f)
                detail.addText("MINES  "+combat.ammo(driver.id,Weapons.MINE),743f,674f)
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
                    if(world.combat.wrecked(c.id))uiBuilder.append("WRECKED / ").append(world.combat.kills[c.id]).append(" kills") else if(c.finishKind==FinishKind.ELIMINATION)uiBuilder.append("LAST SURVIVOR") else if(c.finishSeconds>=0)uiBuilder.append((c.finishSeconds*10).toInt()/10).append('.').append((c.finishSeconds*10).toInt()%10).append(" seconds") else uiBuilder.append("LAP ").append(min(3,c.lap.laps+1)).append(" / 3 - unfinished")
                    detail.addText(uiBuilder,731f,458f-rank*42)
                }
                text.setColor(bg); text.addText("SELECT  /  REMATCH",527f,164f)
                val receipt=profiles[0].lastReceipt
                if(receipt!=null)detail.addText("PRIZE ${receipt.gross} - PIT ${receipt.repair} = +${receipt.banked} CR   /   BANK ${profiles[0].credits}   /   PLAY: GARAGE",305f,99f)
            }
        }
    }
    private fun combatJson(id: Int): String {
        val c=world.combat;val weapon=c.selectedWeapon[id]
        return "{\"armingSeconds\":${c.armingSeconds},\"hp\":${c.health(id)},\"maxHp\":${CombatRules["maxHp"]},\"wrecked\":${c.wrecked(id)},\"weapon\":$weapon,\"weaponName\":\"${Weapons.all[weapon].id}\",\"ammo\":${c.ammo(id,weapon)},\"mines\":${c.ammo(id,Weapons.MINE)},\"heavyAmmo\":${c.ammo(id,Weapons.HAMMER)},\"cooldownSeconds\":${c.cooldown(id,weapon)},\"mineCooldownSeconds\":${c.cooldown(id,Weapons.MINE)},\"damageEvents\":${c.damageEvents[id]},\"kills\":${c.kills[id]}}"
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
    override fun dispose() { server.stop(); scene.dispose();qr?.dispose(); shape.dispose(); batch.dispose(); font.dispose(); large.dispose(); small.dispose() }
}
