package dev.deathride.core

import java.awt.Font
import java.awt.font.FontRenderContext
import java.io.File
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

/** Narrative wiring: lines.csv loader, card coverage, fit on the career screen, scenes and race captions. */
class ScriptTest {
    private val eventIds=Career.events.map{it.id}

    @Test fun resourceCopyMatchesTheNarrativeSource() {
        val source=File("../narrative/lines.csv")
        assertTrue(source.isFile,"run from deathride/core")
        assertEquals(source.readText(Charsets.UTF_8).lines(),File("src/main/resources/data/lines.csv").readText(Charsets.UTF_8).lines(),
            "core/src/main/resources/data/lines.csv must be a copy of narrative/lines.csv (cp narrative/lines.csv core/src/main/resources/data/)")
    }

    @Test fun loaderReadsEveryRowAndQuotedCommas() {
        assertEquals(518,Script.lines.size)
        assertEquals(setOf("card","shop","bark","announcer","post","pre","finale","taunt"),Script.lines.map{it.kind}.toSet())
        val quoted=Script.parse("id,speaker,kind,event,trigger,conditions,text,status,duration_s\nx.1,s,card,e,t,,\"a, \"\"b\"\"\",draft,2.5\n")
        assertEquals("a, \"b\"",quoted.single().text)
        assertEquals(2.5,quoted.single().durationSeconds)
    }

    @Test fun everyEventAndThePrologueHaveScriptedCardsOrAnExplicitFallback() {
        assertEquals(35,eventIds.size)
        val explicitFallback=emptySet<String>() // an event listed here may keep its story-cards.csv text
        for(id in eventIds+"campaign-victory") {
            val lines=Script.cardLines(id)
            if(id in explicitFallback)continue
            assertTrue(lines.all{it!=null},"$id: script card missing line(s) $lines; add rows or list it as an explicit fallback")
            assertEquals(lines.map{it!!},AshStory.cards.getValue(id).lines,"$id: AshStory must show the scripted card")
        }
        assertEquals(explicitFallback,AshStory.fallbackEvents.toSet())
        assertEquals(3,AshStory.prologue!!.lines.size,"prologue (Paper Night) has no story-cards.csv row; it is script-only")
    }

    @Test fun missingScriptRowsFallBackPerLineToTheCsv() {
        val rows=Content.table("story-cards")
        assertEquals(36,rows.size)
        val scrapped=Script.parse(File("src/main/resources/data/lines.csv").readText(Charsets.UTF_8)).filterNot{it.id=="card.scrap-2.2"}
        val missing=(1..3).map{n->scrapped.firstOrNull{it.kind=="card" && it.speaker=="card" && it.event=="scrap-2" && it.conditions=="line=$n"}?.text}
        assertNull(missing[1])
        val merged=(1..3).map{missing[it-1]?:rows.first{r->r["id"]=="scrap-2"}.getValue("line$it")}
        assertEquals(rows.first{it["id"]=="scrap-2"}.getValue("line2"),merged[1])
        assertEquals(Script.cardLines("scrap-2")[0],merged[0])
    }

