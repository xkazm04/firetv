package dev.deathride.game

import dev.deathride.core.CarShape
import dev.deathride.core.CarShapes

/** CarShapes.forId is a linear first{} scan (iterator plus String.equals per row); the renderer asks several times per car per frame. */
object CarShapeCache {
    private val shapes=HashMap<String,CarShape>()
    fun of(id: String): CarShape=shapes[id]?:CarShapes.forId(id).also{shapes[id]=it}
}
