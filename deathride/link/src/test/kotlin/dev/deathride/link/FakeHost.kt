package dev.deathride.link

import dev.deathride.core.InputFrame
import java.io.File

/**
 * Stand-in for the desktop host when only the link is under test: the real RaceServer and the real controller page,
 * a 60 Hz loop that plays the render thread's part (consume inputs, run the lobby -> countdown -> race phases, move a car),
 * and a real-sized garage/career/car fixture. Run: java -cp <test runtime classpath> dev.deathride.link.FakeHostKt <controller dir> <fixture.json> [port]
 */
fun main(args: Array<String>) {
    val dir=File(args[0]);val fixture=File(args[1]).readText();val port=args.getOrNull(2)?.toInt()?:8765
    fun part(name: String): String { val i=fixture.indexOf("\"$name\":");var d=0;var j=i+name.length+3;val start=j
        while(true){ val c=fixture[j]; if(c=='{'||c=='[')d++; if(c=='}'||c==']'){d--; if(d==0){j++;break}}; if(c=='"'){j++;while(fixture[j]!='"'){if(fixture[j]=='\\')j++;j++}}; j++ }
        return fixture.substring(start,j) }
    val host=RaceServer({ name->File(dir,name).takeIf{it.exists()}?.readText()?:"{}" },{println(it)},port=port)
    host.hostCareerJson=part("hostCareer")
    for(s in host.slots){ s.garageJson=part("garage");s.careerJson=part("career");s.combatJson=part("combat") }
    host.start();println("pin ${host.pin}")
    val out=InputFrame();var countdownEnd=0.0;var tPrev=System.nanoTime();var frame=0L
    val speeds=DoubleArray(2)
    while(true) {
        val t0=System.nanoTime();val now=host.nowMs()
        val dt=(t0-tPrev)/1e9;tPrev=t0
        when(host.command.getAndSet(0)) {
            1 -> { host.phase="countdown";countdownEnd=now+3000;speeds.fill(0.0);host.raceSeconds=0.0 }
            2 -> host.phase="lobby"; 3 -> host.phase="garage"; 4 -> host.phase="career"; 5 -> { host.phase="countdown";countdownEnd=now+3000 }
        }
        host.feelRequest.getAndSet(-1).let{ if(it>=0)host.feel=dev.deathride.core.FeelProfiles.all[it] }
        host.surfaceRequest.getAndSet(-1)
        if(host.phase=="countdown"&&now>=countdownEnd){host.phase="race"}
        for(i in 0..1) { host.consume(i,now,out)
            val s=host.slots[i]
            if(host.phase=="race"){ speeds[i]=(speeds[i]+(out.throttle*30.0-speeds[i]*0.15-out.brake*20.0)*dt).coerceIn(0.0,60.0); s.speed=speeds[i]; s.driftQuality=Math.abs(out.steer)*0.6; s.drifting=out.handbrake>0.5; s.slipRadians=out.steer*0.2; s.position=1+i; s.lap=1+(host.raceSeconds/40).toInt()%3 } else { s.speed=0.0; s.driftQuality=0.0 }
        }
        if(host.phase=="race")host.raceSeconds+=dt
        if(host.flash.getAndSet(false))host.flashFrames++
        host.frameNumber++;frame++
        host.metrics.frameMs.add((System.nanoTime()-t0)/1e6+16.0,now);host.metrics.simMs.add((System.nanoTime()-t0)/1e6,now)
        val sleep=(16_000_000L-(System.nanoTime()-t0))/1_000_000L;if(sleep>0)Thread.sleep(sleep)
    }
}
