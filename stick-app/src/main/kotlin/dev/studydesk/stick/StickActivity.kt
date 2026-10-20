package dev.studydesk.stick

import android.app.Activity
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.TextView

/**
 * One fullscreen WebView on the desk's /tv page. Every remote button keys.ts knows goes to the page as a keyboard
 * event (KeyBridge); Back leaves the app only when the page does not take it, or when it is held.
 *
 * Point it: adb shell am start -n dev.studydesk.stick/.StickActivity --es url http://HOST:PORT/tv?key=...
 * The address is kept, so the launcher tile opens the same desk next time.
 */
class StickActivity : Activity() {
    private lateinit var web: WebView
    private lateinit var notice: TextView
    private var url = DEFAULT_URL
    private var backDownAt = -1L
    private var backHeld = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        if (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0) WebView.setWebContentsDebuggingEnabled(true)

        web = WebView(this).apply {
            setBackgroundColor(Color.BLACK)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest) = false
                override fun onPageFinished(view: WebView, url: String) { view.evaluateJavascript(KeyBridge.STAGE_ONLY, null) }
                override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                    if (request.isForMainFrame) showNotice("Cannot reach the desk at $url\n(${error.description})")
                }
            }
        }
        notice = TextView(this).apply {
            setBackgroundColor(Color.rgb(20, 22, 28))
            setTextColor(Color.rgb(232, 228, 216))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 22f)
            gravity = Gravity.CENTER
            setPadding(96, 96, 96, 96)
            visibility = View.GONE
        }
        setContentView(FrameLayout(this).apply {
            addView(web, FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
            addView(notice, FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
        })
        point(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        // the launcher tile on a running desk only brings it forward; a new address reloads
        if (!intent.getStringExtra(EXTRA_URL).isNullOrBlank()) point(intent)
    }

    /** The address comes from the intent's `url` extra, else the one kept from last time, else the default. */
    private fun point(intent: Intent?) {
        val prefs = getSharedPreferences("stick", MODE_PRIVATE)
        val given = intent?.getStringExtra(EXTRA_URL)?.trim()
        if (!given.isNullOrEmpty()) prefs.edit().putString(EXTRA_URL, given).apply()
        url = prefs.getString(EXTRA_URL, null) ?: DEFAULT_URL
        Log.i(TAG, "loading $url")
        load()
    }

    private fun load() {
        notice.visibility = View.GONE
        web.loadUrl(url)
    }

    private fun showNotice(line: String) {
        notice.text = "$line\n\nSelect: try again    Back: leave\n\n" +
            "Point it from the computer:\nadb shell am start -n dev.studydesk.stick/.StickActivity --es url http://HOST:PORT/tv?key=..."
        notice.visibility = View.VISIBLE
    }

    override fun dispatchKeyEvent(e: KeyEvent): Boolean {
        val k = KeyBridge.pageKeyOf(e.keyCode) ?: return super.dispatchKeyEvent(e)
        if (notice.visibility == View.VISIBLE) return onNoticeKey(e)
        if (e.keyCode == KeyEvent.KEYCODE_BACK) return onBack(e, k)
        if (e.action == KeyEvent.ACTION_DOWN) toPage(k, null)
        return true
    }

    /** Back goes to the page on release; held past BACK_HOLD_MS it leaves at once, whatever the page would do. */
    private fun onBack(e: KeyEvent, k: PageKey): Boolean {
        when (e.action) {
            KeyEvent.ACTION_DOWN -> {
                if (e.repeatCount == 0) { backDownAt = e.eventTime; backHeld = false }
                else if (!backHeld && backDownAt >= 0 && e.eventTime - backDownAt >= KeyBridge.BACK_HOLD_MS) {
                    backHeld = true
                    Log.i(TAG, "Back held: leaving")
                    finish()
                }
            }
            KeyEvent.ACTION_UP -> {
                val pressed = backDownAt >= 0 && !backHeld && !e.isCanceled
                backDownAt = -1L
                if (pressed) toPage(k) { taken -> if (!taken) { Log.i(TAG, "Back not taken by the page: leaving"); finish() } }
            }
        }
        return true
    }

    private fun onNoticeKey(e: KeyEvent): Boolean {
        if (e.action != KeyEvent.ACTION_UP) return true
        when (e.keyCode) {
            KeyEvent.KEYCODE_BACK -> finish()
            KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER, KeyEvent.KEYCODE_NUMPAD_ENTER -> load()
        }
        return true
    }

    private fun toPage(k: PageKey, then: ((Boolean) -> Unit)?) {
        web.evaluateJavascript(KeyBridge.script(k)) { result ->
            val taken = result == "true"
            Log.i(TAG, "key ${k.key} taken=$taken")
            then?.invoke(taken)
        }
    }

    companion object {
        const val TAG = "StickKeys"
        const val EXTRA_URL = "url"
        /** The operator's desk: this computer's LAN address, the one port the firewall opens. */
        const val DEFAULT_URL = "http://10.0.0.141:3000/tv"
    }
}
