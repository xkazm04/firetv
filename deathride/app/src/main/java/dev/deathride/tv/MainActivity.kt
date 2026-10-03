package dev.deathride.tv

import android.os.Bundle
import android.view.WindowManager
import android.view.Choreographer
import android.os.Process
import android.util.Log
import com.badlogic.gdx.backends.android.AndroidApplication
import com.badlogic.gdx.backends.android.AndroidApplicationConfiguration
import dev.deathride.game.RaceGame

class MainActivity : AndroidApplication() {
    private var paced=false
    private var resumed=false
    private val frameCallback=object: Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if(!resumed || !paced)return
            graphics.requestRendering()
            Choreographer.getInstance().postFrameCallback(this)
        }
    }
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val config = AndroidApplicationConfiguration().apply { useAccelerometer = false; useCompass = false; useGyroscope = false; useImmersiveMode = true; numSamples = 2; maxSimultaneousSounds = 8 }
        // Explicit diagnostic variants; defaults retain the measured production behavior.
        paced=intent.getStringExtra("pacing")=="vsync"
        if(intent.getStringExtra("resolution")=="720")config.resolutionStrategy=com.badlogic.gdx.backends.android.surfaceview.FixedResolutionStrategy(1280,720)
        initialize(RaceGame({ name -> assets.open(name).bufferedReader().use { it.readText() } }, { message -> Log.i("DeathRide", message) }, fontFactory=::nativeFont,serverPort=resources.getInteger(R.integer.race_port),profilePlatform=if(intent.getBooleanExtra("profile",false))AndroidProfile() else null,cacheRoadMarks=intent.getStringExtra("roadMarks")!="immediate"), config)
        if(paced)graphics.isContinuousRendering=false
        if(intent.getStringExtra("renderPriority")=="display")postRunnable{Process.setThreadPriority(Process.THREAD_PRIORITY_DISPLAY)}
        Log.i("DeathRide","renderVariant pacing=${if(paced)"vsync" else "continuous"} resolution=${intent.getStringExtra("resolution")?:"native"} priority=${intent.getStringExtra("renderPriority")?:"normal"}")
    }
    override fun onResume(){super.onResume();resumed=true;if(paced)Choreographer.getInstance().postFrameCallback(frameCallback)}
    override fun onPause(){resumed=false;Choreographer.getInstance().removeFrameCallback(frameCallback);super.onPause()}
}
