package dev.deathride.game

import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.BitmapFont
import com.badlogic.gdx.graphics.g2d.TextureRegion

/** Original 5x7 letter construction authored for Death Ride; no external font source.
 * Broad irregular cuts affect outer edges only. Used for short uppercase headings. */
object HandCutFont {
    private val alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /:-+."
    private val rows=arrayOf(
        "01110/11011/11011/11111/11011/11011/11011", "11110/11011/11011/11110/11011/11011/11110",
        "01111/11000/11000/11000/11000/11000/01111", "11110/11011/11011/11011/11011/11011/11110",
        "11111/11000/11000/11110/11000/11000/11111", "11111/11000/11000/11110/11000/11000/11000",
        "01111/11000/11000/11011/11011/11011/01111", "11011/11011/11011/11111/11011/11011/11011",
        "11111/00100/00100/00100/00100/00100/11111", "00111/00011/00011/00011/11011/11011/01110",
        "11011/11011/11110/11100/11110/11011/11011", "11000/11000/11000/11000/11000/11000/11111",
        "10001/11011/11111/10101/10001/10001/10001", "11001/11101/11101/11011/11011/11011/11001",
        "01110/11011/11011/11011/11011/11011/01110", "11110/11011/11011/11110/11000/11000/11000",
        "01110/11011/11011/11011/11111/00110/00011", "11110/11011/11011/11110/11100/11011/11011",
        "01111/11000/11000/01110/00011/00011/11110", "11111/00100/00100/00100/00100/00100/00100",
        "11011/11011/11011/11011/11011/11011/01110", "11011/11011/11011/11011/11011/01110/00100",
        "11011/11011/11011/11011/11111/11111/01010", "11011/11011/01110/00100/01110/11011/11011",
        "11011/11011/01110/00100/00100/00100/00100", "11111/00011/00110/00100/01100/11000/11111",
        "01110/11011/11111/11111/11011/11011/01110", "00100/01100/00100/00100/00100/00100/01110",
        "01110/11011/00011/00110/01100/11000/11111", "11110/00011/00011/01110/00011/00011/11110",
        "00011/00111/01111/11011/11111/00011/00011", "11111/11000/11000/11110/00011/00011/11110",
        "01110/11000/11000/11110/11011/11011/01110", "11111/00011/00110/00100/01100/01100/01100",
        "01110/11011/11011/01110/11011/11011/01110", "01110/11011/11011/01111/00011/00011/01110",
        "00000/00000/00000/00000/00000/00000/00000", "00001/00011/00110/00100/01100/11000/10000",
        "00000/00100/00100/00000/00100/00100/00000", "00000/00000/00000/11111/00000/00000/00000",
        "00000/00100/00100/11111/00100/00100/00000", "00000/00000/00000/00000/00000/00110/00110"
    )
    fun create(size: Int): BitmapFont {
        val pixmap=Pixmap(1024,256,Pixmap.Format.RGBA8888)
        pixmap.setColor(1f,1f,1f,1f)
        val data=BitmapFont.BitmapFontData()
        data.lineHeight=48f;data.capHeight=42f;data.ascent=0f;data.descent=-3f;data.down=-48f;data.spaceXadvance=18f
        for((index,ch) in alphabet.withIndex()) {
            val x=index%16*64;val y=index/16*64
            for((row,bits) in rows[index].split('/').withIndex())for((col,bit) in bits.withIndex())if(bit=='1') {
                pixmap.fillRectangle(x+col*6+2,y+row*6+2,6,6)
                // Small fixed corner cuts; no random grain or damage inside glyph counters.
                if((index+col+row)%4==0) {pixmap.setColor(0f,0f,0f,0f);pixmap.drawPixel(x+col*6+2,y+row*6+2);pixmap.setColor(1f,1f,1f,1f)}
            }
            val glyph=BitmapFont.Glyph().apply { id=ch.code;srcX=x;srcY=y;width=34;height=46;xoffset=0;yoffset=-46;xadvance=if(ch==' ')18 else 36 }
            data.setGlyph(ch.code,glyph)
        }
        val texture=Texture(pixmap);pixmap.dispose();texture.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
        return BitmapFont(data,TextureRegion(texture),false).apply {setOwnsTexture(true);setUseIntegerPositions(false);data.setScale(size/42f)}
    }
}
