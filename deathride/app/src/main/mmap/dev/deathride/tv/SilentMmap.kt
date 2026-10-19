package dev.deathride.tv

import android.util.Log

/** P15 (perf package only): one AAudio output stream (exclusive unless [exclusive] is false, low latency, usage GAME,
 * content type SONIFICATION, PCM 16-bit stereo at 48 kHz) whose data callback writes zeros, from resume to pause.
 * It asks for the Stick's mmap_no_irq_out route, which bypasses the AudioFlinger mixer. This file and its library
 * (src/main/cpp) are compiled only into the debug build type of a build made with -PsilentMmap=true; MainActivity
 * reaches it by name, so no other build carries a path that opens the stream. Nothing audible is ever written. */
class SilentMmap(private val exclusive: Boolean): AppStream {
    private var handle=0L

    override fun resume() {
        if(handle!=0L)return
        handle=nativeOpen(exclusive)
        if(handle==0L)Log.i("DeathRide","silentMmap not open (see the line above)")
    }

    override fun pause() {
        if(handle==0L)return
        nativeClose(handle)
        handle=0L
    }

    private companion object {
        init {System.loadLibrary("drsilentmmap")}
        @JvmStatic external fun nativeOpen(exclusive: Boolean): Long
        @JvmStatic external fun nativeClose(handle: Long)
    }
}
