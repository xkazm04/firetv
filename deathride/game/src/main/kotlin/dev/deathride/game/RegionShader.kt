package dev.deathride.game

import com.badlogic.gdx.graphics.glutils.ShaderProgram

/** Same single texture sample as SpriteBatch. Grade is fused into the existing scenery draw. */
object RegionShader {
    fun create()=ShaderProgram("""
        attribute vec4 a_position;
        attribute vec4 a_color;
        attribute vec2 a_texCoord0;
        uniform mat4 u_projTrans;
        varying vec4 v_color;
        varying vec2 v_texCoords;
        void main() {
            v_color=a_color; v_color.a=v_color.a*(255.0/254.0);
            v_texCoords=a_texCoord0;
            gl_Position=u_projTrans*a_position;
        }
    """.trimIndent(),"""
        #ifdef GL_ES
        precision mediump float;
        #endif
        varying vec4 v_color;
        varying vec2 v_texCoords;
        uniform sampler2D u_texture;
        uniform vec3 u_regionGrade;
        void main() {
            vec4 c=v_color*texture2D(u_texture,v_texCoords);
            gl_FragColor=vec4(c.rgb*u_regionGrade,c.a);
        }
    """.trimIndent()).also{check(it.isCompiled){it.log}}
}
