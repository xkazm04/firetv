package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.graphics.*
import com.badlogic.gdx.graphics.g2d.*
import com.badlogic.gdx.graphics.glutils.FileTextureData
import com.badlogic.gdx.utils.JsonReader
import com.badlogic.gdx.utils.JsonValue
import dev.deathride.core.*

/** Presentation-only assets. A broken page or entry cannot disable the procedural renderer. */
class AtlasArt(private val root: FileHandle = Gdx.files.internal("phase2-v1"),private val residentLimit: Long=TextureBudget.ART,
               private val extraBytes: () -> Long = { 0L },private val switchArm: SwitchArm=SwitchArm.OFF) {
    data class Region(val image: TextureRegion, val pivotX: Float, val pivotY: Float, val interior: IntArray?,val bodyBounds: IntArray?=null)
    data class Entry(val id: String, val group: String, val frames: Array<String>, val durations: IntArray,
                     val loop: Boolean, val approved: Boolean, val referenceSelected: Boolean=false, val usable: Boolean=true)
    private val entries=HashMap<String,Entry>()
    private val regions=HashMap<String,Region>()
    /** Per-key resolution (entry plus the region of every frame), memoised once the catalog and atlases are final. */
    private class Resolved(val entry: Entry?,val frames: Array<Region?>,val available: Boolean)
    private val resolved=HashMap<String,Resolved>()
    private var sealed=false
    private val atlases=ArrayList<TextureAtlas>()
    private val tiles=HashMap<String,Texture>()
    private val patches=HashMap<String,NinePatch>()
    private val environmentSets=HashMap<String,Array<String>>()
    private val environmentObstacles=HashMap<String,String>()
    private var backdrop: Texture?=null
    private var backdropKey=""
    private var selectedRegion=""
    private val variantSlots=HashSet<String>()
    val activeRegionVariants: Set<String> get()=variantSlots.toSet()
    private val carKeys=CarCatalog.all.associate { it.id to arrayOf("clean","damaged-1","damaged-2","wreck").map{s->"cars/${it.id.lowercase()}/$s"}.toTypedArray() }
    private val liveryKeys=CarCatalog.all.associate { it.id to arrayOf("clean","livery-bone","livery-red","livery-ochre").map{s->"cars/${it.id.lowercase()}/$s"}.toTypedArray() }
    var textureBytes=0L; private set
    /** P13d: the highest [textureBytes] seen, held tiles included. */
    var peakTextureBytes=0L; private set
    /** P13d: tiles a region switch replaced; held [SwitchArm.DELAY_FRAMES] frames in the DELAY arm, released at once otherwise. */
    private val released=TileRelease<Texture>(if(switchArm==SwitchArm.DELAY)SwitchArm.DELAY_FRAMES else 0) { t -> textureBytes-=t.width.toLong()*t.height*4;t.dispose() }
    /** EARLY arm: the next region's tiles, uploaded before its switch (slot to texture), and the selection they belong to. */
    private val staged=HashMap<String,Texture>()
    private val stagedVariants=HashSet<String>()
    private var stagedSelection=""
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
                        v.getBoolean("reference_approved",false) && v.getBoolean("technical_accepted",false) && v.getString("reference_source_sha256","").length==64,
                        EnvironmentArt.eligible(v) && FaceArt.screened(v))
                    entries[v.getString("logical_name")]=e;entries[id]=e
                } catch(e: Exception){failed("catalog entry",e)}
            }
            fun aliases(v: JsonValue?) { if(v==null)return;for(a in v)if(a.isString)entries[a.asString()]?.let{entries[a.name]=it} else aliases(a) }
            aliases(catalog.get("content_portrait_aliases"));aliases(catalog.get("content_landmark_aliases"));aliases(catalog.get("content_combat_aliases"))
            catalog.get("environment_sets")?.let { sets -> for(v in sets) {
                val keys=v.asStringArray();if(keys.isNotEmpty())environmentSets[v.name]=keys
            } }
            catalog.get("environment_obstacles")?.let { obstacles -> for(v in obstacles)
                environmentObstacles[v.getString("id")]=v.getString("logical_name") }
            loadAtlas("world");loadAtlas("ui")
            // Candidate aliases supersede existing portraits only after screening AND exact owner approval.
            catalog.get("face_first_portrait_aliases")?.let { overrides -> for(v in overrides) {
                val key=v.asString()
                if(key.startsWith("face-first/") && available(key))entries[key]?.let{entries[v.name]=it}
            } }
            // Exact references are owner approved; derived frames carry separate technical selection.
            if(entries.values.any{it.group=="cars" && (it.approved || it.referenceSelected)})loadAtlas("cars")
            for(e in entries.values.distinctBy{it.id})if(e.group=="tile")try {
                val t=loadTexture(e.id+".png",TextureBudget.TILE_EDGE);t.setWrap(Texture.TextureWrap.Repeat,Texture.TextureWrap.Repeat)
                tiles[e.id]=t
            } catch(x: Exception){failed(e.id,x)}
        } catch(e: Exception){failed("catalog",e)}
        sealed=true
        Gdx.app.log("DeathRide","art ready regions=$regionCount bytes=$textureBytes failures=$failures heading=runtime-rotation")
    }
    private fun loadTexture(file: String,limit: Int): Texture = loadTexture(root.child(file),limit)
    private fun loadTexture(source: FileHandle,limit: Int): Texture {
        val bytes=source.read().use{TextureBudget.pngBytes(it,limit)}
        require(textureBytes+bytes+extraBytes()<=minOf(TextureBudget.ART,residentLimit)){"resident texture budget"}
        val t=Texture(source);t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
        textureBytes+=bytes;peakTextureBytes=maxOf(peakTextureBytes,textureBytes);return t
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
    private fun resolve(key: String): Resolved {
        resolved[key]?.let{return it}
        val e=entries[key]
        val r=if(e==null)Resolved(null,arrayOf(regions[key]),regions.containsKey(key)) else {
            val frames=Array(e.frames.size){regions[e.frames[it]]}
            Resolved(e,frames,e.usable && frames.all{it!=null})
        }
        // Entries and regions change during init (aliases, later atlas pages); after that they are fixed.
        if(sealed)resolved[key]=r
        return r
    }
    fun region(key: String,seconds: Double=0.0): Region? {
        val s=resolve(key);val e=s.entry?:return s.frames[0]
        if(!e.usable)return null
        val frame=frameAt(e.durations,e.loop,seconds)
        return if(frame<0)null else s.frames[frame]
    }
    fun available(key: String)=resolve(key).available
    /** Owner-approved (or exact-reference-approved) AND present. Mount sprites must pass this; candidates never do. */
    fun approved(key: String)=entries[key]?.let{it.approved || it.referenceSelected}==true && available(key)
    fun themeProps(theme: String)=environmentSets[theme]?:EnvironmentArt.fallbackSets[theme]?:EnvironmentArt.fallbackSets.getValue("industrial")
    fun obstacleKey(id: String,fallback: String)=environmentObstacles[id]?.takeIf{available(it)}?:fallback
    fun duration(key: String)=(entries[key]?.durations?.sum()?:0)/1000.0
    /** Fixed corner widths from the measured transparent opening; labels live above this layer. */
    fun frame(batch: Batch,key: String,x: Float,y: Float,width: Float,height: Float,cornerScale: Float=0f): Boolean {
        val r=region(key)?:return false
        val bounds=r.interior?:return false
        // [cornerScale] lets large TV panels show the chunky Hot Ink border; 0 keeps the thin HUD default.
        val patch=patches.getOrPut(if(cornerScale>0f)"$key@$cornerScale" else key) {
            NinePatch(r.image,bounds[0],r.image.regionWidth-bounds[2],bounds[1],r.image.regionHeight-bounds[3]).apply {
                // Authoring cells include transparent margins. Bound corners so thin meters
                // never acquire a negative stretchable centre or cover adjacent text.
                val scale=if(cornerScale>0f)cornerScale else if(r.image.regionWidth>=256).12f else .5f
                scale(scale,scale)
            }
        }
        if(width<patch.leftWidth+patch.rightWidth || height<patch.topHeight+patch.bottomHeight)return false
        patch.draw(batch,x,y,width,height);draws++;return true
    }
    fun tile(key: String)=tiles[entries[key]?.id?:key]
    fun hasRegionVariant(slot: String)=slot in variantSlots
    /** A region tile resolved, hash-verified, size-checked and decoded off the render thread; [selectRegion] only uploads it. */
    private class PreparedTile(val slot: String,val file: FileHandle,val variant: Boolean,val bytes: Long,val pixmap: Pixmap) { @Volatile var consumed=false }
    private class PreparedRegion(val selection: String,val tiles: List<PreparedTile>,val failures: List<Pair<String,Exception>>) {
        fun dispose() { for(t in tiles)if(!t.consumed){t.consumed=true;t.pixmap.dispose()} }
    }
    private val prepared=java.util.concurrent.atomic.AtomicReference<PreparedRegion?>()
    private fun selectionKey(region: RegionDefinition?,candidates: Boolean)=(region?.id?:"base")+":"+candidates
    /** Any thread (the course worker): does the non-GL part of [selectRegion] for the region about to be selected - manifest,
     *  candidate hash, PNG header and decode - so the render thread's switch is release and upload only (P9: selectRegion
     *  65-116 ms wall, of which 4.8-7.6 ms GL upload). Only the newest preparation is kept; a superseded one is freed. */
    fun prepareRegion(region: RegionDefinition?,candidates: Boolean=true) {
        val failures=ArrayList<Pair<String,Exception>>();val ready=ArrayList<PreparedTile>()
        try {
            val regionRoot=root.sibling("regions")
            val manifest=try { if(region!=null)RegionMaterials.manifest(regionRoot) else null }catch(e: Exception){failures.add("region materials" to e);null}
            for((slot,key) in RegionMaterials.tileSlots) {
                val entry=entries[key]?:continue
                val candidate=manifest?.firstOrNull{region!=null && RegionMaterials.eligible(it,region,slot,candidates)}
                var tile: PreparedTile?=null
                if(candidate!=null)try { tile=decodeTile(slot,RegionMaterials.verifiedFile(regionRoot,candidate),true) }catch(e: Exception){failures.add("region $slot" to e)}
                if(tile==null)try { tile=decodeTile(slot,root.child(entry.id+".png"),false) }catch(e: Exception){failures.add("base $slot" to e)}
                tile?.let(ready::add)
            }
        } catch(e: Throwable) { for(t in ready)t.pixmap.dispose();throw e }
        prepared.getAndSet(PreparedRegion(selectionKey(region,candidates),ready,failures))?.dispose()
    }
    // The IHDR size is checked before a pixel is decoded (I2): at most a TILE_EDGE square. Residency is checked at upload.
    private fun decodeTile(slot: String,file: FileHandle,variant: Boolean): PreparedTile {
        val bytes=file.read().use{TextureBudget.pngBytes(it,TextureBudget.TILE_EDGE)}
        return PreparedTile(slot,file,variant,bytes,Pixmap(file))
    }
    /** The same managed, file-backed texture data Texture(FileHandle) builds, with its pixmap already decoded. */
    private fun upload(tile: PreparedTile): Texture {
        require(textureBytes+tile.bytes+extraBytes()<=minOf(TextureBudget.ART,residentLimit)){"resident texture budget"}
        tile.consumed=true // the texture data disposes the preloaded pixmap after its upload
        val t=Texture(FileTextureData(tile.file,tile.pixmap,null,false));t.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
        textureBytes+=tile.bytes;peakTextureBytes=maxOf(peakTextureBytes,textureBytes);return t
    }
    /** REUSE arm: the tile's pixels re-specified into [old], the same texture object; the residency is unchanged (same size). */
    private fun reuse(old: Texture,tile: PreparedTile) {
        tile.consumed=true
        old.load(FileTextureData(tile.file,tile.pixmap,null,false))
    }
    /** A replaced tile: released at once, or held by [released] (DELAY arm), its bytes counted until then. */
    private fun retire(t: Texture)=released.retire(t,t.width.toLong()*t.height*4)
    /** Once per render, first: releases at most one held tile whose hold has passed. Returns its bytes (0 for none). */
    fun frame(): Long {
        val bytes=released.frame()
        if(bytes>0)Gdx.app.log("DeathRide","regionMaterials released bytes=$bytes held=${released.bytes} resident=$textureBytes peak=$peakTextureBytes")
        return bytes
    }
    /** EARLY arm: uploads the prepared region's tiles now, beside the current ones; its [selectRegion] then only swaps them in. */
    fun stageRegion() {
        val ready=prepared.getAndSet(null)?:return
        try {
            for(t in staged.values){textureBytes-=t.width.toLong()*t.height*4;t.dispose()};staged.clear();stagedVariants.clear()
            for((name,e) in ready.failures)failed(name,e)
            for(tile in ready.tiles)try { staged[tile.slot]=upload(tile);if(tile.variant)stagedVariants.add(tile.slot) }catch(e: Exception){failed(if(tile.variant)"region ${tile.slot}" else "base ${tile.slot}",e)}
            stagedSelection=ready.selection
        } finally { ready.dispose() }
        Gdx.app.log("DeathRide","regionMaterials staged ${ready.selection} tiles=${staged.size} bytes=$textureBytes peak=$peakTextureBytes")
    }
    /** Release the old slot BEFORE decoding its replacement. No five-region residency spike. */
    fun selectRegion(region: RegionDefinition?,candidates: Boolean=true) {
        val selection=selectionKey(region,candidates)
        if(selection==selectedRegion)return
        // SKIP arm (diagnostic): once a region is resident, a switch neither deletes nor uploads a tile.
        if(switchArm==SwitchArm.SKIP && selectedRegion.isNotEmpty()) {
            prepared.get()?.takeIf{it.selection==selection && prepared.compareAndSet(it,null)}?.dispose()
            selectedRegion=selection
            Gdx.app.log("DeathRide","regionMaterials $selection skipped arm=skip bytes=$textureBytes")
            return
        }
        val previous=selectedRegion
        selectedRegion=selection;variantSlots.clear()
        if(staged.isNotEmpty() && stagedSelection==selection) {
            for((slot,key) in RegionMaterials.tileSlots) {
                val entry=entries[key]?:continue
                tiles.remove(entry.id)?.let(::retire)
                val replacement=staged.remove(slot)?:try { loadTexture(entry.id+".png",TextureBudget.TILE_EDGE) }catch(e: Exception){failed("base $slot",e);null}
                if(slot in stagedVariants)variantSlots.add(slot)
                replacement?.let{it.setWrap(Texture.TextureWrap.Repeat,Texture.TextureWrap.Repeat);tiles[entry.id]=it}
            }
            stagedVariants.clear();stagedSelection=""
            Gdx.app.log("DeathRide","regionMaterials $selection candidates=${variantSlots.size} bytes=$textureBytes prepared=staged peak=$peakTextureBytes")
            return
        }
        val ready=prepared.get()?.takeIf{it.selection==selection && prepared.compareAndSet(it,null)}
        if(ready!=null) {
            try {
                for((name,e) in ready.failures)failed(name,e)
                for((slot,key) in RegionMaterials.tileSlots) {
                    val entry=entries[key]?:continue
                    val tile=ready.tiles.firstOrNull{it.slot==slot}
                    var replacement: Texture?=null
                    val old=tiles.remove(entry.id)
                    if(switchArm==SwitchArm.REUSE && old!=null && tile!=null && old.width.toLong()*old.height*4==tile.bytes) {
                        try { reuse(old,tile);replacement=old;if(tile.variant)variantSlots.add(slot) }catch(e: Exception){failed(if(tile.variant)"region $slot" else "base $slot",e);retire(old)}
                    } else {
                        old?.let(::retire)
                        if(tile!=null)try { replacement=upload(tile);if(tile.variant)variantSlots.add(slot) }catch(e: Exception){failed(if(tile.variant)"region $slot" else "base $slot",e)}
                    }
                    // As below: a variant that cannot be made resident falls back to the base tile.
                    if(replacement==null && tile?.variant==true)try { replacement=loadTexture(entry.id+".png",TextureBudget.TILE_EDGE) }catch(e: Exception){failed("base $slot",e)}
                    replacement?.let{it.setWrap(Texture.TextureWrap.Repeat,Texture.TextureWrap.Repeat);tiles[entry.id]=it}
                }
            } finally { ready.dispose() }
            Gdx.app.log("DeathRide","regionMaterials $selection candidates=${variantSlots.size} bytes=$textureBytes prepared=true held=${released.bytes} peak=$peakTextureBytes from=$previous")
            return
        }
        val regionRoot=root.sibling("regions")
        val manifest=try { if(region!=null)RegionMaterials.manifest(regionRoot) else null }catch(e: Exception){failed("region materials",e);null}
        for((slot,key) in RegionMaterials.tileSlots) {
            val entry=entries[key]?:continue
            tiles.remove(entry.id)?.let(::retire)
            val candidate=manifest?.firstOrNull{region!=null && RegionMaterials.eligible(it,region,slot,candidates)}
            var replacement: Texture?=null
            if(candidate!=null)try {
                val source=RegionMaterials.verifiedFile(regionRoot,candidate)
                replacement=loadTexture(source,TextureBudget.TILE_EDGE);variantSlots.add(slot)
            }catch(e: Exception){failed("region $slot",e)}
            if(replacement==null)try { replacement=loadTexture(entry.id+".png",TextureBudget.TILE_EDGE) }catch(e: Exception){failed("base $slot",e)}
            replacement?.let{it.setWrap(Texture.TextureWrap.Repeat,Texture.TextureWrap.Repeat);tiles[entry.id]=it}
        }
        Gdx.app.log("DeathRide","regionMaterials $selection candidates=${variantSlots.size} bytes=$textureBytes prepared=false")
    }
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
    /** Sprite bodies are often shorter than the contact shape (Needle 5.6 vs 6.6 m): fit the body to the contact LENGTH,
     *  keeping aspect, but never let the body overhang the contact width by more than [WIDTH_SLACK]. */
    fun car(batch: Batch,key: String,x: Float,y: Float,length: Float,width: Float,heading: Double) {
        val r=region(key)?:return;val body=r.bodyBounds?:return
        val scale=fitScale(length,width,(body[2]-body[0]).toFloat(),(body[3]-body[1]).toFloat())
        batch.color=Color.WHITE
        draw(batch,key,x,y,scale*r.image.regionWidth,scale*r.image.regionHeight,(heading*180/Math.PI).toFloat())
    }
    /** Atlas page of a sprite, so callers can batch by texture. */
    fun carPage(key: String): Texture? = region(key)?.image?.texture
    /** The measured body box of a car sprite as drawn by [car]: out = forward offset, left offset (both from the car position),
     *  half length, half width, in metres. False when the sprite or its body bounds are unavailable. */
    fun carBody(key: String,length: Float,width: Float,out: FloatArray): Boolean {
        val r=region(key)?:return false;val b=r.bodyBounds?:return false
        val scale=fitScale(length,width,(b[2]-b[0]).toFloat(),(b[3]-b[1]).toFloat())
        out[0]=((b[0]+b[2])*.5f-r.pivotX)*scale;out[1]=((r.image.regionHeight-(b[1]+b[3])*.5f)-r.pivotY)*scale
        out[2]=(b[2]-b[0])*.5f*scale;out[3]=(b[3]-b[1])*.5f*scale
        return true
    }
    fun selectBackdrop(key: String?) {
        val next=key?:"";if(next==backdropKey)return
        backdrop?.let{textureBytes-=it.width.toLong()*it.height*4;it.dispose()};backdrop=null;backdropKey=next
        if(next.isNotEmpty())try { val id=entries[next]?.id?:return;backdrop=loadTexture("$id.png",TextureBudget.ART_PAGE_EDGE) } catch(e: Exception){failed(next,e)}
    }
    fun drawBackdrop(batch: Batch,x: Float,y: Float,width: Float,height: Float) { backdrop?.let{batch.setColor(.24f,.24f,.24f,1f);batch.draw(it,x,y,width,height);batch.color=Color.WHITE} }
    fun dispose() { atlases.forEach{it.dispose()};tiles.values.forEach{it.dispose()};staged.values.forEach{it.dispose()};released.releaseAll();backdrop?.dispose();prepared.getAndSet(null)?.dispose() }
    companion object {
        const val WIDTH_SLACK=1.25f
        fun fitScale(length: Float,width: Float,bodyLength: Float,bodyWidth: Float)=minOf(length/bodyLength,width/bodyWidth*WIDTH_SLACK)
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
