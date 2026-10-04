package dev.deathride.game

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import dev.deathride.core.RegionDefinition

/** Cached colours, applied inside existing scenery draws. No post-process target/pass. */
class RegionLook(val definition: RegionDefinition) {
    private val colors=definition.palette.mapValues{(_,rgb)->Color((rgb shl 8) or 255)}
    // A neutral material fallback receives a restrained multiplicative tint. Candidate tiles
    // already contain their colour; they get grade only, never a second material recolour.
    private val tints=colors.mapValues { (_,c)->val peak=maxOf(c.r,c.g,c.b,.01f);Color(c.r/peak,c.g/peak,c.b/peak,1f) }
    fun color(slot: String)=colors.getValue(slot)
    fun tileColor(slot: String,variant: Boolean)=if(variant)Color.WHITE else tints.getValue(slot)
    fun slot(surface: String)=when(surface){"Gravel"->"gravel";"Ice"->"ice";"Oil"->"oil";else->"asphalt"}
    val groundSlot=if(definition.backdrop=="bare-ridges")"ice" else "dirt"

    /** Missing prop art keeps an act-specific, off-road silhouette, never a new collider. */
    fun prop(r: ShapeRenderer,x: Float,y: Float) {
        r.color=color("asphalt")
        when(definition.backdrop) {
            "sorting-sheds" -> {r.rect(x,y,5f,3f);r.color=color("gravel");for(i in 0..3)r.rect(x+.3f+i*1.1f,y+.2f,.6f,2.5f)}
            "cast-halls" -> {r.rect(x,y,5f,2.8f);r.color=color("accent");r.rect(x+.4f,y+.3f,4.2f,.6f);r.rect(x+.4f,y+1.9f,4.2f,.6f)}
            "mineral-terraces" -> {r.rect(x,y,5f,3f);r.color=color("salt");r.rect(x+.5f,y+.3f,4f,.6f);r.rect(x+1,y+1.2f,3f,.6f);r.rect(x+1.5f,y+2.1f,2f,.5f)}
            "bare-ridges" -> {r.triangle(x,y,x+5,y,x+2,y+3);r.color=color("snow");r.triangle(x+1.7f,y+2,x+2,y+3,x+2.7f,y+1.9f);r.color=color("accent");r.rectLine(x+4,y,x+4,y+4,.25f)}
            "empty-stands" -> {for(i in 0..2)r.rect(x+i*1.8f,y,1.5f,2.6f);r.color=color("accent");for(i in 0..2)r.rect(x+i*1.8f,y+2,1.5f,.5f)}
        }
    }

    /** Original procedural silhouettes; bounded geometry also supplies division banners. */
    fun backdrop(r: ShapeRenderer,x: Float,y: Float,w: Float,h: Float) {
        r.color=color("dirt");r.rect(x,y,w,h)
        r.color=color("asphalt")
        when(definition.backdrop) {
            "sorting-sheds" -> for(i in 0..6) {
                val xx=x+i*w/7;val top=y+h*(.25f+(i%3)*.08f)
                r.rect(xx,y,w*.095f,top-y);r.triangle(xx,top,xx+w*.047f,top+h*.16f,xx+w*.095f,top)
                r.rectLine(xx,top+h*.08f,xx+w*.12f,top+h*.2f,w*.004f)
            }
            "cast-halls" -> for(i in 0..4) {
                val xx=x+i*w/5;val top=y+h*(.30f+(i%2)*.20f)
                r.rect(xx,y,w*.14f,top-y);r.rectLine(xx+w*.12f,top,xx+w*.20f,top+h*.27f,w*.013f)
                r.rect(xx+w*.15f,y,w*.016f,top-y+h*.24f)
            }
            "mineral-terraces" -> for(i in 0..3) {
                val xx=x+i*w*.25f;val top=h*(.22f+(i%2)*.13f)
                r.rect(xx,y,w*.21f,top);r.rect(xx+w*.03f,y+top,w*.15f,h*.10f)
                r.rect(xx+w*.06f,y+top+h*.10f,w*.09f,h*.10f)
            }
            "bare-ridges" -> for(i in 0..6) {
                val xx=x+i*w/7;val top=y+h*(.4f+(i%3)*.12f)
                r.triangle(xx-w*.035f,y,xx+w*.085f,top,xx+w*.21f,y)
            }
            "empty-stands" -> for(i in 0..4) {
                val xx=x+i*w/5
                for(j in 0..3)r.rect(xx+j*w*.011f,y+j*h*.09f,w*.16f-j*w*.022f,h*.09f)
                r.rect(xx+w*.035f,y,w*.004f,h*.78f);r.rect(xx+w*.01f,y+h*.74f,w*.06f,h*.055f)
            }
        }
        r.color=color("accent");r.rect(x,y,w,h*.025f)
    }
}
