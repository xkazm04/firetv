package dev.deathride.artlab;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.*;
import com.badlogic.gdx.graphics.g2d.*;
import com.badlogic.gdx.math.Matrix4;
import com.badlogic.gdx.utils.ScreenUtils;
import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;
import java.util.*;

/** One cached ribbon submission, seeded static details, height-sorted silhouettes.
 * Art-only mock. Obstacle collision metadata is deliberately not a physics hook. */
final class FusionCourse {
    private final SpriteBatch batch = new SpriteBatch(3000);
    private final Matrix4 projection = new Matrix4();
    private Texture ground,dirt,cars,details,ribbon;
    private final Map<String,Texture> loaded=new LinkedHashMap<>();
    private final TextureRegion[] carRegions=new TextureRegion[10], marks=new TextureRegion[5], props=new TextureRegion[5];
    private TextureRegion barrier,shadow;
    private final float[] x=new float[361],y=new float[361],nx=new float[361],ny=new float[361];
    private final float[] vertices=new float[360*20];
    private final float[][] decals=new float[16][5];
    private final Item[] order=new Item[12];
    private final boolean natural;
    long bytes, cpuBytes=360*20*4;
    int draws;
    double fill, area, buildMs;
    boolean fullBundle;

    private static final class Item {float x,y,angle,height; int region,slot; boolean car;}
    FusionCourse(boolean natural) {
        this.natural=natural;long start=System.nanoTime();
        fullBundle=Gdx.files.internal("fusion-bundle/manifest.json").exists();
        if(fullBundle)loadBundle();
        else {
            ground=load("fusion/ground.png",true);dirt=load("fusion/dirt.png",true);
            cars=load("fusion/cars.png",false);details=load("fusion/details.png",false);
            ribbon=natural?load("fusion/ribbon.png",true):null;
            for(int i=0;i<5;i++){marks[i]=region(i);props[i]=region(5+i);}
            barrier=region(10);shadow=region(11);
        }
        if(ribbon!=null)ribbon.setWrap(Texture.TextureWrap.Repeat,Texture.TextureWrap.ClampToEdge);
        for(int i=0;i<10;i++)carRegions[i]=new TextureRegion(cars,(i%4)*128,(i/4)*128,128,128);
        for(int i=0;i<=360;i++) {
            double a=i*Math.PI*2/360,dx=-715*Math.sin(a)+165*Math.cos(a*3),dy=330*Math.cos(a),len=Math.hypot(dx,dy);
            x[i]=(float)(960+715*Math.cos(a)+55*Math.sin(a*3));y[i]=(float)(540+330*Math.sin(a));
            nx[i]=(float)(-dy/len);ny[i]=(float)(dx/len);
        }
        float distance=0,half=natural?113:88;
        for(int i=0;i<360;i++) {
            float length=(float)Math.hypot(x[i+1]-x[i],y[i+1]-y[i]);
            for(int j=0;j<4;j++) {
                int p=i*20+j*5,k=j<2?i:i+1;float sign=j==0||j==3?1:-1;
                float px=x[k]+nx[k]*half*sign,py=y[k]+ny[k]*half*sign;
                vertices[p]=px;vertices[p+1]=py;vertices[p+2]=Color.WHITE_FLOAT_BITS;
                vertices[p+3]=natural?(distance+(j<2?0:length))/512: px/256;
                vertices[p+4]=natural?(sign>0?0:1):py/256;
            }
            distance+=length;area+=length*half*2;
        }
        // Close the texture phase at the circuit join, avoiding a discontinuity.
        if(natural){float periods=Math.max(1,Math.round(distance/512));for(int i=0;i<vertices.length;i+=5)vertices[i+3]*=periods*512/distance;}
        Random rng=new Random(713);
        for(float[] d:decals){d[0]=rng.nextInt(360);d[1]=(rng.nextFloat()-.5f)*112;d[2]=rng.nextFloat()*360;d[3]=18+rng.nextFloat()*22;d[4]=rng.nextInt(5);}
        for(int i=0;i<order.length;i++){order[i]=new Item();order[i].slot=i;order[i].car=i<6;order[i].region=i<6?i:(i-6)%5;}
        Gdx.gl.glFinish();buildMs=(System.nanoTime()-start)/1e6;
    }
    private void loadBundle(){
        String root="fusion-bundle/";JsonReader reader=new JsonReader();
        JsonValue manifest=reader.parse(Gdx.files.internal(root+"manifest.json"));
        for(JsonValue page:manifest.get("pages"))load(root+page.getString("file"),false);
        for(JsonValue tile:manifest.get("tiles"))load(root+tile.getString("file"),true);
        load(root+manifest.get("themes").get(0).getString("file"),false);
        if(natural)ribbon=load(root+manifest.get("ribbons").get(0).getString("file"),true);
        cars=load("fusion/cars.png",false);
        if(cars.getWidth()!=1024||cars.getHeight()!=1024)throw new IllegalStateException("car reserve page dimensions");
        Pixmap reserve=new Pixmap(1024,1024,Pixmap.Format.RGBA8888);reserve.setColor(0,0,0,0);reserve.fill();
        Texture second=new Texture(reserve);reserve.dispose();loaded.put("reserved-car-page-2",second);bytes+=4L*1024*1024;
        Map<String,String> aliases=new HashMap<>();
        for(JsonValue asset:reader.parse(Gdx.files.internal(root+"catalog.json")).get("assets"))aliases.put(asset.getString("logical_name"),asset.getString("asset_id"));
        for(JsonValue tile:manifest.get("tiles")){
            if(tile.getString("id").equals(aliases.get("tiles/asphalt-worn")))ground=loaded.get(root+tile.getString("file"));
            if(tile.getString("id").equals(aliases.get("tiles/dirt")))dirt=loaded.get(root+tile.getString("file"));
        }
        JsonValue atlas=reader.parse(Gdx.files.internal(root+"world.json"));Map<String,TextureRegion> regions=new HashMap<>();
        for(JsonValue r:atlas.get("regions")){
            Texture t=loaded.get(root+atlas.get("pages").get(r.getInt("page")).getString("file"));
            regions.put(r.getString("id"),new TextureRegion(t,r.getInt("x"),r.getInt("y"),r.getInt("width"),r.getInt("height")));
        }
        String[] decalNames={"skid","oil","scorch","cracks","impact"},propNames={"brush","rock-field","soft-dune","dead-tree","rock-spire"};
        for(int i=0;i<5;i++){marks[i]=regions.get(aliases.get("decals/"+decalNames[i]));props[i]=regions.get(aliases.get("props/"+propNames[i]));}
        barrier=regions.get(aliases.get("barriers/concrete-straight"));shadow=regions.get("fusion-render-shadow");
        if(ground==null||dirt==null||shadow==null)throw new IllegalStateException("missing fusion bundle region");
        long expected=manifest.getLong("resident_rgba_bytes_with_reserved_cars")-(natural?0:512L*256*4);
        if(bytes!=expected)throw new IllegalStateException("resident bytes "+bytes+" != declared "+expected);
    }
    private TextureRegion region(int i){return new TextureRegion(details,(i%4)*128,(i/4)*128,128,128);}
    private Texture load(String name,boolean repeat){if(loaded.containsKey(name))return loaded.get(name);Texture t=new Texture(Gdx.files.internal(name));loaded.put(name,t);bytes+=(long)t.getWidth()*t.getHeight()*4;t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear);t.setWrap(repeat?Texture.TextureWrap.Repeat:Texture.TextureWrap.ClampToEdge,repeat?Texture.TextureWrap.Repeat:Texture.TextureWrap.ClampToEdge);return t;}
    private void begin(boolean blend){if(blend)batch.enableBlending();else batch.disableBlending();batch.begin();}
    private void end(){batch.end();draws+=batch.renderCalls;}
    private void sprite(TextureRegion r,float x,float y,float w,float h,float angle){batch.draw(r,x-w/2,y-h/2,w/2,h/2,w,h,1,1,angle);fill+=w*h;}
    void render(double seconds){
        draws=0;fill=0;float panX=(float)Math.sin(seconds*.2)*25,panY=(float)Math.cos(seconds*.2)*10;
        projection.setToOrtho2D(panX,panY,1920,1080);batch.setProjectionMatrix(projection);
        Gdx.gl.glViewport(0,0,Gdx.graphics.getBackBufferWidth(),Gdx.graphics.getBackBufferHeight());ScreenUtils.clear(.10f,.08f,.06f,1);
        begin(false);batch.setColor(Color.WHITE);batch.draw(dirt,0,0,1920,1080,0,0,1920/256f,1080/256f);fill+=1920*1080;end();
        begin(natural);batch.draw(natural?ribbon:ground,vertices,0,vertices.length);fill+=area;end();
        begin(true);batch.setColor(1,1,1,.38f);
        for(float[] d:decals){int i=(int)d[0];sprite(marks[(int)d[4]],x[i]+nx[i]*d[1],y[i]+ny[i]*d[1],d[3]*1.7f,d[3],d[2]);}
        batch.setColor(Color.WHITE);
        for(int i=18;i<360;i+=60){float a=(float)Math.toDegrees(Math.atan2(y[i+1]-y[i],x[i+1]-x[i]));sprite(barrier,x[i]+nx[i]*126,y[i]+ny[i]*126,56,32,a);}
        // Ground shadows all precede objects; no generated asset contains a cast shadow.
        for(Item item:order){
            if(item.car){float pos=(float)((seconds*13+item.slot*60)%360);int i=(int)pos;float a=pos-i;item.x=x[i]*(1-a)+x[i+1]*a;item.y=y[i]*(1-a)+y[i+1]*a;item.angle=(float)Math.toDegrees(Math.atan2(y[i+1]-y[i],x[i+1]-x[i]));item.height=0;}
            else{int i=8+(item.slot-6)*60;item.x=x[i]+nx[i]*122;item.y=y[i]+ny[i]*122;item.angle=0;item.height=item.region>=3?30:0;}
            batch.setColor(0,0,0,.26f);sprite(shadow,item.x+4+item.height*.3f,item.y-5-item.height*.22f,item.car?100:72,item.car?52:55+item.height, item.car?item.angle:-20);
        }
        end();
        // Insertion sort twelve objects without per-frame allocation. Lower feet draw last.
        for(int i=1;i<order.length;i++){Item item=order[i];int j=i-1;while(j>=0&&order[j].y<item.y){order[j+1]=order[j];j--;}order[j+1]=item;}
        begin(true);batch.setColor(Color.WHITE);
        for(Item item:order)sprite(item.car?carRegions[item.region]:props[item.region],item.x,item.y+item.height,item.car?128:92,item.car?128:92,item.angle);
        end();
    }
    void dispose(){batch.dispose();for(Texture t:loaded.values())t.dispose();}
}
