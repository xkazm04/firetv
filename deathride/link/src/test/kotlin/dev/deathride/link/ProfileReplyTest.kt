package dev.deathride.link

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import kotlinx.serialization.json.*

/** P18: /profile is formatted in pieces and served as UTF-8 blocks instead of two PerfTrace Strings in a template and
 *  respondText's copy. The bytes must not change by one, over rows recorded on the Stick. */
class ProfileReplyTest {
    /** The pre-P18 PerfTrace (992c48a9), verbatim: the ring, append and json. */
    private class PreP18Trace(val columns: Array<String>, private val capacity: Int = 4096) {
        private val rows = DoubleArray(capacity * columns.size)
        private var sequence = 0L
        @Synchronized fun append(row: DoubleArray) {
            val offset = (sequence % capacity).toInt() * columns.size
            System.arraycopy(row, 0, rows, offset, columns.size)
            sequence++
        }
        fun json(after: Long = 0): String {
            val copy: DoubleArray
            val first: Long
            val end: Long
            synchronized(this) {
                end = sequence
                first = maxOf(after.coerceAtMost(end), end - capacity, 0)
                copy = DoubleArray((end - first).toInt() * columns.size)
                for (n in first until end) System.arraycopy(rows, (n % capacity).toInt() * columns.size,
                    copy, (n - first).toInt() * columns.size, columns.size)
            }
            return buildString {
                append("{\"first\":").append(first).append(",\"end\":").append(end)
                append(",\"columns\":[")
                for (i in columns.indices) { if (i > 0) append(','); append('"').append(columns[i]).append('"') }
                append("],\"rows\":[")
                for (n in first until end) {
                    if (n > first) append(',')
                    append('[')
                    for (i in columns.indices) {
                        if (i > 0) append(',')
                        val value = copy[(n - first).toInt() * columns.size + i]
                        if (value.isFinite()) append(value) else append("null")
                    }
                    append(']')
                }
                append("]}")
            }
        }
    }
    /** The pre-P18 /profile route's text (RaceServer.kt:180 at 992c48a9), verbatim but for its two traces. */
    private fun preP18Text(frames: PreP18Trace,inputs: PreP18Trace,runtime: (()->String)?,f: Long,i: Long)=
        "{\"frames\":${frames.json(f)},\"inputs\":${inputs.json(i)},\"runtime\":${runtime?.invoke()?:"{}"}}"

