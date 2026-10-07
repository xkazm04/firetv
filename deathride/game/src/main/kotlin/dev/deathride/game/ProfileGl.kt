package dev.deathride.game

import com.badlogic.gdx.graphics.GL20
import java.nio.Buffer

/** Diagnostic only: count actual GL calls without glGetError/glFinish synchronization. */
class ProfileGl(private val delegate: GL20) : GL20 by delegate {
    var draws = 0; private set
    var binds = 0; private set
    var uploads = 0; private set
    /** Wall time inside texture upload calls since creation; never reset per frame. */
    var uploadNanos = 0L; private set
    /** Indices (or array vertices) submitted to draw calls: a vertex-work counter independent of the host GPU. */
    var indices = 0; private set
    fun reset() { draws = 0; binds = 0; uploads = 0; indices = 0 }
    override fun glBindTexture(target: Int, texture: Int) { binds++; delegate.glBindTexture(target, texture) }
    override fun glDrawArrays(mode: Int, first: Int, count: Int) { draws++; indices += count; delegate.glDrawArrays(mode, first, count) }
    override fun glDrawElements(mode: Int, count: Int, type: Int, indices: Buffer?) { draws++; this.indices += count; delegate.glDrawElements(mode, count, type, indices) }
    override fun glDrawElements(mode: Int, count: Int, type: Int, indices: Int) { draws++; this.indices += count; delegate.glDrawElements(mode, count, type, indices) }
    override fun glTexImage2D(target: Int, level: Int, internalformat: Int, width: Int, height: Int, border: Int, format: Int, type: Int, pixels: Buffer?) {
        uploads++; val started = System.nanoTime(); delegate.glTexImage2D(target, level, internalformat, width, height, border, format, type, pixels); uploadNanos += System.nanoTime() - started
    }
    override fun glTexSubImage2D(target: Int, level: Int, xoffset: Int, yoffset: Int, width: Int, height: Int, format: Int, type: Int, pixels: Buffer?) {
        uploads++; val started = System.nanoTime(); delegate.glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels); uploadNanos += System.nanoTime() - started
    }
    override fun glCompressedTexImage2D(target: Int, level: Int, internalformat: Int, width: Int, height: Int, border: Int, imageSize: Int, data: Buffer?) {
        uploads++; val started = System.nanoTime(); delegate.glCompressedTexImage2D(target, level, internalformat, width, height, border, imageSize, data); uploadNanos += System.nanoTime() - started
    }
    override fun glCompressedTexSubImage2D(target: Int, level: Int, xoffset: Int, yoffset: Int, width: Int, height: Int, format: Int, imageSize: Int, data: Buffer?) {
        uploads++; val started = System.nanoTime(); delegate.glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data); uploadNanos += System.nanoTime() - started
    }
}
