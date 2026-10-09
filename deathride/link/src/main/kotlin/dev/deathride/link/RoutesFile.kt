package dev.deathride.link

import dev.deathride.core.Course
import java.io.File
import java.io.FileNotFoundException
import java.io.InputStream

/**
 * The read-only /routes reply kept on disk, not in the heap (P21, card 14).
 *
 * P20: the reply's blocks ([RoutesReply], 16.76 MiB) were kept by a companion lazy for the life of the process, a third of
 * what survived every full GC, for a route no phone requests (only the LAN driving probes do). Building the reply per
 * request costs the Stick about 7.5 s (P21's preflight), past the probe's 5 s fetch. So the first request writes the
 * reply's text ([RoutesReply.write], the same bytes) to one file in [dir] (the app's cache directory on Android), and every
 * request streams that file. The heap keeps the file's name and length only.
 */
internal class RoutesFile(private val dir: File,private val courses: ()->List<Course>) {
    class Opened(val length: Long,val stream: InputStream)
    @Volatile private var file: File?=null

    /** The reply's length and its bytes. The file is written on first use, and again if it has gone (Android may clear a
     *  cache directory). */
    fun open(): Opened = synchronized(this) {
        repeat(2) {
            val f=file?.takeIf { it.isFile }?:write().also { file=it }
            try { return Opened(f.length(),f.inputStream()) } catch(e: FileNotFoundException) { file=null }
        }
        error("routes file unavailable in $dir")
    }

    private fun write(): File {
        dir.mkdirs()
        // An earlier process's file: Android kills a process without running deleteOnExit.
        dir.listFiles { f -> f.name.startsWith(PREFIX) && f.name.endsWith(SUFFIX) }?.forEach { it.delete() }
        val f=File.createTempFile(PREFIX,SUFFIX,dir);f.deleteOnExit()
        f.outputStream().writer(Charsets.UTF_8).buffered(8192).use { RoutesReply.write(courses(),it) }
        return f
    }

    companion object {
        const val PREFIX="deathride-routes-"
        const val SUFFIX=".json"
    }
}
