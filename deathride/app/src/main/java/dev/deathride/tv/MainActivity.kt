package dev.deathride.tv

import android.os.Bundle
import android.view.WindowManager
import android.util.Log
import com.badlogic.gdx.backends.android.AndroidApplication
import com.badlogic.gdx.backends.android.AndroidApplicationConfiguration
import dev.deathride.game.RaceGame

class MainActivity : AndroidApplication() {
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val config = AndroidApplicationConfiguration().apply { useAccelerometer = false; useCompass = false; useGyroscope = false; useImmersiveMode = true; numSamples = 2; maxSimultaneousSounds = 8 }
        initialize(RaceGame({ name -> assets.open(name).bufferedReader().use { it.readText() } }, { message -> Log.i("DeathRide", message) }, fontFactory=::nativeFont,serverPort=resources.getInteger(R.integer.race_port)), config)
    }
}
