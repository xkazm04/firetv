package dev.deathride.artlab;

import com.badlogic.gdx.*;
import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.graphics.*;
import com.badlogic.gdx.graphics.g2d.*;
import com.badlogic.gdx.graphics.glutils.*;
import com.badlogic.gdx.math.Matrix4;
import com.badlogic.gdx.utils.*;
import java.util.*;

/** Faithful 2D rendering experiment. No game services, saves, ports or simulation. */
public final class SurfaceLab extends ApplicationAdapter {
    public static final String[] MODES={"baseline","painted","macro","decals","ribbon","edges","grade-dust","depth","wear","poster-grain","contrast","combined","ribbon-control","lean-stack","efficient-stack","cached-stack"};
    private static final int W=1920,H=1080,SAMPLES=900,WARM=240;
    private int style;
    private final boolean automatic;
    private final String run;
    private int mode,frame,n,draws;
    private long previous,bytes;
    private double seconds,fill;
    private final double[] intervals=new double[SAMPLES],cpu=new double[SAMPLES],completion=new double[SAMPLES];
    private final double[] drawSamples=new double[SAMPLES],fillSamples=new double[SAMPLES];
    private double bakeMs;
    private final float[] quad=new float[20];
    private float[] cachedGround,cachedEdges;
    private double groundArea,edgeArea;
    private final Matrix4 projection=new Matrix4().setToOrtho2D(0,0,W,H);
    private SpriteBatch batch;
    private Texture ground,dirt,car,atlas,macro;
    private TextureRegion[] decals;
    private TextureRegion prop,barrier,dust,white,shadow;
    private FrameBuffer ribbon,wear;
    private TextureRegion baked,wearRegion;
    private ShaderProgram surface;
    private final Array<Texture> owned=new Array<>();
    private final float[] cx=new float[361],cy=new float[361],nx=new float[361],ny=new float[361];
    private final float[][] scatter=new float[64][5];
    private boolean finished,screenshot;
    private double captureSeconds;

