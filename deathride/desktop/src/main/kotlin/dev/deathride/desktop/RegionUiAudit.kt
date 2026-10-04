package dev.deathride.desktop

import com.badlogic.gdx.*
import com.badlogic.gdx.graphics.Pixmap
import com.badlogic.gdx.graphics.PixmapIO
import dev.deathride.core.*
import dev.deathride.game.*
import java.io.File
import java.security.MessageDigest

/** Desktop verification only. In-memory profile fixtures, no progression or save writes. */
class RegionUiAudit(private val game: RaceGame): ApplicationListener by game {
    private fun field(name: String)=RaceGame::class.java.getDeclaredField(name).apply{isAccessible=true}
    private val rebuild=RaceGame::class.java.getDeclaredMethod("rebuildUi").apply{isAccessible=true}
    private var index=0;private var frames=0
    private var saves=emptyMap<String,String>()
    private fun saveHashes()=File("profiles").takeIf{it.exists()}?.walkTopDown()?.filter{it.isFile}?.associate{it.path to MessageDigest.getInstance("SHA-256").digest(it.readBytes()).joinToString(""){b->"%02x".format(b)}}?:emptyMap()
    override fun create(){
        saves=saveHashes();game.create();File("evidence/regions/g2/ui").mkdirs();select()
    }
    private fun select() {
        @Suppress("UNCHECKED_CAST") val profiles=field("profiles").get(game) as Array<Profile>
        profiles[0]=Profile(profiles[0].id).also{p->
            val round=Career.events.indexOfFirst{it.region.id==Regions.all[index].id}
            for(name in listOf("careerRound","careerCleared"))Profile::class.java.getDeclaredField(name).apply{isAccessible=true}.setInt(p,round)
        }
        field("phase").set(game,"career");rebuild.invoke(game);frames=0
    }
    override fun render() {
        game.render();frames++
        @Suppress("UNCHECKED_CAST") val profiles=field("profiles").get(game) as Array<Profile>
        check(Career.events[profiles[0].careerRound].region.id==Regions.all[index].id){"UI fixture was replaced before capture"}
        val scene=field("scene").get(game) as TrackScene
        if(!scene.ready || frames<10)return
        val region=Regions.all[index]
        val pixmap=Pixmap.createFromFrameBuffer(0,0,Gdx.graphics.width,Gdx.graphics.height)
        PixmapIO.writePNG(Gdx.files.local("evidence/regions/g2/ui/career-${region.id}.png"),pixmap,-1,true);pixmap.dispose()
        index++
        if(index<Regions.all.size)select() else {
            check(saveHashes()==saves){"UI audit changed a save"}
            File("evidence/regions/g2/ui/result.json").writeText("{\"status\":\"pass\",\"source\":\"shipping RaceGame desktop GL\",\"divisionMenus\":5,\"profileWrites\":0,\"ownerFeel\":\"unmeasured\"}\n")
            Gdx.app.exit()
        }
    }
}
