package dev.telestrator.tv

import android.os.Bundle
import android.view.KeyEvent
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
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import androidx.tv.material3.Text
import dev.telestrator.core.PenMessage
import kotlinx.coroutines.delay

@UnstableApi
class MainActivity : ComponentActivity() {

    private lateinit var session: Session
    private lateinit var server: PenServer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        session = Session(clipId = "fixture_clip", videoAspect = 16.0 / 9.0)
        server = PenServer(applicationContext, session).also { it.start() }

        setContent { TelestratorScreen(session, server) }
    }

    override fun onDestroy() {
        server.stop()
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
private fun TelestratorScreen(session: Session, server: PenServer) {
    val context = LocalContext.current
    val doc by session.doc.collectAsState()
    val transport by session.transport.collectAsState()
    var tMs by remember { mutableLongStateOf(0L) }
    var paused by remember { mutableStateOf(false) }

    val player = remember {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(
                MediaItem.fromUri(
                    "android.resource://" + context.packageName + "/" + R.raw.fixture_clip
                )
            )
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
            paused = !player.isPlaying
            delay(33)
        }
    }

    LaunchedEffect(transport) {
        val t = transport ?: return@LaunchedEffect
        when (t.cmd) {
            "toggle" -> if (player.isPlaying) player.pause() else player.play()
            "play" -> player.play()
            "pause" -> player.pause()
            "seek+" -> player.seekTo(player.currentPosition + 5_000)
            "seek-" -> player.seekTo((player.currentPosition - 5_000).coerceAtLeast(0))
            "seek" -> player.seekTo(t.value.toLong())
            "clear" -> session.accept(PenMessage.Clear)
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
            url = "http://" + server.lanAddress() + ":" + server.port + "/?pin=" + session.pin,
            modifier = Modifier.align(Alignment.TopEnd).padding(24.dp),
        )

        // Machine-readable status line: the live UI test reads this instead of guessing.
        Text(
            text = "t=" + tMs + "ms " + (if (paused) "PAUSED" else "PLAY") + " ink=" + doc.annotations.size,
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
private fun PairingCard(url: String, modifier: Modifier = Modifier) {
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
    }
}
