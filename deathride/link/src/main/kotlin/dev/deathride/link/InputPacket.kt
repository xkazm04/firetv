package dev.deathride.link

/**
 * Allocation-free reader for the phone's 30-60 Hz input packet {"t":"i","q":..,"ts":..,"s":..,"a":..,"b":..,...}.
 * It reads the frame's bytes in place: no String, CharBuffer, JSON tree or regex per packet.
 * Anything unusual (escapes, nesting, quoted numbers, another message type, a malformed number) returns false so
 * the caller falls back to the full JSON path with its original semantics.
 */
class InputPacket {
    var q=0L; var ts=Double.NaN; var s=Double.NaN; var a=Double.NaN; var b=Double.NaN
    var h=0.0; var fire=0.0; var mine=0.0; var ability=0.0; var weapon=0; var flash=0
    private var pos=0
    private var failed=false
    private var number=0.0
    private var integer=true

    fun parse(d: ByteArray, length: Int=d.size): Boolean {
        q=0;ts=Double.NaN;s=Double.NaN;a=Double.NaN;b=Double.NaN;h=0.0;fire=0.0;mine=0.0;ability=0.0;weapon=0;flash=0
        pos=0;failed=false
        var n=0; var sawType=false; var sawQ=false
        if(!expect(d,length,'{'.code))return false
        while(true) {
            skip(d,length)
            if(pos>=length)return false
            if(d[pos].toInt()=='}'.code){pos++;break}
            if(n++>0){ if(!expect(d,length,','.code))return false;skip(d,length) }
            if(pos>=length||d[pos].toInt()!='"'.code)return false
            val ks=pos+1; var ke=ks
            while(ke<length&&d[ke].toInt()!='"'.code){ if(d[ke].toInt()=='\\'.code)return false; ke++ }
            if(ke>=length)return false
            pos=ke+1; skip(d,length)
            if(!expect(d,length,':'.code))return false
            skip(d,length)
            if(pos>=length)return false
            val kl=ke-ks
            if(d[pos].toInt()=='"'.code) {
                // The only string value allowed is "t":"i".
                if(kl==1&&d[ks].toInt()=='t'.code&&pos+2<length&&d[pos+1].toInt()=='i'.code&&d[pos+2].toInt()=='"'.code){pos+=3;sawType=true;continue}
                return false
            }
            if(!readNumber(d,length))return false
            when {
                kl==1&&d[ks].toInt()=='q'.code -> { if(!integer||number<0||number>9e15)return false; q=number.toLong();sawQ=true }
                kl==1&&d[ks].toInt()=='s'.code -> s=number
                kl==1&&d[ks].toInt()=='a'.code -> a=number
                kl==1&&d[ks].toInt()=='b'.code -> b=number
                kl==1&&d[ks].toInt()=='h'.code -> h=number
                kl==1&&d[ks].toInt()=='f'.code -> { if(!integer)return false; flash=number.toInt() }
                kl==2&&d[ks].toInt()=='t'.code&&d[ks+1].toInt()=='s'.code -> ts=number
                kl==4&&match(d,ks,"fire") -> fire=number
                kl==4&&match(d,ks,"mine") -> mine=number
                kl==7&&match(d,ks,"ability") -> ability=number
                kl==6&&match(d,ks,"weapon") -> { if(!integer)return false; weapon=number.toInt() }
                kl==1&&d[ks].toInt()=='t'.code -> return false
            }
        }
        skip(d,length)
        return sawType&&sawQ&&pos==length&&!failed
    }
    private fun match(d: ByteArray,at: Int,word: String): Boolean { for(i in word.indices)if(d[at+i].toInt()!=word[i].code)return false; return true }
    private fun skip(d: ByteArray,length: Int){ while(pos<length){ val c=d[pos].toInt(); if(c==32||c==9||c==10||c==13)pos++ else break } }
    private fun expect(d: ByteArray,length: Int,c: Int): Boolean { if(pos<length&&d[pos].toInt()==c){pos++;return true}; return false }
    /** JSON number into [number]/[integer]. Mantissa up to 15 digits and a small exponent are exact (Clinger fast path); the rest goes through Double.parseDouble. */
    private fun readNumber(d: ByteArray,length: Int): Boolean {
        val start=pos; var i=pos; var neg=false
        if(i<length&&d[i].toInt()=='-'.code){neg=true;i++}
        if(i>=length||d[i].toInt()<'0'.code||d[i].toInt()>'9'.code)return false
        var mant=0L; var digits=0; var scale=0; var seenDot=false; var any=false; var exact=true
        while(i<length) {
            val c=d[i].toInt()
            if(c>='0'.code&&c<='9'.code){ any=true; if(digits<15){mant=mant*10+(c-'0'.code); if(mant!=0L)digits++; if(seenDot)scale++} else { exact=false }; i++ }
            else if(c=='.'.code&&!seenDot){seenDot=true;i++}
            else break
        }
        if(!any)return false
        var exp=0; var hasExp=false
        if(i<length&&(d[i].toInt()=='e'.code||d[i].toInt()=='E'.code)) { hasExp=true; exact=false; i++
            while(i<length){val c=d[i].toInt(); if(c=='+'.code||c=='-'.code||(c>='0'.code&&c<='9'.code))i++ else break} }
        if(i<length) { val c=d[i].toInt(); if(c!=','.code&&c!='}'.code&&c!=32&&c!=9&&c!=10&&c!=13)return false }
        integer=!seenDot&&!hasExp
        // digits counts significant digits only; leading zeros after the dot do not reach 15 here, so "exact" also needs the scale bound.
        if(exact&&scale<=22) {
            var v=mant.toDouble(); if(scale>0)v/=POW10[scale]; number=if(neg)-v else v
        } else {
            val text=String(d,start,i-start,Charsets.ISO_8859_1)
            val v=text.toDoubleOrNullFast() ?: return false
            number=v
        }
        pos=i
        return true
    }
    private fun String.toDoubleOrNullFast(): Double? = try { java.lang.Double.parseDouble(this) } catch(_: NumberFormatException) { null }
    private companion object { val POW10=DoubleArray(23).also{ var p=1.0; for(i in it.indices){it[i]=p;p*=10.0} } }
}
