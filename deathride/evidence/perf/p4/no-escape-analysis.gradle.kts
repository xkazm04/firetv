allprojects {
    tasks.withType<Test>().configureEach { jvmArgs("-XX:-DoEscapeAnalysis") }
}
