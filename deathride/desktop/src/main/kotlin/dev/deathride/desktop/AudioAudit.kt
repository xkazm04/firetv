package dev.deathride.desktop

import com.badlogic.gdx.ApplicationAdapter
import com.badlogic.gdx.Gdx
import dev.deathride.game.audio.*

/** Native host playback exercise; explicitly not a TV listening or memory verdict. */
class AudioAudit: ApplicationAdapter() {
    private lateinit var service: CueService
    private var seconds=0.0
    private var started=false
    private var stolen=false
    private var lifecycle=false
    private var gainChecked=false
    override fun create(){
        val delivered=CueManifest.parse(Gdx.files.internal("audio/cues.json").readString("UTF-8"))
        // Exercise the real Music decoder with a known short WAV, not a new song.
        val stream=delivered.cues.getValue("engine.base").copy(id="music.audit",bus="music",group="music",loop=false,spatial=false,stream=true,decodedBytes=0)
        val manifest=delivered.copy(cues=delivered.cues+(stream.id to stream))
        service=CueService(manifest,GdxAudioBackend(manifest.decodedBudgetBytes));service.preload()
    }
    override fun render(){
        val dt=Gdx.graphics.deltaTime.toDouble().coerceAtMost(.1);seconds+=dt
        if(seconds>.5 && !started){
            // 1 Music stream + 2 engines + 1 tyre + 2 weapons + 1 impact + 1 voice = 8.
            check(service.play("music.audit"))
            check(service.play("engine.base",0));check(service.play("engine.base",1))
            check(service.play("movement.drift"))
            check(service.play("weapon.hammer.hit",0));check(service.play("weapon.hammer.hit",1))
            check(service.play("collision.wall",0))
            check(service.narrate("voice.mechanic.welcome"))
            check(service.activeVoices==8);started=true
        }
        if(started && !stolen){check(service.play("ability.punch-lance"));check(service.stolen>0);check(service.activeVoices==8);stolen=true}
        if(started && seconds<1.5){service.play("engine.base",0);service.play("engine.base",1);service.play("movement.drift")}
        service.update(dt)
        check(service.activeVoices<=8)
        if(seconds>1.5 && !lifecycle){
            service.pause();check(service.activeVoices==0);check(service.caption.isEmpty());service.resume()
            service.setGain("master",0f);check(!service.narrate("voice.announcer.debt"));check(service.caption.isNotEmpty())
            service.skipNarration();check(service.caption.isEmpty());service.setGain("master",.8f)
            check(service.play("ui.confirm"));lifecycle=true
        }
        if(seconds>2.0 && !gainChecked){service.setGain("effects",0f);check(!service.play("weapon.rivet.fire"));gainChecked=true}
        if(seconds>2.5){
            check(service.highWater==8);check(service.missing==0L)
            val report="{\"result\":\"pass\",\"backend\":\"LWJGL3/OpenAL native host\",\"audio\":${service.statsJson()},\"notMeasured\":[\"physical Fire TV\",\"speaker masking\",\"human listening\",\"native PSS\"]}"
            Gdx.files.local(System.getenv("DEATHRIDE_AUDIO_AUDIT_OUTPUT")?:"audio/x3/runtime/desktop-audio.json").writeString(report+"\n",false,"UTF-8")
            println("DeathRide native audio audit $report");Gdx.app.exit()
        }
    }
    override fun dispose(){if(::service.isInitialized)service.dispose()}
}