    /** FrameProfiler's 40 columns (game/), and RaceServer's 9 input columns. */
    private val frameColumns=arrayOf("startNs", "intervalMs", "workMs", "cpuMs", "active", "liveCars",
        "requestsMs", "prepareMs", "simulationMs", "audioMs", "telemetryMs", "clearMs",
        "cameraMs", "effectsUpdateMs", "sceneryDrawMs", "carsEffectsMs", "hudMs", "captionMs",
        "drawCalls", "textureBinds", "textureUploads", "effectSlots",
        "requestsBytes", "prepareBytes", "simulationBytes", "audioBytes", "telemetryBytes", "clearBytes",
        "cameraBytes", "effectsUpdateBytes", "sceneryDrawBytes", "carsEffectsBytes", "hudBytes", "captionBytes", "drawIndices",
        "hudDraws", "hudFlushes", "hudBakeMs", "schedRunMs", "schedWaitMs")
    private val inputColumns=arrayOf("receiveNs","slot","q","ageMs","parseMs","offerMs","ackEnqueueMs","reason","receiveGapMs")
    /** Recorded: frame rows 8952-8975 of the P18 audit run (/profile read 12, 40 columns). */
    private val recordedFrames=arrayOf(
        doubleArrayOf(2734825433765543.0,16.373307999999998,8.383154,8.222538,1.0,5.0,0.222461,0.003693,1.292923,0.148538,0.484,0.625846,0.050616,0.032538,1.157,3.173,1.167692,0.009308,19.0,13.0,0.0,15.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22815.0,6.0,3.0,0.0,7.677768,0.123231),
        doubleArrayOf(2734825450478697.0,16.713154,8.471923,8.295077,1.0,5.0,0.220846,0.003692,1.509846,0.191616,0.007,0.567692,0.053538,0.054693,1.142615,3.180385,1.512,0.010538,19.0,13.0,0.0,17.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22803.0,6.0,3.0,0.0,8.910846,0.295),
        doubleArrayOf(2734825467192850.0,16.714153,9.005539,7.931463,1.0,5.0,0.213616,0.003923,1.353308,0.135692,0.006846,1.388231,0.056308,0.034307,1.201231,3.025308,1.559,0.010538,19.0,13.0,0.0,17.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22767.0,6.0,3.0,0.0,9.012616,0.037384),
        doubleArrayOf(2734825483774312.0,16.581462000000002,7.530385,7.397077,1.0,5.0,0.221846,0.003769,1.084154,0.160923,0.006308,0.545385,0.052923,0.033154,1.145692,2.988846,1.261308,0.009307,19.0,13.0,0.0,17.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22827.0,6.0,3.0,0.0,8.577617,0.469537),
        doubleArrayOf(2734825500536466.0,16.762154000000002,8.112231,7.65254,1.0,5.0,0.384615,0.004385,1.060461,0.155308,0.343385,0.557615,0.052923,0.033385,1.204538,2.893539,1.395538,0.010539,19.0,13.0,0.0,17.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22827.0,6.0,3.0,0.0,8.242691,0.348539),
        doubleArrayOf(2734825515637235.0,15.100769,8.636154,8.453,1.0,5.0,0.278692,0.004,1.980847,0.201307,0.007385,0.533692,0.052077,0.053154,1.167,3.050923,1.280538,0.009462,19.0,13.0,0.0,18.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22785.0,6.0,3.0,0.0,8.219616,0.360384),
        doubleArrayOf(2734825532321235.0,16.684,9.702615,9.343616,1.0,5.0,0.272692,0.004154,1.857616,0.149077,0.50123,0.629231,0.060385,0.051307,1.253847,3.36423,1.530308,0.010692,19.0,13.0,0.0,19.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22788.0,6.0,3.0,0.0,9.188308,0.397077),
        doubleArrayOf(2734825549119774.0,16.798539,10.073615,7.433692,1.0,5.0,0.218,0.003692,1.251077,0.273077,0.007769,0.602154,0.05,0.032384,3.634154,2.910154,1.067231,0.008692,19.0,13.0,0.0,19.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22824.0,6.0,3.0,0.0,9.970307,0.284307),
        doubleArrayOf(2734825565664850.0,16.545075999999998,7.780462,7.555923,1.0,5.0,0.281,0.004231,1.573231,0.202,0.006769,0.575539,0.052077,0.053077,1.113,2.813461,1.079077,0.010385,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22842.0,6.0,3.0,0.0,8.176845,2.69677),
        doubleArrayOf(2734825582329620.0,16.664769999999997,7.565769,7.139615,1.0,5.0,0.291846,0.003846,1.119231,0.134077,0.006769,0.612231,0.050692,0.033154,1.253615,2.827462,1.207154,0.008846,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22782.0,6.0,3.0,0.0,8.192461,0.103385),
        doubleArrayOf(2734825599269543.0,16.939923,7.698615,7.551155,1.0,5.0,0.213538,0.003769,1.444847,0.153615,0.007,0.535462,0.05123,0.032154,1.187077,2.960154,1.083154,0.010154,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22830.0,6.0,3.0,0.0,7.797539,0.958231),
        doubleArrayOf(2734825615950620.0,16.681077,7.801769,7.343229,1.0,5.0,0.337307,0.004077,1.066308,0.145154,0.331846,0.584538,0.055924,0.127461,1.352923,2.76,1.013769,0.008154,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22866.0,6.0,3.0,0.0,8.348463,0.090769),
        doubleArrayOf(2734825632414774.0,16.464154,8.416,8.13754,1.0,5.0,0.274384,0.004,1.715308,0.204615,0.007385,0.651615,0.059769,0.060077,1.234154,2.941,1.238846,0.009308,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22794.0,6.0,3.0,0.0,7.937306,0.244002),
        doubleArrayOf(2734825649241235.0,16.826461000000002,8.197154,7.843231,1.0,5.0,0.212539,0.004076,1.093693,0.153615,0.520308,0.853538,0.060616,0.033769,1.194077,2.873231,1.172769,0.009461,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22782.0,6.0,3.0,0.0,8.829694,0.337846),
        doubleArrayOf(2734825666245850.0,17.004615,8.52877,8.16246,1.0,5.0,0.440231,0.004923,1.93577,0.133,0.005846,0.683846,0.053461,0.032616,1.167615,2.952077,1.095539,0.009692,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22866.0,6.0,3.0,0.0,8.736924,1.097922),
        doubleArrayOf(2734825683325543.0,17.079693,8.437846,8.265077,1.0,5.0,0.204846,0.003385,1.952615,0.187231,0.006769,0.623308,0.050846,0.049538,1.073846,3.06877,1.189923,0.009846,19.0,13.0,0.0,21.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22788.0,6.0,3.0,0.0,8.754385,0.540923),
        doubleArrayOf(2734825700256081.0,16.930538,7.673923,6.952615,1.0,5.0,0.305923,0.00377,1.021,0.354923,0.007615,0.791846,0.054385,0.033692,1.073846,2.781308,1.219692,0.010154,19.0,13.0,0.0,21.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22800.0,6.0,3.0,0.0,9.064461,0.29654),
        doubleArrayOf(2734825715777081.0,15.521,8.439308,8.048923,1.0,5.0,0.345154,0.003769,1.301846,0.162385,0.006846,0.527462,0.054077,0.032923,1.210231,3.501692,1.265692,0.009462,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22662.0,6.0,3.0,0.0,7.628999,0.331616),
        doubleArrayOf(2734825732623081.0,16.846,7.804308,7.401922,1.0,5.0,0.225693,0.003461,1.116462,0.157153,0.339308,0.550077,0.054846,0.032846,1.217,2.688923,1.391308,0.010154,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22674.0,6.0,3.0,0.0,8.761462,0.451385),
        doubleArrayOf(2734825749170697.0,16.547616,8.266538,7.941539,1.0,5.0,0.213077,0.003846,1.101307,0.162462,0.006461,0.536924,0.053384,0.031692,1.498154,3.441616,1.191384,0.009385,19.0,13.0,0.0,20.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22638.0,6.0,3.0,0.0,8.036614,0.275923),
        doubleArrayOf(2734825766047850.0,16.877153,8.209,7.991923,1.0,5.0,0.215154,0.004077,1.384769,0.152,0.533693,0.657154,0.056153,0.033385,1.184462,2.83523,1.127616,0.010384,19.0,13.0,0.0,19.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22638.0,6.0,3.0,0.0,8.754387,1.174922),
        doubleArrayOf(2734825782890389.0,16.842539,9.214923,7.741386,1.0,5.0,0.199308,0.003846,1.171,0.137154,0.007384,0.823308,0.057538,0.173385,2.146,3.138769,1.331231,0.01,19.0,13.0,0.0,19.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22626.0,6.0,3.0,0.0,8.732616,0.242539),
        doubleArrayOf(2734825799175235.0,16.284845999999998,8.686769,8.208617,1.0,5.0,0.275692,0.00477,1.939692,0.150615,0.006154,0.877692,0.062154,0.035462,1.188,2.988384,1.132924,0.009769,19.0,13.0,0.0,18.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22611.0,6.0,3.0,0.0,8.337154,1.100538),
        doubleArrayOf(2734825815860697.0,16.685462,8.518384,7.222848,1.0,5.0,0.411,0.005077,2.084076,0.139847,0.006,0.829846,0.052538,0.032693,1.138615,2.707461,1.086,0.009693,19.0,13.0,0.0,17.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,-1.0,22617.0,6.0,3.0,0.0,8.951694,0.349383),
    )
    /** Recorded: input rows of the same read (9 columns). */
    private val recordedInputs=arrayOf(
        doubleArrayOf(2734823883213081.0,1.0,3666.0,5.752446000027703,0.126923,0.004769,0.280924,0.0,22.407461),
        doubleArrayOf(2734823926491081.0,1.0,3667.0,2.702915000001667,0.131769,0.005077,0.272693,0.0,43.278),
        doubleArrayOf(2734823926491235.0,0.0,3667.0,2.962826999981189,0.131615,0.005385,0.272923,0.0,43.721462),
        doubleArrayOf(2734823959074697.0,1.0,3668.0,3.9118540000054054,0.142538,0.005385,0.326077,0.0,32.583616),
        doubleArrayOf(2734823961859389.0,0.0,3668.0,6.949904000008246,0.136769,0.006846,0.322846,0.0,35.368154),
        doubleArrayOf(2734823989836312.0,0.0,3669.0,3.9020109999983106,0.130077,0.005769,0.335,0.0,27.976923),
        doubleArrayOf(2734823991697697.0,1.0,3669.0,5.548669000010705,0.16,0.005692,0.298923,0.0,32.623),
        doubleArrayOf(2734824019914235.0,1.0,3670.0,3.195914999989327,0.158462,0.00623,0.388077,0.0,28.216538),
        doubleArrayOf(2734824023993466.0,0.0,3670.0,7.5118340000044554,0.176538,0.006231,0.360615,0.0,34.157154),
        doubleArrayOf(2734824052254158.0,0.0,3671.0,4.540611000003992,0.126769,0.005462,0.333384,0.0,28.260692),
        doubleArrayOf(2734824082807389.0,1.0,3671.0,35.497537999995984,0.771231,0.104153,0.524462,0.0,62.893154),
        doubleArrayOf(2734824091496620.0,1.0,3672.0,12.96374599999399,0.119846,0.004615,0.289308,0.0,8.689231),
        doubleArrayOf(2734824090100158.0,0.0,3672.0,12.996556999976747,1.286615,0.007,1.753308,0.0,37.846),
        doubleArrayOf(2734824126879543.0,0.0,3673.0,3.1553040000144392,0.164154,0.006076,0.343462,0.0,36.779385),
        doubleArrayOf(2734824130668312.0,1.0,3673.0,6.679861999989953,0.132154,0.005615,0.732,0.0,39.171692),
        doubleArrayOf(2734824157467312.0,0.0,3674.0,3.9496809999691322,0.164308,0.006923,0.332692,0.0,30.587769),
        doubleArrayOf(2734824159747235.0,1.0,3674.0,5.980162000021664,0.136462,0.007,0.370307,0.0,29.078923),
        doubleArrayOf(2734824190712081.0,0.0,3675.0,7.014526999992086,0.133308,0.005846,0.320538,0.0,33.244769),
        doubleArrayOf(2734824191411773.0,1.0,3675.0,7.770762000000104,0.416385,0.034385,1.047923,0.0,31.664538),
        doubleArrayOf(2734824218059004.0,0.0,3676.0,3.7893419999745674,0.134385,0.005615,1.039846,0.0,27.346923),
        doubleArrayOf(2734824218708927.0,1.0,3676.0,4.184654000011506,0.114923,0.004923,0.602847,0.0,27.297154),
        doubleArrayOf(2734824247128004.0,0.0,3677.0,2.8134339999814983,0.375385,0.006615,1.101308,0.0,29.069),
        doubleArrayOf(2734824249981004.0,1.0,3677.0,5.167992000002414,0.128616,0.005077,0.357307,0.0,31.272077),
        doubleArrayOf(2734824282807389.0,1.0,3678.0,5.604408000013791,0.122,0.004308,0.262384,0.0,32.826385),
    )
    /** Recorded: the first eight runtime stats of the same read (AndroidProfile.runtimeJson's form). */
    private val recordedRuntime="{\"art.gc.blocking-gc-count\":\"0\",\"art.gc.gc-time\":\"3864\",\"art.gc.bytes-allocated\":\"794985208\",\"art.gc.bytes-freed\":\"737621648\",\"art.gc.gc-count-rate-histogram\":\"0:3,1:11,2:1,3:1,6:1,10:2\",\"art.gc.blocking-gc-count-rate-histogram\":\"0:19\",\"art.gc.gc-count\":\"43\",\"art.gc.blocking-gc-time\":\"0\"}"

