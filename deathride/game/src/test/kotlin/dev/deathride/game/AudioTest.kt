package dev.deathride.game

import dev.deathride.game.audio.*
import dev.deathride.core.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File
import java.security.MessageDigest

private class RecordingAudio: AudioBackend {
    data class Playback(val cue: Cue,var gain: Float,var pitch: Float,var pan: Float)
    val active=linkedMapOf<Long,Playback>()
    val starts=mutableListOf<String>()
    val stopped=mutableListOf<Long>()
    var maximum=0
    var next=0L
    var disposed=false
    var unavailable=false
    override fun prepare(cue: Cue)=!unavailable && cue.path.isNotEmpty()
    override fun start(cue: Cue,gain: Float,pitch: Float,pan: Float): Long {
        val id=++next;active[id]=Playback(cue,gain,pitch,pan);starts.add(cue.id);maximum=maxOf(maximum,active.size);return id
    }
    override fun parameters(handle: Long,gain: Float,pitch: Float,pan: Float){active[handle]?.let{it.gain=gain;it.pitch=pitch;it.pan=pan}}
    override fun stop(handle: Long){active.remove(handle);stopped.add(handle)}
    override fun dispose(){disposed=true;active.clear()}
}

class AudioTest {
    private fun cue(id: String,priority: Int=1,group: String="all",bus: String="effects",loop: Boolean=false,
                    cooldown: Int=0,seconds: Double=2.0,path: String="audio/test.wav",spatial: Boolean=false)=
        Cue(id,bus,group,priority,cooldown,loop,seconds,spatial,1f,path,100,.5f,2f,caption="Caption for $id")
    private fun manifest(vararg cues: Cue,caps: Map<String,Int> = mapOf("all" to 8,"voice" to 1,"critical" to 1))=
        CueManifest(cues.associateBy{it.id},8,1024,caps,mapOf("master" to 1f,"effects" to 1f,"engines" to 1f,"music" to 1f,"voice" to 1f,"ui" to 1f))

