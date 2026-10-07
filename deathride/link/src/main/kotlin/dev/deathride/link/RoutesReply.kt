package dev.deathride.link

import dev.deathride.core.Course
import java.io.OutputStream
import java.io.OutputStreamWriter

/**
 * The read-only /routes reply (authored route telemetry for the LAN driving probes), as UTF-8 bytes built once on the link
 * side and kept in [CHUNK]-byte blocks.
 *
 * P13e: before, the reply was one 17,540,089-character String built by nested joinToString calls and kept by a lazy, and
 * every request encoded it to a second array of the same size. On the Stick a background GC cleared that ~36 MB of large
 * objects during the probe's first requests (P13d). Here each point is written straight to the blocks: no reply-sized
 * String or array exists, and a request copies the blocks to the socket. The bytes are exactly the old reply's.
 */
internal class RoutesReply private constructor(private val blocks: List<ByteArray>,private val tail: Int) {
    val length: Long get()=if(blocks.isEmpty())0L else (blocks.size-1).toLong()*CHUNK+tail
    val blockCount get()=blocks.size
    /** Block [i]: its first [size] bytes are the reply's. */
    fun block(i: Int)=blocks[i]
    fun size(i: Int)=if(i==blocks.lastIndex)tail else CHUNK
    /** The whole reply in one array: tests only. */
    fun bytes(): ByteArray { val out=ByteArray(length.toInt());var at=0;for(i in blocks.indices){System.arraycopy(blocks[i],0,out,at,size(i));at+=size(i)};return out }

    private class Blocks: OutputStream() {
        val blocks=ArrayList<ByteArray>();var used=CHUNK
        override fun write(b: Int) { if(used==CHUNK){blocks.add(ByteArray(CHUNK));used=0};blocks.last()[used++]=b.toByte() }
        override fun write(b: ByteArray,off: Int,len: Int) {
            var from=off;var left=len
            while(left>0) {
                if(used==CHUNK){blocks.add(ByteArray(CHUNK));used=0}
                val n=minOf(left,CHUNK-used);System.arraycopy(b,from,blocks.last(),used,n);used+=n;from+=n;left-=n
            }
        }
    }
    companion object {
        /** 64 KiB: few blocks (about 270 for today's courses), each in ART's large-object space, so a GC never copies them. */
        const val CHUNK=65536
        fun of(courses: List<Course>): RoutesReply {
            val out=Blocks()
            OutputStreamWriter(out,Charsets.UTF_8).buffered(8192).use { write(courses,it) }
            return RoutesReply(out.blocks,if(out.blocks.isEmpty())0 else out.used)
        }
        /** The reply's text, course by course and point by point, in the old reply's exact format. */
        fun write(courses: List<Course>,out: Appendable) {
            out.append('[')
            for((n,c) in courses.withIndex()) {
                if(n>0)out.append(',')
                out.append("{\"id\":\"${c.id}\",\"lengthM\":${c.lengthM},\"startM\":${c.startFraction*c.lengthM},\"gridLanes\":[${c.grid.joinToString(","){it.laneM.toString()}}],\"points\":[")
                for(i in 0..c.count) {
                    if(i>0)out.append(',')
                    out.append("[${c.x[i]},${c.y[i]},${c.arc[i]},${c.curvature[i]},${c.surfaces[i].gripScale}]")
                }
                out.append("]}")
            }
            out.append(']')
        }
    }
}
