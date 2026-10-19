package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class ContentParseTest {
    /** The pre-optimisation parser, kept as the oracle. */
    private fun legacy(name: String): List<Map<String,String>> {
        val lines=requireNotNull(javaClass.getResourceAsStream("/data/$name.csv")).bufferedReader().use { it.readLines() }.filter { it.isNotBlank() && !it.startsWith("#") }
        require(lines.size>1)
        val keys=lines.first().split(',');require(keys.distinct().size==keys.size)
        return lines.drop(1).map { line -> val values=line.split(',');require(values.size==keys.size);keys.zip(values).toMap() }
    }
    @Test fun everyTableParsesIdenticallyToTheLegacyParser() {
        val root=File("src/main/resources/data");assertTrue(root.isDirectory)
        var tables=0
        for(f in root.walkTopDown().filter { it.isFile && it.extension=="csv" }) {
            val name=f.relativeTo(root).path.replace('\\','/').removeSuffix(".csv")
            val old=runCatching { legacy(name) }
            val new=runCatching { Content.table(name) }
            // Tables that are not table-shaped (junction/branch files have no distinct header contract) must fail identically.
            assertEquals(old.isSuccess,new.isSuccess,name)
            if(old.isSuccess) { assertEquals(old.getOrThrow(),new.getOrThrow(),name);assertEquals(old.getOrThrow().map{it.keys.toList()},new.getOrThrow().map{it.keys.toList()},name);tables++ }
        }
        assertTrue(tables>150,"parsed $tables tables")
    }
}