    @Test fun eightVoicesIncludesMusicAndStealsBeforeStarting(){
        val data=(0..8).map{cue("low$it",0)}+cue("tell",3,group="critical")+cue("music",0,bus="music").copy(stream=true)
        val backend=RecordingAudio();val service=CueService(manifest(*data.toTypedArray()),backend)
        assertTrue(service.play("music"))
        repeat(7){assertTrue(service.play("low$it"))}
        assertFalse(service.play("low8"))
        assertTrue(service.play("tell"))
        assertEquals(8,service.activeVoices);assertEquals(8,backend.maximum)
        assertEquals(1,service.stolen);assertFalse(backend.active.values.any{it.cue.id=="music"})
        assertTrue(service.play("tell",eventId=99)) // critical onset replaces old tell
        assertEquals(8,backend.maximum)
        service.dispose();assertTrue(backend.active.isEmpty());assertTrue(backend.disposed)
    }
    @Test fun identitiesCooldownAndGroupCapsSuppressWithoutAQueue(){
        val backend=RecordingAudio();val service=CueService(manifest(cue("shot",cooldown=100,seconds=.04),cue("voice",group="voice",bus="voice")),backend)
        assertTrue(service.play("shot",eventId=77));assertFalse(service.play("shot",eventId=77))
        assertFalse(service.play("shot",eventId=78));service.update(.15)
        assertFalse(service.play("shot",eventId=78)) // dropped identity cannot return later
        assertTrue(service.play("shot",eventId=79));assertTrue(service.play("voice"));assertFalse(service.play("voice",emitter=1))
        service.update(5.0);assertEquals(0,service.activeVoices)
        assertEquals(listOf("shot","shot","voice"),backend.starts)
    }
    @Test fun missingCueCannotStealAndMutedNarrationStillHasText(){
        val backend=RecordingAudio();val service=CueService(manifest(cue("bed",0,loop=true),cue("missing",3,path=""),cue("voice",bus="voice",group="voice",path="")),backend)
        assertTrue(service.play("bed"));assertFalse(service.play("missing"));assertEquals(1,service.activeVoices)
        service.setGain("master",0f);assertEquals(0,service.activeVoices)
        assertFalse(service.narrate("voice"));assertEquals("Caption for voice",service.caption)
        service.skipNarration();assertEquals("",service.caption)
        service.setGain("master",1f);assertEquals(0,service.activeVoices)
        service.pause();assertFalse(service.play("bed"));service.resume();assertTrue(service.play("bed"))
        service.sceneChanged();assertEquals(0,service.activeVoices)
    }
    @Test fun speechDucksMusicAndEngineAndRecoversWithoutRestart(){
        val backend=RecordingAudio();val service=CueService(manifest(cue("music",bus="music",seconds=10.0),
            cue("motor",bus="engines",loop=true),cue("speech",bus="voice",group="voice",seconds=.1)),backend)
        service.play("music");service.play("motor");service.play("speech");service.update(.06)
        assertEquals(.5012f,backend.active.values.first{it.cue.id=="music"}.gain,.001f)
        assertEquals(.7079f,backend.active.values.first{it.cue.id=="motor"}.gain,.001f)
        service.stopBus("voice");service.play("motor");service.update(.2);service.play("motor");service.update(.2)
        assertTrue(backend.active.values.first{it.cue.id=="music"}.gain>.85f)
        assertEquals(1,backend.starts.count{it=="music"})
    }
    @Test fun movingLoopsSlewPitchExpireWhenUntouchedAndRespectSpatialCutoff(){
        val backend=RecordingAudio();val service=CueService(manifest(cue("engine",loop=true,spatial=true)),backend)
        assertFalse(service.play("engine",x=61.0))
        assertTrue(service.play("engine",x=20.0,pitch=.5f))
        service.play("engine",x=20.0,pitch=2f);service.update(.05)
        val voice=backend.active.values.single();assertEquals(1.25f,voice.pitch,.001f);assertTrue(voice.pan>0)
        assertTrue(voice.gain in 0f..1f)
        service.update(.31);assertEquals(0,service.activeVoices)
        assertFalse(service.play("engine",gain=Float.NaN))
    }
    @Test fun pitchedOneShotsRetainTheirSlotUntilTheirActualDuration(){
        val backend=RecordingAudio();val service=CueService(manifest(cue("short",seconds=1.0)),backend)
        service.play("short",pitch=.5f);service.update(1.5);assertEquals(1,service.activeVoices)
        service.update(.61);assertEquals(0,service.activeVoices)
    }
    @Test fun deliveredManifestMatchesHashesBudgetsAndAllActualSignatures(){
        val raw=File("../assets/audio/cues.json").readText();val m=CueManifest.parse(raw)
        assertEquals(62,m.cues.size);assertEquals(8,m.maxVoices)
        assertTrue(AbilityCatalog.all.all{"ability.${it.id}" in m.cues})
        assertTrue(RaceAudioDirector.abilityCue(AbilityCatalog.dispatcher) in m.cues)
        val json=com.badlogic.gdx.utils.JsonReader().parse(raw)
        val shipped=json.get("cues").filter{it.getString("path").isNotEmpty()}
        for(r in shipped){
            val f=File("../assets",r.getString("path"));assertTrue(f.isFile,r.getString("id"))
            val hash=MessageDigest.getInstance("SHA-256").digest(f.readBytes()).joinToString(""){"%02x".format(it)}
            assertEquals(r.getString("sha256"),hash,r.getString("id"))
        }
        val bytes=shipped.distinctBy{it.getString("path")}.sumOf{it.getLong("decodedBytes")}
        assertTrue(bytes<=6*1024*1024)
        assertTrue(m.cues.getValue("voice.mechanic.seizure").path.isEmpty())
        assertTrue(m.cues.getValue("voice.mechanic.seizure").caption.isNotEmpty())
        assertThrows(IllegalArgumentException::class.java){CueManifest.parse(raw.replace("\"maxVoices\": 8","\"maxVoices\": 9"))}
        assertThrows(IllegalArgumentException::class.java){CueManifest.parse(raw.replace("audio/clips/engine.base.wav","../secret.wav"))}
    }
    @Test fun directorConsumesOnceFreezesCountdownAndDoesNotCallSpectatorsLosers(){
        val data=listOf("race.countdown","race.start","race.victory","race.defeat","weapon.rivet.fire").map{cue(it,seconds=.1)}
        val backend=RecordingAudio();val service=CueService(manifest(*data.toTypedArray()),backend);val director=RaceAudioDirector(service)
        val world=World(combatEnabled=true);director.bind(world)
        director.update(world,"countdown",false,3.0,.1);assertTrue(backend.starts.isEmpty())
        director.update(world,"countdown",true,3.0,.1);director.update(world,"countdown",true,2.8,.1)
        assertEquals(1,backend.starts.count{it=="race.countdown"})
        director.update(world,"countdown",true,2.0,1.0)
        assertEquals(2,backend.starts.count{it=="race.countdown"})
        director.sceneChanged("race")
        world.presentationEvents.emit(PresentationKind.FIRE,0,detail=Weapons.RIVET,x=0.0,y=0.0,seconds=world.seconds)
        director.update(world,"race",true,0.0,.1);director.update(world,"race",true,0.0,.1)
        assertEquals(1,backend.starts.count{it=="weapon.rivet.fire"})
        director.sceneChanged("results");director.results(world)
        assertFalse(backend.starts.any{it=="race.defeat" || it=="race.victory"})
    }

    private fun delivered()=CueManifest.parse(File("../assets/audio/cues.json").readText())
    // Explicit ledger fixture: reported wins, not a simulated full career.
    private fun profileAt(round: Int)=Profile("audio-fixture").also{p->
        repeat(round){Career.settle(p,Economy.start(p),p.careerRound,0,1,0,100.0,true,finished=true)}
    }

