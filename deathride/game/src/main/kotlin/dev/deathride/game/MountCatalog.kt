package dev.deathride.game

import dev.deathride.core.*

/**
 * Read-only mapping from an installed weapon or part to where it is drawn on each car class.
 *
 * Data lives in resources `mounts/mount-attachments.csv` (game module), measured on the shipped atlas sprites at desktop scale
 * with the `--mount-shots` mode. Coordinates are fractions of the drawn body: [Attach.x] of the body LENGTH forward of the car
 * centre (nose is about +0.5), [Attach.y] of the body WIDTH to the left of the centre line. [Attach.scale] is the mount's own
 * length as a fraction of the body length; [Attach.rotationDeg] turns the mount away from the car's heading (+90 = points left).
 * Layers draw low to high: 0 rear, 1 side, 2 front guns, 3 roof turret.
 *
 * A (class, kind) pair either has one or more `mount` rows, or exactly one explicit `none` row with the reason. Anything else is
 * a data error, caught by MountCatalogTest. No art is needed: [Attach.sprite] stays empty until an owner-approved mount sprite exists.
 */
enum class MountKind(val weapon: Int,val csv: String) {
    RIVET(Weapons.RIVET,"Rivet"),HAMMER(Weapons.HAMMER,"Hammer"),SCATTER(Weapons.SCATTER,"Scatter"),MINE(Weapons.MINE,"Mine"),SPIKES(-1,"Spikes"),ARMOR(-1,"Armor");
    companion object { val all=entries.toTypedArray();fun of(name: String)=all.firstOrNull{it.csv.equals(name,true)} }
}

class Attach(val kind: MountKind,val x: Float,val y: Float,val rotationDeg: Float,val scale: Float,val layer: Int,val sprite: String,val note: String)

object MountCatalog {
    private val EMPTY=emptyArray<Attach>()
    private val rows=HashMap<String,Array<Array<Attach>>>()
    private val none=HashMap<String,BooleanArray>()
    private val ordered=HashMap<String,Array<Attach>>()
    val classes: List<String>
    init {
        val text=MountCatalog::class.java.getResourceAsStream("/mounts/mount-attachments.csv")!!.bufferedReader().use{it.readText()}
        val lines=text.lines().filter{it.isNotBlank()}
        val head=lines[0].split(',');fun col(n: String)=head.indexOf(n).also{require(it>=0){"mount-attachments.csv missing $n"}}
        val cc=col("class");val cw=col("weapon");val cm=col("mode");val cx=col("x");val cy=col("y");val cr=col("rotationDeg");val cs=col("scale");val cl=col("layer");val cp=col("sprite");val cn=col("note")
        val lists=HashMap<String,Array<ArrayList<Attach>>>()
        for(line in lines.drop(1)) {
            val f=line.split(',');require(f.size>=head.size){"bad mount row: $line"}
            val kind=requireNotNull(MountKind.of(f[cw])){"unknown mount weapon ${f[cw]}"}
            val l=lists.getOrPut(f[cc]){Array(MountKind.all.size){ArrayList()}};val n=none.getOrPut(f[cc]){BooleanArray(MountKind.all.size)}
            when(f[cm]) {
                "none"->{require(l[kind.ordinal].isEmpty() && !n[kind.ordinal]){"none must be the only row: $line"};n[kind.ordinal]=true}
                "mount"->{
                    require(!n[kind.ordinal]){"mount after none: $line"}
                    val a=Attach(kind,f[cx].toFloat(),f[cy].toFloat(),f[cr].toFloat(),f[cs].toFloat(),f[cl].toInt(),f[cp],f[cn])
                    require(a.x in -0.6f..0.6f && a.y in -0.7f..0.7f && a.scale in 0.03f..0.4f && a.layer in 0..3 && a.rotationDeg in -180f..180f){"mount out of range: $line"}
                    l[kind.ordinal].add(a)
                }
                else->error("bad mode: $line")
            }
        }
        for((c,l) in lists) {
            rows[c]=Array(l.size){i->l[i].toTypedArray()}
            ordered[c]=l.flatMap{it}.sortedBy{it.layer}.toTypedArray()
        }
        classes=rows.keys.sorted()
    }
    /** The attachments for an installed [kind] on [classId]; empty when it is an explicit 'none' or the class is unknown. */
    fun attachments(classId: String,kind: MountKind): Array<Attach> = rows[classId]?.get(kind.ordinal)?:EMPTY
    fun explicitNone(classId: String,kind: MountKind)=none[classId]?.get(kind.ordinal)==true
    /** Every pair must be one or the other; false means the data file forgot it. */
    fun declared(classId: String,kind: MountKind)=attachments(classId,kind).isNotEmpty() || explicitNone(classId,kind)
    /** All mounts of a class sorted by layer (stable), for single-pass drawing; callers skip kinds that are not installed. */
    fun layered(classId: String): Array<Attach> = ordered[classId]?:EMPTY
}

/** Which mount kinds a car currently carries. Bits are [MountKind.ordinal]. Pure read of core state. */
object MountLoadout {
    fun mask(c: Car,combat: Combat): Int {
        var m=(1 shl MountKind.RIVET.ordinal) or (1 shl MountKind.MINE.ordinal)
        if(combat.capacity(c.id,Weapons.HAMMER)>0)m=m or (1 shl MountKind.HAMMER.ordinal)
        if(combat.capacity(c.id,Weapons.SCATTER)>0)m=m or (1 shl MountKind.SCATTER.ordinal)
        if(c.utilityMask and 1!=0)m=m or (1 shl MountKind.SPIKES.ordinal)
        return m
    }
    fun has(mask: Int,kind: MountKind)=mask and (1 shl kind.ordinal)!=0
    fun maskOf(vararg kinds: MountKind): Int { var m=0;for(k in kinds)m=m or (1 shl k.ordinal);return m }
}
