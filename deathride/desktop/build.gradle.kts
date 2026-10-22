plugins { kotlin("jvm"); application }
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }
java { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
dependencies {
    implementation(project(":game"))
    implementation("com.badlogicgames.gdx:gdx-backend-lwjgl3:1.14.2")
    implementation("com.badlogicgames.gdx:gdx-platform:1.14.2:natives-desktop")
    runtimeOnly("org.slf4j:slf4j-simple:2.0.20")
}
application { mainClass.set("dev.deathride.desktop.LauncherKt") }
tasks.named<JavaExec>("run") { workingDir = rootProject.projectDir }

sourceSets.main { resources.srcDir(rootProject.file("assets")) }
