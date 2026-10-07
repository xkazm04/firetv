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
    buildTypes {
        // R8 + resource shrink for release only (debug unchanged); -PnoMinify=true opts out. Verified: starts on Fire TV, race server listens.
        release {
            val minify = !providers.gradleProperty("noMinify").isPresent
            isMinifyEnabled = minify; isShrinkResources = minify
            proguardFiles(file("proguard-rules.pro"))
            signingConfig = signingConfigs.getByName("debug")
        }
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

// Release-only lossless PNG re-encode (owner ruling 2026-10-07). A generated asset dir wired into the release variant only:
// it holds just the changed PACKAGED copies (re-encoded PNGs, catalog JSONs with their sha256 pins rewritten) and overrides
// the same paths from assets/. Debug, desktop and tests keep reading assets/ unchanged. Tool pinned in release-assets/requirements.txt;
// -PnoPngReencode=true ships the original bytes (like -PnoMinify) and logs it.
val releaseAssetsDir = layout.projectDirectory.dir("release-assets")
abstract class PngReencode @javax.inject.Inject constructor(private val execOps: org.gradle.process.ExecOperations) : DefaultTask() {
    @get:Internal abstract val assetsRoot: DirectoryProperty
    @get:InputFiles @get:PathSensitive(PathSensitivity.RELATIVE) abstract val assetInputs: ConfigurableFileCollection // PNGs of the shipped dirs + every JSON; audio changes do not rerun zopfli
    @get:InputFiles @get:PathSensitive(PathSensitivity.RELATIVE) abstract val tooling: ConfigurableFileCollection
    @get:Input abstract val python: Property<String>
    @get:OutputDirectory abstract val outDir: DirectoryProperty
    @get:OutputFile abstract val manifest: RegularFileProperty
    @TaskAction fun run() {
        project.delete(outDir)
        val script = tooling.files.first { it.name.endsWith(".py") }
        val req = tooling.files.first { it.name == "requirements.txt" }
        execOps.exec {
            commandLine(python.get(), "-I", script.path, assetsRoot.get().asFile.path, outDir.get().asFile.path, manifest.get().asFile.path, req.path)
        }
    }
}
val pngReencode = tasks.register<PngReencode>("pngReencode") {
    assetsRoot.set(rootProject.layout.projectDirectory.dir("assets"))
    assetInputs.from(rootProject.fileTree("assets") { include("phase2-states/**", "story-art/**", "regions/**", "**/*.json") })
    tooling.from(releaseAssetsDir.file("reencode_release_assets.py"), releaseAssetsDir.file("requirements.txt"))
    python.set(providers.gradleProperty("python").orElse("python"))
    outDir.set(layout.buildDirectory.dir("generated/release-assets"))
    manifest.set(layout.buildDirectory.file("outputs/png-reencode-manifest.json"))
}
if (providers.gradleProperty("noPngReencode").isPresent) {
    logger.lifecycle("PNG re-encode: -PnoPngReencode set, the release ships the original asset bytes")
} else {
    androidComponents.onVariants(androidComponents.selector().withBuildType("release")) { variant ->
        variant.sources.assets?.addGeneratedSourceDirectory(pngReencode, PngReencode::outDir)
    }
}
