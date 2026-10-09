package dev.deathride.game

import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.BitmapFont
import com.badlogic.gdx.graphics.g2d.TextureRegion

/** Platform text rasterization at startup. No font/image files are bundled or downloaded. */
object RuntimeFonts {
    fun atlas(png: ByteArray,size: Int,cellWidth: Int,cellHeight: Int,advances: IntArray): BitmapFont {
        val pixmap=Pixmap(png,0,png.size);val texture=Texture(pixmap);val columns=pixmap.width/cellWidth;pixmap.dispose()
        texture.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
        val data=BitmapFont.BitmapFontData()
        data.lineHeight=size*2.5f;data.capHeight=size*1.5f;data.ascent=0f;data.descent=-size*.4f;data.down=-data.lineHeight;data.spaceXadvance=advances[0].toFloat()
        for(code in 32..126) {
            val i=code-32;val g=BitmapFont.Glyph();g.id=code;g.srcX=(i%columns)*cellWidth;g.srcY=(i/columns)*cellHeight
            g.width=cellWidth;g.height=cellHeight;g.xoffset=-2;g.yoffset=-cellHeight;g.xadvance=advances[i];data.setGlyph(code,g)
        }
        return BitmapFont(data,TextureRegion(texture),false).apply { setOwnsTexture(true);setUseIntegerPositions(false);data.setScale(.5f) }
    }
    /** P16: a second font over [font]'s page with its own copy of the metrics (glyph cells, advances, scale), so a caller that
     *  rescales or recolours one (TrackScene's signage) never touches the other, and both draw from one texture. */
    fun sibling(font: BitmapFont): BitmapFont {
        val source=font.data;val data=BitmapFont.BitmapFontData()
        data.lineHeight=source.lineHeight;data.capHeight=source.capHeight;data.ascent=source.ascent;data.descent=source.descent
        data.down=source.down;data.spaceXadvance=source.spaceXadvance;data.xHeight=source.xHeight
        data.scaleX=source.scaleX;data.scaleY=source.scaleY
        for(glyphs in source.glyphs)if(glyphs!=null)for(g in glyphs)if(g!=null)data.setGlyph(g.id,BitmapFont.Glyph().apply {
            id=g.id;srcX=g.srcX;srcY=g.srcY;width=g.width;height=g.height;xoffset=g.xoffset;yoffset=g.yoffset;xadvance=g.xadvance;page=g.page
            kerning=g.kerning?.let{k->Array(k.size){k[it]?.copyOf()}}
        })
        return BitmapFont(data,TextureRegion(font.region.texture),false).apply { setOwnsTexture(false);setUseIntegerPositions(font.usesIntegerPositions()) }
    }
    /** The first texel row below every glyph cell of [font]'s page; the rows from here down are free. */
    fun usedRows(font: BitmapFont): Int {
        var bottom=0
        for(glyphs in font.data.glyphs)if(glyphs!=null)for(g in glyphs)if(g!=null)bottom=maxOf(bottom,g.srcY+g.height)
        return bottom
    }
}
