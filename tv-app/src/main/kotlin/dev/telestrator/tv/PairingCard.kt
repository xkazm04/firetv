package dev.telestrator.tv

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Text
import dev.telestrator.core.LinkView
import kotlinx.coroutines.delay

/** How often the card re-reads the clock; the shortest thing it times is a 3 s grace. */
private const val CARD_TICK_MS = 250L

/**
 * The corner of the picture that belongs to the pairing link: an invitation while no pen is here, a
 * dot once one is, the QR again when it is lost, the reason when a PIN was refused. What it shows,
 * and when, is decided by [dev.telestrator.core.LinkState]; this only draws the [LinkView].
 *
 * It owns its clock so that only this small composable recomposes with it, not the screen.
 */
@Composable
fun PairingCard(session: Session, transport: String, modifier: Modifier = Modifier) {
    val link by session.link.collectAsState()
    var now by remember { mutableLongStateOf(session.linkClockMs()) }
    LaunchedEffect(link) {
        while (true) {
            now = session.linkClockMs()
            delay(CARD_TICK_MS)
        }
    }
    when (val view = link.view(now)) {
        LinkView.Chip -> Box(
            modifier
                .padding(20.dp)
                .size(16.dp)
                .background(Color(0xFF2ECC71).copy(alpha = 0.85f), CircleShape)
                .testTag("pairedChip"),
        )
        LinkView.Connecting -> Card(modifier, 200.dp) {
            Text(stringResource(R.string.link_connecting), color = Color.Black, fontSize = 22.sp)
        }
        is LinkView.Invite -> Card(modifier, 260.dp) { Invitation(view.url, view.pin, transport, title = null) }
        is LinkView.Lost -> Card(modifier, 260.dp) {
            Invitation(view.url, view.pin, transport, title = stringResource(R.string.link_lost))
        }
        is LinkView.Refused -> Card(modifier, 260.dp) {
            val title = stringResource(if (view.reason == "wrong PIN") R.string.link_refused else R.string.link_locked)
            Text(title, color = Color(0xFFB00020), fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Pin(view.pin)
        }
        is LinkView.Failed -> Card(modifier, 340.dp) {
            Text(
                text = view.message,
                color = Color(0xFFB00020),
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.testTag("transportError"),
            )
        }
    }
}

/** How long the Menu peek has left, as a value the status line can follow without ticking. */
@Composable
fun peekingState(session: Session): State<Boolean> {
    val link by session.link.collectAsState()
    return produceState(false, link) {
        val left = link.peekLeftMs(session.linkClockMs())
        value = left > 0
        if (left > 0) {
            delay(left)
            value = false
        }
    }
}

@Composable
private fun Card(modifier: Modifier, width: androidx.compose.ui.unit.Dp, content: @Composable () -> Unit) {
    Column(
        modifier = modifier
            .padding(24.dp)
            .background(Color.White.copy(alpha = 0.92f))
            .padding(16.dp)
            .width(width),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) { content() }
}

@Composable
private fun Invitation(url: String, pin: String, transport: String, title: String?) {
    // The QR carries the PIN, so nobody types it; the digits are for the phone that cannot scan.
    val qr = remember(url) { runCatching { qrBitmap(url, 300) }.getOrNull() }
    if (title != null) Text(title, color = Color(0xFFB00020), fontSize = 28.sp, fontWeight = FontWeight.Bold)
    if (qr != null) {
        Image(bitmap = qr, contentDescription = stringResource(R.string.link_qr), modifier = Modifier.size(200.dp))
    }
    Pin(pin)
    Text(url.removePrefix("http://").substringBefore('?'), color = Color.Black, fontSize = 16.sp)
    Text(stringResource(R.string.link_via, transport), color = Color.DarkGray, fontSize = 14.sp)
}

@Composable
private fun Pin(pin: String) {
    Text(
        text = pin,
        color = Color.Black,
        fontSize = 52.sp,
        fontWeight = FontWeight.Bold,
        fontFamily = FontFamily.Monospace,
        letterSpacing = 6.sp,
        modifier = Modifier.testTag("pin"),
    )
}
