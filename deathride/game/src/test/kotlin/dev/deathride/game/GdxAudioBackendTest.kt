package dev.deathride.game

import com.badlogic.gdx.*
import com.badlogic.gdx.audio.Sound
import com.badlogic.gdx.files.FileHandle
import dev.deathride.game.audio.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File
import java.lang.reflect.Proxy

class GdxAudioBackendTest {
    @Test fun decodedCacheCannotEvictPlayingSoundsAndMissingFilesStaySilent(){
        val previousAudio=Gdx.audio;val previousFiles=Gdx.files
        var loads=0;var disposals=0;var stops=0
        var instance=0L
        try{
            Gdx.files=Proxy.newProxyInstance(Files::class.java.classLoader,arrayOf(Files::class.java)){_,method,args->
                when(method.name){"internal"->FileHandle(File("../assets",args!![0] as String));else->null}
            } as Files
            Gdx.audio=Proxy.newProxyInstance(Audio::class.java.classLoader,arrayOf(Audio::class.java)){_,method,_->
                if(method.name=="newSound"){
                    loads++
                    Proxy.newProxyInstance(Sound::class.java.classLoader,arrayOf(Sound::class.java)){_,m,_->
                        when(m.name){"play","loop"->++instance;"dispose"->{disposals++;null};"stop"->{stops++;null};else->null}
                    } as Sound
                }else null
            } as Audio
            val backend=GdxAudioBackend(100)
            fun cue(name: String)=Cue(name,"effects","all",1,0,false,1.0,false,1f,"audio/clips/$name.wav",80)
            val first=cue("ui.confirm");val second=cue("race.start")
            assertTrue(backend.prepare(first));assertEquals(80,backend.decodedBytes)
            val handle=backend.start(first,1f,1f,0f);assertTrue(handle>0)
            assertFalse(backend.prepare(second));assertEquals(0,disposals)
            backend.stop(handle);assertTrue(backend.prepare(second));assertEquals(1,disposals)
            assertEquals(80,backend.decodedBytes)
            assertFalse(backend.prepare(cue("missing")))
            assertFalse(backend.prepare(cue("missing")));assertEquals(2,loads)
            assertEquals(-1,backend.start(cue("missing"),1f,1f,0f))
            backend.dispose();assertEquals(2,disposals);assertEquals(0,backend.decodedBytes);assertTrue(stops>0)
        }finally{Gdx.audio=previousAudio;Gdx.files=previousFiles}
    }
}
