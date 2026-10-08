package dev.deathride.tv

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.util.Log
import dev.deathride.game.audio.AppTrack

/** P14 (perf package only): one Android AudioTrack that writes zeros from resume to pause, so a silent arm can
 * tell whether any open app stream costs the platform audio pair, and whether a deep-buffer output avoids it.
 * Attributes are libGDX SoundPool's (USAGE_GAME, CONTENT_TYPE_SONIFICATION); nothing audible is ever written. */
class SilentTrack(private val mode: AppTrack) {
    private var track: AudioTrack?=null
    private var writer: Thread?=null
    @Volatile private var running=false

    fun resume() {
        if(track!=null)return
        val rate=AudioTrack.getNativeOutputSampleRate(AudioManager.STREAM_MUSIC)
        val channels=AudioFormat.CHANNEL_OUT_STEREO
        val encoding=AudioFormat.ENCODING_PCM_16BIT
        val min=AudioTrack.getMinBufferSize(rate,channels,encoding)
        val bytes=maxOf(min,rate*4*mode.minBufferMs/1000)
        val performance=if(mode==AppTrack.POWER_SAVING)AudioTrack.PERFORMANCE_MODE_POWER_SAVING else AudioTrack.PERFORMANCE_MODE_NONE
        val t=AudioTrack.Builder()
            .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
            .setAudioFormat(AudioFormat.Builder().setSampleRate(rate).setChannelMask(channels).setEncoding(encoding).build())
            .setBufferSizeInBytes(bytes).setTransferMode(AudioTrack.MODE_STREAM).setPerformanceMode(performance).build()
        track=t
        running=true
        t.play()
        // Blocking writes of zeros, a quarter of the buffer at a time, until pause stops the track.
        val zeros=ByteArray(maxOf(256,bytes/4) and 3.inv())
        writer=Thread({
            var written=0L
            while(running){
                val n=t.write(zeros,0,zeros.size)
                if(n<0){Log.i("DeathRide","silentTrack write error $n");break}
                written+=n
            }
            Log.i("DeathRide","silentTrack stopped bytesWritten=$written")
        },"DR.silentTrack").apply{start()}
        Log.i("DeathRide","silentTrack open mode=${mode.name} rate=$rate minBufferBytes=$min bufferBytes=$bytes bufferFrames=${t.bufferSizeInFrames} " +
            "performanceMode=${t.performanceMode} requestedMode=$performance device=${t.routedDevice?.let{"${it.type}/${it.productName}"}} session=${t.audioSessionId}")
    }

    fun pause() {
        val t=track?:return
        running=false
        t.pause();t.flush();t.stop() // stop() releases a blocked write
        writer?.join(1_000)
        t.release()
        track=null;writer=null
    }
}
