package dev.deathride.core

import java.io.File
import java.util.concurrent.TimeUnit
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

/**
 * Owner ruling of 2026-10-07 06:41Z, "Summaries in git, raw outside": no new raw trace, capture or large file under
 * deathride/evidence/. Files tracked at the ruling commit are grandfathered, so history stays as it is.
 * The rule is pure ([EvidenceRule]); the repo case reads the HEAD tree and the ruling commit's tree with git.
 */
object EvidenceRule {
    const val RULING_COMMIT="20189c47" // last deathride/main commit at or before 2026-10-07T06:41Z
    const val ROOT="deathride/evidence/"
    const val MAX_BYTES=512L*1024 // about four times the largest file committed after the ruling (132,871 B)
    private val refusedExtensions=setOf("gz","zip","apk","aab","perfetto-trace","pftrace","atrace","trace","hprof","mp4","webm","mkv")

    /** Raw by kind: refused at any size. */
    fun refusedAtAnySize(path:String):Boolean {
        val name=path.substringAfterLast('/')
        return name.startsWith("logcat")||name.substringAfterLast('.',"").lowercase() in refusedExtensions
    }

    /** True when a file at [path] of [bytes] may be tracked under deathride/evidence/. */
    fun allowed(path:String,bytes:Long,grandfathered:Boolean=false):Boolean =
        grandfathered||(!refusedAtAnySize(path)&&bytes<=MAX_BYTES)
}

class EvidenceRuleTest {
    private val big=EvidenceRule.MAX_BYTES+1

    @Test fun refusesAGzipAtAnySize() = assertFalse(EvidenceRule.allowed("deathride/evidence/perf/p14/run1/trace.json.gz",10))
    @Test fun refusesAnApkAtAnySize() = assertFalse(EvidenceRule.allowed("deathride/evidence/perf/p14/app-release.apk",1))
    @Test fun refusesALogcatAtAnySize() = assertFalse(EvidenceRule.allowed("deathride/evidence/perf/p14/run1/logcat-full.txt",100))
    @Test fun refusesAPerfettoTraceAndAVideo() {
        assertFalse(EvidenceRule.allowed("deathride/evidence/perf/p14/sched.perfetto-trace",1))
        assertFalse(EvidenceRule.allowed("deathride/evidence/perf/p14/capture.mp4",1))
    }
    @Test fun refusesAnOversizeJson() = assertFalse(EvidenceRule.allowed("deathride/evidence/perf/p14/p11-readings.json",big))
    @Test fun refusesAnOversizePng() = assertFalse(EvidenceRule.allowed("deathride/evidence/perf/p14/screen-full.png",big))
    @Test fun allowsSummariesManifestsAndLogs() {
        assertTrue(EvidenceRule.allowed("deathride/evidence/perf/p14/summary.json",20_000))
        assertTrue(EvidenceRule.allowed("deathride/evidence/perf/p14/manifest.json",40_000))
        assertTrue(EvidenceRule.allowed("deathride/evidence/perf/p14/probe.log",132_871))
    }
    @Test fun allowsASmallPngAndTheCapItself() {
        assertTrue(EvidenceRule.allowed("deathride/evidence/perf/p14/screen-small.png",60_000))
        assertTrue(EvidenceRule.allowed("deathride/evidence/perf/p14/edge.json",EvidenceRule.MAX_BYTES))
    }
    @Test fun allowsAGrandfatheredRawFile() {
        assertTrue(EvidenceRule.allowed("deathride/evidence/perf/p9/trace.perfetto-trace",300_000_000,grandfathered=true))
        assertTrue(EvidenceRule.allowed("deathride/evidence/perf/p9/logcat.txt",big,grandfathered=true))
    }
    @Test fun capIsAboutFourTimesTheLargestPostRulingFile() = assertEquals(3.95,EvidenceRule.MAX_BYTES/132_871.0,0.01)

    @Test fun everyTrackedEvidenceFileKeepsTheRuleOrIsGrandfathered() {
        val repo=File("../..").canonicalFile
        assertTrue(File(repo,"deathride/evidence").isDirectory,"run from deathride/core (repo root not found at $repo)")
        val head=lsTree(repo,"HEAD")
        val ruling=lsTree(repo,EvidenceRule.RULING_COMMIT).keys
        val offenders=head.filter{(path,bytes)->path !in ruling&&!EvidenceRule.allowed(path,bytes)}
        assertTrue(offenders.isEmpty(),
            "tracked under ${EvidenceRule.ROOT} but refused by the evidence rule (raw outside git, summaries inside; cap ${EvidenceRule.MAX_BYTES} B):\n"+
                offenders.entries.joinToString("\n"){"  ${it.key} (${it.value} B)"})
    }

    /** path to size for every blob under deathride/evidence at [rev]; fails, never skips, when git cannot answer. */
    private fun lsTree(repo:File,rev:String):Map<String,Long> {
        val out=try {
            val p=ProcessBuilder("git","-c","core.quotepath=off","ls-tree","-r","-l","-z",rev,"--",EvidenceRule.ROOT)
                .directory(repo).redirectErrorStream(false).start()
            val text=p.inputStream.readBytes().toString(Charsets.UTF_8)
            val err=p.errorStream.readBytes().toString(Charsets.UTF_8)
            if(!p.waitFor(60,TimeUnit.SECONDS)) { p.destroyForcibly(); fail<Unit>("git ls-tree $rev timed out") }
            if(p.exitValue()!=0) fail<Unit>("git ls-tree -r -l $rev failed (exit ${p.exitValue()}): ${err.trim()}")
            text
        } catch(e:java.io.IOException) { return fail("git cannot run, so the evidence rule cannot be checked: ${e.message}") }
        val files=out.split('\u0000').filter{it.isNotEmpty()}.associate{rec->
            val tab=rec.indexOf('\t')
            val bytes=rec.substring(0,tab).trim().split(Regex("\\s+"))[3].toLong()
            rec.substring(tab+1) to bytes
        }
        assertTrue(files.isNotEmpty(),"git ls-tree $rev returned no files under ${EvidenceRule.ROOT}")
        return files
    }
}
