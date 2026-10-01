package dev.deathride.desktop

import com.badlogic.gdx.backends.lwjgl3.Lwjgl3Application
import com.badlogic.gdx.backends.lwjgl3.Lwjgl3ApplicationConfiguration
import dev.deathride.game.RaceGame
import java.io.File

fun main(args: Array<String>) {
    val config = Lwjgl3ApplicationConfiguration().apply { setTitle("Death Ride"); setWindowedMode(if(args.contains("--1080"))1920 else 1280, if(args.contains("--1080"))1080 else 720); useVsync(true); setForegroundFPS(60); setIdleFPS(60) }
    val duration=args.firstOrNull{it.startsWith("--duration=")}?.substringAfter('=')?.toDoubleOrNull() ?: 0.0
    if(args.contains("--drift-lab")){config.setTitle("Death Ride Drift Lab");Lwjgl3Application(DriftLabScreen(args.contains("--drift-lab-check"),duration),config);return}
    if(args.contains("--atlas-check")){Lwjgl3Application(AtlasAudit(),config);return}
    val port=args.firstOrNull{it.startsWith("--port=")}?.substringAfter('=')?.toIntOrNull()?:8766
    val game=RaceGame({ name -> File("controller", name).readText() }, { println("DeathRide $it") }, args.contains("--smoke"), duration, args.contains("--soak"), args.contains("--keyboard-check"),fontFactory=::nativeFont,proceduralOnly=args.contains("--no-art"),serverPort=port)
    val listener=if(args.contains("--keyboard-check"))KeyboardAudit(game) else game
    Lwjgl3Application(if(args.contains("--audit"))AllocationAudit(listener) else listener, config)
}
