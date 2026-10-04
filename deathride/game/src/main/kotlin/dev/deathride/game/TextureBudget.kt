package dev.deathride.game

import java.io.DataInputStream
import java.io.InputStream

/** RGBA storage without mipmaps. PSS is measured separately on the device. */
object TextureBudget {
    const val MIB=1048576L
    const val ART_PAGE_EDGE=1024
    const val TILE_EDGE=256
    const val ART=32*MIB
    const val SCENERY=16*MIB
    const val FONTS=11*MIB
    const val QR=240L*240*4
    const val TOTAL=52*MIB
    fun remainingArt(fonts: Long,scenery: Long)=minOf(ART,(TOTAL-fonts-scenery-QR).coerceAtLeast(0))
    /** Read only the fixed PNG header, before a decoder can allocate the pixel buffer. */
    fun pngBytes(input: InputStream,limit: Int): Long {
        val data=DataInputStream(input);val signature=ByteArray(8);data.readFully(signature)
        require(signature.contentEquals(byteArrayOf(-119,80,78,71,13,10,26,10))){"invalid PNG signature"}
        require(data.readInt()==13 && data.readInt()==0x49484452){"missing PNG IHDR"}
        val width=data.readInt();val height=data.readInt()
        require(width in 1..limit && height in 1..limit){"texture exceeds $limit page budget"}
        return width.toLong()*height*4
    }
    fun fits(art: Long,fonts: Long,scenery: Long,qr: Long)=
        art in 0..ART && fonts in 0..FONTS && scenery in 0..SCENERY && qr in 0..QR && art+fonts+scenery+qr<=TOTAL
}
