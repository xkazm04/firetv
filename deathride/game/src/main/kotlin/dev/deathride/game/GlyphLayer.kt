package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.g2d.BitmapFont
import com.badlogic.gdx.graphics.g2d.SpriteBatch

/** Fixed-capacity glyph quads. Word wrapping allocates only during the throttled UI rebuild. */
class GlyphLayer(private val font: BitmapFont) {
    private val vertices=FloatArray(40000)
    private var count=0
    private var color=Color.WHITE.toFloatBits()
    // Retained layout: addText calls repeat in the same order every rebuild, so a call whose string, origin and colour match the call at
    // the same index last time, and which starts at the same vertex offset, finds its quads still in the array and is not laid out again.
    private var calls=0
    private var previousCalls=0
    private var texts=arrayOfNulls<String>(64)
    private var xs=FloatArray(64)
    private var ys=FloatArray(64)
    private var colors=IntArray(64)
    private var starts=IntArray(64)
    private var ends=IntArray(64)
    fun clear() { previousCalls=calls;calls=0;count=0 }
    fun setColor(value: Color) { color=value.toFloatBits() }
    fun width(text: CharSequence): Float {
        var width=0f
        for(ch in text)width+=(font.data.getGlyph(ch)?.xadvance?:0)*font.data.scaleX
        return width
    }
    /** Wrap at word boundaries; never reduce the sofa-readable font size to fit. */
    fun wrapped(value: String,x: Float,y: Float,maxWidth: Float,lineHeight: Float=25f): Float {
        var baseline=y
        for(paragraph in value.split('\n')) {
            var line=""
            for(word in paragraph.split(' ')) {
                val next=if(line.isEmpty())word else "$line $word"
                if(line.isNotEmpty() && width(next)>maxWidth) { addText(line,x,baseline);baseline-=lineHeight;line=word }
                else line=next
            }
            addText(line,x,baseline);baseline-=lineHeight
        }
        return baseline
    }
    fun addText(text: CharSequence, originX: Float, originY: Float) {
        val slot=calls++
        if(slot>=texts.size)grow()
        val start=count;val bits=color.toRawBits()
        if(text is String && slot<previousCalls && starts[slot]==start && texts[slot]==text && xs[slot]==originX && ys[slot]==originY && colors[slot]==bits) { count=ends[slot];return }
        layout(text,originX,originY)
        texts[slot]=text as? String;xs[slot]=originX;ys[slot]=originY;colors[slot]=bits;starts[slot]=start;ends[slot]=count
    }
    private fun grow() {
        val n=texts.size*2
        texts=texts.copyOf(n);xs=xs.copyOf(n);ys=ys.copyOf(n);colors=colors.copyOf(n);starts=starts.copyOf(n);ends=ends.copyOf(n)
    }
    private fun layout(text: CharSequence, originX: Float, originY: Float) {
        var x=originX; var y=originY+font.data.ascent
        var previous: BitmapFont.Glyph?=null
        val sx=font.data.scaleX; val sy=font.data.scaleY
        for(i in 0 until text.length) {
            val ch=text[i]
            if(ch=='\n') { x=originX; y-=font.data.lineHeight; previous=null; continue }
            val glyph=font.data.getGlyph(ch) ?: continue
            x+=(previous?.getKerning(ch) ?: 0)*sx
            if(glyph.width>0 && glyph.height>0 && count+20<=vertices.size) {
                val x1=x+glyph.xoffset*sx; val y1=y+glyph.yoffset*sy
                val x2=x1+glyph.width*sx; val y2=y1+glyph.height*sy
                vertex(x1,y1,glyph.u,glyph.v); vertex(x1,y2,glyph.u,glyph.v2)
                vertex(x2,y2,glyph.u2,glyph.v2); vertex(x2,y1,glyph.u2,glyph.v)
            }
            x+=glyph.xadvance*sx; previous=glyph
        }
    }
    private fun vertex(x: Float,y: Float,u: Float,v: Float) { vertices[count++]=x; vertices[count++]=y; vertices[count++]=color; vertices[count++]=u; vertices[count++]=v }
    fun draw(batch: SpriteBatch) { batch.draw(font.region.texture,vertices,0,count) }
}
