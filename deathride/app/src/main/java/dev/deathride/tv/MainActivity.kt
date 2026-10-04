package dev.deathride.tv

import android.os.Bundle
import android.view.WindowManager
import android.view.Choreographer
import android.os.Process
import android.os.Trace
import java.util.concurrent.locks.LockSupport
import android.util.Log
import com.badlogic.gdx.backends.android.AndroidApplication
import com.badlogic.gdx.backends.android.AndroidApplicationConfiguration
import dev.deathride.game.RaceGame
import dev.deathride.game.TrackPreview

class MainActivity : AndroidApplication() {
    private var paced=false
    private var resumed=false
    private var aligned=false
    private var profiling=false
    private var frameOffsetNs=3_000_000L
    private var finalSpinNs=200_000L
    @Volatile private var renderDeadlineNs=0L
    private val frameGate=Runnable {
        if(profiling)Trace.beginSection("DR.pacingWait")
        val deadline=renderDeadlineNs
        var remaining=deadline-System.nanoTime()
        while(remaining>0){
            if(remaining>finalSpinNs)LockSupport.parkNanos(remaining-finalSpinNs)
            remaining=deadline-System.nanoTime()
        }
        if(profiling)Trace.endSection()
    }
    private var foregroundWifi: ForegroundWifi?=null
    private val frameCallback=object: Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if(!resumed || !paced)return
            if(profiling && android.os.Build.VERSION.SDK_INT>=29)Trace.setCounter("DR.vsyncLagUs",(System.nanoTime()-frameTimeNanos)/1000)
            if(aligned){renderDeadlineNs=frameTimeNanos+frameOffsetNs;postRunnable(frameGate)}else graphics.requestRendering()
            Choreographer.getInstance().postFrameCallback(this)
        }
    }
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val config = AndroidApplicationConfiguration().apply { useAccelerometer = false; useCompass = false; useGyroscope = false; useImmersiveMode = true; numSamples = 2; maxSimultaneousSounds = 8 }
        // Measured native-resolution default; alternative slots remain diagnostic.
        val pacing=intent.getStringExtra("pacing")?:"vsync"
        val renderPriority=intent.getStringExtra("renderPriority")?:"display"
        aligned=pacing=="aligned";paced=aligned || pacing=="vsync"
        profiling=intent.getBooleanExtra("profile",false)
        frameOffsetNs=((intent.getStringExtra("frameSlotMs")?.toIntOrNull()?:3).coerceIn(2,8))*1_000_000L
        finalSpinNs=((intent.getStringExtra("frameSpinUs")?.toIntOrNull()?:200).coerceIn(0,500))*1000L
        if(intent.getStringExtra("wifiLatency")=="low")foregroundWifi=ForegroundWifi(this)
        if(intent.getStringExtra("resolution")=="720")config.resolutionStrategy=com.badlogic.gdx.backends.android.surfaceview.FixedResolutionStrategy(1280,720)
        val preview=if(applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE !=0 && packageName=="dev.deathride.tracks")intent.getStringExtra("trackPreview")?.let { id ->
            require(id.matches(Regex("[a-z]+-[1-7]-[abc]")))
            TrackPreview.read(java.io.File(filesDir,"track-previews/$id.json").readText())
        }else null
        initialize(RaceGame({ name -> assets.open(name).bufferedReader().use { it.readText() } }, { message -> Log.i("DeathRide", message) }, fontFactory=::nativeFont,serverPort=resources.getInteger(R.integer.race_port),profilePlatform=if(intent.getBooleanExtra("profile",false))AndroidProfile() else null,cacheRoadMarks=intent.getStringExtra("roadMarks")!="immediate",trackPreview=preview), config)
        // Apply after the GL thread is created, keeping its startup priority independent.
        if(intent.getStringExtra("callbackPriority")=="display")Process.setThreadPriority(Process.THREAD_PRIORITY_DISPLAY)
        if(paced)graphics.isContinuousRendering=false
        if(renderPriority=="display")postRunnable{Process.setThreadPriority(Process.THREAD_PRIORITY_DISPLAY)}
        Log.i("DeathRide","renderVariant pacing=$pacing slotNs=${if(aligned)frameOffsetNs else 0} spinNs=${if(aligned)finalSpinNs else 0} callbackPriority=${intent.getStringExtra("callbackPriority")?:"normal"} resolution=${intent.getStringExtra("resolution")?:"native"} priority=$renderPriority")
    }
    override fun onResume(){super.onResume();resumed=true;foregroundWifi?.resume();if(paced)Choreographer.getInstance().postFrameCallback(frameCallback)}
    override fun onPause(){resumed=false;Choreographer.getInstance().removeFrameCallback(frameCallback);foregroundWifi?.pause();super.onPause()}
}