    public SurfaceLab(int mode,int style,boolean automatic,String run) {
        if(mode<0||mode>=MODES.length||style<0||style>2)throw new IllegalArgumentException("invalid mode/style");
        this.mode=mode;this.style=style;this.automatic=automatic;
        this.run=run==null?"manual":run.replaceAll("[^a-zA-Z0-9_-]","_");
    }
    private Texture texture(String name,boolean repeat) {
        Texture t=new Texture(Gdx.files.internal(name));owned.add(t);bytes+=(long)t.getWidth()*t.getHeight()*4;
        t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear);
        t.setWrap(repeat?Texture.TextureWrap.Repeat:Texture.TextureWrap.ClampToEdge,repeat?Texture.TextureWrap.Repeat:Texture.TextureWrap.ClampToEdge);
        return t;
    }
    private boolean on(int feature) { return mode==feature || mode==11 && feature!=4 || mode==12 && (feature==3||feature==5) || mode>=13 && (feature==2||feature==3||feature==5||feature==6||feature==10); }
    @Override public void create() {
        bakeMs=0;cachedGround=null;cachedEdges=null;
        batch=new SpriteBatch(3000);batch.setProjectionMatrix(projection);
        ground=texture(mode==0?"baseline.png":"ground-"+style+".png",true);
        dirt=texture("dirt.png",true);car=texture("car.png",false);atlas=texture("details.png",false);
        decals=new TextureRegion[4];for(int i=0;i<4;i++)decals[i]=new TextureRegion(atlas,i*128,0,128,128);
        prop=new TextureRegion(atlas,0,128,128,128);barrier=new TextureRegion(atlas,128,128,128,128);
        dust=new TextureRegion(atlas,256,128,128,128);shadow=new TextureRegion(atlas,384,128,128,128);white=new TextureRegion(atlas,8,264,1,1);
        if(on(2))macro=texture("macro.png",true);
        surface=new ShaderProgram(VERT,FRAG);
        if(!surface.isCompiled())throw new IllegalStateException(surface.getLog());
        for(int i=0;i<=360;i++) {
            double a=i*Math.PI*2/360;
            cx[i]=(float)(960+715*Math.cos(a)+55*Math.sin(a*3));cy[i]=(float)(540+330*Math.sin(a));
            double dx=-715*Math.sin(a)+165*Math.cos(a*3),dy=330*Math.cos(a),len=Math.hypot(dx,dy);
            nx[i]=(float)(-dy/len);ny[i]=(float)(dx/len);
        }
        Random r=new Random(713);
        for(float[] s:scatter){s[0]=r.nextInt(360);s[1]=(r.nextFloat()-.5f)*125;s[2]=r.nextFloat()*360;s[3]=25+r.nextFloat()*55;s[4]=r.nextInt(4);}
        if(mode==15)cacheGeometry();
        if(mode==4){
            long bakeStart=System.nanoTime();
            ribbon=new FrameBuffer(Pixmap.Format.RGBA8888,1024,1024,false);bytes+=4L*1024*1024;
            ribbon.begin();ScreenUtils.clear(.22f,.16f,.10f,1);batch.setProjectionMatrix(projection);
            drawStatic(true,true,false);ribbon.end();baked=new TextureRegion(ribbon.getColorBufferTexture());baked.flip(false,true);baked.getTexture().setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear);Gdx.gl.glFinish();bakeMs=(System.nanoTime()-bakeStart)/1e6;
        }
        if(on(8)){
            wear=new FrameBuffer(Pixmap.Format.RGBA8888,512,512,false);bytes+=4L*512*512;
            wear.begin();ScreenUtils.clear(0,0,0,0);wear.end();wearRegion=new TextureRegion(wear.getColorBufferTexture());wearRegion.flip(false,true);
            wearRegion.getTexture().setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear);
        }
        Gdx.app.log("ArtLab","READY "+MODES[mode]+" style="+style+" bytes="+bytes+" renderer="+Gdx.gl.glGetString(GL20.GL_RENDERER));
    }
    private void begin(boolean blend){batch.setProjectionMatrix(projection);if(blend)batch.enableBlending();else batch.disableBlending();batch.begin();}
    private void end(){batch.end();draws+=batch.renderCalls;}
    private void rect(Texture t,float x,float y,float w,float h,float u,float v,float u2,float v2){batch.draw(t,x,y,w,h,u,v,u2,v2);fill+=w*h;}
    private void sprite(TextureRegion t,float x,float y,float w,float h,float angle){batch.draw(t,x-w/2,y-h/2,w/2,h/2,w,h,1,1,angle);fill+=w*h;}
    private void road(float half,Texture t,boolean tiled,float red,float green,float blue,float alpha) {
        if(mode==15&&t==ground&&half==88){batch.draw(t,cachedGround,0,cachedGround.length);fill+=groundArea;return;}
        float packed=Color.toFloatBits(red,green,blue,alpha);
        for(int i=0;i<360;i++) {
            for(int j=0;j<4;j++){int p=j*5,k=j<2?i:i+1;float sign=j==0||j==3?1:-1,x=cx[k]+nx[k]*half*sign,y=cy[k]+ny[k]*half*sign;quad[p]=x;quad[p+1]=y;quad[p+2]=packed;quad[p+3]=tiled?x/256:8.5f/512;quad[p+4]=tiled?y/256:264.5f/512;}
            batch.draw(t,quad,0,20);fill+=Math.hypot(cx[i+1]-cx[i],cy[i+1]-cy[i])*half*2;
        }
    }
    private void cacheGeometry() {
        cachedGround=new float[360*20];cachedEdges=new float[3*360*2*20];groundArea=edgeArea=0;
        float[][] bands={{113,104,.10f,.075f,.05f},{104,94,.57f,.38f,.20f},{94,88,.16f,.12f,.08f}};
        for(int i=0;i<360;i++){
            for(int j=0;j<4;j++){int p=i*20+j*5,k=j<2?i:i+1;float sign=j==0||j==3?1:-1,x=cx[k]+nx[k]*88*sign,y=cy[k]+ny[k]*88*sign;cachedGround[p]=x;cachedGround[p+1]=y;cachedGround[p+2]=Color.toFloatBits(1f,1f,1f,1f);cachedGround[p+3]=x/256;cachedGround[p+4]=y/256;}
            groundArea+=Math.hypot(cx[i+1]-cx[i],cy[i+1]-cy[i])*176;
        }
        int offset=0;
        for(float[] band:bands)for(int i=0;i<360;i++){
            for(int sign=-1;sign<=1;sign+=2){
                for(int j=0;j<4;j++){int p=offset+j*5,k=j<2?i:i+1;float radius=j==0||j==3?band[0]:band[1];cachedEdges[p]=cx[k]+nx[k]*radius*sign;cachedEdges[p+1]=cy[k]+ny[k]*radius*sign;cachedEdges[p+2]=Color.toFloatBits(band[2],band[3],band[4],1);cachedEdges[p+3]=8.5f/512;cachedEdges[p+4]=264.5f/512;}
                offset+=20;
            }
            edgeArea+=Math.hypot(cx[i+1]-cx[i],cy[i+1]-cy[i])*(band[0]-band[1])*2;
        }
    }
    private void configureShader(boolean enabled){
        batch.setShader(enabled?surface:null);
        if(enabled){
            surface.bind();surface.setUniformf("u_macroOn",on(2)?1:0);surface.setUniformf("u_grade",on(6)?1:0);surface.setUniformf("u_poster",on(9)?1:0);surface.setUniformf("u_contrast",on(10)?1:0);
            surface.setUniformi("u_macro",1);(macro==null?ground:macro).bind(1);Gdx.gl.glActiveTexture(GL20.GL_TEXTURE0);
        }
    }
    private void edgeBand(float outer,float inner,float red,float green,float blue) {
        float packed=Color.toFloatBits(red,green,blue,1);
        for(int i=0;i<360;i++) {
            for(int sign=-1;sign<=1;sign+=2) {
                for(int j=0;j<4;j++){int p=j*5,k=j<2?i:i+1;float radius=j==0||j==3?outer:inner;quad[p]=cx[k]+nx[k]*radius*sign;quad[p+1]=cy[k]+ny[k]*radius*sign;quad[p+2]=packed;quad[p+3]=8.5f/512;quad[p+4]=264.5f/512;}
                batch.draw(atlas,quad,0,20);
            }
            fill+=Math.hypot(cx[i+1]-cx[i],cy[i+1]-cy[i])*(outer-inner)*2;
        }
    }
    private void drawStatic(boolean edge,boolean scatterOn,boolean shader) {
        configureShader(shader);begin(false);batch.setColor(1,1,1,1);
        rect(dirt,0,0,W,H,0,0,W/256f,H/256f);end();configureShader(false);
        if(edge){begin(false);if(mode==15){batch.draw(atlas,cachedEdges,0,cachedEdges.length);fill+=edgeArea;}else if(mode==14){edgeBand(113,104,.10f,.075f,.05f);edgeBand(104,94,.57f,.38f,.20f);edgeBand(94,88,.16f,.12f,.08f);}else{road(113,atlas,false,.10f,.075f,.05f,1);road(104,atlas,false,.57f,.38f,.20f,1);road(94,atlas,false,.16f,.12f,.08f,1);}end();}
        configureShader(shader);begin(false);road(88,ground,true,1,1,1,1);end();configureShader(false);
        if(scatterOn){begin(true);batch.setColor(.8f,.7f,.57f,mode>=13?.45f:.7f);for(int k=0;k<scatter.length;k++){if(mode>=13&&k%(mode>=14?4:2)!=0)continue;float[] s=scatter[k];int i=(int)s[0];float scale=mode>=13?.7f:1; sprite(decals[(int)s[4]],cx[i]+nx[i]*s[1],cy[i]+ny[i]*s[1],s[3]*1.7f*scale,s[3]*scale,s[2]);}batch.setColor(Color.WHITE);end();}
        if(edge){begin(true);for(int i=0;i<360;i+=12){float angle=(float)Math.toDegrees(Math.atan2(cy[i+1]-cy[i],cx[i+1]-cx[i]));sprite(barrier,cx[i]+nx[i]*113,cy[i]+ny[i]*113,44,24,angle);}end();}
    }
    private void updateWear(double time) {
        if(wear==null||frame%3!=0)return;
        projection.setToOrtho2D(0,0,W,H);
        double beforeFill=fill;
        wear.begin();begin(true);batch.setBlendFunctionSeparate(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA,GL20.GL_ONE,GL20.GL_ONE_MINUS_SRC_ALPHA);batch.setColor(.065f,.05f,.045f,.24f);
        for(int c=0;c<6;c++){int i=((int)(time*13+c*60))%360;sprite(decals[2],cx[i],cy[i],30,13,(float)Math.toDegrees(Math.atan2(cy[i+1]-cy[i],cx[i+1]-cx[i])));}
        batch.setColor(Color.WHITE);end();wear.end();fill=beforeFill+(fill-beforeFill)*(512.0*512/(W*H));batch.setBlendFunction(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA);
    }
    private void scene(double time) {
        updateWear(time);Gdx.gl.glViewport(0,0,Gdx.graphics.getBackBufferWidth(),Gdx.graphics.getBackBufferHeight());ScreenUtils.clear(.1f,.08f,.06f,1);
        float panX=(float)Math.sin(time*.2)*25,panY=(float)Math.cos(time*.2)*10;
        projection.setToOrtho2D(panX,panY,W,H);
        if(mode==4){begin(false);batch.setColor(Color.WHITE);batch.draw(baked,0,0,W,H);fill+=W*H;end();}
        else drawStatic(on(5),on(3),on(2)||on(6)||on(9)||on(10));
        if(wear!=null){begin(true);batch.setBlendFunction(GL20.GL_ONE,GL20.GL_ONE_MINUS_SRC_ALPHA);batch.draw(wearRegion,0,0,W,H);fill+=W*H;end();batch.setBlendFunction(GL20.GL_SRC_ALPHA,GL20.GL_ONE_MINUS_SRC_ALPHA);}
        begin(true);
        for(int c=0;c<6;c++){
            float pos=(float)((time*13+c*60)%360);int i=(int)pos;float a=pos-i;
            float x=cx[i]*(1-a)+cx[i+1]*a,y=cy[i]*(1-a)+cy[i+1]*a;
            float angle=(float)Math.toDegrees(Math.atan2(cy[i+1]-cy[i],cx[i+1]-cx[i]));
            batch.setColor(.0f,.0f,.0f,.3f);sprite(shadow,x+4,y-5,105,62,angle);batch.setColor(Color.WHITE);
            // Preserve the square authored cell and aspect; 223px art bounds become 96px.
            float cw=110,ch=cw*car.getHeight()/car.getWidth();
            batch.draw(car,x-cw/2,y-ch/2,cw/2,ch/2,cw,ch,1,1,angle,0,0,car.getWidth(),car.getHeight(),false,false);fill+=cw*ch;
        }
        end();
        if(on(7)){
            begin(true);for(int i=8;i<360;i+=40){float x=cx[i]+nx[i]*125,y=cy[i]+ny[i]*125;batch.setColor(0,0,0,.32f);sprite(shadow,x+13,y-12,84,100,-20);batch.setColor(Color.WHITE);sprite(prop,x-panX*.3f,y+25-panY*.3f,128,128,0);}end();
        }
        if(on(6)){
            begin(true);batch.setColor(.67f,.48f,.26f,.13f);for(int i=0;i<(mode>=14?8:28);i++){float x=(float)((i*193.7+time*22)%W),y=(i*139)%H;sprite(dust,x,y,90,45,0);}batch.setColor(Color.WHITE);end();
        }
    }
    @Override public void render(){
        if(!automatic){
            int change=Gdx.input.isKeyJustPressed(Input.Keys.RIGHT)?1:Gdx.input.isKeyJustPressed(Input.Keys.LEFT)?-1:0;
            boolean nextStyle=Gdx.input.isKeyJustPressed(Input.Keys.UP);
            if(change!=0||nextStyle){dispose();owned.clear();macro=null;ribbon=null;wear=null;bytes=0;mode=(mode+change+MODES.length)%MODES.length;if(nextStyle)style=(style+1)%3;n=frame=0;seconds=0;previous=0;finished=false;create();return;}
        }
        if(finished)return;
        long now=System.nanoTime();double dt=previous==0?1.0/60:(now-previous)/1e9;previous=now;seconds+=dt;
        draws=0;fill=0;long begin=System.nanoTime();scene(seconds);long submitted=System.nanoTime();
        // Separate synchronised diagnostic: CPU+GPU completion wall time, not a GPU timer query.
        Gdx.gl.glFinish();long done=System.nanoTime();
        if(frame>=WARM&&n<SAMPLES){intervals[n]=dt*1000;cpu[n]=(submitted-begin)/1e6;completion[n]=(done-begin)/1e6;drawSamples[n]=draws;fillSamples[n]=fill;n++;}
        frame++;
        if(n==SAMPLES){
            double measuredDraws=mean(drawSamples),measuredFill=mean(fillSamples);captureSeconds=12;
            // Capture after timed sampling, with identical phase for every A/B.
            if(wear!=null){wear.begin();ScreenUtils.clear(0,0,0,0);wear.end();for(int i=0;i<240;i++){frame=i*3;updateWear(i*.05);}}
            scene(captureSeconds);Gdx.gl.glFinish();
            FileHandle dir=Gdx.files.local("artlab-output/"+run+"-"+style+"-"+MODES[mode]);dir.mkdirs();
            Pixmap p=Pixmap.createFromFrameBuffer(0,0,Gdx.graphics.getBackBufferWidth(),Gdx.graphics.getBackBufferHeight());PixmapIO.PNG png=new PixmapIO.PNG();png.setFlipY(true);try{png.write(dir.child("scene.png"),p);}catch(Exception e){throw new RuntimeException(e);}finally{png.dispose();p.dispose();}
            JsonValue out=new JsonValue(JsonValue.ValueType.object);
            put(out,"mode",MODES[mode]);put(out,"style",style);put(out,"samples",n);put(out,"warmup_frames",WARM);put(out,"rgba_bytes",bytes);put(out,"draw_calls",measuredDraws);put(out,"submitted_pixel_area_ratio",measuredFill/(W*H));put(out,"width",Gdx.graphics.getBackBufferWidth());put(out,"height",Gdx.graphics.getBackBufferHeight());
            put(out,"p50_ms",percentile(intervals,.5));put(out,"p95_ms",percentile(intervals,.95));put(out,"max_ms",percentile(intervals,1));put(out,"cpu_p50_ms",percentile(cpu,.5));put(out,"completion_p50_ms",percentile(completion,.5));put(out,"completion_p95_ms",percentile(completion,.95));
            put(out,"draw_calls_max",percentile(drawSamples,1));put(out,"draw_calls_basis","mean of all timed frames including wear updates; SpriteBatch flushes");put(out,"bake_completion_ms",bakeMs);put(out,"fill_basis","submitted quad/road pixel area, including overlap and clipping; proxy, not measured GPU fragments");
            put(out,"cpu_geometry_bytes",cachedGround==null?0:(cachedGround.length+cachedEdges.length)*4);
            put(out,"renderer",Gdx.gl.glGetString(GL20.GL_RENDERER));put(out,"timing_basis","start-to-start frame intervals; glFinish each frame; completion is CPU+GPU wall time, NOT a GPU timer");put(out,"scope","isolated libGDX rendering mock; no gameplay or soak");
            out.addChild("intervals_ms",array(intervals));out.addChild("cpu_ms",array(cpu));out.addChild("completion_ms",array(completion));
            String json=out.prettyPrint(JsonWriter.OutputType.json,120);dir.child("result.json").writeString(json,false,"UTF-8");Gdx.app.log("ArtLab","RESULT "+dir.path()+" p50="+percentile(intervals,.5)+" bytes="+bytes);finished=true;
            if(Gdx.app.getType()==Application.ApplicationType.Desktop)Gdx.app.exit();
        }
    }
    private static JsonValue array(double[] v){JsonValue a=new JsonValue(JsonValue.ValueType.array);for(double x:v)a.addChild(new JsonValue(x));return a;}
    private static void put(JsonValue o,String k,String v){o.addChild(k,new JsonValue(v));}
    private static void put(JsonValue o,String k,double v){o.addChild(k,new JsonValue(v));}
    private static double percentile(double[] v,double f){double[] a=v.clone();Arrays.sort(a);return a[Math.min(a.length-1,(int)(f*a.length))];}
    private static double mean(double[] v){double sum=0;for(double n:v)sum+=n;return sum/v.length;}
    @Override public void resize(int w,int h){Gdx.gl.glViewport(0,0,w,h);}
    @Override public void dispose(){for(Texture t:owned)t.dispose();if(ribbon!=null)ribbon.dispose();if(wear!=null)wear.dispose();surface.dispose();batch.dispose();}
    private static final String VERT="attribute vec4 a_position; attribute vec4 a_color; attribute vec2 a_texCoord0; uniform mat4 u_projTrans; varying vec4 v_color; varying vec2 v_texCoords; void main(){v_color=a_color;v_color.a=v_color.a*(255.0/254.0);v_texCoords=a_texCoord0;gl_Position=u_projTrans*a_position;}";
    private static final String FRAG="#ifdef GL_ES\nprecision mediump float;\n#endif\nvarying vec4 v_color; varying vec2 v_texCoords; uniform sampler2D u_texture; uniform sampler2D u_macro; uniform float u_macroOn,u_grade,u_poster,u_contrast; void main(){vec4 c=texture2D(u_texture,v_texCoords)*v_color; if(u_macroOn>0.5)c.rgb*=mix(0.72,1.18,texture2D(u_macro,v_texCoords*0.25).r); if(u_grade>0.5)c.rgb=c.rgb*vec3(1.08,0.98,0.84)+vec3(0.015,0.005,0.0); if(u_poster>0.5){float grain=fract(sin(dot(floor(gl_FragCoord.xy/3.0),vec2(12.9898,78.233)))*43758.5453);c.rgb=floor(c.rgb*6.0+grain*0.22)/6.0;}if(u_contrast>0.5){float l=dot(c.rgb,vec3(0.299,0.587,0.114));c.rgb=mix(vec3(l),c.rgb,0.45)*0.68+vec3(0.045);}gl_FragColor=c;}";
}
