package dev.deathride.link

import kotlin.math.*

/** Fixed storage in the hot path. Window quantiles exact; lifetime histogram has 0.1 ms bins. */
class Distribution(private val capacity: Int = 4096, private val binMs: Double = .1, private val capMs: Double = 5000.0) {
    private val values=DoubleArray(capacity)
    private val times=DoubleArray(capacity)
    private val histogram=LongArray((capMs/binMs).toInt()+1)
    private var cursor=0
    private var filled=0
    private var count=0L
    private var maximum=0.0
    /** Sort scratch for [json], reused under this lock: /stats reads four distributions several times a second, and a fresh
     *  32 KB array each time was a large-object allocation made while the render thread's [add] waits on the same lock. */
    private var scratch=DoubleArray(0)
    @Synchronized fun add(valueMs: Double, nowMs: Double) {
        val value=valueMs.coerceAtLeast(0.0)
        values[cursor]=value; times[cursor]=nowMs; cursor=(cursor+1)%capacity; filled=min(filled+1,capacity)
        histogram[(value/binMs).toInt().coerceIn(0,histogram.lastIndex)]++; count++; maximum=max(maximum,value)
    }
    @Synchronized fun json(nowMs: Double): String {
        if(scratch.size<filled)scratch=DoubleArray(capacity)
        val window=scratch; var n=0
        for(i in 0 until filled) if(nowMs-times[i]<=10000) window[n++]=values[i]
        java.util.Arrays.sort(window,0,n)
        fun q(p: Double)=if(n==0) 0.0 else window[(ceil(p*n).toInt()-1).coerceIn(0,n-1)]
        fun lifetime(p: Double): Double { var sum=0L; val target=ceil(count*p).toLong(); if(count==0L)return 0.0; for(i in histogram.indices){sum+=histogram[i]; if(sum>=target)return i*binMs}; return maximum }
        return "{\"lifetimeBinMs\":$binMs,\"lifetimeCapMs\":$capMs,\"last10s\":{\"p50\":${q(.5)},\"p95\":${q(.95)},\"max\":${if(n==0)0.0 else window[n-1]},\"count\":$n},\"sinceStart\":{\"p50\":${lifetime(.5)},\"p95\":${lifetime(.95)},\"max\":$maximum,\"count\":$count}}"
    }
}
class Counter {
    private val time=DoubleArray(4096); private val value=LongArray(4096)
    private var cursor=0; private var filled=0; private var total=0L
    @Synchronized fun add(n: Long, now: Double) { if(n<=0)return; time[cursor]=now; value[cursor]=n; cursor=(cursor+1)%time.size; filled=min(filled+1,time.size); total+=n }
    @Synchronized fun json(now: Double): String { var recent=0L; for(i in 0 until filled) if(now-time[i]<=10000) recent+=value[i]; return "{\"last10s\":$recent,\"sinceStart\":$total}" }
}
class Metrics {
    val frameMs=Distribution()
    val simMs=Distribution(binMs=.001,capMs=50.0)
    val inputAgeMs=Array(2){Distribution()}
    val stale=Array(2){Counter()}; val dropped=Array(2){Counter()}; val outOfOrder=Array(2){Counter()}
    val discardedSimMs=Counter()
}
