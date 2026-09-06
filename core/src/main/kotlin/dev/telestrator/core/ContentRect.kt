package dev.telestrator.core

/**
 * Maps normalized annotation coordinates onto the letterboxed video content rectangle inside a
 * surface of arbitrary size. This is the single piece of maths standing between "drawing lands on
 * the player" and "drawing floats in the black bars".
 */
data class ContentRect(val left: Float, val top: Float, val width: Float, val height: Float) {

    fun x(nx: Double): Float = left + width * nx.toFloat()
    fun y(ny: Double): Float = top + height * ny.toFloat()

    /** Stroke widths are normalized against the content *width* so they scale with the video. */
    fun w(nw: Double): Float = width * nw.toFloat()

    companion object {
        fun fit(surfaceWidth: Float, surfaceHeight: Float, videoAspect: Double): ContentRect {
            val surfaceAspect = surfaceWidth / surfaceHeight
            return if (surfaceAspect > videoAspect) {
                // Surface is wider than the video: pillarbox (bars left/right).
                val w = surfaceHeight * videoAspect.toFloat()
                ContentRect((surfaceWidth - w) / 2f, 0f, w, surfaceHeight)
            } else {
                // Surface is taller: letterbox (bars top/bottom).
                val h = surfaceWidth / videoAspect.toFloat()
                ContentRect(0f, (surfaceHeight - h) / 2f, surfaceWidth, h)
            }
        }
    }
}
