package dev.deathride.artprobe;

import android.app.Activity;
import android.os.Bundle;
import android.opengl.GLES20;
import android.opengl.GLSurfaceView;
import android.opengl.GLUtils;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;
import android.view.WindowManager;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.Arrays;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

/** Isolated representation experiment. Does not load or modify the game or its saves. */
public final class ProbeActivity extends Activity {
    private GLSurfaceView view;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        view=new GLSurfaceView(this);view.setEGLContextClientVersion(2);
        view.setRenderer(new Probe(getIntent().getIntExtra("headings",1)));
        setContentView(view);
    }
    @Override public void onPause(){super.onPause();view.onPause();}
    @Override public void onResume(){super.onResume();view.onResume();}
    private final class Probe implements GLSurfaceView.Renderer {
        final int headings;
        final FloatBuffer vertices=ByteBuffer.allocateDirect(16*4).order(ByteOrder.nativeOrder()).asFloatBuffer();
        final float[] data=new float[16];
        final double[] intervals=new double[1800];
        final int[] textures=new int[2];
        int program,position,uv,sampler,n=0,width,height,frames;
        long previous,start,bytes;
        Probe(int count){headings=count==16||count==32?count:1;}
        int shader(int type,String text){int s=GLES20.glCreateShader(type);GLES20.glShaderSource(s,text);GLES20.glCompileShader(s);int[] ok={0};GLES20.glGetShaderiv(s,GLES20.GL_COMPILE_STATUS,ok,0);if(ok[0]==0)throw new IllegalStateException(GLES20.glGetShaderInfoLog(s));return s;}
        @Override public void onSurfaceCreated(GL10 unused,EGLConfig config){
            program=GLES20.glCreateProgram();
            GLES20.glAttachShader(program,shader(GLES20.GL_VERTEX_SHADER,"attribute vec2 p; attribute vec2 t; varying vec2 v; void main(){gl_Position=vec4(p,0.,1.);v=t;}"));
            GLES20.glAttachShader(program,shader(GLES20.GL_FRAGMENT_SHADER,"precision mediump float; varying vec2 v; uniform sampler2D tex; void main(){gl_FragColor=texture2D(tex,v);}"));
            GLES20.glLinkProgram(program);GLES20.glUseProgram(program);
            position=GLES20.glGetAttribLocation(program,"p");uv=GLES20.glGetAttribLocation(program,"t");sampler=GLES20.glGetUniformLocation(program,"tex");
            int pages=headings==32?2:1;GLES20.glGenTextures(pages,textures,0);
            try { for(int i=0;i<pages;i++){
                String path=headings==1?"single.png":"h"+headings+"-"+i+".png";
                Bitmap bmp=BitmapFactory.decodeStream(getAssets().open(path));bytes+=(long)bmp.getWidth()*bmp.getHeight()*4;
                GLES20.glBindTexture(GLES20.GL_TEXTURE_2D,textures[i]);
                GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D,GLES20.GL_TEXTURE_MIN_FILTER,GLES20.GL_LINEAR);
                GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D,GLES20.GL_TEXTURE_MAG_FILTER,GLES20.GL_LINEAR);
                GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D,GLES20.GL_TEXTURE_WRAP_S,GLES20.GL_CLAMP_TO_EDGE);
                GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D,GLES20.GL_TEXTURE_WRAP_T,GLES20.GL_CLAMP_TO_EDGE);
                GLUtils.texImage2D(GLES20.GL_TEXTURE_2D,0,bmp,0);bmp.recycle();
            }}catch(Exception e){throw new RuntimeException(e);}
            GLES20.glEnable(GLES20.GL_BLEND);GLES20.glBlendFunc(GLES20.GL_ONE,GLES20.GL_ONE_MINUS_SRC_ALPHA);
            GLES20.glEnableVertexAttribArray(position);GLES20.glEnableVertexAttribArray(uv);
            GLES20.glUniform1i(sampler,0);start=System.nanoTime();previous=0;
            Log.i("ArtProbe","READY headings="+headings+" rgbaBytes="+bytes+" renderer="+GLES20.glGetString(GLES20.GL_RENDERER));
        }
        @Override public void onSurfaceChanged(GL10 unused,int w,int h){width=w;height=h;GLES20.glViewport(0,0,w,h);}
        @Override public void onDrawFrame(GL10 unused){
            long now=System.nanoTime();double seconds=(now-start)/1e9;
            if(previous!=0&&seconds>5&&n<intervals.length)intervals[n++]=(now-previous)/1e6;
            previous=now;GLES20.glClearColor(.12f,.14f,.16f,1);GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
            for(int car=0;car<6;car++){
                double angle=(seconds*.22+car*Math.PI/3)%(Math.PI*2);
                int frame=headings==1?0:(int)Math.round(angle/(Math.PI*2)*headings)%headings;
                double rotation=headings==1?angle:0;
                float cx=(car%3-1)*.60f,cy=(car/3==0?.44f:-.44f);
                // 256 source pixels occupy 384 physical pixels at 1080p: W6-scale diagnostic.
                float halfX=384f/width,halfY=384f/height;
                float c=(float)Math.cos(rotation),s=(float)Math.sin(rotation);
                float u0=headings==1?0:(frame%4)*.25f,v0=headings==1?0:((frame%16)/4)*.25f;
                float step=headings==1?1:.25f;
                for(int v=0;v<4;v++){
                    float x=(v%2==0?-1:1),y=(v<2?-1:1);
                    data[v*4]=cx+(x*c-y*s)*halfX;data[v*4+1]=cy+(x*s+y*c)*halfY;
                    data[v*4+2]=u0+(x+1)*.5f*step;data[v*4+3]=v0+(1-y)*.5f*step;
                }
                vertices.clear();vertices.put(data).position(0);GLES20.glVertexAttribPointer(position,2,GLES20.GL_FLOAT,false,16,vertices);
                vertices.position(2);GLES20.glVertexAttribPointer(uv,2,GLES20.GL_FLOAT,false,16,vertices);
                GLES20.glBindTexture(GLES20.GL_TEXTURE_2D,textures[frame/16]);GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP,0,4);
            }
            frames++;
            if(n==intervals.length){
                Arrays.sort(intervals);Log.i("ArtProbe","RESULT {\"headings\":"+headings+",\"samples\":"+n+",\"p50_ms\":"+intervals[n/2]+",\"p95_ms\":"+intervals[(int)(n*.95)]+",\"max_ms\":"+intervals[n-1]+",\"rgba_bytes\":"+bytes+",\"elapsed_s\":"+seconds+"}");n++;
            }
        }
    }
}
