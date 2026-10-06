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
    @Test fun damageSelectionHasStableBoundariesAndWreckTakesPriority() {
        assertEquals(listOf(0,0,1,1,2,3),listOf(1f,.67f,.669f,.34f,.339f,1f).mapIndexed{i,hp->AtlasArt.carState(hp,i==5)})
    }
    @Test fun bodyFitMatchesContactLengthButNeverOverhangsWidthBeyondSlack() {
        // Short body (5.6 of 6.6 m) grows to the contact length; wide-and-short body is capped by the width slack.
        assertEquals(6.6f/5.6f,AtlasArt.fitScale(6.6f,3f,5.6f,2.4f),1e-5f)
        assertEquals(3f/3f*AtlasArt.WIDTH_SLACK,AtlasArt.fitScale(6.6f,3f,3f,3f),1e-5f)
    }
    @Test fun shippedCarFamiliesHaveSevenRegisteredRegionsAndReferenceApproval() {
        val root=FileHandle(File("../assets/phase2-states"));val catalog=JsonReader().parse(root.child("catalog.json"))
        val cars=catalog.get("assets").filter{it.getString("group")=="cars"}
        val data=TextureAtlas.TextureAtlasData(root.child("cars.atlas"),root,false)
        assertTrue(data.pages.size in 1..2)
        val regions=data.regions.associateBy{it.name}
        assertEquals(70,cars.size);assertEquals(70,regions.size)
        val metadata=JsonReader().parse(root.child("cars.json")).get("regions").associateBy{it.getString("id")}
        for(cls in dev.deathride.core.CarCatalog.all) {
            val family=cars.filter{it.getString("car_class")==cls.id}
            assertEquals(7,family.size,cls.id)
            val placements=family.map {
                assertFalse(it.getBoolean("owner_approved"));assertTrue(it.getBoolean("reference_approved"));assertTrue(it.getBoolean("technical_accepted"))
                assertEquals(64,it.getString("reference_source_sha256").length)
                val id=it.getString("asset_id");assertTrue(regions.containsKey(id))
                val m=metadata.getValue(id)
                assertEquals(regions.getValue(id).width,m.getInt("width"));assertEquals(regions.getValue(id).height,m.getInt("height"))
                m.get("pivot_px").asFloatArray().toList() to m.get("body_bounds_px").asIntArray().toList()
            }
            assertEquals(1,placements.distinct().size,cls.id)
        }
    }
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
