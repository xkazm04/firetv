package dev.deathride.link

import kotlinx.serialization.json.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.Random

class InputPacketTest {
    private fun same(a: Double,b: Double)=(a.isNaN()&&b.isNaN())||a==b
    /** The byte reader must agree with the JSON tree on every packet it accepts, and refuse (so the JSON path runs) anything it cannot prove. */
    private fun check(raw: String) {
        val p=InputPacket();val ok=p.parse(raw.toByteArray())
        val msg=runCatching{Json.parseToJsonElement(raw).jsonObject}.getOrNull()
        if(!ok)return
        assertNotNull(msg,raw)
        fun num(k: String)=msg!![k]?.jsonPrimitive?.doubleOrNull ?: Double.NaN
        assertEquals("i",msg!!["t"]!!.jsonPrimitive.content,raw)
        assertEquals(msg["q"]!!.jsonPrimitive.longOrNull,p.q,raw)
        for((k,v) in listOf("ts" to p.ts,"s" to p.s,"a" to p.a,"b" to p.b)) assertTrue(same(num(k),v),"$k in $raw: ${num(k)} vs $v")
        for((k,v) in listOf("h" to p.h,"fire" to p.fire,"mine" to p.mine,"ability" to p.ability)) assertTrue(same(msg[k]?.jsonPrimitive?.doubleOrNull?:0.0,v),"$k in $raw")
        assertEquals(msg["weapon"]?.jsonPrimitive?.intOrNull?:0,p.weapon,raw)
        assertEquals(msg["f"]?.jsonPrimitive?.intOrNull==1,p.flash==1,raw)
    }
    @Test fun phoneAndProbePacketsParseIdenticallyToJson() {
        val r=Random(7)
        repeat(20000) {
            val q=r.nextInt(1_000_000);val ts=r.nextDouble()*1e6;val s=(r.nextDouble()*2-1)*(if(r.nextInt(3)==0)1.0 else 1e-3)
            val fields=StringBuilder("""{"t":"i","q":$q,"ts":$ts,"s":$s,"a":${r.nextInt(2)},"b":${"%.3f".format(java.util.Locale.ROOT,r.nextDouble())}""")
            if(r.nextBoolean())fields.append(""","h":${r.nextInt(2)},"f":${r.nextInt(2)},"fire":${r.nextInt(2)},"mine":0,"weapon":${intArrayOf(0,1,3,2,-1)[r.nextInt(5)]},"ability":1""")
            fields.append('}'); check(fields.toString())
        }
        for(raw in listOf("""{"t":"i","q":1,"ts":5,"s":1e-3,"a":1,"b":0}""","""{"t":"i","q":1,"ts":5,"s":-0.5,"a":1,"b":0.0,"f":1}""","""{ "t":"i" , "q":1,"ts":5,"s":0.25,"a":1,"b":0 }""",
            """{"t":"i","q":0,"ts":0.000000000000000001,"s":0.12345678901234567,"a":1,"b":0}""","""{"b":0,"a":1,"s":0.5,"ts":7,"q":3,"t":"i"}""","""{"t":"i","q":1,"ts":5,"s":0.5,"a":1,"b":0,"extra":9}"""))
            { check(raw);assertTrue(InputPacket().parse(raw.toByteArray()),raw) }
    }
    @Test fun anythingUnusualFallsBackToTheJsonPath() {
        val p=InputPacket()
        for(raw in listOf("""{"t":"i","q":1,"ts":5,"s":"NaN","a":1,"b":0}""","""{"t":"i","q":1.5,"ts":5,"s":0,"a":1,"b":0}""","""{"t":"ping","ts":5}""","""{"t":"i","q":1,"ts":5,"s":0,"a":1,"b":0""",
            """{"t":"i","q":1,"ts":5,"s":0,"a":1,"b":0,"x":[1]}""","""{"t":"i","q":-1,"ts":5,"s":0,"a":1,"b":0}""","""{"t":"i","q":1,"ts":5,"s":.5,"a":1,"b":0}""","""{"t":"i","q":1,"ts":5,"s":0,"a":1,"b":0}x""",
            """{"t":"i","q":1,"ts":5,"s":0,"a":1,"b":0,"weapon":1.0}""","""{"t":"i","t2":"i","q":1}""","""{"q":1,"s":0,"a":0,"b":0,"ts":1}""","", "{}","[1]"))
            assertFalse(p.parse(raw.toByteArray()),raw)
    }
    @Test fun garbageNeverThrows() {
        val r=Random(11);val p=InputPacket();val base="""{"t":"i","q":12,"ts":123.5,"s":0.25,"a":1,"b":0,"h":0,"f":1}""".toByteArray()
        repeat(50000){ val d=base.copyOf(); repeat(1+r.nextInt(3)){ d[r.nextInt(d.size)]=r.nextInt(256).toByte() }; val cut=if(r.nextInt(4)==0)r.nextInt(d.size) else d.size
            val text=String(d,0,cut,Charsets.ISO_8859_1); if(p.parse(d,cut))check(text) }
    }
}
