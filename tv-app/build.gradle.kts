plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.compiler)
}

android {
    namespace = "dev.telestrator.tv"
    compileSdk = 34

    defaultConfig {
        applicationId = "dev.telestrator.tv"
        // Fire OS 7 == Android 9 (API 28); Fire OS 8 == Android 11 (API 30).
        minSdk = 28
        targetSdk = 34
        versionCode = 1
        versionName = "0.1-poc"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    packaging {
        resources.excludes += setOf(
            "META-INF/INDEX.LIST",
            "META-INF/io.netty.versions.properties",
            "META-INF/{AL2.0,LGPL2.1}",
        )
    }
    // The fixture clip must not be re-encoded by aapt or ExoPlayer sees a corrupt stream.
    androidResources {
        noCompress += "mp4"
    }
}

dependencies {
    implementation(project(":core"))

    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.ui.graphics)
    implementation(libs.compose.foundation)
    implementation(libs.compose.ui.tooling.preview)
    debugImplementation(libs.compose.ui.tooling)
    implementation(libs.tv.material)
    implementation(libs.androidx.activity.compose)

    implementation(libs.media3.exoplayer)
    implementation(libs.media3.ui)

    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.cio)
    implementation(libs.ktor.server.websockets)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)

    implementation(libs.zxing.core)

    androidTestImplementation(libs.androidx.test.junit)
    androidTestImplementation(libs.espresso.core)
    androidTestImplementation(libs.uiautomator)
}

/**
 * The companion PWA lives in /companion and is served from the APK's assets. Copying it at build
 * time keeps one source of truth, so Playwright tests the same file the TV serves.
 */
val companionAssetsDir = layout.buildDirectory.dir("generated/companionAssets").get().asFile

val syncCompanion by tasks.registering(Copy::class) {
    from(rootProject.layout.projectDirectory.dir("companion"))
    into(File(companionAssetsDir, "companion"))
}

android.sourceSets["main"].assets.srcDir(companionAssetsDir)

tasks.withType<com.android.build.gradle.tasks.MergeSourceSetFolders>().configureEach {
    dependsOn(syncCompanion)
}
