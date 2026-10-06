package dev.deathride.game

import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.Batch
import dev.deathride.core.*
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/**
 * Draws installed weapons and spikes on every car, and animates them when they fire.
 *
 * Only owner-approved art may be used. No mount sprite is approved today (the combat icons are HUD icons and unapproved), so every
 * mount is a procedural silhouette made of tinted rectangles of the shared 1x1 pixel texture: one texture, no atlas page, no
 * allocation, and it follows the wheel overlay in the same batch pass so it costs at most one texture switch per frame.
 * A catalog row with a `sprite` that [AtlasArt.approved] accepts draws that region instead of the silhouette, flash included.
 *
 * Mounts rotate with the car heading, draw after the body and the wheel overlay, and are ordered by catalog layer within a car.
 * Damage states darken them; a wreck shows them dropped, crooked and charred, with no animation.
 */
class MountPainter(private val art: AtlasArt?,private val pixel: ()->Texture?,val source: WeaponFireSource=CombatDerivedFireSource()) {
    val animator=MountAnimator()
    /** Rectangles issued in the last [draw], for the audits. */
    var quads=0;private set
    private var b: Batch?=null;private var tex: Texture?=null
    private var ox=0f;private var oy=0f;private var dc=1f;private var ds=0f;private var unit=1f;private var deg=0f;private var tint=1f;private var alpha=1f

    fun draw(batch: Batch,world: World,alphaT: Double,dt: Float,view: ViewBounds=ViewBounds.ALL) {
        quads=0
        source.update(world);animator.update(source,dt)
        val s=world.snapshot;val prev=world.previousSnapshot
        for(c in world.cars) {
            if(!c.entered || c.id>=Tuning.CAR_COUNT || c.ability.definition?.kind==AbilityKind.DISPATCHER)continue
            val id=c.carClass?.id?:"Line";val shape=CarShapeCache.of(id)
            val x=(prev.x(c.id)+(s.x(c.id)-prev.x(c.id))*alphaT);val y=(prev.y(c.id)+(s.y(c.id)-prev.y(c.id))*alphaT)
            if(!view.sees(x,y,shape.lengthM))continue
            val heading=prev.heading(c.id)+wrapAngle(s.heading(c.id)-prev.heading(c.id))*alphaT
            val state=AtlasArt.carState(s.healthFraction(c.id).toFloat(),s.wrecked(c.id))
            drawCar(batch,c.id,id,MountLoadout.mask(c,world.combat),x.toFloat(),y.toFloat(),heading,shape.lengthM.toFloat(),shape.widthM.toFloat(),state)
        }
        batch.setColor(1f,1f,1f,1f)
    }

    /** One car. [state]: 0 clean, 1 and 2 damaged, 3 wreck. [mask] bits are [MountKind.ordinal]. */
    fun drawCar(batch: Batch,slot: Int,classId: String,mask: Int,x: Float,y: Float,heading: Double,length: Float,width: Float,state: Int) {
        val t=pixel()?:return
        b=batch;tex=t
        val ch=cos(heading).toFloat();val sh=sin(heading).toFloat();val hdeg=Math.toDegrees(heading).toFloat()
        val wreck=state>=3
        val carTint=when(state){0->1f;1->.86f;2->.7f;else->.30f}
        for(a in MountCatalog.layered(classId)) {
            if(!MountLoadout.has(mask,a.kind))continue
            var lx=a.x*length;var ly=a.y*width;var rot=a.rotationDeg
            if(wreck){ lx*=.94f;ly*=.94f;rot+=if((slot+a.kind.ordinal+(if(a.y<0)1 else 0))%2==0)9f else -9f }
            ox=x+lx*ch-ly*sh;oy=y+lx*sh+ly*ch
            val a0=Math.toRadians((hdeg+rot).toDouble());dc=cos(a0).toFloat();ds=sin(a0).toFloat();deg=hdeg+rot
            unit=a.scale*length;tint=carTint;alpha=1f
            val age=if(wreck)MountAnim.IDLE else animator.age(slot,a.kind)
            val kick=MountAnim.kick(a.kind,age);val flash=MountAnim.flash(a.kind,age)
            val sprite=art?.takeIf{a.sprite.isNotEmpty() && it.approved(a.sprite)}
            when(a.kind) {
                MountKind.RIVET->rivet(sprite,a,kick,flash,if(wreck)0f else animator.spin(slot),if(wreck)-1f else MountAnim.eject(age))
                MountKind.HAMMER->hammer(sprite,a,kick,flash)
                MountKind.SCATTER->scatter(sprite,a,kick,flash)
                MountKind.MINE->mine(sprite,a,if(wreck)-1f else MountAnim.pop(age))
                MountKind.SPIKES->spikes(sprite,a,kick,flash)
                MountKind.ARMOR->{}
            }
        }
        batch.setColor(1f,1f,1f,1f)
    }

