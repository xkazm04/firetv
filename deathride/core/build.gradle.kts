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
