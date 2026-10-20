package dev.studydesk.stick

import android.app.Activity
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executors

/**
 * One fullscreen WebView on the desk's /tv page. Every remote button keys.ts knows goes to the page as a keyboard
 * event (KeyBridge); Back leaves the app only when the page does not take it, or when it is held.
 *
 * Before the page, the stick finds its desk (Desk.kt): it probes the kept address, else the default, with GET
 * /api/session; if nothing answers it searches its own /24, and if that finds nothing it asks for host:port on a
 * setup screen driven by the D-pad. A desk that answers but does not take the stick for its TV gets the pairing
 * screen. While the page is shown a heartbeat probes the desk; when it stops answering the error screen comes up and
 * retries by itself, and the page comes back when the desk does.
 *
 * Point it and pair it (once): adb shell am start -n dev.studydesk.stick/.StickActivity --es url "'http://HOST:PORT/tv?key=...'"
 * The key opens /tv once, so the desk sets its httpOnly desk-tv cookie in the WebView; only host:port is kept, and
 * never a localhost one (an adb-reverse tunnel is gone when the walk ends).
 */
class StickActivity : Activity() {
    private lateinit var web: WebView
    private lateinit var panel: LinearLayout
    private lateinit var kicker: TextView
    private lateinit var title: TextView
    private lateinit var address: TextView
    private lateinit var body: TextView
    /** The one command the operator types, on the pairing screen: monospace, on one line. */
    private lateinit var code: TextView
    private lateinit var row: LinearLayout
    private lateinit var footer: TextView

    private val main = Handler(Looper.getMainLooper())
    private val io = Executors.newSingleThreadExecutor()
    private val clock = SimpleDateFormat("HH:mm:ss", Locale.ROOT)

    private enum class Mode { SEARCHING, WEB, DOWN, UNPAIRED, SETUP }
    private var mode = Mode.SEARCHING
    private var desk = Address.DEFAULT
    private var source = Source.DEFAULT
    /** The TV key from the intent: in memory only, used once to open /tv?key= (the cookie is what lasts). */
    private var key: String? = null
    private var scanned = false
    private var why = ""
    /** Bumped whenever the stick changes its mind, so an answer to an older question is dropped. */
    private var gen = 0
    private var busy = false
    private var lastTry = ""
    /** The screen Back returns to from the setup screen, when the setup was asked for (Change address). */
    private var cameFrom: Mode? = null

    private val recovery = Recovery()
    private val heartbeat = Heartbeat()
    private val stops = Choice(listOf("Retry", "Change address"))
    private var picker = AddressPicker.from(null, null)

    private var backDownAt = -1L
    private var backHeld = false

