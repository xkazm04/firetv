package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.g2d.BitmapFont
import com.badlogic.gdx.graphics.g2d.SpriteBatch

/** Fixed-capacity glyph quads. Rebuilding a HUD never allocates layouts, runs, or strings. */
class GlyphLayer(private val font: BitmapFont) {
    private val vertices=FloatArray(40000)
    private var count=0
    private var color=Color.WHITE.toFloatBits()
    fun clear() { count=0 }
    fun setColor(value: Color) { color=value.toFloatBits() }
    fun addText(text: CharSequence, originX: Float, originY: Float) {
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