    /** A trace and the old one fed the same rows: the recorded rows in turn, each with its clock moved on, and every
     *  [special]th row carrying a value a trace can hold besides those (NaN and the infinities print as null). */
    private class Fed(val trace: PerfTrace,val old: PreP18Trace)
    private fun feed(fed: Fed,recorded: Array<DoubleArray>,count: Int,special: Int=97) {
        val row=DoubleArray(recorded[0].size)
        val extras=doubleArrayOf(Double.NaN,Double.POSITIVE_INFINITY,Double.NEGATIVE_INFINITY,-0.0,1e-7,0.1+0.2,123456789.123,4.9E-324,Double.MAX_VALUE,-1.0)
        for(k in 0 until count) {
            recorded[k%recorded.size].copyInto(row)
            row[0]+=k*16_683_350.0
            if(k%special==0)row[(k/special)%row.size]=extras[(k/special)%extras.size]
            fed.trace.append(row);fed.old.append(row)
        }
    }
    private fun server(port: Int,frames: PerfTrace,runtime: (()->String)?)=RaceServer({ "{}" },{},port=port,profileFrames=frames,profileRuntime=runtime)
    /** RaceServer's own input trace (made from profileFrames), fed through reflection as its input handler would feed it. */
    private fun inputsOf(h: RaceServer)=RaceServer::class.java.getDeclaredField("profileInputs").also{it.isAccessible=true}.get(h) as PerfTrace
    private val runtime={ recordedRuntime.dropLast(1)+",\"note\":\"Zoë Łódź 🏎\"}" }