    private val tick = Runnable { onTick() }

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
                override fun onPageFinished(view: WebView, url: String) {
                    view.evaluateJavascript(KeyBridge.STAGE_ONLY, null)
                    // the desk has set its cookie by now (proxy.ts redirects /tv?key= to /tv): keep it, forget the key
                    if (mode == Mode.WEB && url.startsWith(desk.tv())) { key = null; CookieManager.getInstance().flush() }
                }
                override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                    if (request.isForMainFrame && mode == Mode.WEB) apply(Step.Down(desk, "the page did not load (${error.description})"))
                }
                override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, response: WebResourceResponse) {
                    if (request.isForMainFrame && mode == Mode.WEB && response.statusCode >= 500) apply(Step.Down(desk, "the desk answered HTTP ${response.statusCode}"))
                }
            }
        }
        CookieManager.getInstance().setAcceptCookie(true)

        fun text(sp: Float, color: Int, bold: Boolean = false) = TextView(this).apply {
            setTextColor(color)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, sp)
            if (bold) typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER_HORIZONTAL
            setLineSpacing(0f, 1.15f)
        }
        kicker = text(16f, DIM, bold = true).apply { letterSpacing = 0.2f; text = "STUDY DESK" }
        title = text(34f, INK, bold = true)
        address = text(24f, AMBER).apply { typeface = Typeface.MONOSPACE }
        body = text(20f, INK)
        code = text(13f, AMBER).apply { typeface = Typeface.MONOSPACE }
        row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER }
        footer = text(16f, DIM)
        panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(PANEL)
            setPadding(120, 64, 120, 64)
            fun gap(v: View, top: Int) = addView(v, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = top })
            gap(kicker, 0); gap(title, 20); gap(address, 20); gap(body, 24); gap(code, 16); gap(row, 40); gap(footer, 40)
        }
        setContentView(FrameLayout(this).apply {
            addView(web, FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
            addView(panel, FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT)
        })
        point(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        // the launcher tile on a running desk only brings it forward; a new address reloads
        if (intent.hasExtra(EXTRA_URL)) point(intent)
    }

    override fun onStart() { super.onStart(); schedule() }
    override fun onStop() { main.removeCallbacks(tick); super.onStop() }
    override fun onDestroy() { io.shutdownNow(); super.onDestroy() }

    /**
     * The address: the intent's `url` (host:port, or the TV link with its key), else the kept desk, else the default.
     * A kept address from before this build (the whole link, a localhost tunnel among them) is read once and dropped.
     */
    private fun point(intent: Intent?) {
        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        prefs.getString(OLD_URL, null)?.let { old ->
            val p = Address.parse(old)
            val e = prefs.edit().remove(OLD_URL)
            if (p != null && Address.keepable(p.desk)) e.putString(KEPT, p.desk.label)
            e.apply()
            Log.i(TAG, "dropped the old kept link ${redact(old)}${if (p != null && Address.keepable(p.desk)) ", kept ${p.desk.label}" else " (loopback, not kept)"}")
        }
        val given = intent?.getStringExtra(EXTRA_URL)?.trim()
        if (!given.isNullOrEmpty()) {
            val p = Address.parse(given)
            if (p == null) {
                Log.i(TAG, "the given address is not one: ${redact(given)}")
                showSetup("The address given from the computer is not one the stick can use: ${redact(given)}")
                return
            }
            start(p.desk, Source.GIVEN, p.key)
            return
        }
        val kept = Address.parse(prefs.getString(KEPT, null))?.desk?.takeIf(Address::keepable)
        if (kept != null) start(kept, Source.SAVED, null) else start(Address.DEFAULT, Source.DEFAULT, null)
    }

    private fun start(d: Desk, s: Source, k: String?) {
        gen++
        desk = d; source = s; key = k; scanned = false; busy = false; cameFrom = null
        recovery.reset(); heartbeat.reset()
        Log.i(TAG, "trying ${d.label} ($s${if (k != null) ", with a key" else ""})")
        showSearching("Trying ${d.origin}")
        probe { apply(Plan.afterProbe(d, it, s, key, scanned)) }
    }

    private fun probe(then: (Probe) -> Unit) {
        val g = gen
        val d = desk
        val cookie = CookieManager.getInstance().getCookie(d.origin)
        busy = true
        io.execute {
            val p = DeskNet.probe(d, cookie)
            main.post {
                if (g != gen) return@post
                busy = false
                lastTry = clock.format(Date()) + ": " + when (p) { is Probe.Answered -> "the desk answered"; is Probe.Failed -> p.why }
                Log.i(TAG, "probe ${d.label}: $p")
                then(p)
            }
        }
    }

    private fun scan(quiet: Boolean) {
        val g = gen
        val d = desk
        val s = source
        scanned = true
        busy = true
        if (!quiet) showSearching("Nothing answered at ${d.origin}.\nSearching this network for a desk...")
        Log.i(TAG, "searching the LAN for a desk (stick at ${DeskNet.localIPv4()})")
        io.execute {
            val found = DeskNet.scan(d) { CookieManager.getInstance().getCookie(it.origin) }
            main.post {
                if (g != gen) return@post
                busy = false
                Log.i(TAG, "search found ${found.map { "${it.first.label}=${it.second.viewer}" }}")
                val step = Plan.afterScan(d, found, s, why.ifEmpty { "it did not answer" })
                if (step is Step.Open || step is Step.Unpaired) {
                    val at = (step as? Step.Open)?.desk ?: (step as Step.Unpaired).desk
                    desk = at; source = Source.FOUND
                }
                if (quiet && step is Step.Down) render() else apply(step)
            }
        }
    }

    private fun apply(step: Step) {
        Log.i(TAG, "step $step".replace(Regex("key=[^,)]+"), "key=…"))
        when (step) {
            is Step.Open -> {
                keep(step.desk)
                mode = Mode.WEB
                heartbeat.reset()
                panel.visibility = View.GONE
                web.loadUrl(step.desk.tv(step.key))
            }
            is Step.Unpaired -> { keep(step.desk); show(Mode.UNPAIRED) }
            is Step.Scan -> scan(quiet = false)
            is Step.Down -> { why = step.why; if (mode == Mode.WEB) web.stopLoading(); show(Mode.DOWN) }
            is Step.Setup -> showSetup(step.why)
        }
        schedule()
    }

    /** Only an address that answered as a desk is kept, and never a loopback one. */
    private fun keep(d: Desk) {
        if (!Address.keepable(d)) return
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(KEPT, d.label).remove(OLD_URL).apply()
    }

    /** Every tick: the heartbeat while the page is shown, a retry while the error or pairing screen waits. */
    private fun schedule() {
        main.removeCallbacks(tick)
        when (mode) {
            Mode.WEB -> main.postDelayed(tick, BEAT_MS)
            Mode.DOWN, Mode.UNPAIRED -> main.postDelayed(tick, RETRY_MS)
            else -> {}
        }
    }

    private fun onTick() {
        if (busy) { schedule(); return }
        when (mode) {
            Mode.WEB -> probe { p ->
                when {
                    // the key was not the desk's, or the desk minted a new one: the page is a guest's, so ask for the key
                    p is Probe.Answered && p.viewer != "tv" -> apply(Step.Unpaired(desk))
                    heartbeat.beat(p) -> apply(Step.Down(desk, (p as Probe.Failed).why))
                    else -> schedule()
                }
            }
            Mode.DOWN, Mode.UNPAIRED -> {
                if (recovery.tick() && source != Source.GIVEN && source != Source.PICKED) { scan(quiet = true); schedule(); return }
                probe { p ->
                    when {
                        p is Probe.Answered && (p.viewer == "tv" || key != null) -> apply(Step.Open(desk, if (p.viewer == "tv") null else key))
                        p is Probe.Answered -> apply(Step.Unpaired(desk))
                        mode == Mode.UNPAIRED -> apply(Step.Down(desk, (p as Probe.Failed).why))
                        else -> { why = (p as Probe.Failed).why; render() ; schedule() }
                    }
                }
            }
            else -> {}
        }
    }

    // -- the screens

    private fun showSearching(line: String) {
        mode = Mode.SEARCHING
        title.text = "Looking for the desk"
        address.text = line
        body.text = ""
        code.text = ""
        row.removeAllViews()
        footer.text = "Back: leave"
        panel.visibility = View.VISIBLE
    }

    private fun show(m: Mode) {
        val was = mode
        mode = m
        if (was != m) stops.reset()
        render()
        panel.visibility = View.VISIBLE
    }

    private fun showSetup(line: String) {
        cameFrom = if (mode == Mode.DOWN || mode == Mode.UNPAIRED) mode else null
        mode = Mode.SETUP
        main.removeCallbacks(tick)
        picker = AddressPicker.from(desk, DeskNet.localIPv4())
        why = line
        render()
        panel.visibility = View.VISIBLE
    }

    private fun render() {
        row.removeAllViews()
        code.text = ""
        when (mode) {
            Mode.DOWN -> {
                title.text = "The desk is not answering"
                address.text = "Tried ${desk.origin}"
                body.text = "${why.replaceFirstChar { it.uppercase() }}.\n\nIs the desk running on the computer, and is the stick on the same Wi-Fi?"
                stopsRow()
                footer.text = "The stick tries again by itself every ${RETRY_MS / 1000} s and opens the desk when it answers." +
                    (if (lastTry.isNotEmpty()) "\nLast try $lastTry" else "") + "\nBack: leave"
            }
            Mode.UNPAIRED -> {
                title.text = "Found the desk. This stick is not its TV yet"
                address.text = "${desk.origin} answered"
                body.text = "On the computer, copy the TV: line the desk printed when it started, and run once:"
                code.text = "adb shell am start -n dev.studydesk.stick/.StickActivity --es url \"'${desk.origin}/tv?key=...'\""
                stopsRow()
                footer.text = "The key stays on the computer; the desk gives this stick its TV cookie when the link is opened." +
                    (if (lastTry.isNotEmpty()) "\nLast try $lastTry" else "") + "\nBack: leave"
            }
            Mode.SETUP -> {
                title.text = "Where is the desk?"
                address.text = "Will try ${picker.desk().origin}"
                body.text = "$why\n\nEnter the computer's address with the remote."
                pickerRow()
                footer.text = "Up/Down: change    Left/Right: move    Select: connect    Back: " + if (cameFrom != null) "return" else "leave"
            }
            else -> {}
        }
    }

    private fun stopsRow() = stops.stops.forEachIndexed { i, s -> row.addView(chip(s, i == stops.at, 28f), chipParams()) }

    private fun pickerRow() {
        picker.octets.forEachIndexed { i, o ->
            if (i > 0) row.addView(glyph("."))
            row.addView(chip(o.toString().padStart(3, ' '), picker.field == i, 34f, mono = true), chipParams(4))
        }
        row.addView(glyph(":"))
        row.addView(chip(picker.port.toString(), picker.field == 4, 34f, mono = true), chipParams(4))
    }

    private fun chip(label: String, lit: Boolean, sp: Float, mono: Boolean = false) = TextView(this).apply {
        text = label
        setTextSize(TypedValue.COMPLEX_UNIT_SP, sp)
        typeface = if (mono) Typeface.create(Typeface.MONOSPACE, Typeface.BOLD) else Typeface.DEFAULT_BOLD
        setTextColor(if (lit) PANEL else INK)
        setPadding(40, 18, 40, 18)
        background = GradientDrawable().apply {
            cornerRadius = 18f
            setColor(if (lit) AMBER else CHIP)
            if (!lit) setStroke(3, DIM)
        }
    }

    private fun glyph(s: String) = TextView(this).apply { text = s; setTextColor(INK); setTextSize(TypedValue.COMPLEX_UNIT_SP, 34f) }
    private fun chipParams(side: Int = 20) = LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { setMargins(side, 0, side, 0) }

    // -- the remote

    override fun dispatchKeyEvent(e: KeyEvent): Boolean {
        val k = KeyBridge.pageKeyOf(e.keyCode) ?: return super.dispatchKeyEvent(e)
        if (mode != Mode.WEB) return onPanelKey(e)
        if (e.keyCode == KeyEvent.KEYCODE_BACK) return onBack(e, k)
        if (e.action == KeyEvent.ACTION_DOWN) toPage(k, null)
        return true
    }

    /** Back goes to the page on release; held (the system's long press, or BACK_HOLD_MS) it leaves at once, whatever the page would do. */
    private fun onBack(e: KeyEvent, k: PageKey): Boolean {
        when (e.action) {
            KeyEvent.ACTION_DOWN -> {
                if (e.repeatCount == 0) { backDownAt = e.eventTime; backHeld = false }
                else if (!backHeld && backDownAt >= 0 && (e.isLongPress || e.eventTime - backDownAt >= KeyBridge.BACK_HOLD_MS)) {
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

    /**
     * The error, pairing and setup screens. Back leaves, as on the page (from a setup asked for, it returns). The arrows
     * act on press, repeating while held (an octet runs up fast); Select acts on release.
     */
    private fun onPanelKey(e: KeyEvent): Boolean {
        val code = e.keyCode
        val select = code == KeyEvent.KEYCODE_DPAD_CENTER || code == KeyEvent.KEYCODE_ENTER || code == KeyEvent.KEYCODE_NUMPAD_ENTER
        if (code == KeyEvent.KEYCODE_BACK) {
            if (e.action == KeyEvent.ACTION_UP && !e.isCanceled) {
                val back = cameFrom
                if (mode == Mode.SETUP && back != null) { Log.i(TAG, "setup: back"); show(back); schedule() } else finish()
            }
            return true
        }
        if (mode == Mode.SETUP) {
            if (select) { if (e.action == KeyEvent.ACTION_UP) start(picker.desk(), Source.PICKED, null); return true }
            if (e.action != KeyEvent.ACTION_DOWN) return true
            when (code) {
                KeyEvent.KEYCODE_DPAD_UP -> picker.up()
                KeyEvent.KEYCODE_DPAD_DOWN -> picker.down()
                KeyEvent.KEYCODE_DPAD_LEFT -> picker.left()
                KeyEvent.KEYCODE_DPAD_RIGHT -> picker.right()
                else -> return true
            }
            render()
            return true
        }
        if (mode != Mode.DOWN && mode != Mode.UNPAIRED) return true
        if (select) {
            if (e.action != KeyEvent.ACTION_UP) return true
            Log.i(TAG, "${mode.name.lowercase()}: ${stops.current}")
            if (stops.at == 0) start(desk, source, key) else showSetup("The desk was last tried at ${desk.label}.")
            return true
        }
        if (e.action != KeyEvent.ACTION_DOWN) return true
        when (code) {
            KeyEvent.KEYCODE_DPAD_LEFT, KeyEvent.KEYCODE_DPAD_UP -> stops.prev()
            KeyEvent.KEYCODE_DPAD_RIGHT, KeyEvent.KEYCODE_DPAD_DOWN -> stops.next()
            else -> return true
        }
        render()
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
        private const val PREFS = "stick"
        /** The kept desk, host:port only. */
        private const val KEPT = "desk"
        /** What builds before this one kept: the whole link, key and all (a localhost tunnel, on the walk's stick). */
        private const val OLD_URL = "url"
        private const val BEAT_MS = 10_000L
        private const val RETRY_MS = 5_000L

        private val INK = Color.rgb(232, 228, 216)
        private val DIM = Color.rgb(140, 138, 130)
        private val AMBER = Color.rgb(232, 178, 74)
        private val PANEL = Color.rgb(20, 22, 28)
        private val CHIP = Color.rgb(40, 44, 54)

        private fun redact(s: String) = s.replace(Regex("key=[^&#\\s']+"), "key=…")
    }
}
