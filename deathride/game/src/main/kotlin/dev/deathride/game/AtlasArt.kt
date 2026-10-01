package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.JsonValue
import dev.deathride.core.*

/** Presentation-only assets. A broken page or entry cannot disable the procedural renderer. */
class AtlasArt(private val root: FileHandle = Gdx.files.internal("phase2-v1")) {
    data class Region(val image: TextureRegion, val pivotX: Float, val pivotY: Float, val interior: IntArray?,val bodyBounds: IntArray?=null)
    data class Entry(val id: String, val group: String, val frames: Array<String>, val durations: IntArray,
                     val loop: Boolean, val approved: Boolean)
    private val entries=HashMap<String,Entry>()
    private val regions=HashMap<String,Region>()
    private val atlases=ArrayList<TextureAtlas>()
    private val tiles=HashMap<String,Texture>()
    private var backdrop: Texture?=null
    private var backdropKey=""
    private val carKeys=CarCatalog.all.associate { it.id to arrayOf("clean","damaged-1","damaged-2","wreck").map{s->"cars/${it.id.lowercase()}/$s"}.toTypedArray() }
    var textureBytes=0L; private set
    var failures=0; private set
    var draws=0L; private set
    val regionCount get()=regions.size
    private fun failed(id: String,e: Exception) { failures++;Gdx.app.log("DeathRide","art fallback $id: ${e.javaClass.simpleName}: ${e.message}") }
    init {
        try {
            val catalog=JsonReader().parse(root.child("catalog.json"))
            for(v in catalog.get("assets")) {
                try {
                    val id=v.getString("asset_id");val frames=v.get("frames")?.asStringArray()?:arrayOf(id)
                    val durations=v.get("durations_ms")?.asIntArray()?:intArrayOf(1)
                    require(frames.size==durations.size && durations.all{it>0})
                    val e=Entry(id,v.getString("group"),frames,durations,v.getBoolean("loop",false),v.getBoolean("owner_approved",false))
                    entries[v.getString("logical_name")]=e;entries[id]=e
                } catch(e: Exception){failed("catalog entry",e)}
            }
            fun aliases(v: JsonValue?) { if(v==null)return;for(a in v)if(a.isString)entries[a.asString()]?.let{entries[a.name]=it} else aliases(a) }
            aliases(catalog.get("content_portrait_aliases"));aliases(catalog.get("content_landmark_aliases"));aliases(catalog.get("content_combat_aliases"))
            loadAtlas("world");loadAtlas("ui")
            // Optional future bundle contract: approval is attached to shipped car entries, never inferred from a candidate file.
            if(entries.values.any{it.group=="cars" && it.approved})loadAtlas("cars")
            for(e in entries.values.distinctBy{it.id})if(e.group=="tile")try {
                val t=loadTexture(e.id+".png",256);t.setWrap(Texture.TextureWrap.Repeat,Texture.TextureWrap.Repeat)
                tiles[e.id]=t
            } catch(x: Exception){failed(e.id,x)}
        } catch(e: Exception){failed("catalog",e)}
        Gdx.app.log("DeathRide","art ready regions=$regionCount bytes=$textureBytes failures=$failures heading=runtime-rotation")
    }
    private fun loadTexture(file: String,limit: Int): Texture {
        val p=Pixmap(root.child(file))
        try {
            require(p.width<=limit && p.height<=limit){"texture exceeds $limit page budget"}
            val t=Texture(root.child(file));t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
            textureBytes+=p.width.toLong()*p.height*4;return t
        } finally { p.dispose() }
    }
    private fun loadAtlas(group: String) {
        val loaded=ArrayList<Texture>()
        var bytes=0L
        try {
            val data=TextureAtlas.TextureAtlasData(root.child("$group.atlas"),root,false)
            require(data.pages.size<=if(group=="cars")2 else 1){"atlas page budget"}
            for(page in data.pages) {
                require(page.width<=1024 && page.height<=1024 && !page.useMipMaps)
                val t=loadTexture(page.textureFile.name(),1024);loaded.add(t);bytes+=t.width.toLong()*t.height*4;page.texture=t
            }
            val atlas=TextureAtlas(data)
            val metadata=JsonReader().parse(root.child("$group.json"))
            val accepted=HashMap<String,Region>()
            for(v in metadata.get("regions"))try {
                val id=v.getString("id");val r=atlas.findRegion(id)?:continue
                val p=v.get("pivot_px").asFloatArray();require(p.size==2 && p.all{it.isFinite()})
                require(!r.rotate && r.regionWidth==v.getInt("width") && r.regionHeight==v.getInt("height"))
                require(p[0] in 0f..r.regionWidth.toFloat() && p[1] in 0f..r.regionHeight.toFloat())
                val interior=v.get("hud_interior_px")?.takeUnless{it.isNull}?.asIntArray()
                // Metadata uses top-left image coordinates; libGDX world/UI uses bottom-left.
                val body=v.get("body_bounds_px")?.takeUnless{it.isNull}?.asIntArray()
                if(group=="cars")require(body!=null && body.size==4 && body[2]>body[0] && body[3]>body[1]){"cars require measured body_bounds_px"}
                accepted[id]=Region(r,p[0],r.regionHeight-p[1],interior,body)
            } catch(e: Exception){failed("$group region",e)}
            atlases.add(atlas);regions.putAll(accepted)
        } catch(e: Exception) { loaded.forEach{it.dispose()};textureBytes-=bytes;failed(group,e) }
    }
    fun region(key: String,seconds: Double=0.0): Region? {
        val e=entries[key]?:return regions[key]
        val frame=frameAt(e.durations,e.loop,seconds)
        return if(frame<0)null else regions[e.frames[frame]]
    }
    fun available(key: String)=entries[key]?.let{e->e.frames.all{regions.containsKey(it)}}?:regions.containsKey(key)
    fun duration(key: String)=(entries[key]?.durations?.sum()?:0)/1000.0
    fun tile(key: String)=tiles[entries[key]?.id?:key]
    fun draw(batch: Batch,key: String,x: Float,y: Float,width: Float,height: Float,degrees: Float=0f,seconds: Double=0.0): Boolean {
        val r=region(key,seconds)?:return false
        val sx=width/r.image.regionWidth;val sy=height/r.image.regionHeight
        batch.draw(r.image,x-r.pivotX*sx,y-r.pivotY*sy,r.pivotX*sx,r.pivotY*sy,width,height,1f,1f,degrees)
        draws++;return true
    }
    fun carKey(id: String,hp: Float,wreck: Boolean): String? {
        val state=if(wreck)3 else if(hp<.34f)2 else if(hp<.67f)1 else 0
        val key=carKeys[id]?.get(state)?:return null
        return key.takeIf{entries[it]?.approved==true && available(it)}
    }
    fun car(batch: Batch,key: String,x: Float,y: Float,length: Float,width: Float,heading: Double,tint: Color,flash: Boolean) {
        val r=region(key)?:return;val body=r.bodyBounds?:return
        val cellLength=length*r.image.regionWidth/(body[2]-body[0]);val cellWidth=width*r.image.regionHeight/(body[3]-body[1])
        batch.color=Color.WHITE
        draw(batch,key,x,y,cellLength,cellWidth,(heading*180/Math.PI).toFloat())
        // Only a separately authored body-panel mask is tinted: rubber/glass/outline keep their roles.
        if(available("$key-tint")){batch.color=if(flash)Color.WHITE else tint;draw(batch,"$key-tint",x,y,cellLength,cellWidth,(heading*180/Math.PI).toFloat())}
        batch.color=Color.WHITE
    }
    fun selectBackdrop(key: String?) {
        val next=key?:"";if(next==backdropKey)return
        backdrop?.let{textureBytes-=it.width.toLong()*it.height*4;it.dispose()};backdrop=null;backdropKey=next
        if(next.isNotEmpty())try { val id=entries[next]?.id?:return;backdrop=loadTexture("$id.png",1024) } catch(e: Exception){failed(next,e)}
    }
    fun drawBackdrop(batch: Batch,x: Float,y: Float,width: Float,height: Float) { backdrop?.let{batch.setColor(.24f,.24f,.24f,1f);batch.draw(it,x,y,width,height);batch.color=Color.WHITE} }
    fun dispose() { atlases.forEach{it.dispose()};tiles.values.forEach{it.dispose()};backdrop?.dispose() }
    companion object {
        /** Catalog frame boundaries, including non-looping end: no guessed or retimed frames. */
        fun frameAt(durations: IntArray,loop: Boolean,seconds: Double): Int {
            if(!seconds.isFinite() || seconds<0 || durations.isEmpty())return -1
            val total=durations.sum();if(total<=0)return -1
            var ms=seconds*1000;if(loop)ms%=total else if(ms>=total)return -1
            for(i in durations.indices){if(ms<durations[i])return i;ms-=durations[i]};return -1
        }
    }
}
