package dev.deathride.game

import com.badlogic.gdx.graphics.GL20
import java.nio.Buffer

/** Diagnostic only: count actual GL calls without glGetError/glFinish synchronization. */
class ProfileGl(private val delegate: GL20) : GL20 by delegate {
    var draws = 0; private set
    var binds = 0; private set
    var uploads = 0; private set
    fun reset() { draws = 0; binds = 0; uploads = 0 }
    override fun glBindTexture(target: Int, texture: Int) { binds++; delegate.glBindTexture(target, texture) }
    override fun glDrawArrays(mode: Int, first: Int, count: Int) { draws++; delegate.glDrawArrays(mode, first, count) }
    override fun glDrawElements(mode: Int, count: Int, type: Int, indices: Buffer?) { draws++; delegate.glDrawElements(mode, count, type, indices) }
    override fun glDrawElements(mode: Int, count: Int, type: Int, indices: Int) { draws++; delegate.glDrawElements(mode, count, type, indices) }
    override fun glTexImage2D(target: Int, level: Int, internalformat: Int, width: Int, height: Int, border: Int, format: Int, type: Int, pixels: Buffer?) {
        uploads++; delegate.glTexImage2D(target, level, internalformat, width, height, border, format, type, pixels)
    }
    override fun glTexSubImage2D(target: Int, level: Int, xoffset: Int, yoffset: Int, width: Int, height: Int, format: Int, type: Int, pixels: Buffer?) {
        uploads++; delegate.glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels)
    }
    override fun glCompressedTexImage2D(target: Int, level: Int, internalformat: Int, width: Int, height: Int, border: Int, imageSize: Int, data: Buffer?) {
        uploads++; delegate.glCompressedTexImage2D(target, level, internalformat, width, height, border, imageSize, data)
    }
    override fun glCompressedTexSubImage2D(target: Int, level: Int, xoffset: Int, yoffset: Int, width: Int, height: Int, format: Int, imageSize: Int, data: Buffer?) {
        uploads++; delegate.glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data)
    }
}
