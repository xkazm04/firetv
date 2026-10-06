package dev.deathride.core

/** One row of narrative/lines.csv (the 518-line script). Text only; nothing here touches simulation state. */
data class ScriptLine(
    val id: String,val speaker: String,val kind: String,val event: String,val trigger: String,
    val conditions: String,val text: String,val status: String,val durationSeconds: Double
) {
    val terms: List<String> get()=if(conditions.isEmpty())emptyList() else conditions.split(';')
    /** Recorded voice rows and unused alternates keep their own path; the on-screen script skips them. */
    val usable get()=status !in UNUSED_STATUS && !id.startsWith("rec.")
    /** Numbered siblings with identical conditions (x.pre.1, x.pre.2) are variants of one slot; only one is shown. */
    val slot get()=id.replace(Regex("\\.\\d+$"),"")+"|"+conditions
    companion object { val UNUSED_STATUS=setOf("alternate","variant","recorded-keep","recorded-replace") }
}

/** Facts a condition term is checked against. Unknown keys fail the term, so a line that needs a fact the game
 * cannot supply is never chosen and a less specific line (or the story-cards.csv fallback) is used instead. */
class ScriptFacts {
    private val text=HashMap<String,MutableSet<String>>()
    private val number=HashMap<String,Double>()
    private val flags=HashSet<String>()
    private val said=HashSet<String>()
    fun set(key: String,value: String):ScriptFacts{text.getOrPut(key){HashSet()}.add(value);return this}
    fun set(key: String,value: Int):ScriptFacts{number[key]=value.toDouble();return set(key,value.toString())}
    fun flag(name: String):ScriptFacts{flags+=name;return this}
    fun said(id: String):ScriptFacts{said+=id;return this}
    fun hasSaid(id: String)=id in said
    fun copy():ScriptFacts{val c=ScriptFacts();text.forEach{(k,v)->c.text[k]=v.toMutableSet()};c.number.putAll(number);c.flags+=flags;c.said+=said;return c}
    fun holds(term: String): Boolean {
        if(term.startsWith("after:"))return term.removePrefix("after:") in said
        val m=OPERATOR.matchEntire(term)
        if(m==null)return term in flags
        val key=m.groupValues[1];if(key=="line")return true // card-line markers on scene captions
        val op=m.groupValues[2];val raw=m.groupValues[3]
        val wanted=raw.toDoubleOrNull();val have=number[key]
        if(wanted!=null && have!=null)return when(op) {
            ">="->have>=wanted;"<="->have<=wanted;"!="->have!=wanted;"="->have==wanted;"<"->have<wanted;else->have>wanted
        }
        val values=text[key]
        return when(op) {
            "="->values!=null && raw in values
            "!="->values==null || raw !in values
            else->false
        }
    }
    fun satisfied(line: ScriptLine)=line.terms.all{holds(it)}
    companion object { private val OPERATOR=Regex("^([A-Za-z][\\w-]*)(>=|<=|!=|=|<|>)(.+)$") }
}

object Script {
    const val RESOURCE="/data/lines.csv"
    val lines: List<ScriptLine> by lazy { parse(requireNotNull(javaClass.getResourceAsStream(RESOURCE)){"Missing lines.csv"}.bufferedReader(Charsets.UTF_8).use{it.readText()}) }
    val cardEvents get()=lines.filter{it.kind=="card" && it.speaker=="card"}.map{it.event}.toSet()

    /** RFC 4180 reader: quoted fields may hold commas, doubled quotes and line breaks. */
    fun parseCsv(source: String): List<List<String>> {
        val rows=ArrayList<List<String>>();var row=ArrayList<String>();val field=StringBuilder();var quoted=false;var i=0
        fun endField(){row.add(field.toString());field.setLength(0)}
        fun endRow(){endField();if(row.size>1 || row[0].isNotEmpty())rows.add(row);row=ArrayList()}
        val text=source.removePrefix("﻿")
        while(i<text.length) {
            val ch=text[i]
            if(quoted) {
                if(ch=='"'){if(i+1<text.length && text[i+1]=='"'){field.append('"');i++} else quoted=false} else field.append(ch)
            } else when(ch) {
                '"'->quoted=true
                ','->endField()
                '\r'->{}
                '\n'->endRow()
                else->field.append(ch)
            }
            i++
        }
        if(field.isNotEmpty() || row.isNotEmpty())endRow()
        return rows
    }
    fun parse(source: String): List<ScriptLine> {
        val rows=parseCsv(source);val header=rows.first();val index=header.withIndex().associate{it.value to it.index}
        fun col(r: List<String>,name: String)=r[index.getValue(name)]
        val out=rows.drop(1).map{r->
            require(r.size==header.size){"lines.csv: bad row ${r.firstOrNull()}"}
            ScriptLine(col(r,"id"),col(r,"speaker"),col(r,"kind"),col(r,"event"),col(r,"trigger"),col(r,"conditions"),col(r,"text"),col(r,"status"),col(r,"duration_s").toDoubleOrNull()?:3.0)
        }
        require(out.map{it.id}.distinct().size==out.size){"lines.csv: duplicate ids"}
        return out
    }

    /** Lines 1..3 of a card, or null if the script has no card for the event (caller falls back per line). */
    fun cardLines(event: String): List<String?> {
        val rows=lines.filter{it.kind=="card" && it.speaker=="card" && it.event==event && it.trigger=="card-show" && it.usable}
        return (1..3).map{n->rows.firstOrNull{it.conditions=="line=$n"}?.text}
    }

    fun speakerName(speaker: String)=when(speaker) {
        "voice"->"THE VOICE";"mechanic"->"THE MECHANIC";"house"->"FLEET NINE";else->speaker.uppercase()
    }
    private fun rank(speaker: String)=when(speaker){"voice"->2;"mechanic"->1;else->0}

    /** Variant choice inside one slot: the pick the writers marked, then the most specific, then the least shown. */
    fun pickBest(options: List<ScriptLine>,shown: Map<String,Int> = emptyMap())=
        options.sortedWith(compareBy<ScriptLine>({if(it.status=="key-pick")0 else 1},{-it.terms.size},{shown[it.id]?:0},{it.id})).first()

    /** A short scene for (kinds, event, triggers): one line per slot, after:-chains appended behind their parent,
     * boss/ally first, then the Mechanic, then the Voice. At most [limit] lines. */
    fun scene(kinds: Set<String>,event: String,triggers: Set<String>,facts: ScriptFacts,shown: Map<String,Int> = emptyMap(),limit: Int=3,specificFirst: Boolean=false): List<ScriptLine> {
        val pool=lines.filter{it.usable && it.kind in kinds && it.trigger in triggers && (it.event==event || it.event=="any")}
        val heads=pool.filter{l->l.terms.none{it.startsWith("after:")} && facts.satisfied(l)}
        val chosen=heads.groupBy{it.slot}.values.map{pickBest(it,shown)}.sortedWith(compareBy({if(specificFirst)-it.terms.size else 0},{rank(it.speaker)},{lines.indexOf(it)}))
        val out=ArrayList<ScriptLine>()
        for(head in chosen) {
            if(out.size>=limit)break
            out+=head;var tail=head
            while(out.size<limit) {
                val follow=facts.copy().said(tail.id)
                val next=pool.filter{l->l.terms.any{it=="after:${tail.id}"} && follow.satisfied(l)}
                if(next.isEmpty())break
                tail=pickBest(next,shown);out+=tail
            }
        }
        return out
    }
}
