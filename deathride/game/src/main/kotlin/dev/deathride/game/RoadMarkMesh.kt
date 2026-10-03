package dev.deathride.game

import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.glutils.ShaderProgram
import com.badlogic.gdx.math.Matrix4
import com.badlogic.gdx.math.Vector2

/** One bounded, context-managed static buffer shared by successive courses. */
class RoadMarkMesh {
    private val vertices=FloatArray(12000*4)
    private val normal=Vector2()
    private var used=0
    private val mesh=Mesh(true,12000,0,VertexAttribute.Position(),VertexAttribute.ColorPacked())
    private val shader=ShaderProgram("""
        attribute vec4 a_position;
        attribute vec4 a_color;
        uniform mat4 u_projTrans;
        varying vec4 v_color;
        void main(){v_color=a_color;v_color.a*=255.0/254.0;gl_Position=u_projTrans*a_position;}
    ""","""
        #ifdef GL_ES
        precision mediump float;
        #endif
        varying vec4 v_color;
        void main(){gl_FragColor=v_color;}
    """)
    init { check(shader.isCompiled){shader.log} }
    val capacityBytes get()=vertices.size*4
    fun clear(){used=0}
    private fun vertex(x: Float,y: Float,color: Float){vertices[used++]=x;vertices[used++]=y;vertices[used++]=0f;vertices[used++]=color}
    fun line(x1: Float,y1: Float,x2: Float,y2: Float,width: Float,r: Float,g: Float,b: Float){
        check(used+24<=vertices.size){"Road mark capacity exceeded"}
        // Same float normalization and vertex order as ShapeRenderer.rectLine.
        normal.set(y2-y1,x1-x2).nor()
        val half=width*.5f;val tx=normal.x*half;val ty=normal.y*half
        val color=Color.toFloatBits(r,g,b,1f)
        vertex(x1+tx,y1+ty,color);vertex(x1-tx,y1-ty,color);vertex(x2+tx,y2+ty,color)
        vertex(x2-tx,y2-ty,color);vertex(x2+tx,y2+ty,color);vertex(x1-tx,y1-ty,color)
    }
    fun upload(){mesh.setVertices(vertices,0,used)}
    fun draw(matrix: Matrix4){if(used==0)return;shader.bind();shader.setUniformMatrix("u_projTrans",matrix);mesh.render(shader,GL20.GL_TRIANGLES,0,used/4)}
    fun dispose(){mesh.dispose();shader.dispose()}
}
