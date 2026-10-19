package dev.deathride.core

/** Bin statistics for Course.project: bins, mean list length over bins that hold road, and bake time. */
fun main() {
    for(i in listOf(0,5,12,19,26,33,37)) {
        val c=Courses.playable[i]
        val t=System.nanoTime();c.project(c.x[0],c.y[0],Projection());val ms=(System.nanoTime()-t)/1e6
        val f=Course::class.java.getDeclaredField("candidates\$delegate");f.isAccessible=true
        val lazy=f.get(c) as Lazy<*>;@Suppress("UNCHECKED_CAST") val bins=lazy.value as Array<IntArray>
        val sizes=bins.map{it.size}
        println("%-16s segs=%5d bins=%6d meanList=%.1f maxList=%d bake=%.0f ms ints=%d".format(c.id,c.count,bins.size,sizes.average(),sizes.max(),ms,sizes.sum()))
    }
}
