package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import com.badlogic.gdx.files.FileHandle
import com.badlogic.gdx.graphics.g2d.TextureAtlas
import com.badlogic.gdx.utils.JsonReader
import java.io.File
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.DataOutputStream
import java.io.EOFException

class AtlasArtTest {
    @Test fun oversizedOrMalformedPngIsRejectedBeforePixelDecoding() {
        fun header(width: Int,height: Int): ByteArray {
            val bytes=ByteArrayOutputStream()
            DataOutputStream(bytes).use{it.write(byteArrayOf(-119,80,78,71,13,10,26,10));it.writeInt(13);it.writeInt(0x49484452);it.writeInt(width);it.writeInt(height)}
            return bytes.toByteArray()
        }
        // These contain no pixel data: allocation decisions require just the fixed 24-byte header.
        assertEquals(4*TextureBudget.MIB,TextureBudget.pngBytes(ByteArrayInputStream(header(1024,1024)),1024))
        for((width,height) in listOf(8192 to 8192,1025 to 1,1 to 1025,0 to 1,1 to -1))
            assertThrows(IllegalArgumentException::class.java){TextureBudget.pngBytes(ByteArrayInputStream(header(width,height)),1024)}
        assertThrows(IllegalArgumentException::class.java){TextureBudget.pngBytes(ByteArrayInputStream(header(256,257)),256)}
        val invalid=header(1,1).also{it[0]=0}
        assertThrows(IllegalArgumentException::class.java){TextureBudget.pngBytes(ByteArrayInputStream(invalid),1024)}
        assertThrows(EOFException::class.java){TextureBudget.pngBytes(ByteArrayInputStream(byteArrayOf(1,2,3)),1024)}
    }
    @Test fun animationUsesEveryAuthoredDurationAndStopsOrLoopsAtTheBoundary() {
        val d=intArrayOf(35,45,45,40,40,45)
        assertEquals(listOf(0,1,2,3,4,5),listOf(.0,.036,.081,.126,.166,.206).map{AtlasArt.frameAt(d,false,it)})
        assertEquals(-1,AtlasArt.frameAt(d,false,.25));assertEquals(0,AtlasArt.frameAt(d,true,.25))
        assertEquals(-1,AtlasArt.frameAt(d,false,-1.0));assertEquals(-1,AtlasArt.frameAt(d,false,Double.NaN))
    }
    @Test fun shippedCatalogResolvesActualAtlasRegionsIncludingCombatAndStoryAliases() {
        val root=FileHandle(File("../assets/phase2-v1"));val catalog=JsonReader().parse(root.child("catalog.json"))
        val ids=mutableSetOf<String>()
        for(group in listOf("world","ui")) {
            val data=TextureAtlas.TextureAtlasData(root.child("$group.atlas"),root,false)
            assertEquals(1,data.pages.size)
            for(p in data.pages){assertEquals(1024f,p.width);assertEquals(1024f,p.height);assertFalse(p.useMipMaps)}
            for(r in data.regions)ids.add(r.name)
        }
        assertEquals(78,ids.size)
        for(e in catalog.get("assets"))if(e.getString("group") in listOf("world","ui")) {
            val frames=e.get("frames")?.asStringArray()?:arrayOf(e.getString("asset_id"))
            assertTrue(frames.all{it in ids},e.getString("logical_name"))
        }
        assertTrue(dev.deathride.core.AshStory.cards.values.all{it.backdrop in ArtBindings.stories})
        assertTrue(catalog.get("content_portrait_aliases").getString("rival-marrow") in ids)
        assertTrue(catalog.get("content_combat_aliases").get("weapons").getString("Scatter") in ids)
    }
}
