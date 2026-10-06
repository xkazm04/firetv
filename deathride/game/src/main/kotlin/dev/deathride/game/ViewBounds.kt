package dev.deathride.game

/** World-space rectangle the world camera can show. Painters skip what cannot reach it; [ALL] disables culling. */
class ViewBounds {
    var minX=-1e18;private set
    var maxX=1e18;private set
    var minY=-1e18;private set
    var maxY=1e18;private set
    /** The 1280x720 stage maps (640,350) to the focus at [pixelsPerM]; [padM] absorbs interpolation and rounding. */
    fun set(focusX: Double,focusY: Double,pixelsPerM: Double,padM: Double=PAD_M) {
        minX=focusX-640/pixelsPerM-padM;maxX=focusX+640/pixelsPerM+padM
        minY=focusY-350/pixelsPerM-padM;maxY=focusY+370/pixelsPerM+padM
    }
    /** A circle of radius [r] around (x,y) touches the view. */
    fun sees(x: Double,y: Double,r: Double)=x+r>=minX && x-r<=maxX && y+r>=minY && y-r<=maxY
    fun seesBox(x0: Float,y0: Float,x1: Float,y1: Float)=x1>=minX && x0<=maxX && y1>=minY && y0<=maxY
    companion object {
        const val PAD_M=6.0
        val ALL=ViewBounds()
    }
}
