package dev.telestrator.tv

import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import androidx.tv.material3.Text
import androidx.lifecycle.lifecycleScope
import dev.telestrator.core.PenMessage
import dev.telestrator.core.PlayerAction
import dev.telestrator.core.TransportPlan
import dev.telestrator.tv.transport.LanTransport
import dev.telestrator.tv.transport.PenTransport
import dev.telestrator.tv.transport.RelayTransport
import kotlinx.coroutines.delay

/** 10.0.2.2 is the development host as seen from inside the Android emulator. */
private const val DEFAULT_RELAY_WS = "ws://10.0.2.2:9787/tv"
private const val DEFAULT_RELAY_PHONE = "http://10.0.2.2:9787/"

@UnstableApi
class MainActivity : ComponentActivity() {

    private lateinit var session: Session
    private lateinit var transport: PenTransport
    private var thumbnailer: Thumbnailer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // A telestrator is watched, not touched: the viewer holds the phone, and the remote may
        // sit untouched through a whole play review. Fire OS reads that as idle and hands the
        // screen to its screensaver, which pauses this activity, takes the foreground and lets
        // the process be reclaimed - taking the pen session with it. Keeping the screen on is
        // the same promise a video player makes, and this app is one.
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        val clipUri = Uri.parse("android.resource://$packageName/${R.raw.fixture_clip}")
        session = Session(clipId = "fixture_clip", videoAspect = 16.0 / 9.0)
        thumbnailer = Thumbnailer(applicationContext, clipUri)

        val host = PenSessionHost(session, thumbnailer)
        transport = chooseTransport()
        transport.start(lifecycleScope) { channel -> host.host(channel) }
        // The viewer reads this off the QR card; the test harness reads it out of logcat, which
        // is the closest a script gets to looking at the television.
        android.util.Log.i("Telestrator", "transport=${transport.name} pairing=${transport.pairingUrl()}")

        setContent { TelestratorScreen(session, transport, clipUri) }
    }

    /**
     * Which way pens reach us. LAN by default; the relay is selected at launch so the same build
     * can be exercised both ways:
     *
     *   adb shell am start -n dev.telestrator.tv/.MainActivity
     *     --es transport relay
     *     --es relay_url ws://10.0.2.2:9787/tv
     *     --es phone_url http://HOST:9787/
     */
    private fun chooseTransport(): PenTransport {
        val requested = intent?.getStringExtra("transport") ?: "lan"
        if (requested != "relay") {
            return LanTransport(
                context = applicationContext,
                pin = session.pin,
                healthJson = { healthJson(session, "lan") },
            )
        }
        val relayUrl = intent?.getStringExtra("relay_url") ?: DEFAULT_RELAY_WS
        val phoneUrl = intent?.getStringExtra("phone_url") ?: DEFAULT_RELAY_PHONE
        return RelayTransport(
            relayWsUrl = relayUrl,
            phoneUrl = "$phoneUrl?pin=${session.pin}",
        )
    }

    override fun onDestroy() {
        transport.stop()
        thumbnailer?.release()
        super.onDestroy()
    }

    /**
     * Fire TV remote keys (Appendix B). The remote is the fallback path when no phone is paired,
     * and the only way to drive playback from an instrumented test via `adb shell input keyevent`.
     */
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        val cmd = when (keyCode) {
            KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER,
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> "toggle"
            KeyEvent.KEYCODE_MEDIA_FAST_FORWARD, KeyEvent.KEYCODE_DPAD_RIGHT -> "seek+"
            KeyEvent.KEYCODE_MEDIA_REWIND, KeyEvent.KEYCODE_DPAD_LEFT -> "seek-"
            KeyEvent.KEYCODE_DPAD_UP -> "undo"
            KeyEvent.KEYCODE_DPAD_DOWN -> "clear"
            else -> null
        }
        if (cmd != null) {
            session.accept(PenMessage.Transport(cmd))
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}

