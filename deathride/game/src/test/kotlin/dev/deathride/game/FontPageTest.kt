package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.Graphics
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.TextureData
import com.badlogic.gdx.graphics.g2d.BitmapFont
import com.badlogic.gdx.graphics.g2d.TextureRegion
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.lang.reflect.Proxy

/** P16: the shared HUD font page. The sibling must carry the body font's metrics exactly, over the same texture, and stay
 *  independent of it; the title rows must refuse a page they do not fit. The pixels themselves are proved on the Stick. */
class FontPageTest {
    private var gl: GL20?=null
    private var graphics: Graphics?=null
    @BeforeEach fun fakeGl() {
        gl=Gdx.gl;graphics=Gdx.graphics
        Gdx.gl=proxy(GL20::class.java);Gdx.gl20=Gdx.gl;Gdx.graphics=proxy(Graphics::class.java)
    }
    @AfterEach fun restore() { Gdx.gl=gl;Gdx.gl20=gl;Gdx.graphics=graphics }

    @Test fun siblingCopiesEveryGlyphCellAdvanceAndScaleOverTheSameTexture() {
        val font=bodyFont(1024,512)
        val sibling=RuntimeFonts.sibling(font)
        assertSame(font.region.texture,sibling.region.texture)
        assertNotSame(font.data,sibling.data)
        assertFalse(sibling.ownsTexture())
        assertEquals(font.usesIntegerPositions(),sibling.usesIntegerPositions())
        val a=font.data;val b=sibling.data
        for((x,y) in listOf(a.lineHeight to b.lineHeight,a.capHeight to b.capHeight,a.ascent to b.ascent,a.descent to b.descent,a.down to b.down,
                a.spaceXadvance to b.spaceXadvance,a.xHeight to b.xHeight,a.scaleX to b.scaleX,a.scaleY to b.scaleY))assertEquals(x.toRawBits(),y.toRawBits())
        for(code in 32..126) {
            val g=a.getGlyph(code.toChar());val h=b.getGlyph(code.toChar())
            assertNotSame(g,h)
            assertEquals(listOf(g.id,g.srcX,g.srcY,g.width,g.height,g.xoffset,g.yoffset,g.xadvance,g.page),listOf(h.id,h.srcX,h.srcY,h.width,h.height,h.xoffset,h.yoffset,h.xadvance,h.page))
            assertEquals(listOf(g.u,g.v,g.u2,g.v2).map{it.toRawBits()},listOf(h.u,h.v,h.u2,h.v2).map{it.toRawBits()},"uv of $code")
        }
    }
    @Test fun rescalingOneFontLeavesTheOtherUntouched() {
        val font=bodyFont(1024,512);val sibling=RuntimeFonts.sibling(font)
        val line=font.data.lineHeight
        sibling.data.setScale(.9f,.9f);sibling.setColor(.1f,.2f,.3f,1f)
        assertEquals(.5f,font.data.scaleX);assertEquals(line,font.data.lineHeight);assertEquals(1f,font.color.r)
    }
    @Test fun usedRowsIsTheBottomOfTheLowestGlyphCell() {
        // RuntimeFonts.atlas at the HUD body size: cells of 56 px, 18 per row, 95 glyphs in 6 rows.
        assertEquals(6*56,RuntimeFonts.usedRows(bodyFont(1024,512)))
    }
    @Test fun titlesRefuseAPageTheyDoNotFit() {
        // Two rows of 26 cells (34x46 glyphs inside a 2-texel border) need 100 rows below the body glyphs.
        val page=bodyFont(1024,512).region.texture
        assertNull(HandCutFont.createOn(HudTheme.TITLE,page,513-100))
        assertNull(HandCutFont.createOn(HudTheme.TITLE,page,-1))
        assertNull(HandCutFont.createOn(HudTheme.TITLE,Texture(SizeOnly(32,512)),0))
    }

    /** RuntimeFonts.atlas's metrics for size 20 (cell 56 px) over a texture that only records its size. */
    private fun bodyFont(width: Int,height: Int): BitmapFont {
        val size=20;val cell=56;val columns=width/cell
        val data=BitmapFont.BitmapFontData()
        data.lineHeight=size*2.5f;data.capHeight=size*1.5f;data.ascent=0f;data.descent=-size*.4f;data.down=-data.lineHeight;data.spaceXadvance=11f
        for(code in 32..126) {
            val i=code-32;val g=BitmapFont.Glyph();g.id=code;g.srcX=(i%columns)*cell;g.srcY=(i/columns)*cell
            g.width=cell;g.height=cell;g.xoffset=-2;g.yoffset=-cell;g.xadvance=10+i%7;data.setGlyph(code,g)
        }
        return BitmapFont(data,TextureRegion(Texture(SizeOnly(width,height))),false).apply { setOwnsTexture(true);setUseIntegerPositions(false);data.setScale(.5f) }
    }
    private class SizeOnly(private val w: Int,private val h: Int): TextureData {
        override fun getType()=TextureData.TextureDataType.Custom
        override fun isPrepared()=true
        override fun prepare() {}
        override fun consumePixmap(): Pixmap=throw UnsupportedOperationException()
        override fun disposePixmap()=false
        override fun consumeCustomData(target: Int) {}
        override fun getWidth()=w
        override fun getHeight()=h
        override fun getFormat()=Pixmap.Format.RGBA8888
        override fun useMipMaps()=false
        override fun isManaged()=false
    }
    @Suppress("UNCHECKED_CAST")
    private fun <T> proxy(type: Class<T>): T = Proxy.newProxyInstance(type.classLoader,arrayOf(type)) { _,method,_ ->
        when(method.returnType) {
            java.lang.Boolean.TYPE -> false
            Integer.TYPE -> 1
            java.lang.Float.TYPE -> 0f
            java.lang.Long.TYPE -> 0L
            java.lang.Double.TYPE -> 0.0
            else -> null
        }
    } as T
}
