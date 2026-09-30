package dev.deathride.core

/** Startup-only parsing. Missing or malformed content is fatal, never a hidden default. */
object Content {
    fun table(name: String): List<Map<String,String>> {
        val lines = requireNotNull(javaClass.getResourceAsStream("/data/$name.csv")) { "Missing $name" }
            .bufferedReader().use { it.readLines() }.filter { it.isNotBlank() && !it.startsWith("#") }
        require(lines.size > 1) { "Empty $name" }
        val keys=lines.first().split(',')
        require(keys.distinct().size==keys.size)
        return lines.drop(1).map { line ->
            val values=line.split(','); require(values.size==keys.size) { "Bad row in $name: $line" }
            keys.zip(values).toMap()
        }
    }
}
fun Map<String,String>.number(key: String): Double = getValue(key).toDouble().also { require(it.isFinite()) { key } }
