package dev.deathride.tv

import android.graphics.*
import dev.deathride.game.RuntimeFonts
import java.io.ByteArrayOutputStream
import kotlin.math.ceil

fun nativeFont(size: Int): com.badlogic.gdx.graphics.g2d.BitmapFont {
    val paint=Paint(Paint.ANTI_ALIAS_FLAG).apply { color=Color.WHITE;textSize=size*2f;typeface=Typeface.create("sans-serif",if(size>25)Typeface.BOLD else Typeface.NORMAL) }
    val cellWidth=ceil(size*2.8).toInt();val cellHeight=ceil(size*2.8).toInt();val columns=1024/cellWidth
    var height=1;while(height<((95+columns-1)/columns)*cellHeight)height*=2
    val bitmap=Bitmap.createBitmap(1024,height,Bitmap.Config.ARGB_8888);val canvas=Canvas(bitmap);val advances=IntArray(95)
    for(code in 32..126) { val i=code-32;val ch=code.toChar().toString();advances[i]=ceil(paint.measureText(ch)).toInt();canvas.drawText(ch,(i%columns)*cellWidth+2f,(i/columns)*cellHeight+2f-paint.fontMetrics.ascent,paint) }
    val out=ByteArrayOutputStream();bitmap.compress(Bitmap.CompressFormat.PNG,100,out);bitmap.recycle()
    return RuntimeFonts.atlas(out.toByteArray(),size,cellWidth,cellHeight,advances)
}
