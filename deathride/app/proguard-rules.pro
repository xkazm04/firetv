# libGDX: natives bind to Java fields/methods by name; reflection-based ApplicationListener loading.
-keep class com.badlogic.gdx.** { *; }
-keep class com.badlogic.gdx.backends.android.** { *; }
-dontwarn com.badlogic.gdx.**
# Ktor / coroutines / slf4j (link server)
-keep class io.ktor.** { *; }
-keepclassmembers class kotlinx.coroutines.** { volatile <fields>; }
-dontwarn io.ktor.**
-dontwarn org.slf4j.**
-dontwarn java.lang.management.**
-dontwarn org.slf4j.impl.**
-dontwarn kotlinx.coroutines.debug.**
# App and game code (reflection-free but small; keep entry points and the race link)
-keep class dev.deathride.** { *; }
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keep class kotlinx.serialization.** { *; }
-dontwarn kotlinx.serialization.**
-keep class kotlinx.coroutines.** { *; }
-keep class kotlin.** { *; }
-keep class org.slf4j.** { *; }
-adaptresourcefilecontents META-INF/services/**
-dontoptimize
