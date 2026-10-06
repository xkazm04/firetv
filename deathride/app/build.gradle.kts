plugins { id("com.android.application"); kotlin("android") }
val nativeJars by configurations.creating
// Fire TV is arm only; -PemulatorAbi=true keeps x86_64 for emulator builds.
val tvAbis = listOf("arm64-v8a", "armeabi-v7a") + if (providers.gradleProperty("emulatorAbi").isPresent) listOf("x86_64") else emptyList()
android {
    namespace = "dev.deathride.tv"
    compileSdk = 36
    defaultConfig {
        applicationId = providers.gradleProperty("appId").getOrElse("dev.deathride.campaign")
        resValue("string", "app_name", providers.gradleProperty("appLabel").getOrElse("Death Ride Campaign"))
        resValue("integer", "race_port", providers.gradleProperty("racePort").getOrElse("8770"))
        minSdk = 28; targetSdk = 34; versionCode = 1; versionName = "0.1-spike"
        ndk { abiFilters += tvAbis }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    sourceSets["main"].assets.srcDir(rootProject.file("controller"))
    sourceSets["main"].assets.srcDir(rootProject.file("assets"))
    sourceSets["main"].jniLibs.srcDir(layout.buildDirectory.dir("generated/natives"))
    // Runtime loads only phase2-states, story-art, regions, audio (+controller). The other phase2 bundles
    // are audit/test inputs (desktop AtlasAudit, tests read ../assets directly) and stay in the repo.
    androidResources { ignoreAssetsPattern = "!phase2-v1:!phase2-hud:!phase2-fusion" }
    packaging { resources.excludes += setOf("META-INF/INDEX.LIST", "META-INF/AL2.0", "META-INF/LGPL2.1") }
}
dependencies {
    implementation(project(":game"))
    implementation("com.badlogicgames.gdx:gdx-backend-android:1.13.5")
    for (abi in tvAbis) nativeJars("com.badlogicgames.gdx:gdx-platform:1.13.5:natives-$abi")
}
val extractNatives by tasks.registering {
    inputs.files(nativeJars); outputs.dir(layout.buildDirectory.dir("generated/natives"))
    doLast {
        nativeJars.files.forEach { jar ->
            val abi = tvAbis.first { jar.name.contains("natives-$it") }
            copy { from(zipTree(jar)); include("**/*.so"); into(layout.buildDirectory.dir("generated/natives/$abi")) }
        }
    }
}
tasks.named("preBuild") { dependsOn(extractNatives) }
