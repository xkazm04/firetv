package dev.deathride.link

import io.ktor.utils.io.*

/**
 * One /stats reply as UTF-8 bytes in [BLOCK]-byte blocks, reused across requests.
 *
 * P13g: after P13f's in-place build, each read still made the 78 KB reply String and respondText's 78 KB UTF-8 copy of it,
 * two large objects (ART's threshold is 12 KiB) per probe read. Here the reused text builder is encoded straight into
 * blocks under 12 KiB and the blocks are written to the socket; no array of 12 KiB or more is made per read. The bytes are
 * exactly String.toByteArray(UTF_8)'s, an unpaired surrogate included ('?').
 *
 * A reply is filled under RaceServer's stats lock and written outside it (the write suspends); a read that races another
 * takes its own reply from [Pool], so a reply is never refilled while it is being written.
 */
internal class StatsReply {
    private val blocks=ArrayList<ByteArray>()
    private var used=0 // bytes in the current (last used) block
    private var current=-1
    var length=0L; private set

    fun clear() { used=BLOCK;current=-1;length=0 }
    /** P18: drops blocks past the first [max], so a pooled reply keeps no more than that after an unusually long one. */
    fun trim(max: Int) { while(blocks.size>max)blocks.removeAt(blocks.size-1) }
    private fun put(b: Int) {
        if(used==BLOCK) { current++;if(current==blocks.size)blocks.add(ByteArray(BLOCK));used=0 }
        blocks[current][used++]=b.toByte();length++
    }
    /** Encodes [text] as UTF-8 after what is already here, through a small reused char window. */
    fun encode(text: CharSequence,chars: CharArray) {
        val sb=text as? java.lang.StringBuilder
        var at=0;val n=text.length
        var pendingHigh=0 // a high surrogate whose low half may start the next window
        while(at<n) {
            val m=minOf(chars.size,n-at)
            if(sb!=null) sb.getChars(at,at+m,chars,0) else for(i in 0 until m)chars[i]=text[at+i]
            for(i in 0 until m) {
                val c=chars[i].code
                if(pendingHigh!=0) {
                    if(c in 0xDC00..0xDFFF) { putCodePoint(0x10000+((pendingHigh-0xD800) shl 10)+(c-0xDC00));pendingHigh=0;continue }
                    put('?'.code);pendingHigh=0
                }
                when {
                    c<0x80 -> put(c)
                    c<0x800 -> { put(0xC0 or (c shr 6));put(0x80 or (c and 0x3F)) }
                    c in 0xD800..0xDBFF -> pendingHigh=c
                    c in 0xDC00..0xDFFF -> put('?'.code)
                    else -> { put(0xE0 or (c shr 12));put(0x80 or ((c shr 6) and 0x3F));put(0x80 or (c and 0x3F)) }
                }
            }
            at+=m
        }
        if(pendingHigh!=0)put('?'.code)
    }
    private fun putCodePoint(cp: Int) { put(0xF0 or (cp shr 18));put(0x80 or ((cp shr 12) and 0x3F));put(0x80 or ((cp shr 6) and 0x3F));put(0x80 or (cp and 0x3F)) }

    suspend fun writeTo(out: ByteWriteChannel) {
        var left=length;var i=0
        while(left>0) { val n=minOf(left,BLOCK.toLong()).toInt();out.writeFully(blocks[i],0,n);left-=n;i++ }
    }
    /** The whole reply in one array: tests only. */
    fun bytes(): ByteArray { val out=ByteArray(length.toInt());var left=length.toInt();var i=0;var at=0
        while(left>0){val n=minOf(left,BLOCK);System.arraycopy(blocks[i],0,out,at,n);at+=n;left-=n;i++};return out }
    val blockCount get()=blocks.size

    /** Free replies; guarded by its owner's lock. Keeps at most [keep]: a burst of racing reads past that allocates small blocks.
     *  P18: a kept reply holds at most [maxBlocks] blocks (/profile keeps one reply of up to 64 blocks, 512 KiB). */
    class Pool(private val keep: Int=KEEP,private val maxBlocks: Int=Int.MAX_VALUE) {
        private val free=ArrayDeque<StatsReply>()
        fun take(): StatsReply=(free.removeLastOrNull()?:StatsReply()).also{it.clear()}
        fun give(r: StatsReply) { if(free.size<keep) { r.trim(maxBlocks);free.addLast(r) } }
        val size get()=free.size
    }
    companion object {
        /** 8 KiB: under ART's 12 KiB large-object threshold, so a block is an ordinary small object. */
        const val BLOCK=8192
        const val KEEP=4
        /** The char window [encode] reads the builder through: 2,048 chars, a 4 KiB array. */
        const val WINDOW=2048
    }
}