    private fun q(lx: Float,ly: Float,w: Float,h: Float,rot: Float,c: Int,a: Float=1f) {
        val bt=b?:return;val t=tex?:return
        val px=ox+(lx*dc-ly*ds)*unit;val py=oy+(lx*ds+ly*dc)*unit
        val ww=w*unit;val hh=h*unit
        val glow=c>=FLASH
        val k=if(glow)1f else tint
        bt.setColor(PAL[c*3]*k,PAL[c*3+1]*k,PAL[c*3+2]*k,a*alpha)
        bt.draw(t,px-ww*.5f,py-hh*.5f,ww*.5f,hh*.5f,ww,hh,1f,1f,deg+rot,0,0,1,1,false,false);quads++
    }
    private fun sprite(art: AtlasArt,a: Attach,backX: Float): Boolean {
        val r=art.region(a.sprite)?:return false
        val px=ox+(-backX*dc)*unit;val py=oy+(-backX*ds)*unit
        val bt=b?:return false
        bt.setColor(tint,tint,tint,alpha)
        art.draw(bt,a.sprite,px,py,unit,unit*r.image.regionHeight/r.image.regionWidth,deg)
        bt.setColor(1f,1f,1f,1f);tex=pixel()
        return true
    }

    private fun rivet(art: AtlasArt?,a: Attach,kick: Float,flash: Float,spin: Float,eject: Float) {
        val ks=kick*.22f
        if(art==null || !sprite(art,a,ks)) {
            q(-.18f,0f,.56f,.46f,0f,DARK);q(-.18f,0f,.48f,.38f,0f,STEEL);q(-.2f,0f,.30f,.10f,0f,LIGHT)
            q(.2f-ks,0f,.66f,.2f,0f,DARK);q(.2f-ks,0f,.62f,.13f,0f,STEEL)
            val phase=spin/(2f*PI.toFloat())
            for(i in 0..2){var t=phase+i/3f;t-=t.toInt();q(.2f-ks-.27f+t*.54f,0f,.05f,.13f,0f,LIGHT)}
            q(.5f-ks,0f,.08f,.24f,0f,AMBER)
        }
        if(flash>0f) {
            q(.72f-ks,0f,.34f+.3f*flash,.13f,0f,FLASH,flash);q(.56f-ks,0f,.2f,.2f,45f,FLASH_CORE,flash)
        }
        if(eject>=0f) {
            val side=if(a.y<0f)-1f else 1f
            q(-.05f-.3f*eject,side*(.24f+.9f*eject),.09f,.05f,eject*540f,BRASS,1f-eject)
        }
    }
    private fun hammer(art: AtlasArt?,a: Attach,kick: Float,flash: Float) {
        val ks=kick*.28f
        if(art==null || !sprite(art,a,ks)) {
            q(-.15f,0f,.6f,.66f,0f,DARK);q(-.15f,0f,.52f,.58f,0f,STEEL);q(-.2f,0f,.26f,.26f,0f,DARK);q(-.2f,0f,.16f,.16f,0f,LIGHT)
            q(.2f-ks,0f,.9f,.36f,0f,DARK);q(.2f-ks,0f,.84f,.28f,0f,STEEL);q(0f-ks,0f,.1f,.3f,0f,ORANGE)
            q(.62f-ks,0f,.18f,.5f,0f,DARK);q(.62f-ks,0f,.12f,.42f,0f,ORANGE)
        }
        if(flash>0f) {
            q(.95f-ks,0f,.6f+.6f*flash,.22f,0f,FLASH,flash);q(.78f-ks,0f,.22f+.18f*flash,.22f+.18f*flash,45f,FLASH_CORE,flash);q(.9f-ks,0f,.3f+.3f*flash,.1f,45f,FLASH,flash*.7f);q(.9f-ks,0f,.3f+.3f*flash,.1f,-45f,FLASH,flash*.7f)
        }
    }
    private fun scatter(art: AtlasArt?,a: Attach,kick: Float,flash: Float) {
        val ks=kick*.2f
        if(art==null || !sprite(art,a,ks)) {
            q(-.22f,0f,.5f,.58f,0f,DARK);q(-.22f,0f,.42f,.5f,0f,STEEL)
            for(r in -1..1){q(.2f-ks,r*.12f,.62f,.16f,r*14f,DARK);q(.2f-ks,r*.12f,.58f,.1f,r*14f,STEEL);q(.52f-ks,r*.17f,.07f,.14f,r*14f,AMBER)}
        }
        if(flash>0f)for(r in -1..1) {
            q(.68f-ks,r*.2f,.3f+.25f*flash,.1f,r*14f,FLASH,flash);q(.56f-ks,r*.18f,.14f,.14f,45f,FLASH_CORE,flash)
        }
    }
    private fun mine(art: AtlasArt?,a: Attach,pop: Float) {
        if(art==null || !sprite(art,a,0f)) {
            q(0f,0f,.74f,.92f,0f,DARK);q(0f,0f,.64f,.82f,0f,STEEL);q(0f,.34f,.64f,.1f,0f,AMBER);q(0f,-.34f,.64f,.1f,0f,AMBER)
            val rest=if(pop<0f)1f else .35f;alpha=rest
            q(0f,0f,.44f,.44f,0f,DARK);q(0f,0f,.36f,.36f,0f,LIGHT);q(.02f,0f,.12f,.12f,0f,RED);alpha=1f
        }
        if(pop>=0f) {
            val lift=sin(pop*PI.toFloat());val g=.40f*(1f+.6f*lift)
            alpha=1f-pop
            q(.2f+pop*1.5f,0f,g+.06f,g+.06f,0f,DARK);q(.2f+pop*1.5f,0f,g,g,0f,STEEL);q(.2f+pop*1.5f,0f,.12f,.12f,0f,RED)
            alpha=1f
        }
    }
    private fun spikes(art: AtlasArt?,a: Attach,kick: Float,flash: Float) {
        val ex=kick*.28f
        if(art==null || !sprite(art,a,-ex)) {
            q(-.32f,0f,.3f,1.04f,0f,DARK);q(-.32f,0f,.22f,.96f,0f,STEEL)
            for(i in -1..1) {
                val y=i*.32f
                q(-.02f+ex,y,.34f,.24f,0f,BONE);q(.16f+ex,y,.2f,.15f,0f,BONE);q(.28f+ex,y,.14f,.075f,0f,LIGHT)
            }
        }
        if(flash>0f)for(i in -1..1)q(.36f+ex,i*.32f,.16f+.2f*flash,.16f+.2f*flash,45f,FLASH_CORE,flash)
    }

    private companion object {
        const val DARK=0;const val STEEL=1;const val LIGHT=2;const val AMBER=3;const val ORANGE=4;const val RED=5;const val BONE=6;const val BRASS=7
        const val FLASH=8;const val FLASH_CORE=9
        val PAL=floatArrayOf(
            .07f,.07f,.08f, .46f,.48f,.50f, .70f,.72f,.70f, 1f,.78f,.28f, .95f,.42f,.12f, .85f,.15f,.10f, .88f,.84f,.70f, .90f,.70f,.25f,
            1f,.55f,.15f, 1f,.95f,.70f)
    }
}
