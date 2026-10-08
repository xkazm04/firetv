package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.graphics.glutils.FrameBuffer
import com.badlogic.gdx.utils.viewport.Viewport
import kotlin.math.ceil
import kotlin.math.floor

/** P16 card 2: the race HUD's fixed frames and icons, baked once into a retained texture with premultiplied alpha and
 *  composited where they were drawn as two screen-aligned quads (the instrument band and the minimap dial).
 *  The bake renders the same draw calls with the same camera; only the viewport is offset by whole pixels, so every quad
 *  rasterizes on the same pixel grid. Bars, meters, the minimap, text and everything that changes per frame stay live. */
class HudLayer {
    companion object {
        /** Bake bounds in stage units: every race frame and icon. */
        const val LEFT=24f
        const val BOTTOM=394f
        const val RIGHT=1244f
        const val TOP=708f
        /** Composite rectangles in stage units: the instrument band and the minimap dial. */
        val QUADS=arrayOf(floatArrayOf(24f,562f,1244f,708f),floatArrayOf(1044f,394f,1244f,544f))
        /** Resident limit; a larger target (a bigger back buffer) is not made and the chrome stays drawn directly. */
        const val MAX_BYTES=4L*1048576
    }
    private var fbo: FrameBuffer?=null
    private var x0=0
    private var y0=0
    private var width=0
    private var height=0
    private var held=false
    private var driver=-1
    private var weapon=-1
    private var ability: String?=null
    private var dial=false
    private var screenX=0
    private var screenY=0
    private var screenWidth=0
    private var screenHeight=0
    var bakes=0; private set
    val textureBytes get()=fbo?.let{it.width.toLong()*it.height*4}?:0L

    /** True when the layer holds exactly this chrome for this viewport. */
    fun holds(view: Viewport,driver: Int,weapon: Int,ability: String?,dial: Boolean)=held && fbo!=null && this.driver==driver && this.weapon==weapon &&
        this.ability==ability && this.dial==dial && screenX==view.screenX && screenY==view.screenY && screenWidth==view.screenWidth && screenHeight==view.screenHeight

    /** Bake [draw] when the layer does not hold this chrome. Returns the bake's milliseconds (0 when nothing was baked). Must run
     *  outside any batch or shape begin/end, before the frame's own drawing starts. */
    fun prepare(view: Viewport,batch: SpriteBatch,driver: Int,weapon: Int,ability: String?,dial: Boolean,draw: ()->Unit): Double {
        if(holds(view,driver,weapon,ability,dial))return 0.0
        val started=System.nanoTime()
        val sx=view.screenWidth/view.worldWidth;val sy=view.screenHeight/view.worldHeight
        val left=floor(view.screenX+LEFT*sx).toInt()-1;val bottom=floor(view.screenY+BOTTOM*sy).toInt()-1
        val w=ceil(view.screenX+RIGHT*sx).toInt()+1-left;val h=ceil(view.screenY+TOP*sy).toInt()+1-bottom
        held=false
        if(w<=0 || h<=0 || w.toLong()*h*4>MAX_BYTES) { dispose();return 0.0 }
        if(fbo==null || width!=w || height!=h) {
            dispose()
            fbo=FrameBuffer(Pixmap.Format.RGBA8888,w,h,false).also{it.colorBufferTexture.setFilter(Texture.TextureFilter.Nearest,Texture.TextureFilter.Nearest)}
        }
        x0=left;y0=bottom;width=w;height=h
        val target=fbo!!
        target.begin()
        Gdx.gl.glViewport(view.screenX-x0,view.screenY-y0,view.screenWidth,view.screenHeight)
        Gdx.gl.glClearColor(0f,0f,0f,0f);Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT)
        batch.projectionMatrix=view.camera.combined
        // Colour blends as the direct draw does; alpha accumulates as coverage, so the target holds premultiplied colour.
        batch.setBlendFunctionSeparate(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA,GL20.GL_ONE,GL20.GL_ONE_MINUS_SRC_ALPHA)
        batch.begin();batch.color=Color.WHITE;draw();batch.end()
        batch.setBlendFunction(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)
        target.end()
        this.driver=driver;this.weapon=weapon;this.ability=ability;this.dial=dial
        screenX=view.screenX;screenY=view.screenY;screenWidth=view.screenWidth;screenHeight=view.screenHeight
        held=true;bakes++
        return (System.nanoTime()-started)/1e6
    }

    /** Draw the held layer inside an open batch (premultiplied over), texel for pixel. */
    fun composite(batch: SpriteBatch,view: Viewport) {
        val texture=fbo?.colorBufferTexture?:return
        val sx=view.screenWidth/view.worldWidth;val sy=view.screenHeight/view.worldHeight
        batch.setBlendFunction(GL20.GL_ONE,GL20.GL_ONE_MINUS_SRC_ALPHA)
        for(q in QUADS) {
            val left=maxOf(x0,floor(view.screenX+q[0]*sx).toInt()-1);val bottom=maxOf(y0,floor(view.screenY+q[1]*sy).toInt()-1)
            val right=minOf(x0+width,ceil(view.screenX+q[2]*sx).toInt()+1);val top=minOf(y0+height,ceil(view.screenY+q[3]*sy).toInt()+1)
            // The target's row 0 is its bottom row (y0 on screen): flip so the quad's bottom samples it.
            batch.draw(texture,(left-view.screenX)/sx,(bottom-view.screenY)/sy,(right-left)/sx,(top-bottom)/sy,left-x0,bottom-y0,right-left,top-bottom,false,true)
        }
        batch.setBlendFunction(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA)
    }

    /** The target's contents are gone (a lost GL context): bake again before the next use. */
    fun invalidate() { held=false }
    fun dispose() { fbo?.dispose();fbo=null;held=false }
}
