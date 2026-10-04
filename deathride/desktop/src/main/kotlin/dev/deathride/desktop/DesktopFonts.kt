package dev.deathride.desktop

import dev.deathride.game.RuntimeFonts
import java.awt.*
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO
import kotlin.math.ceil

fun nativeFont(size: Int): com.badlogic.gdx.graphics.g2d.BitmapFont {
    val cellWidth=ceil(size*2.8).toInt();val cellHeight=ceil(size*2.8).toInt();val columns=1024/cellWidth
    var height=1;while(height<((95+columns-1)/columns)*cellHeight)height*=2
    val bitmap=BufferedImage(1024,height,BufferedImage.TYPE_INT_ARGB);val g=bitmap.createGraphics()
    g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING,RenderingHints.VALUE_TEXT_ANTIALIAS_ON);g.color=Color.WHITE;g.font=Font("SansSerif",if(size>25)Font.BOLD else Font.PLAIN,size*2)
    val metrics=g.fontMetrics;val advances=IntArray(95)
    for(code in 32..126) { val i=code-32;val ch=code.toChar().toString();advances[i]=metrics.stringWidth(ch);g.drawString(ch,(i%columns)*cellWidth+2,(i/columns)*cellHeight+2+metrics.ascent) }
    g.dispose();val out=ByteArrayOutputStream();ImageIO.write(bitmap,"png",out)
    return RuntimeFonts.atlas(out.toByteArray(),size,cellWidth,cellHeight,advances)
}
