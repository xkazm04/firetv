plugins { kotlin("jvm") }
kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }
java { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
dependencies {
    api(project(":core")); api(project(":link"))
    api("com.badlogicgames.gdx:gdx:1.13.5")
    implementation("com.google.zxing:core:3.5.3")
}
