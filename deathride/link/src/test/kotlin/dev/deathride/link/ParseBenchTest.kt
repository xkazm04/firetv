package dev.deathride.link

import kotlinx.serialization.json.*
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.Test
import java.lang.management.ManagementFactory

class ParseBenchTest {
    private val mx=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
    private fun measure(name: String,n: Int,body: (Int)->Unit) {
        repeat(20000){body(it)}
        val id=Thread.currentThread().id;val b0=mx.getThreadAllocatedBytes(id);val t0=System.nanoTime()
        for(i in 0 until n)body(i)
        val ns=(System.nanoTime()-t0)/n.toDouble();val bytes=(mx.getThreadAllocatedBytes(id)-b0)/n
        println("BENCH $name: ${"%.0f".format(ns)} ns/op, $bytes B/op")
    }
    @Test fun parse() {
        assumeTrue(System.getenv("LINK_BENCH")!=null)
        val raw="""{"t":"i","q":12345,"ts":123456.78901234567,"s":0.12345678901234567,"a":1,"b":0,"h":0,"f":0,"fire":0,"mine":0,"weapon":0,"ability":0}"""
        var sink=0.0
        measure("json tree parse + field reads",200000){ val msg=Json.parseToJsonElement(raw).jsonObject
            sink+=(msg["q"]?.jsonPrimitive?.longOrNull ?: 0L)+(msg["ts"]?.jsonPrimitive?.doubleOrNull?:0.0)+(msg["s"]?.jsonPrimitive?.doubleOrNull?:0.0)+(msg["a"]?.jsonPrimitive?.doubleOrNull?:0.0)+(msg["b"]?.jsonPrimitive?.doubleOrNull?:0.0)+(msg["h"]?.jsonPrimitive?.doubleOrNull?:0.0)+(msg["fire"]?.jsonPrimitive?.doubleOrNull?:0.0)+(msg["mine"]?.jsonPrimitive?.doubleOrNull?:0.0)+(msg["weapon"]?.jsonPrimitive?.intOrNull?:0)+(msg["ability"]?.jsonPrimitive?.doubleOrNull?:0.0)
            sink+=msg["t"]?.jsonPrimitive?.contentOrNull.hashCode() }
        val bytes=raw.toByteArray();val pk=InputPacket()
        measure("InputPacket byte parse",500000){ if(pk.parse(bytes))sink+=pk.q+pk.ts+pk.s+pk.a }
        val phone="""{"t":"i","q":12345,"ts":123456.8,"s":0.123,"a":1,"b":0}""".toByteArray()
        measure("InputPacket byte parse (compact phone packet)",500000){ if(pk.parse(phone))sink+=pk.q+pk.ts+pk.s+pk.a }
        val now=987654.321012345
        measure("ack string template",500000){ val s="{\"t\":\"ack\",\"q\":${it.toLong()},\"tvNow\":$now,\"accepted\":${it%2==0}}";sink+=s.length }
        run { val d=Distribution();val r=java.util.Random(1);for(i in 0 until 5000)d.add(r.nextDouble()*20,i*2.0)
            measure("Distribution.add",2000000){ d.add((it%97)*0.1,10000.0+it) }
            measure("Distribution.json (4096 window)",2000){ sink+=d.json(10000.0).length } }
        run { val h=RaceServer({"{}"},{},port=0);for(i in 0 until 5000){h.metrics.frameMs.add(16.0+i%5,i*2.0);h.metrics.simMs.add(0.02,i*2.0);h.metrics.inputAgeMs[0].add(20.0,i*2.0);h.metrics.inputAgeMs[1].add(20.0,i*2.0)}
            measure("RaceServer.statsJson (/stats)",2000){ sink+=h.statsJson().length } }
        println("BENCH sink $sink")
    }
}
