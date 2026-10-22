plugins { kotlin("jvm") }
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }
java { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
dependencies {
    api(project(":core"))
    testImplementation("org.junit.jupiter:junit-jupiter:6.1.3")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    implementation("io.ktor:ktor-server-cio:2.3.12")
    implementation("io.ktor:ktor-server-websockets:2.3.12")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
}

tasks.register("printTestClasspath") { dependsOn("testClasses"); doLast { println("CP=" + sourceSets.test.get().runtimeClasspath.asPath) } }
tasks.test { useJUnitPlatform(); if(System.getenv("LINK_BENCH")!=null){ enableAssertions=false; jvmArgs("-Dkotlinx.coroutines.debug=off") }; System.getenv("LINK_JFR")?.let { jvmArgs("-XX:StartFlightRecording=filename=$it,settings=profile") }; testLogging { events("passed", "failed"); showStandardStreams=true } }