    @Test fun traceJsonIsThePreP18Text() {
        for(capacity in listOf(3,64,4096)) {
            val fed=Fed(PerfTrace(frameColumns,capacity),PreP18Trace(frameColumns,capacity))
            assertEquals(fed.old.json(),fed.trace.json(),"empty")
            feed(fed,recordedFrames,5000)
            for(after in listOf(0L,1L,903L,4999L,5000L,5001L,99_999L,-5L))assertEquals(fed.old.json(after),fed.trace.json(after),"capacity $capacity after $after")
        }
    }

    @Test fun replyBytesAreTheUtf8OfThePreP18Text() {
        for(rt in listOf(runtime,null)) {
            val frames=PerfTrace(frameColumns);val oldFrames=PreP18Trace(frameColumns);val oldInputs=PreP18Trace(inputColumns)
            val h=server(0,frames,rt)
            feed(Fed(frames,oldFrames),recordedFrames,4500);feed(Fed(inputsOf(h),oldInputs),recordedInputs,7000)
            // The probe's reads: from the start, each from the previous end, one at the end, one past it and one older than the ring.
            for((f,i) in listOf(0L to 0L,3600L to 6100L,4400L to 6900L,4500L to 7000L,9999L to 9999L,10L to 20L)) repeat(2) {
                val reply=h.profileReply(f,i)
                val expected=preP18Text(oldFrames,oldInputs,rt,f,i).toByteArray(Charsets.UTF_8)
                assertArrayEquals(expected,reply.bytes(),"frames $f inputs $i")
                assertEquals(expected.size.toLong(),reply.length)
                h.releaseProfile(reply)
            }
            // A one-field change of the old text is caught: the comparison is by byte.
            val reply=h.profileReply(0,0); val bytes=reply.bytes()
            val bent=preP18Text(oldFrames,oldInputs,rt,0,0).replaceFirst("\"end\":4500","\"end\":4501").toByteArray(Charsets.UTF_8)
            assertFalse(bent.contentEquals(bytes))
            if(rt!=null)assertTrue(String(bytes,Charsets.UTF_8).contains("Zoë Łódź 🏎"))
            Json.parseToJsonElement(String(bytes,Charsets.UTF_8))
        }
    }

