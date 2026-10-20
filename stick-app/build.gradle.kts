plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

/**
 * The Study Desk's stick shell: one WebView on the desk's /tv page. Silk keeps the D-pad, Select, Back and Menu for
 * its own cursor and chrome (TV-led design, finding F0), so this activity hands those keys to the page itself.
 * No Compose and no AndroidX: the page draws everything.
 */
android {
    namespace = "dev.studydesk.stick"
    compileSdk = 34

    defaultConfig {
        applicationId = "dev.studydesk.stick"
        // Fire OS 7 == Android 9 (API 28); the stick in the house runs Fire OS 8 (Android 11).
        minSdk = 28
        targetSdk = 34
        versionCode = 1
        versionName = "0.1"
    }

    buildTypes {
        release {
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
    testOptions {
        unitTests.all { it.useJUnitPlatform() }
    }
}

dependencies {
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}
