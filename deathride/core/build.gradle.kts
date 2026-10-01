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
    args(providers.gradleProperty("ashSeeds").getOrElse("8"),providers.gradleProperty("ashCareers").getOrElse("2000"))
    providers.gradleProperty("ashReuse").orNull?.let { args("reuse") }
}
