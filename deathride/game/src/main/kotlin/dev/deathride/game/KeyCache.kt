package dev.deathride.game

/** "prefix"+id atlas keys, concatenated once per id instead of every frame. */
class KeyCache(private val prefix: String) {
    private val keys=HashMap<String,String>()
    fun of(id: String): String=keys[id]?:(prefix+id).also{keys[id]=it}
}