    @Test fun cardsHaveThreeLinesAndFitTheCareerScreenArea() {
        val maxChars=Script.lines.filter{it.kind=="card" && it.speaker=="card"}.maxOf{it.text.length}
        println("longest card line $maxChars chars")
        val overflow=ArrayList<String>()
        for(id in eventIds+"campaign-victory") {
            val card=AshStory.cards.getValue(id)
            assertEquals(3,card.lines.size,id)
            assertTrue(card.lines.all{it.isNotBlank() && it.length<=CardFit.MAX_LINE_CHARS},"$id: card line over ${CardFit.MAX_LINE_CHARS} chars")
            val withArt=CardFit.visualLines(card.lines.joinToString(" "),CardFit.WIDTH_WITH_ART)
            val plain=CardFit.visualLines(card.lines.joinToString(" "),CardFit.WIDTH_PLAIN)
            if(withArt>CardFit.CAREER_BUDGET_LINES || plain>CardFit.CAREER_BUDGET_LINES)overflow+="$id art=$withArt plain=$plain"
        }
        val widest=eventIds.map{id->id to CardFit.visualLines(AshStory.cards.getValue(id).lines.joinToString(" "),CardFit.WIDTH_WITH_ART)}
        println("visual lines at ${CardFit.WIDTH_WITH_ART}px: max ${widest.maxOf{it.second}} ${widest.filter{it.second==widest.maxOf{w->w.second}}.map{it.first}}; at ${CardFit.WIDTH_PLAIN}px max ${eventIds.maxOf{id->CardFit.visualLines(AshStory.cards.getValue(id).lines.joinToString(" "),CardFit.WIDTH_PLAIN)}}")
        println("career card overflow (budget ${CardFit.CAREER_BUDGET_LINES} lines): $overflow")
        assertTrue(overflow.isEmpty(),"cards overflow the career text area: $overflow")
        val prologue=AshStory.prologue!!
        assertTrue(CardFit.visualLines(prologue.lines.joinToString(" "),CardFit.WIDTH_WITH_ART)<=CardFit.CAREER_BUDGET_LINES)
    }

    @Test fun captionsFitTwoLinesOfTheCaptionBox() {
        val tooLong=Script.lines.filter{it.usable && it.kind in setOf("bark","taunt","pre","post","announcer","finale","shop") && it.speaker!="card"}
            .filter{CardFit.visualLines("${Script.speakerName(it.speaker)}: ${it.text}",CardFit.CAPTION_WIDTH)>2}
        println("caption rows over two lines at ${CardFit.CAPTION_WIDTH}px: ${tooLong.map{it.id}}")
        assertTrue(tooLong.isEmpty(),"over two caption lines: ${tooLong.map{it.id}}")
    }

    @Test fun conditionsAreEvaluatedAgainstFactsAndUnknownTermsFail() {
        val f=ScriptFacts().set("act",5).set("rook","ally").flag("boss-race").set("retry",2)
        assertTrue(f.holds("act>=3"));assertFalse(f.holds("act<5"));assertTrue(f.holds("rook=ally"));assertFalse(f.holds("rook=rival"))
        assertTrue(f.holds("retry>=2"));assertTrue(f.holds("boss-race"));assertFalse(f.holds("rare"));assertFalse(f.holds("weakness=grip"))
        assertTrue(f.holds("ox!=ally"),"absent fact is not equal")
        assertFalse(f.holds("after:x.1"));assertTrue(f.copy().said("x.1").holds("after:x.1"))
    }

    @Test fun bossPreRaceSceneHasTheBossTheMechanicAndTheBook() {
        val facts=ScriptFacts().set("retry",0).flag("boss-race").set("act",1).set("scene","shop")
        val scene=Script.scene(setOf("pre","announcer"),"scrap-7",setOf("pre-race"),facts)
        assertEquals(3,scene.size)
        assertTrue(scene.any{it.speaker=="rook"} && scene.any{it.speaker=="mechanic"})
        val retry=Script.scene(setOf("pre"),"scrap-7",setOf("pre-race"),ScriptFacts().set("retry",1).flag("boss-race"))
        assertTrue(retry.any{it.id=="rook.pre.retry1"})
        assertTrue(retry.none{it.id=="rook.pre.1"},"first-attempt lines do not repeat on a retry")
    }

    @Test fun afterChainsFollowTheirParent() {
        val scene=Script.scene(setOf("post"),"foundry-7",setOf("boss-turn"),ScriptFacts().flag("boss-finished"),limit=4)
        val ids=scene.map{it.id}
        assertTrue(ids.indexOf("ox.turn.2")==ids.indexOf("ox.turn.1")+1,ids.toString())
    }

