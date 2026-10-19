package dev.deathride.link

/** Appends finite numbers with at most [decimals] places and no trailing zeros, without Double.toString allocation. */
fun StringBuilder.appendFixed(value: Double,decimals: Int): StringBuilder {
    if(!value.isFinite())return append('0')
    var scale=1L; repeat(decimals){scale*=10}
    val scaled=Math.round(Math.abs(value)*scale)
    if(scaled==0L)return append('0')
    if(value<0)append('-')
    append(scaled/scale)
    var frac=scaled%scale
    if(frac!=0L) {
        append('.'); var places=decimals
        while(frac%10==0L){frac/=10;places--}
        val digits=if(frac<10)1 else if(frac<100)2 else if(frac<1000)3 else 4
        repeat(places-digits){append('0')}
        append(frac)
    }
    return this
}
fun sameChars(a: CharSequence,b: CharSequence): Boolean {
    val n=a.length; if(n!=b.length)return false
    for(i in 0 until n)if(a[i]!=b[i])return false
    return true
}
