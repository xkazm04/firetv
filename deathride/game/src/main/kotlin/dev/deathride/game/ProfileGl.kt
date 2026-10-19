package dev.deathride.game

import com.badlogic.gdx.graphics.GL20
import java.nio.Buffer
import java.nio.IntBuffer

/** Diagnostic only: count actual GL calls without glGetError/glFinish synchronization. */
class ProfileGl(private val delegate: GL20) : GL20 by delegate {
    var draws = 0; private set
    var binds = 0; private set
    var uploads = 0; private set
    /** Wall time inside texture upload calls since creation; never reset per frame. */
    var uploadNanos = 0L; private set
    /** Indices (or array vertices) submitted to draw calls: a vertex-work counter independent of the host GPU. */
    var indices = 0; private set
    /** P13d: every GL object this frame created, deleted or (re)specified, by kind (see [inventory]). Reset per frame. */
    private val counts = IntArray(INVENTORY.size)
    private var uploadBytes = 0L
    private var bufferBytes = 0L
    fun reset() { draws = 0; binds = 0; uploads = 0; indices = 0; counts.fill(0); uploadBytes = 0; bufferBytes = 0 }
    /** This frame's object events, nonzero kinds only ("" when none): textures, buffers, shaders/programs, framebuffers, syncs. */
    fun inventory(): String {
        val out = StringBuilder()
        for (i in counts.indices) if (counts[i] != 0) out.append(INVENTORY[i]).append('=').append(counts[i]).append(' ')
        if (uploads != 0) out.append("texUploads=").append(uploads).append(" texUploadBytes=").append(uploadBytes).append(' ')
        if (bufferBytes != 0L) out.append("bufBytes=").append(bufferBytes).append(' ')
        return out.toString().trimEnd()
    }
    /** Object creations or deletions this frame (not data uploads, binds or draws). */
    fun objectEvents() = counts[0] + counts[1] + counts[3] + counts[4] + counts[7] + counts[8] + counts[9] + counts[10] + counts[11] + counts[12] + counts[14] + counts[15]
    private fun count(kind: Int, n: Int = 1) { counts[kind] += n }
    override fun glBindTexture(target: Int, texture: Int) { binds++; delegate.glBindTexture(target, texture) }
    override fun glDrawArrays(mode: Int, first: Int, count: Int) { draws++; indices += count; delegate.glDrawArrays(mode, first, count) }
    override fun glDrawElements(mode: Int, count: Int, type: Int, indices: Buffer?) { draws++; this.indices += count; delegate.glDrawElements(mode, count, type, indices) }
    override fun glDrawElements(mode: Int, count: Int, type: Int, indices: Int) { draws++; this.indices += count; delegate.glDrawElements(mode, count, type, indices) }
    override fun glTexImage2D(target: Int, level: Int, internalformat: Int, width: Int, height: Int, border: Int, format: Int, type: Int, pixels: Buffer?) {
        uploads++; uploadBytes += width.toLong() * height * 4; val started = System.nanoTime(); delegate.glTexImage2D(target, level, internalformat, width, height, border, format, type, pixels); uploadNanos += System.nanoTime() - started
    }
    override fun glTexSubImage2D(target: Int, level: Int, xoffset: Int, yoffset: Int, width: Int, height: Int, format: Int, type: Int, pixels: Buffer?) {
        uploads++; uploadBytes += width.toLong() * height * 4; val started = System.nanoTime(); delegate.glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels); uploadNanos += System.nanoTime() - started
    }
    override fun glCompressedTexImage2D(target: Int, level: Int, internalformat: Int, width: Int, height: Int, border: Int, imageSize: Int, data: Buffer?) {
        uploads++; uploadBytes += imageSize; val started = System.nanoTime(); delegate.glCompressedTexImage2D(target, level, internalformat, width, height, border, imageSize, data); uploadNanos += System.nanoTime() - started
    }
    override fun glCompressedTexSubImage2D(target: Int, level: Int, xoffset: Int, yoffset: Int, width: Int, height: Int, format: Int, imageSize: Int, data: Buffer?) {
        uploads++; uploadBytes += imageSize; val started = System.nanoTime(); delegate.glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data); uploadNanos += System.nanoTime() - started
    }
    // P13d object inventory. Counting only: every call is passed through unchanged.
    override fun glGenTexture(): Int { count(0); return delegate.glGenTexture() }
    override fun glGenTextures(n: Int, textures: IntBuffer?) { count(0, n); delegate.glGenTextures(n, textures) }
    override fun glDeleteTexture(texture: Int) { count(1); delegate.glDeleteTexture(texture) }
    override fun glDeleteTextures(n: Int, textures: IntBuffer?) { count(1, n); delegate.glDeleteTextures(n, textures) }
    override fun glGenerateMipmap(target: Int) { count(2); delegate.glGenerateMipmap(target) }
    override fun glGenBuffer(): Int { count(3); return delegate.glGenBuffer() }
    override fun glGenBuffers(n: Int, buffers: IntBuffer?) { count(3, n); delegate.glGenBuffers(n, buffers) }
    override fun glDeleteBuffer(buffer: Int) { count(4); delegate.glDeleteBuffer(buffer) }
    override fun glDeleteBuffers(n: Int, buffers: IntBuffer?) { count(4, n); delegate.glDeleteBuffers(n, buffers) }
    override fun glBufferData(target: Int, size: Int, data: Buffer?, usage: Int) { count(5); bufferBytes += size; delegate.glBufferData(target, size, data, usage) }
    override fun glBufferSubData(target: Int, offset: Int, size: Int, data: Buffer?) { count(6); bufferBytes += size; delegate.glBufferSubData(target, offset, size, data) }
    override fun glCreateShader(type: Int): Int { count(7); return delegate.glCreateShader(type) }
    override fun glDeleteShader(shader: Int) { count(8); delegate.glDeleteShader(shader) }
    override fun glCreateProgram(): Int { count(9); return delegate.glCreateProgram() }
    override fun glLinkProgram(program: Int) { count(10); delegate.glLinkProgram(program) }
    override fun glDeleteProgram(program: Int) { count(11); delegate.glDeleteProgram(program) }
    override fun glGenFramebuffer(): Int { count(12); return delegate.glGenFramebuffer() }
    override fun glGenFramebuffers(n: Int, framebuffers: IntBuffer?) { count(12, n); delegate.glGenFramebuffers(n, framebuffers) }
    override fun glBindFramebuffer(target: Int, framebuffer: Int) { count(13); delegate.glBindFramebuffer(target, framebuffer) }
    override fun glDeleteFramebuffer(framebuffer: Int) { count(14); delegate.glDeleteFramebuffer(framebuffer) }
    override fun glDeleteFramebuffers(n: Int, framebuffers: IntBuffer?) { count(14, n); delegate.glDeleteFramebuffers(n, framebuffers) }
    override fun glGenRenderbuffer(): Int { count(15); return delegate.glGenRenderbuffer() }
    override fun glGenRenderbuffers(n: Int, renderbuffers: IntBuffer?) { count(15, n); delegate.glGenRenderbuffers(n, renderbuffers) }
    override fun glDeleteRenderbuffer(renderbuffer: Int) { count(15); delegate.glDeleteRenderbuffer(renderbuffer) }
    override fun glDeleteRenderbuffers(n: Int, renderbuffers: IntBuffer?) { count(15, n); delegate.glDeleteRenderbuffers(n, renderbuffers) }
    override fun glFramebufferTexture2D(target: Int, attachment: Int, textarget: Int, texture: Int, level: Int) { count(16); delegate.glFramebufferTexture2D(target, attachment, textarget, texture, level) }
    override fun glFlush() { count(17); delegate.glFlush() }
    override fun glFinish() { count(18); delegate.glFinish() }
    override fun glReadPixels(x: Int, y: Int, width: Int, height: Int, format: Int, type: Int, pixels: Buffer?) { count(19); delegate.glReadPixels(x, y, width, height, format, type, pixels) }
    override fun glCompileShader(shader: Int) { count(20); delegate.glCompileShader(shader) }
    override fun glClear(mask: Int) { count(21); delegate.glClear(mask) }
    companion object {
        /** Column names of the per-frame inventory; renderbuffer create and delete share one count (none exist in this game). */
        val INVENTORY = arrayOf("texGen", "texDelete", "mipmaps", "bufGen", "bufDelete", "bufData", "bufSubData", "shaderCreate", "shaderDelete",
            "programCreate", "programLink", "programDelete", "fboGen", "fboBinds", "fboDelete", "renderbuffers", "fboAttach", "flush", "finish",
            "readPixels", "shaderCompile", "clears")
    }
}
