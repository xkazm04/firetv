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
import dev.deathride.game.audio.*
import kotlin.math.*

class RaceGame(val assets: (String)->String, val logger: (String)->Unit, val smoke: Boolean=false, val runSeconds: Double=0.0, val soak: Boolean=false, val keyboardCheck: Boolean=false, val fontFactory: ((Int)->BitmapFont)?=null, val proceduralOnly: Boolean=false, val serverPort: Int=8765, profilePlatform: ProfilePlatform?=null, private val cacheRoadMarks: Boolean=true, private val trackPreview: TrackPreview?=null, private val regionOverride: RegionDefinition?=null, private val regionPresentation: Boolean=true, private val regionCandidates: Boolean=true) : ApplicationAdapter() {
    private val courseCatalog=if(trackPreview==null)Courses.all else Courses.all+trackPreview.course
    private val profiler=profilePlatform?.let{FrameProfiler(it)}
    private var profileGl: ProfileGl?=null
    private lateinit var shape: ShapeRenderer
    private lateinit var batch: SpriteBatch
    private lateinit var font: BitmapFont
    private lateinit var large: BitmapFont
    private lateinit var small: BitmapFont
    private var fontTextureBytes=0L
    private lateinit var text: GlyphLayer
    private lateinit var headline: GlyphLayer
    private lateinit var detail: GlyphLayer
    private lateinit var server: RaceServer
    private lateinit var audio: CueService
    private lateinit var raceAudio: RaceAudioDirector
    private lateinit var campaignAudio: CampaignAudioDirector
    private lateinit var captions: GlyphLayer
    private var drawnCaption=""
    private val script=ScriptDirector()
    private lateinit var scriptLayer: GlyphLayer
    private var drawnScript=-1
    private var world=World(track=Track(course=trackPreview?.course?:courseCatalog[Courses.playableIndices.first()]),combatEnabled=true)
    private lateinit var sceneryCanvas: SceneryCanvas
    private lateinit var scene: TrackScene
    private lateinit var art: AtlasArt
    private lateinit var storyArt: StoryArt
    private var storyPanel: String?=null
    private var storySelection=emptySet<String>()
    private lateinit var atlasEffects: AtlasEffects
    private val effects=MotionEffects()
    private val atmosphere=RegionAtmosphere()
    private var activeRegion=regionOverride?:courseCatalog[selectedTrackIndex()].region
    private val regionLooks=Regions.all.associate{it.id to RegionLook(it)}
    private fun selectedTrackIndex()=if(trackPreview==null)Courses.playableIndices.first() else courseCatalog.lastIndex
    private fun makeScene()=TrackScene(courseCatalog[selectedTrack],sceneryCanvas,art,small,activeRegion,regionPresentation,regionCandidates)
    private val painter=CarPainter()
    private val wheels=WheelRig(32)
    private val combatPainter=CombatPainter()
    private val obstaclePainter=ObstaclePainter()
    private val abilityPainter=AbilityPainter()
    private var selectedTrack=if(trackPreview==null)Courses.playableIndices.first() else courseCatalog.lastIndex
    private val selectedCars=IntArray(6){it%CarCatalog.all.size}
    private val inputs=Array(6){InputFrame()}
    private val view=FitViewport(1280f,720f)
    private val worldMatrix=Matrix4()
    private val accent=HudTheme.ochre
    private val colors=arrayOf(Color(Presentation.ACCENT),Color.valueOf("6ECFFF"),Color.valueOf("EC916E"),Color.valueOf("B0A0E8"),Color.valueOf("F0D583"),Color.valueOf("A1B4C3"))
    private val road=HudTheme.earth
    private val infield=Color.valueOf("101F29")
    private val curb=Color.valueOf("60757B")
    private val bg=HudTheme.soot
    private val trackPoints=FloatArray(241*4)
    private val center=FloatArray(241*2)
    private var qr: Texture?=null
    private var qrUrl=""
    private var qrPin=""
    private var qrAddress=""
    private var addressLabel=""
    private val muted=HudTheme.muted
    private val warning=Color.valueOf("F0D583")
    private val digits=Array(10){it.toString()}
    private val weakStats=BooleanArray(CarCatalog.statNames.size)
    private var accumulator=0.0
    private var previousNanos=0L
    private var phase="lobby"
        set(value) { if(field!=value){field=value;if(::raceAudio.isInitialized)raceAudio.sceneChanged(value)} }
    private var countdown=3.0
    private var stateTime=0.0
    private var uiTime=0.0
    private var keyboard=false
    /** Race camera sits 50% farther away than the authored zoom (owner, 2026-10-06). */
    private val RACE_ZOOM_OUT=1.5
    private var focusX=0.0
    private var focusY=0.0
    private var cameraZoom=1.0
    private var lobbyCamera=false
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
    private var selectedReward=0
    private var campaignRace=false
    private var raceRound=0
    private var raceDifficulty=0
    private val careerMessage=Array(2){"Player 1 hosts. Player 2 is a guest."}
    private val rivalPreviews=Array(Tuning.CAR_COUNT-1){i->Car(i,Track()).also{CarCatalog.apply(it,Career.rivals[i].carIndex)}}

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
        server.slots[i].carJson=DeathDuel.carJson(profiles[i])
        server.slots[i].garageJson=Garage.json(profiles[i],shopMessage[i],saveStatus[i])
        server.slots[i].careerJson=Career.json(profiles[i],careerMessage[i]);if(i==0)server.hostCareerJson=server.slots[i].careerJson
    }
    private fun buyPart(i: Int,part: Int,tier: Int,car: Int) {
        if(phase!="garage")return
        val offer=Garage.offer(profiles[i],part)
        val rejection=when { car!=profiles[i].selectedCar->"Car changed - check the selected car";tier!=offer.tier->"Offer changed - check the installed tier";!offer.available->offer.reason;else->"" }
        if(rejection.isNotEmpty()) { shopMessage[i]=rejection;publishGarage(i);if(::audio.isInitialized)audio.play("ui.denied");return }
        var message=""
        if(editProfile(i){message=Garage.buy(it,part,tier,expectedCar=car)}) {
            shopMessage[i]=message;Garage.apply(profiles[i],world.cars[i]);world.reset();publishGarage(i)
            if(::audio.isInitialized)audio.play(if(message.startsWith("Installed"))"ui.purchase" else "ui.denied")
        }
    }
    private fun openGarage() { if(phase=="lobby" || phase=="results" || phase=="career") { phase="garage";server.phase=phase;accumulator=0.0;audio.narrate("voice.mechanic.welcome");rebuildUi() } }
    private fun buyMarket(i: Int,request: dev.deathride.link.MarketRequest) {
        if((phase!="garage" && !(phase=="career" && request.action=="ally" && i==0)) || request.car!=profiles[i].selectedCar)return
        val revision=profiles[i].marketRevision
        var message=""
        if(editProfile(i){message=Market.transact(it,request.action,request.id,request.revision)}) {
            selectedCars[i]=profiles[i].selectedCar;shopMessage[i]=message;careerMessage[i]=message;Garage.apply(profiles[i],world.cars[i]);world.reset();publishGarage(i)
            val purchased=profiles[i].marketRevision!=revision
            audio.play(if(purchased)"ui.purchase" else "ui.denied")
            if(purchased && request.action=="repair")audio.narrate("voice.mechanic.repair")
            if(purchased && request.action=="ally")audio.narrateSequence("voice.mechanic.ally")
        }
    }
    private fun careerSelect() {
        val p=profiles[0];val index=Campaign.pending(p)
        if(index<0){startRace(true);return}
        script.payoutChosen(p,index,Campaign.choices[selectedReward])
        buyMarket(0,dev.deathride.link.MarketRequest(p.id,p.selectedCar,"ally","${Campaign.allies[index].id}:${Campaign.choices[selectedReward]}",p.marketRevision))
    }
    private fun openCareer() {
        if(phase!="lobby" && phase!="results")return
        if(!editProfile(0){RivalEconomy.prepare(it);DeathDuel.seize(it)})return
        phase="career";server.phase=phase;accumulator=0.0
        for((slot,index) in RivalEconomy.cast(profiles[0].careerRound).withIndex())Garage.apply(profiles[0].rivalProfiles[index],rivalPreviews[slot])
        campaignAudio.careerOpened(profiles[0]);script.careerOpened(profiles[0]);rebuildUi()
    }
    private fun selectDifficulty(direction: Int) { if(Campaign.pending(profiles[0])>=0)selectedReward=(selectedReward+direction).mod(Campaign.choices.size) else server.difficultyRequest.set((profiles[0].careerDifficulty+direction).mod(Career.difficulties.size)) }
    private fun configureWorld(courseIndex: Int,career: Boolean,seed: Int=17) {
        val nextRegion=regionOverride?:if(career)Career.events[raceRound].region else courseCatalog[courseIndex].region
        val changed=selectedTrack!=courseIndex || activeRegion!=nextRegion;selectedTrack=courseIndex;activeRegion=nextRegion
        atmosphere.select(if(regionPresentation)activeRegion else null)
        // Publish invalidation before the new track ID; an HTTP reader must not see new-track/old-ready.
        if(changed)server.sceneryReady=false
        if(!career && trackPreview!=null && courseIndex==courseCatalog.lastIndex) {
            world=trackPreview.world(seed);server.raceMode="track-preview"
        } else {
            world=World(seed,track=Track(course=courseCatalog[courseIndex]),combatEnabled=true)
            for(i in world.cars.indices)CarCatalog.apply(world.cars[i],selectedCars[i])
            if(career)Career.prepareRivals(world,raceDifficulty,profiles[0],server.slots[1].claimed)
            if(career)Encounters.apply(world,if(Career.events[raceRound].elimination)"death-duel" else listOf("scrap","foundry","salt","switchback","crown")[Career.events[raceRound].cupIndex])
            for(i in profiles.indices)if(activeSeat(i) && (i==0 || !career || server.slots[i].claimed)){Garage.apply(profiles[i],world.cars[i]);world.cars[i].rivalIndex=-1;world.cars[i].aiStyle=null}
            for(i in profiles.indices)world.cars[i].human=activeSeat(i) && (server.slots[i].claimed || i==0 && keyboard)
        }
        world.reset();effects.clear();if(::atlasEffects.isInitialized)atlasEffects.clear();server.trackJson=courseCatalog[courseIndex].json(activeRegion);server.surface=Surfaces.asphalt
        if(::raceAudio.isInitialized)raceAudio.bind(world)
        if(changed)scene=makeScene()
    }
    private fun activeSeat(i: Int)=!(campaignRace && Career.events[raceRound].duel && i==1)
    private fun driverName(c: Car)=if(c.human)"PLAYER ${c.id+1}" else c.aiStyle?.name?.uppercase()?:"RIVAL ${c.id+1}"
    private fun finishRace() {
        val before=profiles[0]
        for(i in profiles.indices)if(raceTickets[i]>0 && raceProfiles[i]==profiles[i].id) {
            val c=world.cars[i]
            var message=""
            if(editProfile(i){
                if(campaignRace && i==0)RivalEconomy.settle(it,raceTickets[i],world,raceRound)
                if(campaignRace && i==0)message=Career.settle(it,raceTickets[i],raceRound,raceDifficulty,c.position,world.combat.kills[i],world.combat.health(i),Career.qualifies(c,world),world.combat.cashCollected[i],world.cars.any{r->r.aiStyle?.id=="rook" && world.combat.wrecked(r.id)},world.combat.damageTaken[i]==0.0,c.finishSeconds>=0,Career.bossPosition(world,raceRound))?.message?:"Result already saved"
                else Economy.settle(it,raceTickets[i],c.position,world.combat.kills[i],world.combat.health(i),rewardScale=if(campaignRace)CareerCurve.all[raceRound].rewardScale else 1.0,cash=world.combat.cashCollected[i],course=courseCatalog[selectedTrack].id,targetWrecked=world.cars.any{r->r.aiStyle?.id=="rook" && world.combat.wrecked(r.id)},clean=world.combat.damageTaken[i]==0.0,finished=c.finishSeconds>=0)
            }) { shopMessage[i]="Pit service complete - ready to race";if(message.isNotEmpty())careerMessage[i]=message }
            raceTickets[i]=0;publishGarage(i)
        }
        phase="results";server.phase=phase;stateTime=0.0;raceAudio.results(world)
        if(campaignRace)campaignAudio.settled(before,profiles[0])
        script.raceFinished(world,profiles[0],raceRound,campaignRace,profiles[0].careerRound!=raceRound)
        rebuildUi()
    }

    override fun create() {
        if(profiler!=null) { profileGl=ProfileGl(Gdx.gl20);Gdx.gl20=profileGl;Gdx.gl=profileGl }
        shape=ShapeRenderer(10000); batch=SpriteBatch(); wheels.init()
        font=fontFactory?.invoke(HudTheme.BODY)?:BitmapFont().apply { data.setScale(1.6f) }
        large=HandCutFont.create(HudTheme.TITLE)
        small=fontFactory?.invoke(HudTheme.BODY)?:BitmapFont().apply { data.setScale(1.6f) }
        fontTextureBytes=listOf(font,large,small).flatMap{it.regions.map{r->r.texture}}.distinct().sumOf{it.width.toLong()*it.height*4}
        text=GlyphLayer(font); headline=GlyphLayer(large); detail=GlyphLayer(small)
        captions=GlyphLayer(small);scriptLayer=GlyphLayer(small)
        val cueManifest=runCatching{CueManifest.parse(Gdx.files.internal("audio/cues.json").readString("UTF-8"))}.getOrElse{logger("audio manifest unavailable; silent fallback");CueManifest.silent()}
        logger("audio musicMode=${cueManifest.musicMode}")
        for((id,gap) in cueManifest.gaps)logger("audio gap $id: $gap")
        logger("audio countdown retained as delivered; owner Maybe, later review")
        val nativeAudio=GdxAudioBackend(cueManifest.decodedBudgetBytes)
        audio=CueService(cueManifest,if(Gdx.app.type==Application.ApplicationType.Android)QueuedAudioBackend(nativeAudio) else nativeAudio);audio.preload()
        if(Gdx.app.getPreferences("deathride-audio").getBoolean("muted",false))audio.setGain("master",0f)
        raceAudio=RaceAudioDirector(audio);raceAudio.bind(world)
        campaignAudio=CampaignAudioDirector(audio)
        server=RaceServer(assets,logger,port=serverPort,profileFrames=profiler?.trace,profileRuntime=profiler?.let{{it.platform.runtimeJson()}}); for(i in world.cars.indices)CarCatalog.apply(world.cars[i],selectedCars[i]);world.reset(); server.start()
        profileStore=ProfileStore(Gdx.files.local("profiles").file());for(i in profiles.indices)loadProfile(i);world.reset()
        sceneryCanvas=SceneryCanvas(cacheRoadMarks);art=AtlasArt(Gdx.files.internal(if(proceduralOnly)"absent-art-audit" else "phase2-states"),TextureBudget.remainingArt(fontTextureBytes,sceneryCanvas.textureSize.toLong()*sceneryCanvas.textureSize*4),{if(::storyArt.isInitialized)storyArt.textureBytes else 0L})
        storyArt=StoryArt(Gdx.files.internal(if(proceduralOnly)"absent-story-audit" else "story-art")) {
            TextureBudget.remainingArt(fontTextureBytes,sceneryCanvas.textureSize.toLong()*sceneryCanvas.textureSize*4)-art.textureBytes-storyArt.textureBytes
        }
        atlasEffects=AtlasEffects(art);scene=makeScene();effects.clear();atmosphere.select(if(regionPresentation)activeRegion else null);server.trackJson=courseCatalog[selectedTrack].json(activeRegion)
        Gdx.input.setCatchKey(Input.Keys.BACK,true)
        Gdx.input.inputProcessor=object: InputAdapter() {
            override fun keyDown(keycode: Int): Boolean {
                if(keycode==Input.Keys.M || keycode==Input.Keys.BUTTON_Y){
                    val muted=audio.gain("master")>0f
                    audio.setGain("master",if(muted)0f else cueManifest.buses["master"]?:.8f)
                    Gdx.app.getPreferences("deathride-audio").putBoolean("muted",muted).flush();rebuildUi();return true
                }
                if(keycode==Input.Keys.N || keycode==Input.Keys.BUTTON_X){audio.skipNarration();return true}
                if(phase!="race" && phase!="countdown")when(keycode){
                    Input.Keys.LEFT,Input.Keys.RIGHT,Input.Keys.UP,Input.Keys.DOWN,Input.Keys.MENU->audio.play("ui.focus")
                }
                when(keycode) {
                    Input.Keys.ENTER,Input.Keys.SPACE,Input.Keys.DPAD_CENTER,Input.Keys.BUTTON_A -> { if(phase=="garage")buyPart(0,selectedPart,profiles[0].tier(selectedCars[0],selectedPart),selectedCars[0]) else if(phase=="career")careerSelect() else if(phase=="results" && campaignRace)openCareer() else if(phase=="lobby" || phase=="results")startRace(); return true }
                    Input.Keys.BACK,Input.Keys.ESCAPE,Input.Keys.BUTTON_B -> { if(phase!="lobby")lobby() else Gdx.app.exit(); return true }
                    Input.Keys.LEFT -> { if(phase=="garage")server.slots[0].carRequest.set((selectedCars[0]-1).mod(CarCatalog.all.size)) else if(phase=="career")selectDifficulty(-1) else selectFeel(-1); return true }
                    Input.Keys.RIGHT -> { if(phase=="garage")server.slots[0].carRequest.set((selectedCars[0]+1)%CarCatalog.all.size) else if(phase=="career")selectDifficulty(1) else selectFeel(1); return true }
                    Input.Keys.MEDIA_PLAY_PAUSE -> { openGarage();return true }
                    Input.Keys.MENU -> { if(phase=="lobby" || phase=="results")server.trackRequest.set(Courses.nextPlayable(selectedTrack)); return true }
                    Input.Keys.DOWN -> if(phase=="career") { startRace(true);return true } else if(phase=="garage") { selectedPart=(selectedPart+1)%Parts.all.size;return true } else if(phase=="lobby" || phase=="results") { server.slots[0].carRequest.set((selectedCars[0]+1)%CarCatalog.all.size); return true }
                    Input.Keys.UP -> if(phase=="garage") { selectedPart=(selectedPart-1).mod(Parts.all.size);return true } else if(phase=="lobby" || phase=="results") { openCareer();return true }
                    Input.Keys.MEDIA_REWIND -> if(phase=="lobby") { server.resetPairing();keyboard=false;return true }
                }
                if(keycode==Input.Keys.W || keycode==Input.Keys.A || keycode==Input.Keys.D || keycode==Input.Keys.S)keyboard=true
                return false
            }
        }
        if(trackPreview!=null) {
            world=trackPreview.world();for(i in selectedCars.indices)selectedCars[i]=CarCatalog.all.indexOf(world.cars[i].carClass)
            raceAudio.bind(world);server.trackJson=trackPreview.course.json;server.raceMode="track-preview";phase="countdown";countdown=3.0;server.phase=phase
            logger("trackPreview id=${trackPreview.id} tier=${trackPreview.tier} laps=${world.raceLaps} budget=${world.raceLimitSeconds} sixAI=true")
        }
        previousNanos=System.nanoTime()
        rebuildUi()
    }
    private fun selectFeel(direction: Int) {
        server.feelRequest.set((FeelProfiles.all.indexOf(server.feel)+direction).mod(FeelProfiles.all.size))
    }
    private fun startRace(career: Boolean=false) {
        val finale=career && Career.events[profiles[0].careerRound].elimination
        if(career && !server.slots[0].claimed && !keyboard) { careerMessage[0]="Pair Player 1 before starting a career race";publishGarage(0);return }
        if(career && !finale && CarCatalog.all[selectedCars[0]].tierRank>Career.events[profiles[0].careerRound].playerTier) { careerMessage[0]="Choose a car in this division or a lower tier";publishGarage(0);return }
        if(career && !finale && !profiles[0].owned[selectedCars[0]]) { careerMessage[0]="Buy this car in the garage or choose an owned car";publishGarage(0);return }
        if(career && !finale && !Career.unlocked(profiles[0],"car",CarCatalog.all[selectedCars[0]].id)) { careerMessage[0]="Car locked for career - choose Line or an unlocked car";publishGarage(0);return }
        if(career && !Career.events[profiles[0].careerRound].duel && server.slots[1].claimed &&
            (!profiles[1].owned[selectedCars[1]] || CarCatalog.all[selectedCars[1]].tierRank>Career.events[profiles[0].careerRound].playerTier)) {
            careerMessage[0]="Player 2: choose an owned car in this division or a lower tier";publishGarage(0);return
        }
        if(career && !editProfile(0){RivalEconomy.prepare(it);DeathDuel.seize(it)})return
        campaignRace=career;server.raceMode=if(career)"career" else "practice";raceRound=profiles[0].careerRound;raceDifficulty=profiles[0].careerDifficulty
        raceTickets.fill(0)
        for(i in profiles.indices)if(activeSeat(i) && (server.slots[i].claimed || i==0 && keyboard)) {
            var ticket=0L;if(editProfile(i){ticket=Economy.start(it)}) { raceTickets[i]=ticket;raceProfiles[i]=profiles[i].id }
        }
        configureWorld(if(career)Career.events[raceRound].courseIndex else selectedTrack,career,(profiles[0].startedRaces+raceRound).toInt())
        world.reset(); effects.clear();if(::atlasEffects.isInitialized)atlasEffects.clear();phase="countdown"; countdown=3.0; accumulator=0.0; stateTime=0.0; server.phase=phase; logger("race countdown mode=${server.raceMode}"); rebuildUi()
        audio.play("ui.confirm")
    }
    private fun lobby() { raceTickets.fill(0);phase="lobby";campaignRace=false;server.raceMode="practice";configureWorld(selectedTrack,false);stateTime=0.0;server.phase=phase;audio.play("ui.back");rebuildUi() }
    override fun resize(width: Int,height: Int) { view.update(width,height,true) }
    override fun pause() { if(::raceAudio.isInitialized)raceAudio.pause();server.paused=true; server.suspendLink(); accumulator=0.0 }
    override fun resume() { if(::raceAudio.isInitialized)raceAudio.resume();if(::scene.isInitialized)scene=makeScene();if(::server.isInitialized) { server.paused=false; server.start() }; previousNanos=System.nanoTime(); accumulator=0.0 }
    override fun render() {
        val nanos=System.nanoTime(); val actual=(nanos-previousNanos)/1e9; previousNanos=nanos
        profiler?.begin(nanos,actual);profileGl?.reset()
        val now=server.nowMs(); server.metrics.frameMs.add(actual*1000,now); server.frameNumber++
        val elapsed=actual.coerceIn(0.0,.1); stateTime+=elapsed; uiTime+=elapsed; smokeTime+=actual
        for(i in server.slots.indices) {
            if(server.slots[i].profileId!=profiles[i].id && phase!="race" && phase!="countdown")loadProfile(i)
            val choice=server.slots[i].carRequest.getAndSet(-1)
            if(choice>=0 && choice!=selectedCars[i] && (phase=="lobby" || phase=="results" || phase=="garage" || phase=="career")) {
                if(DeathDuel.seized(profiles[i])) { careerMessage[i]="Your car is seized. The Mechanic rig is supplied.";publishGarage(i) }
                else if(editProfile(i){it.selectedCar=choice}) { selectedCars[i]=choice;Garage.apply(profiles[i],world.cars[i]);world.reset();effects.clear() }
            }
            val purchase=server.slots[i].shopRequest.getAndSet(null)
            if(purchase!=null && purchase.profileId==profiles[i].id)buyPart(i,purchase.part,purchase.tier,purchase.car)
            val market=server.slots[i].marketRequest.getAndSet(null)
            if(market!=null && market.profileId==profiles[i].id)buyMarket(i,market)
        }
        val courseIndex=server.trackRequest.getAndSet(-1)
        if(courseIndex in Courses.playableIndices && (phase=="lobby" || phase=="results")) {
            configureWorld(courseIndex,false);rebuildUi()
        }
        val surfaceIndex=server.surfaceRequest.getAndSet(-1)
        if(surfaceIndex>=0 && !campaignRace) { server.surface=Surfaces.practice[surfaceIndex]; world.track.surface=server.surface; world.track.surfaceOverride=true; logger("surface ${server.surface.json}") }
        val difficulty=server.difficultyRequest.getAndSet(-1)
        if(difficulty>=0 && phase=="career" && difficulty!=profiles[0].careerDifficulty)editProfile(0){it.careerDifficulty=difficulty}
        val feelIndex=server.feelRequest.getAndSet(-1)
        if(feelIndex>=0) { server.feel=FeelProfiles.all[feelIndex]; logger("feel ${server.feel.json}") }
        for(c in world.cars)c.feel=if(c.human)server.feel else FeelProfiles.spike
        when(server.command.getAndSet(0)) { 1 -> if(phase=="results" && campaignRace)openCareer() else if(phase=="lobby" || phase=="results")startRace(); 2 -> lobby();3 -> openGarage();4 -> openCareer();5 -> if(phase=="career")startRace(true) }
        profiler?.mark(6,"DR.prepare")
        if(!scene.ready) { scene.advance();accumulator=0.0;if(scene.ready)rebuildUi() };server.sceneryReady=scene.ready
        profiler?.mark(7,"DR.simulation")
        // Keep release/stale state current in menus without mislabelling it as simulation-age evidence.
        if(!scene.ready || phase=="countdown" || phase=="results" || phase=="garage" || phase=="career")for(i in server.slots.indices)server.consume(i,server.nowMs(),inputs[i],false)
        if(actual>.1)server.metrics.discardedSimMs.add(((actual-.1)*1000).toLong(),now)
        if(phase=="countdown" && scene.ready) { countdown-=elapsed; if(countdown<=0) { phase="race"; server.phase=phase; stateTime=0.0 } }
        if(scene.ready && (phase=="lobby" || phase=="race")) {
            accumulator+=elapsed
            var steps=0
            while(accumulator>=Tuning.STEP_SECONDS && steps<6) {
                for(i in 0..1) { world.cars[i].human=activeSeat(i) && server.slots[i].claimed; world.cars[i].feel=if(world.cars[i].human)server.feel else FeelProfiles.spike; server.consume(i,server.nowMs(),inputs[i]) }
                if(keyboard && !server.slots[0].claimed) {
                    world.cars[0].human=true
                    val left=Gdx.input.isKeyPressed(Input.Keys.A)||Gdx.input.isKeyPressed(Input.Keys.LEFT)
                    val right=Gdx.input.isKeyPressed(Input.Keys.D)||Gdx.input.isKeyPressed(Input.Keys.RIGHT)
                    val gas=Gdx.input.isKeyPressed(Input.Keys.W)||Gdx.input.isKeyPressed(Input.Keys.UP)
                    val brake=Gdx.input.isKeyPressed(Input.Keys.S)||Gdx.input.isKeyPressed(Input.Keys.DOWN)
                    inputs[0].fire=if(Gdx.input.isKeyPressed(Input.Keys.F))1.0 else 0.0
                    inputs[0].mine=if(Gdx.input.isKeyPressed(Input.Keys.G))1.0 else 0.0
                    inputs[0].ability=if(Gdx.input.isKeyPressed(Input.Keys.Q))1.0 else 0.0
                    inputs[0].weapon=if(Gdx.input.isKeyPressed(Input.Keys.E))1 else 0
                    inputs[0].handbrake=if(Gdx.input.isKeyPressed(Input.Keys.SHIFT_LEFT))1.0 else 0.0
                    inputs[0].set((if(right)1.0 else 0.0)-(if(left)1.0 else 0.0),if(gas)1.0 else 0.0,if(brake)1.0 else 0.0)
                }
                val start=System.nanoTime(); world.step(inputs); server.metrics.simMs.add((System.nanoTime()-start)/1e6,server.nowMs())
                accumulator-=Tuning.STEP_SECONDS; steps++
            }
            if(phase=="lobby" && world.resolved==world.entrantCount)world.reset()
            if(phase=="race") {
                var humans=0; var complete=0
                for(c in world.cars)if(c.human) { humans++; if(c.finishSeconds>=0 || world.combat.wrecked(c.id))complete++ }
                if((humans>0 && complete==humans) || world.resolved==world.entrantCount || world.seconds>=world.raceLimitSeconds)finishRace()
            }
        }
        profiler?.mark(8,"DR.audio")
        raceAudio.update(world,phase,scene.ready,countdown,actual.coerceAtLeast(0.0))
        script.frame(phase,campaignRace,profiles[0],raceRound,world,actual.coerceIn(0.0,.1))
        profiler?.mark(9,"DR.telemetry")
        server.raceSeconds=world.seconds;server.raceLaps=world.raceLaps;server.eventType=world.eventType.name;server.raceEntrants=world.entrantCount
        if(uiTime>=.1) {
            uiTime=0.0
            server.audioJson=audio.statsJson()
            val sceneryBytes=sceneryCanvas.textureSize.toLong()*sceneryCanvas.textureSize*4
            val qrBytes=qr?.let{it.width.toLong()*it.height*4}?:0L
            val artBytes=art.textureBytes+storyArt.textureBytes
            server.artJson="{\"regions\":${art.regionCount},\"textureBytes\":$artBytes,\"storyTextureBytes\":${storyArt.textureBytes},\"sceneryBytes\":$sceneryBytes,\"fontBytes\":$fontTextureBytes,\"qrBytes\":$qrBytes,\"ownedTextureBytes\":${artBytes+sceneryBytes+fontTextureBytes+qrBytes},\"artBudgetBytes\":${TextureBudget.ART},\"ownedBudgetBytes\":${TextureBudget.TOTAL},\"budgetOk\":${TextureBudget.fits(artBytes,fontTextureBytes,sceneryBytes,qrBytes)},\"failures\":${art.failures+storyArt.failures},\"draws\":${art.draws},\"driftSmokeEmitted\":${atlasEffects.driftSmokeEmitted},\"driftSkidsEmitted\":${atlasEffects.driftSkidsEmitted},\"activeEffects\":${atlasEffects.activeCount},\"region\":\"${activeRegion.id}\",\"regionPresentation\":$regionPresentation,\"regionCandidates\":$regionCandidates,\"weatherLive\":${atmosphere.activeCount},\"weatherCap\":${activeRegion.weatherCap},\"carStrategy\":\"runtime rotation; procedural for unapproved/missing states\"}"
            val combat=world.combat
            server.trafficJson=world.cars.filter{it.entered}.joinToString(",","[","]"){c->"{\"id\":${c.id},\"name\":\"${driverName(c)}\",\"car\":\"${c.carClass?.id}\",\"human\":${c.human},\"x\":${c.x},\"y\":${c.y},\"heading\":${c.heading},\"radius\":${c.spec.circleRadiusM},\"ability\":${world.abilities.json(c.id)},\"ai\":${world.ai.json(c)},\"hp\":${combat.health(c.id)},\"wrecked\":${combat.wrecked(c.id)},\"finished\":${c.finishSeconds>=0},\"finishKind\":\"${c.finishKind}\",\"laps\":${c.lap.laps},\"position\":${c.position},\"repairPickups\":${combat.repairPickupsTaken[c.id]}}"}
            server.pickupsJson=combat.pickups.joinToString(",","[","]"){p->"{\"kind\":\"${p.type.id}\",\"x\":${p.x},\"y\":${p.y},\"cooldown\":${p.cooldownSeconds}}"}
            server.combatSummaryJson="{\"mineBlastRadiusM\":${Weapons.all[Weapons.MINE].radiusM},\"mineTriggerRadiusM\":${combat.mineTriggerRadiusM},\"damageScale\":${world.damageScale},\"shotsByWeapon\":[${combat.shots.joinToString(",")}],\"active\":${world.entrantCount-world.resolved},\"living\":${world.entrantCount-combat.wreckCount},\"finished\":${world.finished},\"shots\":${combat.shots.sum()},\"projectiles\":${combat.projectiles.count{it.active}},\"mines\":${combat.mines.count{it.active}},\"blasts\":${combat.blasts.count{it.remainingSeconds>0}},\"poolExhaustions\":${combat.poolExhaustions},\"abilityDamage\":${combat.abilityDamage.sum()},\"abilityUses\":${world.cars.sumOf{it.ability.activation}}}"
            for(i in 0..1) { val c=world.cars[i]; val s=server.slots[i]; s.speed=c.speedMps; s.lap=min(c.lap.laps+1,world.raceLaps); s.position=c.position; s.impact=c.impact; s.drifting=c.drifting; s.driftQuality=c.driftQuality;s.slipRadians=c.slipRadians;s.spunOut=c.spunOut; s.loadTransfer=c.loadTransfer; s.surfaceId=c.surface.id; s.x=c.x; s.y=c.y;s.heading=c.heading;s.yaw=c.yaw;s.progressM=c.lap.progressM; s.combatJson=combatJson(i) }
            rebuildUi()
        }
        profiler?.mark(10,"DR.clear")
        view.apply(); ScreenUtils.clear(bg)
        profiler?.mark(11,"DR.camera")
        if(scene.ready)drawWorld(elapsed)
        profiler?.mark(15,"DR.hud")
        drawOverlay()
        profiler?.mark(16,"DR.caption")
        drawCaption();drawScriptCaption()
        profiler?.mark(17,"DR.tail")
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
        profiler?.finish(phase=="race" && scene.ready,world.entrantCount-world.resolved,
            profileGl?.draws?:0,profileGl?.binds?:0,profileGl?.uploads?:0,atlasEffects.activeCount+atmosphere.activeCount)
    }
    private fun capture(name: String) { val p=Pixmap.createFromFrameBuffer(0,0,Gdx.graphics.width,Gdx.graphics.height); val writer=PixmapIO.PNG(); writer.setFlipY(true); writer.write(Gdx.files.local("../evidence/$name"),p); writer.dispose(); p.dispose() }
    private fun activeDriver(): Car = world.cars.firstOrNull { it.human && !world.combat.wrecked(it.id) && it.finishSeconds<0 }
        ?: world.cars.firstOrNull { it.human } ?: world.cars[0]
    private fun drawWorld(dt: Double) {
        val course=courseCatalog[selectedTrack]
        val alpha=(accumulator/Tuning.STEP_SECONDS).coerceIn(0.0,1.0)
        val following=phase=="race" || phase=="countdown"
        var pixelsPerM=min(1180.0/(course.maxX-course.minX),490.0/(course.maxY-course.minY))
        if(following) {
            var count=0;var x=0.0;var y=0.0;var speed=0.0;var minX=Double.POSITIVE_INFINITY;var maxX=Double.NEGATIVE_INFINITY;var minY=Double.POSITIVE_INFINITY;var maxY=Double.NEGATIVE_INFINITY
            for(c in world.cars)if(c.human && !world.combat.wrecked(c.id) && c.finishSeconds<0) { x+=c.x+c.vx*VisualTuning["lookAheadSeconds"];y+=c.y+c.vy*VisualTuning["lookAheadSeconds"];speed+=c.speedMps;count++;minX=min(minX,c.x);maxX=max(maxX,c.x);minY=min(minY,c.y);maxY=max(maxY,c.y) }
            if(count==0) { val c=activeDriver();x=c.x+c.vx*VisualTuning["lookAheadSeconds"];y=c.y+c.vy*VisualTuning["lookAheadSeconds"];speed=c.speedMps;count=1 }
            val ease=1-exp(-dt*VisualTuning["cameraResponsePerSecond"])
            focusX+=(x/count-focusX)*ease;focusY+=(y/count-focusY)*ease
            var target=(VisualTuning["soloPixelsPerM"]-speed/count*VisualTuning["speedZoomPerMps"]).coerceAtLeast(VisualTuning["minPixelsPerM"])
            if(count>1)target=min(target,min(1100/(maxX-minX+VisualTuning["sharedPaddingM"]),480/(maxY-minY+VisualTuning["sharedPaddingM"])))
            target/=RACE_ZOOM_OUT;cameraZoom+=(target-cameraZoom)*ease;pixelsPerM=cameraZoom
        } else if(phase=="lobby") {
            // Lobby backdrop: a close, live look at the demo pack on the chosen region's ground, framed by the centre window.
            var n=0;var x=0.0;var y=0.0
            for(c in world.cars)if(c.entered){x+=c.x;y+=c.y;n++}
            if(n>0){x/=n;y/=n}else{x=(course.minX+course.maxX)*.5;y=(course.minY+course.maxY)*.5}
            if(!lobbyCamera){focusX=x;focusY=y;lobbyCamera=true} else {val ease=1-exp(-dt*VisualTuning["cameraResponsePerSecond"]);focusX+=(x-focusX)*ease;focusY+=(y-focusY)*ease}
            cameraZoom=LOBBY_PIXELS_PER_M;pixelsPerM=cameraZoom
        } else { focusX=(course.minX+course.maxX)*.5;focusY=(course.minY+course.maxY)*.5;cameraZoom=VisualTuning["soloPixelsPerM"] }
        if(phase!="lobby")lobbyCamera=false
        worldMatrix.set(view.camera.combined).translate(640f,350f,0f).scale(pixelsPerM.toFloat(),pixelsPerM.toFloat(),1f).translate(-focusX.toFloat(),-focusY.toFloat(),0f)
        profiler?.mark(12,"DR.effectsUpdate")
        atlasEffects.update(world.snapshot,dt);atmosphere.update(dt)
        profiler?.mark(13,"DR.sceneryDraw")
        batch.projectionMatrix=worldMatrix;batch.begin();scene.draw(batch);batch.end()
        profiler?.mark(14,"DR.carsEffects")
        Gdx.gl.glEnable(GL20.GL_BLEND);Gdx.gl.glBlendFunc(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)
        shape.projectionMatrix=worldMatrix;shape.begin(ShapeRenderer.ShapeType.Filled)
        scene.drawRoadMarks(shape)
        obstaclePainter.shapes(shape,world,art,false)
        combatPainter.ground(shape,world)
        effects.draw(shape,world,dt,!art.available("decals/skid"))
        shape.end();batch.begin();obstaclePainter.sprites(batch,world,art,false);atlasEffects.ground(batch,world.snapshot);batch.end();shape.begin(ShapeRenderer.ShapeType.Filled)
        for(c in world.cars)if(c.entered)wheels.update(c.id,dt.toFloat(),c.filteredSteer.toFloat(),c.vx,c.vy,c.heading,c.longitudinalAcceleration,world.combat.wrecked(c.id))
        for(c in world.cars) {
            if(!c.entered)continue
            val prev=world.previousSnapshot;val current=world.snapshot
            val x=(prev.x(c.id)+(current.x(c.id)-prev.x(c.id))*alpha).toFloat();val y=(prev.y(c.id)+(current.y(c.id)-prev.y(c.id))*alpha).toFloat()
            val heading=prev.heading(c.id)+wrapAngle(current.heading(c.id)-prev.heading(c.id))*alpha
            if(c.ability.definition?.kind==AbilityKind.DISPATCHER || art.carKey(c.carClass?.id?:"Line",current.healthFraction(c.id).toFloat(),current.wrecked(c.id),c.id)==null)painter.draw(shape,c,x,y,heading,colors[c.id],world.combat.damageFlashSeconds[c.id]>0 || c.impact>3 && server.frameNumber%6<3,healthFraction=current.healthFraction(c.id).toFloat(),wrecked=world.combat.wrecked(c.id),wheelAngle=wheels.angle[c.id],tread=wheels.tread[c.id],braking=wheels.braking[c.id])
            if(c.ability.definition?.kind!=AbilityKind.DISPATCHER) {
                val hp=current.healthFraction(c.id).toFloat()
                if(!c.human && AtlasArt.carState(hp,current.wrecked(c.id))>0 && art.carKey(c.carClass?.id?:"Line",hp,current.wrecked(c.id),c.id)!=null)
                    seatRing(x,y,CarShapeCache.of(c.carClass?.id?:"Line").lengthM.toFloat()*.5f,colors[c.id],world.combat.damageFlashSeconds[c.id]>0)
            }
            if(c.human) { val marker=(c.spec.circleRadiusM+c.spec.circleOffsetM+1).toFloat();shape.color=colors[c.id];shape.triangle(x-0.7f,y+marker+1,x+0.7f,y+marker+1,x,y+marker) }
        }
        combatPainter.air(shape,world,art)
        abilityPainter.draw(shape,world.snapshot)
        shape.end()
        batch.begin()
        for(c in world.cars)if(c.entered) {
            val s=world.snapshot;val prev=world.previousSnapshot
            if(c.ability.definition?.kind==AbilityKind.DISPATCHER)continue
            val key=art.carKey(c.carClass?.id?:"Line",s.healthFraction(c.id).toFloat(),s.wrecked(c.id),c.id)?:continue
            val x=(prev.x(c.id)+(s.x(c.id)-prev.x(c.id))*alpha).toFloat();val y=(prev.y(c.id)+(s.y(c.id)-prev.y(c.id))*alpha).toFloat()
            val heading=prev.heading(c.id)+wrapAngle(s.heading(c.id)-prev.heading(c.id))*alpha
            val spec=CarShapeCache.of(c.carClass?.id?:"Line")
            art.car(batch,key,x,y,spec.lengthM.toFloat(),spec.widthM.toFloat(),heading)
            wheels.draw(batch,c.id,spec.id,x,y,spec.lengthM.toFloat(),spec.widthM.toFloat(),heading)
        }
        atlasEffects.air(batch,world.snapshot,world.seconds);abilityPainter.art(batch,world.snapshot,art);batch.end()
        shape.begin(ShapeRenderer.ShapeType.Filled);obstaclePainter.shapes(shape,world,art,true);shape.end()
        batch.begin();obstaclePainter.sprites(batch,world,art,true);batch.end()
    }
    private fun drawOverlay() {
        shape.projectionMatrix=view.camera.combined
        shape.begin(ShapeRenderer.ShapeType.Filled)
        if(regionPresentation && scene.ready)atmosphere.draw(shape)
        fun panel(x: Float,y: Float,w: Float,h: Float) {
            shape.color=bg;shape.rect(x,y,w,h)
            shape.color=road;shape.rect(x,y,w,3f);shape.rect(x,y+h-3,w,3f)
            shape.color=accent;shape.rect(x,y+h-22,4f,20f)
        }
        fun bar(x: Float,y: Float,w: Float,value: Float,color: Color) {
            shape.color=road;shape.rect(x,y,w,16f);shape.color=color;shape.rect(x,y,w*value,16f)
        }
        val racing=phase=="race"
        panel(0f,if(racing)554f else 614f,1280f,if(racing)166f else 106f)
        panel(0f,0f,1280f,80f)
        if(racing) {
            val c=activeDriver();val combat=world.combat;val a=c.ability;val d=a.definition
            bar(553f,648f,180f,world.snapshot.healthFraction(c.id).toFloat(),if(combat.health(c.id)<combat.maxHealth(c.id)*.35)warning else accent)
            bar(553f,589f,180f,c.armorReduction.toFloat(),HudTheme.bone)
            if(d!=null) {
                bar(1038f,590f,182f,HudTheme.fraction(a.energy,d.energyCapacity),accent)
                bar(1038f,567f,182f,1f-HudTheme.fraction(a.cooldownSeconds,d.cooldownSeconds),HudTheme.bone)
            }
            panel(345f,82f,690f,35f)
            if(server.slots.any{it.claimed && it.stale})panel(345f,500f,690f,40f)
        }
        when(phase) {
            "lobby" -> {
                // Three columns: pairing panel, a live window onto the chosen region, car panel. Opaque margins keep the world inside the window.
                shape.color=bg;shape.rect(0f,80f,44f,534f);shape.rect(1236f,80f,44f,534f);shape.rect(44f,80f,1192f,16f);shape.rect(44f,602f,1192f,12f)
                panel(44f,96f,360f,506f);panel(876f,96f,360f,506f)
                // Lesson strip and campaign card sit on the world with a translucent / solid Hot Ink underlay.
                shape.setColor(.09f,.08f,.07f,.88f);shape.rect(414f,498f,452f,88f)
                shape.color=HudTheme.rust;shape.rect(416f,120f,448f,92f)
                shape.color=accent;shape.rect(64f,130f,320f,50f)
                val car=CarCatalog.all[selectedCars[0]]
                val spec=CarShapeCache.of(car.id)
                // Turntable: seat-coloured ring so the livery identity reads even on damaged or procedural cars.
                shape.setColor(.13f,.11f,.10f,1f);shape.rect(896f,392f,320f,110f)
                shape.color=colors[0];shape.ellipse(1056f-128f,447f-40f,256f,80f)
                shape.setColor(.16f,.14f,.12f,1f);shape.ellipse(1056f-122f,447f-35f,244f,70f)
                for(i in CarCatalog.statNames.indices) {
                    val value=car.stat(CarCatalog.statNames[i],profiles[0].bonuses())
                    val y=330f-i*29f
                    shape.color=road;shape.rect(1015f,y+5f,158f,14f)
                    shape.color=if(weakStats[i])warning else accent;shape.rect(1015f,y+5f,158f*(value.toFloat()/CarCatalog.statMax).coerceIn(0f,1f),14f)
                }
                if(previewKey()==null)painter.draw(shape,world.cars[0],1056f,447f,0.0,colors[0],false,min(24f,160f/spec.lengthM.toFloat()))
            }
            "garage" -> {
                panel(44f,96f,1192f,506f)
                shape.color=road;shape.rect(65f,457f-selectedPart*52,505f,48f)
                val offer=Garage.offer(profiles[0],selectedPart)
                for(i in CarCatalog.statNames.indices)bar(927f,468f-i*26,260f,offer.before[i].toFloat()/CarCatalog.statMax,accent)
                shape.color=accent;shape.rect(626f,202f,575f,48f)
            }
            "career" -> {
                panel(44f,96f,729f,506f);panel(788f,96f,448f,506f)
                if(regionPresentation)regionLooks.getValue(Career.events[profiles[0].careerRound].region.id).backdrop(shape,65f,487f,678f,82f)
                for(i in Career.difficulties.indices) {shape.color=if(i==if(Campaign.pending(profiles[0])>=0)selectedReward else profiles[0].careerDifficulty)accent else road;shape.rect(66f+i*229,230f,216f,42f)}
                bar(66f,356f,677f,HudTheme.fraction(profiles[0].careerCleared.toDouble(),Career.events.size.toDouble()),accent)
                if(storyArt.available("debt-meter")) {
                    val debt=profiles[0].campaign.debt.toDouble()
                    val initial=profiles[0].campaign.initial.toDouble()+profiles[0].campaign.interest
                    shape.color=bg;shape.rect(66f,326f,240f,8f)
                    shape.color=warning;shape.rect(66f,326f,240f*HudTheme.fraction(debt,initial),8f)
                }
                shape.color=accent;shape.rect(66f,137f,677f,44f)
                shape.color=bg;shape.rect(400f,288f,343f,64f);CoursePreview.draw(shape,Courses.all[Career.events[profiles[0].careerRound].courseIndex],410f,292f,110f,56f,muted,road,accent)
            }
            "results" -> {panel(260f,96f,760f,506f);shape.color=accent;shape.rect(286f,128f,708f,44f)}
            "countdown" -> if(scene.ready)panel(542f,268f,196f,172f)
        }
        if(phase=="race" || phase=="countdown" || phase=="results")for(c in world.cars)if(c.entered) {shape.color=colors[c.id];shape.rect(20f+c.id*210,21f,4f,43f)}
        if(Presentation.FOLLOW_CAMERA && racing && scene.ready)drawMinimap()
        shape.end()
        batch.projectionMatrix=view.camera.combined;batch.begin();batch.color=Color.WHITE
        fun frame(x: Float,y: Float,w: Float,h: Float,key: String="hud/frame-instrument",corner: Float=0f) {art.frame(batch,key,x,y,w,h,corner)}
        when(phase) {
            "lobby" -> {
                previewKey()?.let{key->val spec=CarShapeCache.of(world.cars[0].carClass?.id?:"Line");val s=min(34f,200f/spec.lengthM.toFloat());art.car(batch,key,1056f,447f,spec.lengthM.toFloat()*s,spec.widthM.toFloat()*s,0.0)}
                frame(44f,96f,360f,506f,"hud/frame-panel",.2f);frame(876f,96f,360f,506f,"hud/frame-panel",.2f)
                frame(404f,96f,472f,506f,"hud/frame-instrument",.2f)
                frame(892f,388f,328f,118f,"hud/frame-instrument",.14f)
                frame(58f,124f,332f,62f,"hud/frame-button",.14f);frame(410f,114f,460f,104f,"hud/frame-button",.14f)
                for(i in CarCatalog.statNames.indices)frame(1010f,330f-i*29f,168f,24f,"hud/frame-meter")
            }
            "garage" -> {
                frame(44f,96f,1192f,506f,"hud/frame-panel");frame(61f,453f-selectedPart*52,513f,56f);frame(621f,197f,585f,58f,"hud/frame-button")
                art.draw(batch,"hud/icon-engine",548f,480f,32f,32f)
                art.draw(batch,"hud/icon-handling",548f,428f,32f,32f)
                // Brakes retain their explicit text: no unrelated icon implies an armour upgrade.
                art.draw(batch,"hud/icon-armour",548f,324f,32f,32f)
                art.draw(batch,"hud/icon-handling",548f,272f,32f,32f)
                art.draw(batch,"hud/icon-heavy-gun",548f,220f,32f,32f)
                storyArt.draw(batch,"mechanic",64f,144f,78f,70f)
                storyArt.draw(batch,"icon-ledger",570f,110f,28f,28f)
            }
            "career" -> {
                frame(44f,96f,729f,506f,"hud/frame-panel");frame(788f,96f,448f,506f,"hud/frame-panel")
                // Quiet opaque story text area remains separate from the low-contrast illustration.
                if(!regionPresentation)art.drawBackdrop(batch,65f,486f,678f,82f)
                storyArt.draw(batch,storyPanel,625f,370f,112f,112f)
                storyArt.meter(batch,61f,321f,250f,18f)
                storyArt.draw(batch,"icon-ledger",747f,331f,22f,22f)
                storyArt.draw(batch,"icon-payment",747f,307f,22f,22f)
                storyArt.draw(batch,StoryArt.ledgerIcon(profiles[0]),808f,187f,28f,28f)
                for((i,index) in RivalEconomy.cast(profiles[0].careerRound).withIndex())art.draw(batch,"rival-"+Career.rivals[index].id,1174f,513f-i*72,60f,60f)
                frame(61f,132f,687f,54f,"hud/frame-button")
            }
            "results" -> {frame(260f,96f,760f,506f,"hud/frame-panel");frame(281f,123f,718f,54f,"hud/frame-button");storyArt.draw(batch,storyPanel,60f,300f,176f,176f)}
            "countdown" -> if(scene.ready) {frame(542f,268f,196f,172f,"hud/frame-dial");storyArt.draw(batch,storyPanel,767f,281f,148f,148f)}
            "race" -> {
                frame(24f,562f,156f,146f);frame(184f,562f,185f,146f);frame(373f,562f,160f,146f)
                frame(539f,562f,208f,146f);frame(752f,562f,238f,146f);frame(994f,562f,250f,146f)
                val c=activeDriver();val a=c.ability
                art.draw(batch,Weapons.all[world.combat.selectedWeapon[c.id]].id,777f,680f,32f,32f)
                art.draw(batch,"pickups/mine",777f,636f,32f,32f)
                a.definition?.let{art.draw(batch,"hud/ability-"+it.id,1017f,644f,32f,32f)}
                art.frame(batch,"hud/frame-meter",548f,643f,190f,26f)
                art.frame(batch,"hud/frame-meter",1033f,585f,192f,26f)
                if(Presentation.FOLLOW_CAMERA && scene.ready)frame(1044f,394f,200f,150f,"hud/frame-dial")
            }
        }
        if(phase=="lobby" && qr!=null)batch.draw(qr,64f,266f,150f,150f)
        text.draw(batch);headline.draw(batch);detail.draw(batch);batch.end()
    }
    /** Atlas key for the lobby preview car (clean frame, seat 0 livery), or null for the procedural fallback. */
    private fun previewKey(): String? {
        val c=world.cars[0]
        return if(c.ability.definition?.kind==AbilityKind.DISPATCHER)null else art.carKey(c.carClass?.id?:"Line",1f,false,0)
    }
    /** Seat identity that survives damaged and wreck frames, which are not livery-coloured: a ring under the sprite. */
    private fun seatRing(x: Float,y: Float,radius: Float,color: Color,flash: Boolean) {
        shape.color=if(flash)Color.WHITE else color
        val width=if(flash).35f else .22f
        for(i in 0 until 20) {
            val a=i*2*PI/20;val b=(i+1)*2*PI/20
            shape.rectLine(x+(cos(a)*radius).toFloat(),y+(sin(a)*radius).toFloat(),x+(cos(b)*radius).toFloat(),y+(sin(b)*radius).toFloat(),width)
        }
    }
    private fun drawMinimap() {
        val c=courseCatalog[selectedTrack];val scale=min(166/(c.maxX-c.minX),112/(c.maxY-c.minY)).toFloat()
        val ox=1144f-((c.minX+c.maxX)*.5).toFloat()*scale;val oy=469f-((c.minY+c.maxY)*.5).toFloat()*scale
        shape.color=bg;shape.rect(1044f,394f,200f,150f)
        shape.color=muted
        // The 360-segment road line is static per course: one retained mesh draw instead of ~2,200 immediate-mode vertices per frame.
        shape.end()
        val retained=scene.drawMinimapRoad(view.camera.combined,muted.r,muted.g,muted.b)
        shape.begin(ShapeRenderer.ShapeType.Filled);shape.color=muted
        if(!retained) {
            for(i in 0 until scene.samples)shape.rectLine(ox+scene.center[i*2]*scale,oy+scene.center[i*2+1]*scale,ox+scene.center[(i+1)*2]*scale,oy+scene.center[(i+1)*2+1]*scale,3f)
            for(line in scene.branchCenters)for(i in 0 until line.size/2-1)shape.rectLine(ox+line[i*2]*scale,oy+line[i*2+1]*scale,ox+line[(i+1)*2]*scale,oy+line[(i+1)*2+1]*scale,3f)
        }
        // Dark halo keeps every seat colour readable on the road line; a nose triangle gives heading, humans are larger.
        for(car in world.cars)if(car.entered) {
            val x=ox+car.x.toFloat()*scale;val y=oy+car.y.toFloat()*scale;val r=if(car.human)6f else 4.5f
            val hx=cos(car.heading).toFloat();val hy=sin(car.heading).toFloat()
            val dead=world.combat.wrecked(car.id)
            shape.setColor(.02f,.03f,.035f,1f);shape.circle(x,y,r+1.6f,12)
            if(dead)shape.setColor(.35f,.36f,.35f,1f) else shape.color=colors[car.id]
            shape.circle(x,y,r,12)
            if(!dead){shape.setColor(.02f,.03f,.035f,1f);shape.triangle(x+hx*(r+4f),y+hy*(r+4f),x-hy*r*.6f+hx*r*.3f,y+hx*r*.6f+hy*r*.3f,x+hy*r*.6f+hx*r*.3f,y-hx*r*.6f+hy*r*.3f);shape.color=colors[car.id];shape.triangle(x+hx*(r+2.6f),y+hy*(r+2.6f),x-hy*r*.4f+hx*r*.5f,y+hx*r*.4f+hy*r*.5f,x+hy*r*.4f+hx*r*.5f,y-hx*r*.4f+hy*r*.5f)}
            if(dead){shape.color=colors[car.id];shape.rect(x-r*.7f,y-1f,r*1.4f,2f)}
        }
    }
    private fun rebuildUi() {
        if(!::text.isInitialized)return
        if(::art.isInitialized) {
            storyPanel=StoryArt.panel(profiles[0],phase,campaignRace && (phase!="results" || raceRound==Career.events.lastIndex))
            val keys=linkedSetOf<String>()
            storyPanel?.let{keys.add(it)}
            if(phase=="garage")keys.addAll(listOf("mechanic","icon-ledger"))
            if(phase=="career")keys.addAll(listOf("debt-meter","icon-ledger","icon-payment",StoryArt.ledgerIcon(profiles[0])))
            if(keys!=storySelection) {
                art.selectBackdrop(null)
                storyArt.select(keys)
                storySelection=keys
            }
            art.selectBackdrop(if(!regionPresentation && phase=="career" && !storyArt.available(storyPanel))ArtBindings.stories[Career.events[profiles[0].careerRound].story.backdrop] else null)
        }
        val weak=PowerRating.identity(CarCatalog.all[selectedCars[0]],bonuses=profiles[0].bonuses()).second
        for(i in weakStats.indices)weakStats[i]=CarCatalog.statNames[i] in weak
        text.clear();headline.clear();detail.clear()
        text.setColor(HudTheme.bone);headline.setColor(HudTheme.bone);detail.setColor(muted)
        fun label(value: String,x: Float,y: Float,color: Color=muted) {detail.setColor(color);detail.addText(value,x,y)}
        fun title(value: String,x: Float,y: Float) {headline.addText(value.uppercase(),x,y)}
        if(phase!="race") {
            title("DEATH RIDE",42f,699f)
            label(when(phase){"career"->"THE ASH CIRCUIT";"garage"->"PARTS / PER CAR";"results"->"RACE RESULTS";else->"${courseCatalog[selectedTrack].name} / ${activeRegion.name} / ${world.raceLaps} LAPS"},42f,644f)
            label(if(phase=="lobby")"FEEL  /  ${server.feel.id.uppercase()}" else "BACK: LOBBY   /   ${server.feel.id}",810f,691f)
            label(if(scene.ready)"TWO PHONES. ONE CIRCUIT." else "PREPARING CIRCUIT",810f,654f,if(scene.ready)muted else accent)
        }
        if(phase=="race" || phase=="countdown" || phase=="results") {
            for(c in world.cars)if(c.entered) {
                val x=30f+c.id*210
                label("${c.position}. "+driverName(c),x,66f,colors[c.id])
                label(if(world.combat.wrecked(c.id))"WRECKED" else if(world.eventType==EventType.ELIMINATION)"HP ${world.combat.health(c.id).toInt()} / DUEL" else "HP ${world.combat.health(c.id).toInt()}  L${min(world.raceLaps,c.lap.laps+1)}/${world.raceLaps}",x,39f)
            }
        } else {
            label("P1 ${CarCatalog.all[profiles[0].selectedCar].id} / ${profiles[0].credits} CR",42f,if(phase=="lobby")62f else 55f,accent)
            label(if(server.slots[1].claimed)"P2 ${CarCatalog.all[profiles[1].selectedCar].id} / ${profiles[1].credits} CR" else "SECOND DRIVER / SCAN TO JOIN",455f,if(phase=="lobby")62f else 55f)
            label(if(audio.gain("master")==0f)"M / Y: SOUND OFF" else "M / Y: SOUND ON",995f,if(phase=="lobby")62f else 55f)
        }
        when(phase) {
            "lobby" -> {
                val car=CarCatalog.all[selectedCars[0]]
                // Left column: pair. Centre: lesson caption + campaign card. Right: car. Hints share one tidy footer row.
                title("SCAN + GO",64f,578f)
                detail.setColor(HudTheme.bone);detail.wrapped("1  Same Wi-Fi as this TV\n2  Scan with your phone\n3  Hold GO. Find the first corner.",64f,517f,320f,27f)
                updateQr();label("PIN ${server.pin}",232f,408f,accent)
                detail.setColor(muted);detail.wrapped("No app needed.\nTwo phone seats.",232f,378f,152f,25f)
                label(addressLabel,64f,246f)
                label(if(server.running)"${server.slots.count{it.connected}} / 2 PHONES CONNECTED" else server.serverStatus,64f,214f,accent)
                label("SELECT / PRACTICE",124f,168f,bg)
                title(car.id,896f,578f);detail.setColor(muted);detail.wrapped(car.role,896f,534f,320f)
                label("P1",904f,494f,colors[0])
                val ability=AbilityCatalog.byCar[car.id]
                if(ability!=null)label("SIGNATURE / ${ability.name}",896f,380f,accent)
                for(i in CarCatalog.statNames.indices) {
                    val stat=CarCatalog.statNames[i];val value=car.stat(stat,profiles[0].bonuses())
                    val y=351f-i*29f;val c=if(weakStats[i])warning else HudTheme.bone
                    label(stat,896f,y,c);label("$value",1186f,y,c)
                }
                detail.setColor(HudTheme.bone);detail.wrapped(courseCatalog[selectedTrack].lesson,424f,574f,432f,24f)
                val p=profiles[0];val event=Career.events[p.careerRound]
                label("UP  /  CAREER",432f,202f,HudTheme.bone)
                label((if(p.careerCleared>0)"ROUND ${p.careerRound+1} OF ${Career.events.size}" else "NEW SEASON")+"  /  "+event.name,432f,176f,HudTheme.bone)
                label(if(p.campaign.debt>0)"LEAGUE DEBT ${p.campaign.debt} CR" else "THE ASH CIRCUIT",432f,150f,HudTheme.bone)
                val hints=arrayOf("DOWN  CAR","MENU  CIRCUIT","L / R  FEEL","PLAY  GARAGE","BACK  EXIT")
                for(i in hints.indices)label(hints[i],42f+i*238f,32f)
            }
            "garage" -> {
                val p=profiles[0];val offer=Garage.offer(p,selectedPart);val part=Parts.all[selectedPart]
                title("THE GARAGE",67f,577f);label("${p.credits} CR",429f,566f,accent)
                label(CarCatalog.all[p.selectedCar].id+" / PLAYER 1",631f,568f,HudTheme.bone)
                label("LEFT / RIGHT: CAR",631f,537f)
                for(i in Parts.all.indices) {
                    val item=Garage.offer(p,i)
                    label(Parts.all[i].name+" ${item.tier}/${Parts.all[i].maxTier}",78f,492f-i*52,if(i==selectedPart)accent else HudTheme.bone)
                    label(if(item.tier==Parts.all[i].maxTier)"MAX" else "${item.price} CR",418f,492f-i*52)
                }
                for(i in CarCatalog.statNames.indices)label(CarCatalog.statNames[i]+" ${offer.before[i]} > ${offer.after[i]}",631f,492f-i*26)
                detail.setColor(muted);detail.wrapped(part.description,631f,276f,560f,25f)
                label(if(offer.available)"SELECT: TIER ${offer.nextTier} / ${offer.price} CR" else offer.reason,642f,235f,bg)
                detail.setColor(muted);detail.wrapped(shopMessage[0]+" / "+saveStatus[0],631f,186f,554f,25f)
                val mechanicX=if(storyArt.available("mechanic"))148f else 68f
                label("THE MECHANIC",mechanicX,201f,accent)
                detail.setColor(muted);detail.wrapped(Campaign.mechanicLine(p),mechanicX,175f,568f-mechanicX,24f)
                label("LEAGUE ${p.campaign.debt} / LOANS ${p.debt} CR",68f,127f)
            }
            "career" -> {
                val p=profiles[0];val event=Career.events[p.careerRound];val cup=Career.cups[event.cupIndex];val tier=Career.difficulties[p.careerDifficulty]
                label("SEASON ${p.careerSeasons+1} / ROUND ${p.careerRound+1} OF ${Career.events.size}",66f,577f,accent)
                title(event.name,66f,541f)
                label(cup.region.name+(if(event.elimination)" / DEATH DUEL / " else " / ${event.laps} LAPS / ")+Career.gradeName(p.careerTrophies[event.cupIndex]),66f,488f,HudTheme.bone)
                detail.setColor(HudTheme.bone);detail.wrapped(DeathDuel.story(p).lines.joinToString(" "),66f,453f,if(storyArt.available(storyPanel))548f else 677f,25f)
                label("LEAGUE DEBT ${p.campaign.debt} CR / PAID ${p.campaign.lastPayment}",66f,343f)
                val next=Career.unlocks.filter{it.afterRounds>p.careerCleared}.minByOrNull{it.afterRounds}
                label(if(next!=null)"NEXT ${next.name} / ROUND ${next.afterRounds}" else "ALL CARS AND COURSES UNLOCKED",66f,312f,accent)
                val pending=Campaign.pending(p)
                if(pending>=0) {
                    for(i in Campaign.choices.indices)label(Campaign.choices[i].uppercase(),83f+i*229,260f,if(i==selectedReward)bg else HudTheme.bone)
                    val choice=Campaign.choices[selectedReward];val rejection=Campaign.reason(p,pending,choice)
                    detail.setColor(muted);detail.wrapped(Campaign.allies[pending].id.uppercase()+": "+Campaign.label(p,pending,choice)+(if(rejection.isEmpty())"" else " / $rejection"),66f,219f,677f,25f)
                    label("SELECT CLAIM / DOWN RACE",162f,169f,bg)
                    label("LEFT-RIGHT Reward / PLAY Garage",66f,127f)
                } else {
                    for(i in Career.difficulties.indices)label(Career.difficulties[i].name.uppercase(),83f+i*229,260f,if(i==p.careerDifficulty)bg else HudTheme.bone)
                    detail.setColor(muted);detail.wrapped(tier.description,66f,219f,677f,25f)
                    label("SELECT / RACE NEXT ROUND",220f,169f,bg)
                    label("PLAY Garage / LEFT-RIGHT Difficulty",66f,127f)
                }
                label(Courses.all[event.courseIndex].name.uppercase(),532f,346f,accent);label(cup.region.name,532f,321f,HudTheme.bone);label(if(event.elimination)"DEATH DUEL" else "${event.laps} LAPS",532f,296f)
                label("RIVALS / THEIR GARAGES",808f,577f,accent)
                for((i,index) in RivalEconomy.cast(p.careerRound).withIndex()) {
                    val rival=Career.rivals[index];val g=p.rivalProfiles[index]
                    label(rival.name+" / "+CarCatalog.all[g.selectedCar].id,808f,540f-i*72,colors[i+1])
                    label("PR ${PowerRating.of(CarCatalog.all[g.selectedCar],g.bonuses()).toInt()} / ${g.credits} CR"+(if(Campaign.taunt(p,rival.id)!=null)" / ALLY" else if(p.grudges[index]>0)" / GRUDGE" else ""),808f,514f-i*72)
                }
                detail.setColor(muted);detail.wrapped(if(event.duel)"DEATH DUEL. Mechanic rig supplied. No lap win. P2 spectates." else Career.objective(p.careerRound),808f,158f,400f,25f)
                if(storyArt.available(StoryArt.ledgerIcon(p)))label(when(StoryArt.ledgerIcon(p)) {
                    "icon-cancelled" -> "CLAIM VOIDED ${p.campaign.voided} CR"
                    "icon-recovery" -> "RECOVERED ${p.campaign.recovered+p.campaign.restitutionPaid} / HELD ${p.campaign.restitutionDue}"
                    else -> "DIVERTED ${p.campaign.diverted} CR"
                },842f,210f)
            }
            "countdown" -> if(scene.ready) {title(digits[ceil(countdown).toInt().coerceIn(1,3)],626f,396f);label("HOLD GO",593f,319f,accent)}
            "race" -> {
                val c=activeDriver();val combat=world.combat;val weapon=combat.selectedWeapon[c.id];val a=c.ability;val d=a.definition
                label("POSITION",40f,695f);title("${c.position}/${world.entrantCount}",48f,663f)
                label(if(world.eventType==EventType.ELIMINATION)"SURVIVORS" else "LAP",204f,695f);title(if(world.eventType==EventType.ELIMINATION)"${world.entrantCount-world.combat.wreckCount}" else "${min(world.raceLaps,c.lap.laps+1)}/${world.raceLaps}",196f,663f)
                label("KM/H",395f,695f);title((c.speedMps*3.6).toInt().toString(),397f,663f)
                label("HULL ${combat.health(c.id).toInt()}/${combat.maxHealth(c.id).toInt()}",553f,695f,HudTheme.bone)
                label("ARMOUR ${(c.armorReduction*100).toInt()}%",553f,636f)
                label("${Weapons.all[weapon].id.uppercase()} ${combat.ammo(c.id,weapon)}",800f,695f,HudTheme.bone)
                label(HudTheme.weaponState(combat,c,weapon),800f,669f)
                label("MINE ${combat.ammo(c.id,Weapons.MINE)}",800f,638f,HudTheme.bone)
                label(HudTheme.weaponState(combat,c,Weapons.MINE),800f,615f)
                if(d!=null) {
                    label(d.name.uppercase(),1008f,697f,HudTheme.bone)
                    label(HudTheme.abilityState(a,combat.armingSeconds),1038f,671f,accent)
                    label("ENERGY ${a.energy.toInt()}",1038f,636f)
                }
                if(stateTime<1.2)title("GO",599f,390f)
                for(slot in server.slots)if(slot.claimed && slot.stale) {label("PLAYER ${slot.id+1} / LINK QUIET / COASTING",365f,529f,warning);break}
                label(if(!scene.ready)"PREPARING CIRCUIT" else if(combat.wrecked(c.id))"WRECKED / SPECTATING" else "${driverName(c)} / ${world.seconds.toInt()}s / ${courseCatalog[selectedTrack].name}",363f,109f)
            }
            "results" -> {
                title("THE FINISH",286f,575f)
                label(if(world.eventType==EventType.ELIMINATION)if(world.duelDraw)"DEATH DUEL / DRAW" else "DEATH DUEL / LAST CAR RUNNING" else if(world.entrantCount==2)"THE CROWN / TWO DRIVERS" else "${world.raceLaps} LAPS / SIX CARS",288f,518f)
                for(c in world.cars)if(c.entered)rankOrder[c.position-1]=c.id
                for(rank in 0 until world.entrantCount) {
                    val c=world.cars[rankOrder[rank]]
                    label("${rank+1} / ${driverName(c)}",291f,479f-rank*40,colors[c.id])
                    label(when {combatWrecked(c)->"WRECKED / ${world.combat.kills[c.id]} KILLS";c.finishKind==FinishKind.ELIMINATION->"LAST SURVIVOR";c.finishSeconds>=0->"${(c.finishSeconds*10).toInt()/10.0}s";else->if(world.eventType==EventType.ELIMINATION)"UNRESOLVED / RETRY" else "LAP ${c.lap.laps+1}/${world.raceLaps}"},737f,479f-rank*40)
                }
                val receipt=profiles[0].lastReceipt
                if(receipt!=null) {
                    label("PRIZE ${receipt.gross} / PIT ${receipt.repair} / DEBT + CAP ${receipt.net-receipt.banked}",291f,245f,accent)
                    label("BANKED +${receipt.banked} CR / BALANCE ${profiles[0].credits} CR",291f,220f,accent)
                }
                if(campaignRace && raceRound==Career.events.lastIndex && profiles[0].campaign.finale==2) {
                    val card=AshStory.cards.getValue("campaign-victory")
                    label(card.title.uppercase(),291f,365f,accent);detail.setColor(HudTheme.bone);detail.wrapped(card.lines.joinToString(" "),291f,328f,705f,25f)
                }
                if(campaignRace) {detail.setColor(muted);detail.wrapped(careerMessage[0],291f,194f,705f,25f)}
                label(if(campaignRace)"SELECT / NEXT ROUND" else "SELECT / REMATCH",495f,160f,bg)
            }
        }
    }
    private fun combatWrecked(c: Car)=world.combat.wrecked(c.id)
    /** Timed script captions (pre/post-race scenes, barks); yields to a playing voice caption. No audio. */
    private fun drawScriptCaption(){
        val value=script.caption
        if(value.isEmpty() || audio.caption.isNotEmpty())return
        val (bx,by)=when(phase){"career"->60f to 300f;"results"->190f to 84f;else->190f to 132f}
        val width=if(phase=="career")700f else 900f
        if(script.serial!=drawnScript){scriptLayer.clear();scriptLayer.setColor(HudTheme.bone);scriptLayer.wrapped(value,bx+16f,by+38f,width-32f,24f);drawnScript=script.serial}
        shape.projectionMatrix=view.camera.combined;shape.begin(ShapeRenderer.ShapeType.Filled)
        shape.color=HudTheme.soot;shape.rect(bx,by,width,60f);shape.end()
        batch.projectionMatrix=view.camera.combined;batch.begin();scriptLayer.draw(batch);batch.end()
    }
    private fun drawCaption(){
        val value=audio.caption
        if(value!=drawnCaption){captions.clear();captions.setColor(HudTheme.bone);captions.wrapped(value,190f,177f,900f,26f);captions.addText("N / X: SKIP VOICE",190f,117f);drawnCaption=value}
        if(value.isEmpty())return
        shape.projectionMatrix=view.camera.combined;shape.begin(ShapeRenderer.ShapeType.Filled)
        shape.color=HudTheme.soot;shape.rect(175f,98f,930f,105f);shape.end()
        batch.projectionMatrix=view.camera.combined;batch.begin();captions.draw(batch);batch.end()
    }
    private fun combatJson(id: Int): String {
        val c=world.combat;val weapon=c.selectedWeapon[id]
        return "{\"spectating\":${!activeSeat(id)},\"ability\":${world.abilities.json(id)},\"armingSeconds\":${c.armingSeconds},\"hp\":${c.health(id)},\"maxHp\":${c.maxHealth(id)},\"wrecked\":${c.wrecked(id)},\"weapon\":$weapon,\"weaponName\":\"${Weapons.all[weapon].id}\",\"ammo\":${c.ammo(id,weapon)},\"mines\":${c.ammo(id,Weapons.MINE)},\"heavyAmmo\":${c.ammo(id,Weapons.HAMMER)},\"scatterAmmo\":${c.ammo(id,Weapons.SCATTER)},\"cash\":${c.cashCollected[id]},\"sabotageTarget\":${c.sabotageTarget[id]},\"cooldownSeconds\":${c.cooldown(id,weapon)},\"mineCooldownSeconds\":${c.cooldown(id,Weapons.MINE)},\"damageEvents\":${c.damageEvents[id]},\"kills\":${c.kills[id]}}"
    }
    private fun updateQr() {
        if(server.pin==qrPin && server.address==qrAddress)return
        qrPin=server.pin; qrAddress=server.address; val url=server.pairingUrl(); addressLabel="http://${server.address}:${server.port}"
        qrUrl=url; qr?.dispose()
        val matrix=QRCodeWriter().encode(url,BarcodeFormat.QR_CODE,240,240,mapOf(EncodeHintType.MARGIN to 3))
        val pix=Pixmap(240,240,Pixmap.Format.RGBA8888)
        for(y in 0 until 240)for(x in 0 until 240)pix.drawPixel(x,y,if(matrix[x,y])0x0b141eff else 0xffffffff.toInt())
        qr=Texture(pix); pix.dispose()
    }
    override fun dispose() { if(::audio.isInitialized){logger("audio final "+audio.statsJson());audio.dispose()};server.stop(); storyArt.dispose();wheels.dispose();art.dispose();sceneryCanvas.dispose();qr?.dispose(); shape.dispose(); batch.dispose(); font.dispose(); large.dispose(); small.dispose() }
}
private const val LOBBY_PIXELS_PER_M=9.0
