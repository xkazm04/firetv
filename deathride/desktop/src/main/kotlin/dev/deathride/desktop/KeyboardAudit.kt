package dev.deathride.desktop

import com.badlogic.gdx.ApplicationListener
import com.badlogic.gdx.Gdx
import com.badlogic.gdx.backends.lwjgl3.DefaultLwjgl3Input
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Graphics
import org.lwjgl.glfw.GLFW

/** Injects only into this game's GLFW input callback; never types into another application. */
class KeyboardAudit(private val game: ApplicationListener): ApplicationListener by game {
    private val callback=DefaultLwjgl3Input::class.java.getDeclaredMethod("keyCallback",java.lang.Long.TYPE,Integer.TYPE,Integer.TYPE,Integer.TYPE,Integer.TYPE).apply { isAccessible=true }
    private var elapsed=0.0
    private var event=0
    override fun render() {
        elapsed+=Gdx.graphics.deltaTime
        when {
            event==0 && elapsed>2 -> { key(GLFW.GLFW_KEY_W,GLFW.GLFW_PRESS); event++ }
            event==1 && elapsed>3.8 -> { key(GLFW.GLFW_KEY_D,GLFW.GLFW_PRESS); event++ }
            event==2 && elapsed>4.5 -> { key(GLFW.GLFW_KEY_D,GLFW.GLFW_RELEASE); event++ }
            event==3 && elapsed>4.8 -> { key(GLFW.GLFW_KEY_W,GLFW.GLFW_RELEASE); event++ }
        }
        game.render()
    }
    private fun key(code: Int,action: Int) { callback.invoke(Gdx.input,(Gdx.graphics as Lwjgl3Graphics).window.windowHandle,code,0,action,0) }
}
