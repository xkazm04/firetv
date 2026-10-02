package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.JsonValue
import dev.deathride.core.*

/** Presentation-only assets. A broken page or entry cannot disable the procedural renderer. */
class AtlasArt(private val root: FileHandle = Gdx.files.internal("phase2-v1"),private val residentLimit: Long=TextureBudget.ART) {
    data class Region(val image: TextureRegion, val pivotX: Float, val pivotY: Float, val interior: IntArray?,val bodyBounds: IntArray?=null)
    data class Entry(val id: String, val group: String, val frames: Array<String>, val durations: IntArray,
                     val loop: Boolean, val approved: Boolean, val referenceSelected: Boolean=false)
    private val entries=HashMap<String,Entry>()
    private val regions=HashMap<String,Region>()
    private val atlases=ArrayList<TextureAtlas>()
    private val tiles=HashMap<String,Texture>()
    private val patches=HashMap<String,NinePatch>()
    private var backdrop: Texture?=null
    private var backdropKey=""
    private val carKeys=CarCatalog.all.associate { it.id to arrayOf("clean","damaged-1","damaged-2","wreck").map{s->"cars/${it.id.lowercase()}/$s"}.toTypedArray() }
    private val liveryKeys=CarCatalog.all.associate { it.id to arrayOf("clean","livery-bone","livery-red","livery-ochre").map{s->"cars/${it.id.lowercase()}/$s"}.toTypedArray() }
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
                    require(frames.isNotEmpty() && frames.size==durations.size && durations.all{it>0} && durations.sumOf{it.toLong()}<=Int.MAX_VALUE)
                    val e=Entry(id,v.getString("group"),frames,durations,v.getBoolean("loop",false),v.getBoolean("owner_approved",false),
                        v.getBoolean("reference_approved",false) && v.getBoolean("technical_accepted",false) && v.getString("reference_source_sha256","").length==64)
                    entries[v.getString("logical_name")]=e;entries[id]=e
                } catch(e: Exception){failed("catalog entry",e)}
            }
            fun aliases(v: JsonValue?) { if(v==null)return;for(a in v)if(a.isString)entries[a.asString()]?.let{entries[a.name]=it} else aliases(a) }
            aliases(catalog.get("content_portrait_aliases"));aliases(catalog.get("content_landmark_aliases"));aliases(catalog.get("content_combat_aliases"))
            loadAtlas("world");loadAtlas("ui")
            // Exact references are owner approved; derived frames carry separate technical selection.
            if(entries.values.any{it.group=="cars" && (it.approved || it.referenceSelected)})loadAtlas("cars")
            for(e in entries.values.distinctBy{it.id})if(e.group=="tile")try {
                val t=loadTexture(e.id+".png",TextureBudget.TILE_EDGE);t.setWrap(Texture.TextureWrap.Repeat,Texture.TextureWrap.Repeat)
                tiles[e.id]=t
            } catch(x: Exception){failed(e.id,x)}
        } catch(e: Exception){failed("catalog",e)}
        Gdx.app.log("DeathRide","art ready regions=$regionCount bytes=$textureBytes failures=$failures heading=runtime-rotation")
    }
    private fun loadTexture(file: String,limit: Int): Texture {
        val source=root.child(file)
        val bytes=source.read().use{TextureBudget.pngBytes(it,limit)}
        require(textureBytes+bytes<=minOf(TextureBudget.ART,residentLimit)){"resident texture budget"}
        val t=Texture(source);t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
        textureBytes+=bytes;return t
    }
    private fun loadAtlas(group: String) {
        val loaded=ArrayList<Texture>()
        var bytes=0L
        try {
            val data=TextureAtlas.TextureAtlasData(root.child("$group.atlas"),root,false)
            require(data.pages.size<=if(group=="cars")2 else 1){"atlas page budget"}
            for(page in data.pages) {
                require(page.width<=TextureBudget.ART_PAGE_EDGE && page.height<=TextureBudget.ART_PAGE_EDGE && !page.useMipMaps)
                val t=loadTexture(page.textureFile.name(),TextureBudget.ART_PAGE_EDGE);loaded.add(t);bytes+=t.width.toLong()*t.height*4;page.texture=t
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
                fun validBounds(b: IntArray)=b.size==4 && b[0]>=0 && b[1]>=0 && b[2]>b[0] && b[3]>b[1] && b[2]<=r.regionWidth && b[3]<=r.regionHeight
                if(interior!=null)require(validBounds(interior)){"invalid HUD interior"}
                // Metadata uses top-left image coordinates; libGDX world/UI uses bottom-left.
                val body=v.get("body_bounds_px")?.takeUnless{it.isNull}?.asIntArray()
                if(body!=null)require(validBounds(body)){"invalid body bounds"}
                if(group=="cars")require(body!=null){"cars require measured body_bounds_px"}
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
    /** Fixed corner widths from the measured transparent opening; labels live above this layer. */
    fun frame(batch: Batch,key: String,x: Float,y: Float,width: Float,height: Float): Boolean {
        val r=region(key)?:return false
        val bounds=r.interior?:return false
        val patch=patches.getOrPut(key) {
            NinePatch(r.image,bounds[0],r.image.regionWidth-bounds[2],bounds[1],r.image.regionHeight-bounds[3]).apply {
                // Authoring cells include transparent margins. Bound corners so thin meters
                // never acquire a negative stretchable centre or cover adjacent text.
                val scale=if(r.image.regionWidth>=256).12f else .5f
                scale(scale,scale)
            }
        }
        if(width<patch.leftWidth+patch.rightWidth || height<patch.topHeight+patch.bottomHeight)return false
        patch.draw(batch,x,y,width,height);draws++;return true
    }
    fun tile(key: String)=tiles[entries[key]?.id?:key]
    fun draw(batch: Batch,key: String,x: Float,y: Float,width: Float,height: Float,degrees: Float=0f,seconds: Double=0.0): Boolean {
        val r=region(key,seconds)?:return false
        val sx=width/r.image.regionWidth;val sy=height/r.image.regionHeight
        batch.draw(r.image,x-r.pivotX*sx,y-r.pivotY*sy,r.pivotX*sx,r.pivotY*sy,width,height,1f,1f,degrees)
        draws++;return true
    }
    fun carKey(id: String,hp: Float,wreck: Boolean,livery: Int=0): String? {
        val state=carState(hp,wreck)
        val key=if(state==0)liveryKeys[id]?.get(Math.floorMod(livery,4)) else carKeys[id]?.get(state)
        return key?.takeIf{entries[it]?.let{e->e.approved || e.referenceSelected}==true && available(it)}
    }
    fun car(batch: Batch,key: String,x: Float,y: Float,length: Float,width: Float,heading: Double,tint: Color,flash: Boolean) {
        val r=region(key)?:return;val body=r.bodyBounds?:return
        val scale=minOf(length/(body[2]-body[0]),width/(body[3]-body[1]))
        val cellLength=scale*r.image.regionWidth;val cellWidth=scale*r.image.regionHeight
        batch.color=Color.WHITE
        draw(batch,key,x,y,cellLength,cellWidth,(heading*180/Math.PI).toFloat())
        // Only a separately authored body-panel mask is tinted: rubber/glass/outline keep their roles.
        if(available("$key-tint")){batch.color=if(flash)Color.WHITE else tint;draw(batch,"$key-tint",x,y,cellLength,cellWidth,(heading*180/Math.PI).toFloat())}
        batch.color=Color.WHITE
    }
    fun selectBackdrop(key: String?) {
        val next=key?:"";if(next==backdropKey)return
        backdrop?.let{textureBytes-=it.width.toLong()*it.height*4;it.dispose()};backdrop=null;backdropKey=next
        if(next.isNotEmpty())try { val id=entries[next]?.id?:return;backdrop=loadTexture("$id.png",TextureBudget.ART_PAGE_EDGE) } catch(e: Exception){failed(next,e)}
    }
    fun drawBackdrop(batch: Batch,x: Float,y: Float,width: Float,height: Float) { backdrop?.let{batch.setColor(.24f,.24f,.24f,1f);batch.draw(it,x,y,width,height);batch.color=Color.WHITE} }
    fun dispose() { atlases.forEach{it.dispose()};tiles.values.forEach{it.dispose()};backdrop?.dispose() }
    companion object {
        fun carState(hp: Float,wreck: Boolean)=if(wreck)3 else if(hp<.34f)2 else if(hp<.67f)1 else 0
        /** Catalog frame boundaries, including non-looping end: no guessed or retimed frames. */
        fun frameAt(durations: IntArray,loop: Boolean,seconds: Double): Int {
            if(!seconds.isFinite() || seconds<0 || durations.isEmpty())return -1
            val total=durations.sum();if(total<=0)return -1
            var ms=seconds*1000;if(loop)ms%=total else if(ms>=total)return -1
            for(i in durations.indices){if(ms<durations[i])return i;ms-=durations[i]};return -1
        }
    }
}
