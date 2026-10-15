package dev.deathride.game

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.TextureRegion
import com.badlogic.gdx.utils.JsonReader

/**
 * The owner-approved mount sprites, one small page `assets/mounts/kit.png` with `kit.json` naming each region (the catalog's `sprite`
 * column). A missing page, an unapproved json or an unknown name returns null and the painter keeps its procedural silhouette.
 * The page is 512 x 224 RGBA, 0.44 MiB.
 */
class MountSprites private constructor(private val texture: Texture,private val regions: Map<String,TextureRegion>) {
    fun region(name: String)=regions[name]
    val textureBytes get()=texture.width.toLong()*texture.height*4
    companion object {
        fun load(): MountSprites? { return try {
            val dir=Gdx.files?.internal("mounts")?:return null
            val json=JsonReader().parse(dir.child("kit.json").readString("UTF-8"))
            if(!json.getBoolean("owner_approved",false))return null
            val texture=Texture(dir.child("kit.png"));texture.setFilter(Texture.TextureFilter.Linear,Texture.TextureFilter.Linear)
            val map=HashMap<String,TextureRegion>()
            var e=json.get("sprites").child
            while(e!=null){map[e.name]=TextureRegion(texture,e.getInt("x"),e.getInt("y"),e.getInt("w"),e.getInt("h"));e=e.next}
            MountSprites(texture,map)
        } catch(t: Throwable){null} }
    }
}
