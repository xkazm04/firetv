plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation(libs.kotlinx.serialization.json)
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    // CompanionContractTest reads the phone page; without this an edit to the page alone leaves
    // the test task up to date (or served from the build cache) and the contract is never re-read.
    inputs.file(rootProject.layout.projectDirectory.file("companion/index.html"))
        .withPropertyName("companionPage")
        .withPathSensitivity(PathSensitivity.RELATIVE)
    testLogging { events("passed", "failed", "skipped") }
}