    @Test fun theReplyIsReusedAndTrimmedAndTheFreeListBounded() {
        val frames=PerfTrace(frameColumns);val h=server(0,frames,runtime)
        feed(Fed(frames,PreP18Trace(frameColumns)),recordedFrames,4096)
        val big=h.profileReply(0,0); assertTrue(big.blockCount>64,"a whole ring is ${big.blockCount} blocks"); h.releaseProfile(big)
        assertEquals(1,h.freeProfileReplies)
        val again=h.profileReply(3500,0); assertSame(big,again,"reused"); assertEquals(64,again.blockCount,"trimmed to 64 blocks on release")
        val second=h.profileReply(3500,0); assertNotSame(again,second,"a racing read takes its own reply")
        h.releaseProfile(again);h.releaseProfile(second); assertEquals(1,h.freeProfileReplies,"keeps one")
    }

    /** Warm, a read of ~10 s of rows allocates what formatting its rows allocates and almost nothing more: no reply-sized text
     *  or array (JVM thread counter). The floor is the two traces formatted into a small builder cleared every piece (their
     *  row copies, and on this JVM the per-number garbage of StringBuilder.append(Double), which ART's FloatingDecimal does
     *  not make). The pre-P18 route's text and its UTF-8 copy are measured against the same floor, for the record. */
    @Test fun aWarmReplyAllocatesNoReplySizedText() {
        val frames=PerfTrace(frameColumns);val oldFrames=PreP18Trace(frameColumns);val oldInputs=PreP18Trace(inputColumns)
        val h=server(0,frames,runtime);val inputs=inputsOf(h)
        feed(Fed(frames,oldFrames),recordedFrames,4096);feed(Fed(inputs,oldInputs),recordedInputs,4096)
        val mx=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        val id=Thread.currentThread().id
        val f=4096L-600;val i=4096L-600 // ~10 s of frames at 60 fps and of two phones' inputs at 30 Hz: the probe's read
        val scratch=StringBuilder(PerfTrace.PIECE+1024);val clear: (StringBuilder)->Unit={it.setLength(0)}
        fun floor() { scratch.setLength(0);frames.writeJson(f,scratch,clear);inputs.writeJson(i,scratch,clear) }
        fun measure(block: ()->Unit): Long { val before=mx.getThreadAllocatedBytes(id);repeat(10){block()};return (mx.getThreadAllocatedBytes(id)-before)/10 }
        repeat(30){ floor();h.releaseProfile(h.profileReply(f,i));preP18Text(oldFrames,oldInputs,runtime,f,i).toByteArray(Charsets.UTF_8) }
        var length=0L
        val floorPerRead=measure{floor()}
        val perRead=measure{ val r=h.profileReply(f,i);length=r.length;h.releaseProfile(r) }
        val oldPerRead=measure{ preP18Text(oldFrames,oldInputs,runtime,f,i).toByteArray(Charsets.UTF_8) }
        println("profile reply bytes=$length per warm read: reply=$perRead floor=$floorPerRead (row copies ${600L*(frameColumns.size+inputColumns.size)*8}) pre-P18=$oldPerRead; above the floor: reply ${perRead-floorPerRead}, pre-P18 ${oldPerRead-floorPerRead}")
        assertTrue(perRead-floorPerRead<16*1024,"the reply adds ${perRead-floorPerRead} bytes to formatting a $length-byte reply")
        assertTrue(oldPerRead-floorPerRead>3*length,"the pre-P18 text adds several reply sizes: ${oldPerRead-floorPerRead}")
    }

