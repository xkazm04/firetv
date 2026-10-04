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
}
