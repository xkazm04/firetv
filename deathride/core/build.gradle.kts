plugins { kotlin("jvm") }
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }
java { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
dependencies { testImplementation("org.junit.jupiter:junit-jupiter:5.10.2"); testRuntimeOnly("org.junit.platform:junit-platform-launcher") }
tasks.test { useJUnitPlatform(); testLogging { events("passed", "failed", "skipped"); showStandardStreams = true } }
tasks.register<JavaExec>("balanceReport") {
    group="verification"
    description="Run the versioned full seeded W8 physical balance scenarios"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.BalanceReportKt")
    maxHeapSize="1g"
    providers.gradleProperty("balanceScenario").orNull?.let { args(it) }
}
tasks.register<JavaExec>("rosterReport") {
    group="verification"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.RosterReportKt")
    maxHeapSize="1g"
    jvmArgs("-Djava.util.concurrent.ForkJoinPool.common.parallelism="+providers.gradleProperty("rosterParallel").getOrElse("4"))
    args(providers.gradleProperty("rosterSamples").getOrElse("2000"))
    providers.gradleProperty("rosterTier").orNull?.let { args(it) }
}
tasks.register("reportClasspath") {
    dependsOn(tasks.testClasses)
    doLast { layout.buildDirectory.file("report-classpath.txt").get().asFile.writeText(sourceSets.test.get().runtimeClasspath.asPath) }
}

tasks.register<JavaExec>("driftLab") {
    group="verification"
    description="Deterministic per-class drift scenarios and spin-duration sweep"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.DriftLabReportKt")
    args(providers.gradleProperty("driftOutput").getOrElse("build/reports/drift-lab"))
    args(providers.gradleProperty("driftOverrides").getOrElse(""),providers.gradleProperty("driftClass").getOrElse(""),providers.gradleProperty("driftTraces").getOrElse("true"),providers.gradleProperty("driftGeometryOverrides").getOrElse(""))
}

tasks.register<JavaExec>("combatDepthReport") {
    group="verification"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.CombatDepthReportKt")
    maxHeapSize="1g"
    jvmArgs("-Djava.util.concurrent.ForkJoinPool.common.parallelism=4")
    args(providers.gradleProperty("combatSamples").getOrElse("2000"))
}

tasks.register<JavaExec>("careerV2Report") {
    group="verification"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.CareerV2ReportKt")
    maxHeapSize="1g"
    jvmArgs("-Djava.util.concurrent.ForkJoinPool.common.parallelism=4")
    jvmArgs("-DashReportRoot="+providers.gradleProperty("ashReportRoot").getOrElse("build/reports/ash-circuit"))
    args(providers.gradleProperty("ashSeeds").getOrElse("8"),providers.gradleProperty("ashCareers").getOrElse("2000"))
    providers.gradleProperty("ashReuse").orNull?.let { args("reuse") }
}
tasks.register<JavaExec>("endurancePilot") {
    group="verification"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.EndurancePilotKt")
    maxHeapSize="1g"
    jvmArgs("-Djava.util.concurrent.ForkJoinPool.common.parallelism=4")
    args(providers.gradleProperty("enduranceSamples").getOrElse("2"))
}

tasks.register<JavaExec>("abilityReport") {
    group="verification"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.AbilityReportKt")
    maxHeapSize="1g"
    jvmArgs("-Djava.util.concurrent.ForkJoinPool.common.parallelism="+providers.gradleProperty("abilityParallel").getOrElse("4"))
    args(providers.gradleProperty("abilitySamples").getOrElse("2000"),providers.gradleProperty("abilityBaselineSamples").getOrElse("200"),providers.gradleProperty("abilityPart").getOrElse("roster"),providers.gradleProperty("abilityTag").getOrElse("accepted"),providers.gradleProperty("abilityTier").getOrElse("all"))
    args(providers.gradleProperty("abilitySeedNamespace").getOrElse("abilities"))
}

tasks.register<JavaExec>("trackQualityReport") {
    group="verification"
    description="T1 geometry and seeded six-car combat track instruments; never writes gameplay data"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.TrackQualityReportKt")
    maxHeapSize="2g"
    systemProperty("tracksRoot",rootProject.projectDir.absolutePath)
    args(providers.gradleProperty("trackSeeds").getOrElse("12"),providers.gradleProperty("trackOutput").getOrElse(rootProject.file("tracks/atlas").absolutePath))
}

tasks.register<JavaExec>("trackLab") {
    group="application"
    description="Desktop Track Lab using the actual core spline, linter and AI; browser UI on localhost"
    dependsOn(tasks.testClasses)
    classpath=sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.deathride.core.TrackLabServerKt")
    maxHeapSize="1g"
    systemProperty("tracksRoot",rootProject.projectDir.absolutePath)
    args(providers.gradleProperty("trackLabPort").getOrElse("8794"))
}