@UnstableApi
@Composable
private fun TelestratorScreen(session: Session, transport: PenTransport, clipUri: Uri) {
    val context = LocalContext.current
    val doc by session.doc.collectAsState()
    val command by session.transport.collectAsState()
    val transportFailure by transport.failure.collectAsState()
    var tMs by remember { mutableLongStateOf(0L) }
    var paused by remember { mutableStateOf(false) }
    var rate by remember { mutableStateOf(1.0f) }

    val player = remember {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(clipUri))
            repeatMode = Player.REPEAT_MODE_ALL
            prepare()
            playWhenReady = true
        }
    }

    DisposableEffect(Unit) { onDispose { player.release() } }

    // Publish the playhead at ~30 Hz: pen strokes anchor to whatever this says.
    LaunchedEffect(Unit) {
        while (true) {
            tMs = player.currentPosition
            session.mediaTimeMs = tMs
            session.publishIfDirty()
            session.paused = !player.isPlaying
            session.durationMs = player.duration.coerceAtLeast(0)
            paused = !player.isPlaying
            delay(33)
        }
    }

    // What a command means is decided in core (TransportPlan, JVM-tested); this only reads the
    // player and carries the actions out in order.
    LaunchedEffect(command) {
        val t = command ?: return@LaunchedEffect
        val positionMs = player.currentPosition
        val actions = TransportPlan.plan(
            cmd = t.cmd,
            value = t.value,
            positionMs = positionMs,
            durationMs = player.duration.coerceAtLeast(0),
            playing = player.isPlaying,
            doc = session.doc.value,
            undoAtMs = session.undoAt(positionMs),
            redoAtMs = session.redoAt(positionMs),
        )
        for (action in actions) {
            when (action) {
                PlayerAction.Play -> player.play()
                PlayerAction.Pause -> player.pause()
                is PlayerAction.SeekTo -> player.seekTo(action.positionMs)
                is PlayerAction.SetRate -> {
                    val r = action.rate.toFloat()
                    player.playbackParameters = PlaybackParameters(r)
                    session.rate = action.rate
                    rate = r
                }
                is PlayerAction.Edit -> session.edit(action.message)
            }
        }
    }

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = {
                PlayerView(it).apply {
                    useController = false
                    resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FIT
                    setPlayer(player)
                }
            },
        )

        TelestrationOverlay(
            doc = doc,
            tMs = tMs,
            modifier = Modifier.fillMaxSize().testTag("overlay"),
        )

        PairingCard(
            url = transport.pairingUrl() ?: "connecting…",
            transport = transport.name,
            failure = transportFailure,
            modifier = Modifier.align(Alignment.TopEnd).padding(24.dp),
        )

        // Machine-readable status line: the live UI test reads this instead of guessing.
        Text(
            text = "t=" + tMs + "ms " + (if (paused) "PAUSED" else "PLAY") +
                " x" + rate + " ink=" + doc.annotations.size + " via=" + transport.name,
            color = Color.White,
            fontSize = 16.sp,
            modifier = Modifier
                .align(Alignment.BottomStart)
                .background(Color.Black.copy(alpha = 0.6f))
                .padding(horizontal = 12.dp, vertical = 6.dp)
                .testTag("status"),
        )
    }
}

@Composable
private fun PairingCard(
    url: String,
    transport: String,
    failure: String?,
    modifier: Modifier = Modifier,
) {
    val qr = remember(url) { runCatching { qrBitmap(url, 300) }.getOrNull() }
    Column(
        modifier = modifier
            .background(Color.White.copy(alpha = 0.92f))
            .padding(12.dp)
            .width(180.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        if (qr != null) {
            Image(bitmap = qr, contentDescription = "Pairing QR", modifier = Modifier.size(150.dp))
        }
        Text(text = url.removePrefix("http://"), color = Color.Black, fontSize = 11.sp)
        Text(text = "via $transport", color = Color.DarkGray, fontSize = 10.sp)
        if (failure != null) {
            Text(text = failure, color = Color.Red, fontSize = 10.sp, modifier = Modifier.testTag("transportError"))
        }
    }
}
