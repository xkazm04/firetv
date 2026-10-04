package dev.deathride.link

import kotlinx.serialization.json.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.lang.management.ManagementFactory

class PerfTraceTest {
    @Test fun wrapAndCursorRetainChronologicalRawRows() {
        val trace=PerfTrace(arrayOf("a","b"),3)
        val row=DoubleArray(2)
        repeat(5){row[0]=it.toDouble();row[1]=-it.toDouble();trace.append(row)}
        val json=Json.parseToJsonElement(trace.json()).jsonObject
        assertEquals(2,json["first"]!!.jsonPrimitive.int)
        assertEquals(5,json["end"]!!.jsonPrimitive.int)
        assertEquals(listOf(2,3,4),json["rows"]!!.jsonArray.map{it.jsonArray[0].jsonPrimitive.double.toInt()})
        val next=Json.parseToJsonElement(trace.json(4)).jsonObject
        assertEquals(1,next["rows"]!!.jsonArray.size)
        assertEquals(0,Json.parseToJsonElement(trace.json(99)).jsonObject["rows"]!!.jsonArray.size)
    }
    @Test fun appendAllocatesNothingAfterWarmup() {
        val bean=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true
        val trace=PerfTrace(arrayOf("one","two"));val row=doubleArrayOf(1.0,2.0)
        repeat(20000){trace.append(row)}
        val id=Thread.currentThread().id;val before=bean.getThreadAllocatedBytes(id)
        repeat(10000){trace.append(row)}
        assertEquals(0,bean.getThreadAllocatedBytes(id)-before)
    }
}