    /** The served reply against a bare server running the old route line on the old traces holding the same rows: same status,
     *  every header but Date (Content-Type and Content-Length included) and the body byte for byte, with or without
     *  Accept-Encoding, for the probe's queries and malformed ones; never gzipped. */
    @Test fun servedProfileIsTheOldRouteByteForByte() {
        val port=java.net.ServerSocket(0).use{it.localPort}; val oldPort=java.net.ServerSocket(0).use{it.localPort}
        val frames=PerfTrace(frameColumns);val oldFrames=PreP18Trace(frameColumns);val oldInputs=PreP18Trace(inputColumns)
        val h=server(port,frames,runtime)
        feed(Fed(frames,oldFrames),recordedFrames,4200);feed(Fed(inputsOf(h),oldInputs),recordedInputs,5000)
        val old=embeddedServer(CIO,host="127.0.0.1",port=oldPort){ routing { get("/profile"){
            val f=call.request.queryParameters["frames"]?.toLongOrNull()?:0
            val i=call.request.queryParameters["inputs"]?.toLongOrNull()?:0
            call.respondText("{\"frames\":${oldFrames.json(f)},\"inputs\":${oldInputs.json(i)},\"runtime\":${runtime.invoke()}}",ContentType.Application.Json) } } }.start(false)
        val http=HttpClient.newHttpClient()
        fun get(url: String,accept: String?): HttpResponse<ByteArray> { val b=HttpRequest.newBuilder(URI(url)); if(accept!=null)b.header("Accept-Encoding",accept)
            return http.send(b.build(),HttpResponse.BodyHandlers.ofByteArray()) }
        fun headers(x: HttpResponse<ByteArray>)=x.headers().map().filterKeys{!it.equals("date",true)}
        try {
            h.start();repeat(500){if(!h.running)Thread.sleep(20)}; assertTrue(h.running,h.serverStatus)
            for(query in listOf("","?frames=0&inputs=0","?frames=3600&inputs=4000","?frames=4200&inputs=5000","?frames=x&inputs=-3"))
                for(accept in listOf(null,"gzip, deflate","gzip")) {
                    val r=get("http://127.0.0.1:$port/profile$query",accept); val o=get("http://127.0.0.1:$oldPort/profile$query",accept)
                    assertEquals(200,r.statusCode()); assertEquals(o.statusCode(),r.statusCode())
                    assertEquals(headers(o),headers(r),"headers ($query, $accept)")
                    assertNull(r.headers().firstValue("Content-Encoding").orElse(null),"never gzipped ($accept)")
                    assertEquals(r.body().size.toString(),r.headers().firstValue("Content-Length").get())
                    assertArrayEquals(o.body(),r.body(),"served body ($query, $accept)")
                    println("profile served bytes=${r.body().size} type=${r.headers().firstValue("Content-Type").orElse("")} query=$query accept=$accept")
                }
            assertEquals(1,h.freeProfileReplies,"the reply returned to the pool")
        } finally { h.stop(); old.stop(0,0,java.util.concurrent.TimeUnit.MILLISECONDS) }
    }
}