    @Test fun campaignSeizureSequenceKeepsHeldCaptionAndCancelsOnSkipPauseOrExit(){
        val backend=RecordingAudio();val service=CueService(delivered(),backend)
        val director=CampaignAudioDirector(service)
        val p=profileAt(34);DeathDuel.seize(p)
        director.careerOpened(p)
        assertEquals("voice.announcer.seizure",service.lastNarration)
        service.update(30.0)
        assertEquals("voice.mechanic.seizure",service.lastNarration)
        assertEquals(delivered().cues.getValue("voice.mechanic.seizure").caption,service.caption)
        assertFalse(backend.starts.contains("voice.mechanic.seizure")) // Held clip, real caption.
        service.update(30.0);assertEquals("voice.mechanic.rig",service.lastNarration)
        service.update(30.0);assertEquals("voice.mechanic.duel",service.lastNarration)
        for(cancel in listOf<()->Unit>({service.skipNarration()},{service.sceneChanged()},{service.pause();service.resume()})){
            director.careerOpened(p);val count=service.narrationCount;cancel();service.update(30.0)
            assertEquals(count,service.narrationCount);assertEquals("",service.caption)
        }
        service.setGain("master",0f);director.careerOpened(p);service.update(30.0);service.update(30.0)
        assertEquals("voice.mechanic.rig",service.lastNarration);assertTrue(service.caption.isNotEmpty())
        assertEquals(0,service.activeVoices)
    }

    @Test fun committedBossAndFinaleResultsReachNarrationButLossesAndDuplicateReceiptsDoNot(){
        val backend=RecordingAudio();val service=CueService(delivered(),backend);val director=CampaignAudioDirector(service)
        fun settle(before: Profile,win: Boolean): Profile {
            val p=before.copy();val ticket=Economy.start(p)
            Career.settle(p,ticket,p.careerRound,0,if(win)1 else 6,0,100.0,win,finished=win)
            director.settled(before,p);return p
        }
        val rook=profileAt(6)
        settle(rook,false);assertEquals(0,service.narrationCount)
        val ally=settle(rook,true);assertEquals(1,ally.campaign.rewards[0])
        assertEquals("voice.announcer.ally",service.lastNarration)
        service.sceneChanged();director.careerOpened(ally);service.update(30.0)
        assertEquals("voice.mechanic.ally",service.lastNarration)
        val count=service.narrationCount;director.settled(ally,ally.copy());assertEquals(count,service.narrationCount)
        val ox=profileAt(13)
        settle(ox,true);service.update(30.0);assertEquals("voice.mechanic.books",service.lastNarration)
        val final=profileAt(34);DeathDuel.seize(final)
        service.sceneChanged();val beforeLoss=service.narrationCount
        settle(final,false);assertEquals(beforeLoss,service.narrationCount)
        val won=settle(final,true);assertEquals(2,won.campaign.finale)
        assertEquals("voice.announcer.freedom",service.lastNarration)
        service.update(30.0);assertEquals("voice.mechanic.after",service.lastNarration)
    }

    @Test fun actualDeathDuelDispatchReachesAudioWithoutLapCuesOrChangingReplay(){
        fun duel()=World(701,combatEnabled=true).also{w->
            val p=profileAt(34)
            // Funded final-event fixture; the production rival preparation gate still runs.
            for(npc in p.rivalProfiles)Economy.settle(npc,Economy.start(npc),1,0,100.0,bonus=8000)
            Career.prepareRivals(w,0,p)
            for(c in w.cars){c.entered=c.id<2;c.human=true;CarCatalog.apply(c,DeathDuel.boss.carIndex)}
            w.reset()
        }
        val backend=RecordingAudio();val service=CueService(delivered(),backend);val director=RaceAudioDirector(service)
        val observed=duel();val silent=duel();director.bind(observed)
        director.update(observed,"countdown",false,3.0,.1)
        assertFalse(backend.starts.contains("voice.announcer.duel"))
        director.update(observed,"race",true,0.0,.01)
        assertEquals("voice.announcer.duel",service.lastNarration)
        val input=Array(6){InputFrame(.12,1.0)}
        repeat(1200){
            observed.step(input);silent.step(input)
            director.update(observed,"race",true,0.0,Tuning.STEP_SECONDS)
        }
        assertEquals(silent.stateHash(),observed.stateHash())
        assertTrue(observed.cars[0].ability.activation>0)
        assertTrue(backend.starts.contains("ability.bone-rack"))
        assertTrue(backend.starts.contains("weapon.mine.drop"))
        assertTrue(backend.starts.contains("weapon.mine.arm"))
        for(n in 0..160)observed.cars[0].lap.update(observed.track.startM+n*observed.track.lengthM/32)
        director.update(observed,"race",true,0.0,1.0)
        assertFalse(backend.starts.contains("race.lap"));assertFalse(backend.starts.contains("race.position"))
        assertEquals(1,backend.starts.count{it=="voice.announcer.duel"})
        val practice=World(combatEnabled=true);director.bind(practice);director.sceneChanged("countdown");director.sceneChanged("race")
        assertEquals(1,backend.starts.count{it=="voice.announcer.duel"})
    }
}
