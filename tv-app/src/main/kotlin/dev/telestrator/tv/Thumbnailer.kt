package dev.telestrator.tv

import android.content.Context
import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.util.Base64
import android.util.Log
import java.io.ByteArrayOutputStream

private const val TAG = "Thumbnailer"

/**
 * Produces a small JPEG of the frame the viewer is looking at, so the phone can show what it is
 * drawing on instead of a blank rectangle (design doc 3.4: `state` carries a thumbnail on pause).
 *
 * Pulled with [MediaMetadataRetriever] rather than off the player's surface: a SurfaceView on real
 * TV hardware is often a hardware overlay plane that cannot be read back, so grabbing the frame
 * from the media itself is the approach that will still work on a Fire TV Stick.
 */
class Thumbnailer internal constructor(private val source: FrameSource) {

    constructor(context: Context, uri: Uri) : this(RetrieverFrameSource(context, uri))

    private var lastKeyMs = Long.MIN_VALUE
    private var lastResult: String? = null

    /**
     * A data URL for the frame at [tMs], or null if it could not be decoded.
     *
     * Callers must be on a background thread: this decodes a video frame and takes tens of
     * milliseconds. Results are cached per [bucketMs] so that holding pause does not re-decode
     * the same frame over and over.
     */
    fun dataUrlAt(tMs: Long, widthPx: Int = 320, bucketMs: Long = 200): String? {
        val key = tMs / bucketMs
        if (key == lastKeyMs) return lastResult

        val frame = runCatching {
            source.frameAt(tMs * 1000, widthPx, widthPx * 9 / 16)
        }.onFailure { Log.w(TAG, "frame grab failed at ${tMs}ms", it) }.getOrNull()

        lastKeyMs = key
        lastResult = frame?.let { encode(it) }
        return lastResult
    }

    private fun encode(bitmap: Bitmap): String? = runCatching {
        val out = ByteArrayOutputStream(16 * 1024)
        // Quality 60: the phone shows this at thumbnail size behind its own ink, and every
        // kilobyte here competes with pen messages on the same socket.
        bitmap.compress(Bitmap.CompressFormat.JPEG, 60, out)
        bitmap.recycle()
        "data:image/jpeg;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
    }.getOrNull()

    fun release() {
        source.release()
    }
}

/** Where [Thumbnailer] gets a decoded frame; the seam that lets the JVM drive it without a decoder. */
internal interface FrameSource {
    fun frameAt(tUs: Long, widthPx: Int, heightPx: Int): Bitmap?
    fun release()
}

private class RetrieverFrameSource(context: Context, uri: Uri) : FrameSource {
    private val retriever = MediaMetadataRetriever().apply {
        runCatching { setDataSource(context, uri) }
            .onFailure { Log.w(TAG, "cannot open $uri for thumbnails", it) }
    }

    override fun frameAt(tUs: Long, widthPx: Int, heightPx: Int): Bitmap? =
        retriever.getScaledFrameAtTime(tUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC, widthPx, heightPx)

    override fun release() {
        runCatching { retriever.release() }
    }
}
