plugins { id("com.android.application"); kotlin("android") }
val nativeJars by configurations.creating
android {
    namespace = "dev.deathride.tv"
    compileSdk = 36
    defaultConfig {
        applicationId = providers.gradleProperty("appId").getOrElse("dev.deathride.tv")
        resValue("string", "app_name", providers.gradleProperty("appLabel").getOrElse("Death Ride"))
        minSdk = 28; targetSdk = 34; versionCode = 1; versionName = "0.1-spike"
        ndk { abiFilters += listOf("arm64-v8a", "armeabi-v7a", "x86_64") }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    sourceSets["main"].assets.srcDir(rootProject.file("controller"))
    sourceSets["main"].jniLibs.srcDir(layout.buildDirectory.dir("generated/natives"))
    packaging { resources.excludes += setOf("META-INF/INDEX.LIST", "META-INF/AL2.0", "META-INF/LGPL2.1") }
}
dependencies {
    implementation(project(":game"))
    implementation("com.badlogicgames.gdx:gdx-backend-android:1.13.5")
    for (abi in listOf("arm64-v8a", "armeabi-v7a", "x86_64")) nativeJars("com.badlogicgames.gdx:gdx-platform:1.13.5:natives-$abi")
}
val extractNatives by tasks.registering {
    inputs.files(nativeJars); outputs.dir(layout.buildDirectory.dir("generated/natives"))
    doLast {
        nativeJars.files.forEach { jar ->
            val abi = listOf("arm64-v8a", "armeabi-v7a", "x86_64").first { jar.name.contains("natives-$it") }
            copy { from(zipTree(jar)); include("**/*.so"); into(layout.buildDirectory.dir("generated/natives/$abi")) }
        }
    }
}
tasks.named("preBuild") { dependsOn(extractNatives) }
