package dev.telestrator.tv.voiceprobe

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.SystemClock
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import android.view.Gravity
import android.view.KeyEvent
import android.widget.TextView
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.Locale

/**
 * Throwaway probe for the native voice stack (docs/concepts/NATIVE-VOICE-STACK.md). Debug builds only.
 *
 * It answers two device questions and nothing else: does Android TextToSpeech speak the desk's lines on this
 * Stick (and how fast), and does a third-party app get a SpeechRecognizer on the remote's mic.
 *
 * SELECT starts the run; the recognizer endpoints itself. The report is written to voice-probe.json in the app's
 * external files dir and echoed to logcat (tag VoiceProbe). Absent value = key omitted; firstAudioMs[i] is -1 for a
 * line that never started (pass one at rate 1.0, then pass two at 0.85).
 */
class VoiceProbeActivity : Activity() {
    private lateinit var screen: TextView
    private var tts: TextToSpeech? = null
    private var recognizer: SpeechRecognizer? = null
    private val report = JSONObject()
    private val firstAudioMs = JSONArray()

    // Samples of what the desk says (desk/src/lib/desk/spoken.ts): a hint, an explanation, a verdict, an essay
    // summary, the break, and a Linga partner line. Fixed text: the probe never calls a model.
    private val lines = listOf(
        "Look at what the problem asks you to find. Which quantity is unknown?",
        "The verb is in the past tense because the action is finished.",
        "Number 5(b) is right.",
        "Your essay names its claim in the first paragraph, and the evidence follows.",
        "Time for a break.",
        "Hi! Could you tell me what you did at the weekend?",
    )
    private var started = false
    private var pass = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        screen = TextView(this).apply {
            textSize = 32f; gravity = Gravity.CENTER; setPadding(96, 96, 96, 96)
            text = "Voice probe\n\nPress SELECT to speak ${lines.size} lines twice, then listen once."
        }
        setContentView(screen)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        if (!started && (keyCode == KeyEvent.KEYCODE_DPAD_CENTER || keyCode == KeyEvent.KEYCODE_ENTER)) {
            started = true; run(); return true
        }
        return super.onKeyDown(keyCode, event)
    }

    private fun say(t: String) { runOnUiThread { screen.text = t }; Log.i(TAG, t) }

    private fun run() {
        report.put("device", "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL} api${android.os.Build.VERSION.SDK_INT}")
        val t0 = SystemClock.elapsedRealtime()
        say("Starting text to speech")
        tts = TextToSpeech(this) { status ->
            report.put("ttsReady", status == TextToSpeech.SUCCESS)
            report.put("ttsInitMs", SystemClock.elapsedRealtime() - t0)
            if (status != TextToSpeech.SUCCESS) { finishTts(); return@TextToSpeech }
            describeTts(); speakNext(0, 1.0f)
        }
    }

    private fun describeTts() {
        val t = tts ?: return
        report.put("engines", JSONArray().also { a -> t.engines.forEach { a.put(it.name) } })
        report.put("defaultEngine", t.defaultEngine)
        // >= 0 usable; -1 missing data; -2 not supported
        report.put("enUsSupport", t.setLanguage(Locale.US))
        val v = try { t.voices } catch (e: Exception) { null }
        report.put("voices", JSONArray().also { a ->
            v?.filter { it.locale.language == "en" }?.take(20)?.forEach { a.put("${it.name} q${it.quality} net=${it.isNetworkConnectionRequired}") }
        })
    }

    private fun speakNext(i: Int, rate: Float) {
        val t = tts ?: return
        if (i >= lines.size) {
            if (pass == 0) { pass = 1; speakNext(0, 0.85f) } else finishTts()
            return
        }
        t.setSpeechRate(rate)
        val asked = SystemClock.elapsedRealtime()
        t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(u: String?) { firstAudioMs.put(SystemClock.elapsedRealtime() - asked) }
            override fun onDone(u: String?) { runOnUiThread { speakNext(i + 1, rate) } }
            @Deprecated("Deprecated in Java")
            override fun onError(u: String?) { firstAudioMs.put(-1); runOnUiThread { speakNext(i + 1, rate) } }
        })
        say("Speaking ${i + 1}/${lines.size} at rate $rate")
        t.speak(lines[i], TextToSpeech.QUEUE_FLUSH, null, "p$pass-$i")
    }

    private fun finishTts() {
        report.put("firstAudioMs", firstAudioMs)
        tts?.shutdown(); tts = null
        listen()
    }

    private fun listen() {
        val avail = SpeechRecognizer.isRecognitionAvailable(this)
        report.put("recognizerAvailable", avail)
        if (!avail) { done(); return }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            say("Grant the microphone to continue (or: adb shell pm grant dev.telestrator.tv android.permission.RECORD_AUDIO)")
            requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), 1); return
        }
        val r = SpeechRecognizer.createSpeechRecognizer(this).also { recognizer = it }
        val t0 = SystemClock.elapsedRealtime()
        r.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(p: Bundle?) { say("LISTENING: say a short sentence") }
            override fun onResults(b: Bundle?) {
                val best = b?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()
                if (best != null) report.put("recognizerResult", best)
                report.put("recognizerMs", SystemClock.elapsedRealtime() - t0); done()
            }
            override fun onError(code: Int) { report.put("recognizerError", code); done() }
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rms: Float) {}
            override fun onBufferReceived(buf: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onPartialResults(p: Bundle?) {}
            override fun onEvent(t: Int, p: Bundle?) {}
        })
        r.startListening(
            Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US"),
        )
    }

    override fun onRequestPermissionsResult(code: Int, perms: Array<out String>, grants: IntArray) {
        if (grants.firstOrNull() == PackageManager.PERMISSION_GRANTED) listen()
        else { report.put("recognizerError", "permission denied"); done() }
    }

    private fun done() {
        recognizer?.destroy(); recognizer = null
        val json = report.toString(2)
        try { File(getExternalFilesDir(null), "voice-probe.json").writeText(json) } catch (e: Exception) { Log.w(TAG, "report not written", e) }
        Log.i(TAG, json)
        say("Done. Report: Android/data/dev.telestrator.tv/files/voice-probe.json\n\n$json")
    }

    override fun onDestroy() { tts?.shutdown(); recognizer?.destroy(); super.onDestroy() }

    private companion object { const val TAG = "VoiceProbe" }
}
