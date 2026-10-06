package dev.deathride.core

/** Startup-only parsing. Missing or malformed content is fatal, never a hidden default. */
object Content {
    fun table(name: String): List<Map<String,String>> {
        var keys: Array<String>? = null
        val rows=ArrayList<Map<String,String>>()
        requireNotNull(javaClass.getResourceAsStream("/data/$name.csv")) { "Missing $name" }.bufferedReader().use { reader ->
            while(true) {
                val line=reader.readLine()?:break
                if(line.isBlank() || line.startsWith("#"))continue
                val values=splitCommas(line)
                val header=keys
                if(header==null) { keys=values;continue }
                require(values.size==header.size) { "Bad row in $name: $line" }
                val row=LinkedHashMap<String,String>(header.size*2)
                for(i in header.indices)row[header[i]]=values[i]
                rows.add(row)
            }
        }
        require(rows.isNotEmpty()) { "Empty $name" }
        val header=keys!!;require(header.toSet().size==header.size)
        return rows
    }
    /** Same result as String.split(',') (trailing empty fields kept) without the regex-free but allocation-heavy generic path. */
    private fun splitCommas(line: String): Array<String> {
        var count=1;for(c in line)if(c==',')count++
        val out=arrayOfNulls<String>(count);var from=0;var k=0
        while(true) { val at=line.indexOf(',',from);if(at<0){out[k]=line.substring(from);break};out[k++]=line.substring(from,at);from=at+1 }
        @Suppress("UNCHECKED_CAST") return out as Array<String>
    }
}
fun Map<String,String>.number(key: String): Double = getValue(key).toDouble().also { require(it.isFinite()) { key } }
