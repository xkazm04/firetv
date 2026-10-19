package dev.deathride.game

/** A 1280x720 stage rectangle, origin bottom-left (the same space RaceGame draws in). */
class StageRect(val x: Float,val y: Float,val w: Float,val h: Float) {
    fun intersects(o: StageRect)=x<o.x+o.w && o.x<x+w && y<o.y+o.h && o.y<y+h
    fun inside(o: StageRect)=x>=o.x && y>=o.y && x+w<=o.x+o.w && y+h<=o.y+o.h
}

/** The career screen's elements, one rectangle each, so a test can prove the script caption hides none of them. */
object CareerLayout {
    val panel=StageRect(44f,96f,729f,506f)
    val banner=StageRect(65f,487f,678f,82f)
    val courseLine=StageRect(66f,466f,540f,26f)
    val preview=StageRect(66f,376f,284f,90f)
    val debt=StageRect(371f,398f,250f,66f)
    val story=StageRect(625f,376f,110f,110f)
    val progress=StageRect(66f,356f,677f,16f)
    val pills=StageRect(66f,230f,677f,42f)
    val button=StageRect(66f,137f,677f,44f)
    val hint=StageRect(66f,108f,677f,26f)
    /** Script (bark) caption: the free band between the progress bar and the difficulty pills. */
    val caption=StageRect(60f,284f,700f,60f)
    val elements=listOf(banner,courseLine,preview,debt,story,progress,pills,button,hint)
}