    @Test fun directorQueuesScenesAndTimesThemOut() {
        val p=Profile("script-test")
        val d=ScriptDirector()
        d.careerOpened(p) // scrap-1: no pre-race rows yet
        d.update(0.1)
        val seven=Profile("script-test-7");seven.careerRound=Career.events.indexOfFirst{it.id=="scrap-7"}
        d.careerOpened(seven)
        assertTrue(d.caption.isNotEmpty())
        val first=d.caption;var guard=0
        while(d.caption==first && guard++<2000)d.update(.1)
        assertNotEquals(first,d.caption,"caption must time out")
        d.careerOpened(seven)
        assertTrue(d.idle,"the same scene shows once")
    }

    @Test fun seizureSceneShowsTheShopSequenceOnce() {
        val p=Profile("seize");p.careerRound=Career.events.indexOfFirst{it.id=="crown-7"};DeathDuel.seize(p)
        assertTrue(DeathDuel.seized(p))
        assertEquals(AshStory.cards.getValue("crown-7").lines,DeathDuel.story(p).lines,"scripted duel card needs no hard-coded seizure sentence")
        val d=ScriptDirector();d.careerOpened(p)
        val ids=d.pending().map{it.id}
        assertTrue("marrow.seizure.1" in ids && "shop.seizure.1" in ids,ids.toString())
        assertTrue(ids.indexOf("marrow.seizure.1")<ids.indexOf("marrow.seizure.2"))
    }

    @Test fun everyBossRivalHasALineForEveryWiredBarkTrigger() {
        val triggers=listOf("grid","overtakes-player","overtaken-by-player","hit-by-player","wrecked-by-player","wrecks-player","last-lap","low-hp")
        for(id in listOf("rook","ox","vex","mica","marrow","relay")) {
            val facts=ScriptFacts().set(id,"rival").set("act",if(id=="marrow")5 else 1).flag("leading").set("retry",0).set("race",1)
            for(t in triggers) {
                if(id=="marrow" && false)continue
                val options=Script.lines.filter{it.usable && it.kind in ScriptDirector.BARK_KINDS && it.speaker==id && it.trigger==t && facts.satisfied(it)}
                assertTrue(options.isNotEmpty(),"$id has no selectable '$t' bark")
            }
        }
    }

    @Test fun raceStartAndBarksUseTheScriptWithoutTouchingTheWorld() {
        val p=Profile("race-script")
        val world=World(17,combatEnabled=true)
        for(i in 1 until world.cars.size)world.cars[i].aiStyle=Career.rivals[i-1]
        world.reset()
        val before=world.cars.map{it.x to it.y}
        val d=ScriptDirector()
        d.frame("countdown",true,p,0,world,.016)
        d.frame("race",true,p,0,world,.016)
        assertTrue(d.caption.isNotEmpty(),"the grid scene speaks at race start")
        assertEquals(before,world.cars.map{it.x to it.y})
        // The opening scramble passes without barks and every caption times out.
        var t=0.0
        while(t<5.0){d.frame("race",true,p,0,world,.1);t+=.1}
        repeat(200){d.update(1.0)}
        assertTrue(d.idle)
    }
}

/** Width proxy for the career screen: a headless Java2D font at the body size. The device font (Roboto on the Stick)
 * is a little narrower, so this errs on the side of reporting an overflow. */
object CardFit {
    const val MAX_LINE_CHARS=72
    const val WIDTH_WITH_ART=548.0
    const val WIDTH_PLAIN=677.0
    const val CAPTION_WIDTH=868.0 // 900 box minus the 16 px margins used by drawScriptCaption
    /** Baseline 453 down to the league-debt label at 343 in 25 px steps: five lines is the last that clears it. */
    const val CAREER_BUDGET_LINES=5
    private val font=Font("SansSerif",Font.PLAIN,20)
    private val context=FontRenderContext(null,true,true)
    fun width(text: String)=font.getStringBounds(text,context).width
    /** Greedy word wrap, the same rule GlyphLayer.wrapped applies. */
    fun visualLines(text: String,maxWidth: Double): Int {
        var lines=1;var line=""
        for(word in text.split(' ')) {
            val next=if(line.isEmpty())word else "$line $word"
            if(line.isNotEmpty() && width(next)>maxWidth){lines++;line=word} else line=next
        }
        return lines
    }
}
