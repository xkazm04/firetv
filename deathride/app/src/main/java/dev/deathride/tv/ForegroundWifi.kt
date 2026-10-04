package dev.deathride.tv

import android.content.Context
import android.net.wifi.WifiManager
import android.os.Build
import android.util.Log

/** Activity-scoped experiment; does not change the saved network configuration. */
class ForegroundWifi(context: Context) {
    private val manager=context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private var lock: WifiManager.WifiLock?=null
    fun resume(){
        if(lock?.isHeld==true)return
        val mode=if(Build.VERSION.SDK_INT>=29)WifiManager.WIFI_MODE_FULL_LOW_LATENCY else WifiManager.WIFI_MODE_FULL_HIGH_PERF
        try {
            val next=manager.createWifiLock(mode,"DeathRide:controllers")
            next.setReferenceCounted(false);next.acquire();lock=next
            Log.i("DeathRide","wifiLatency mode=$mode held=${next.isHeld}")
        }catch(e: RuntimeException){Log.w("DeathRide","wifiLatency unavailable: ${e.javaClass.simpleName}")}
    }
    fun pause(){lock?.let{if(it.isHeld)it.release()};lock=null;Log.i("DeathRide","wifiLatency released")}
}
