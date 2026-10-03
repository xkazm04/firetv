package dev.deathride.game

import com.badlogic.gdx.utils.JsonReader
import dev.deathride.core.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File

class ObstacleArtTest {
    @Test fun physicsFootprintsAndRendererBindingsPreserveTheDeliveredMetadata() {
        val root=if(File("../art/fusion-obstacles-selected.json").exists())File("..") else File(".")
        val meta=JsonReader().parse(File(root,"art/fusion-obstacles-selected.json").readText()).get("obstacles")
        val catalog=JsonReader().parse(File(root,"assets/phase2-states/catalog.json").readText()).get("assets")
        for(m in meta) {
            val d=ObstacleContent.definitions.getValue(m.name)
            assertEquals(m.getString("logical_name"),d.art)
            assertEquals(m.getString("effect_class").uppercase(),d.effect.name)
            val radii=m.get("collision_footprint").get("radii").asDoubleArray()
            assertEquals(radii[0],d.rx);assertEquals(radii[1],d.ry)
            val extent=m.get("visual_extent_m").asDoubleArray()
            assertEquals(extent[0],d.visualWidth);assertEquals(extent[1],d.visualHeight)
            assertEquals(m.getDouble("height_m"),d.height)
            val shadow=m.get("shadow");val offset=shadow.get("offset_per_height").asDoubleArray()
            assertEquals(offset[0],d.shadowX);assertEquals(offset[1],d.shadowY);assertEquals(shadow.getDouble("opacity"),d.shadowAlpha)
            if(m.name=="soft-dune")assertFalse(catalog.any{it.getString("logical_name")==d.art},"Owner rejected the retained dune; physics stays, renderer falls back")
            else assertTrue(catalog.any{it.getString("logical_name")==d.art && it.getString("asset_id")==m.getString("asset_id")})
        }
        for(d in ObstacleContent.definitions.values)assertEquals(d.art!="props/soft-dune",catalog.any{it.getString("logical_name")==d.art})
        assertEquals(ObstacleEffect.NONE,ObstacleContent.definitions.getValue("tree-decoration").effect)
        assertEquals(ObstacleEffect.DRAG,ObstacleContent.definitions.getValue("rubble").effect)
    }
}
