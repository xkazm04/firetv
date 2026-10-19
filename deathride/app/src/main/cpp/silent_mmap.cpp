// P15 (perf package only): one AAudio output stream whose data callback writes zeros, so the silentMmap arm can tell
// whether a stream on the Stick's mmap_no_irq_out route (DIRECT + MMAP_NOIRQ) keeps the platform audio pair idle.
// Exclusive (or shared on request), low latency, usage GAME, content type SONIFICATION, PCM 16-bit stereo, 48 kHz.
// Nothing audible is ever written.
#include <aaudio/AAudio.h>
#include <android/log.h>
#include <dlfcn.h>
#include <jni.h>
#include <atomic>
#include <cstring>

#define TAG "DeathRide"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)

namespace {

struct Silent {
    AAudioStream* stream = nullptr;
    std::atomic<int64_t> callbacks{0};
    std::atomic<int64_t> frames{0};
    std::atomic<int32_t> error{AAUDIO_OK};
};

aaudio_data_callback_result_t onData(AAudioStream* stream, void* user, void* audio, int32_t numFrames) {
    auto* s = static_cast<Silent*>(user);
    memset(audio, 0, static_cast<size_t>(numFrames) * AAudioStream_getChannelCount(stream) * sizeof(int16_t));
    s->callbacks.fetch_add(1, std::memory_order_relaxed);
    s->frames.fetch_add(numFrames, std::memory_order_relaxed);
    return AAUDIO_CALLBACK_RESULT_CONTINUE;
}

void onError(AAudioStream*, void* user, aaudio_result_t error) {
    static_cast<Silent*>(user)->error.store(error);
    LOGI("silentMmap error %d (%s)", error, AAudio_convertResultToText(error));
}

const char* sharingName(aaudio_sharing_mode_t m) {
    return m == AAUDIO_SHARING_MODE_EXCLUSIVE ? "EXCLUSIVE" : m == AAUDIO_SHARING_MODE_SHARED ? "SHARED" : "?";
}
const char* performanceName(aaudio_performance_mode_t m) {
    return m == AAUDIO_PERFORMANCE_MODE_LOW_LATENCY ? "LOW_LATENCY"
         : m == AAUDIO_PERFORMANCE_MODE_POWER_SAVING ? "POWER_SAVING"
         : m == AAUDIO_PERFORMANCE_MODE_NONE ? "NONE" : "?";
}

// AAudioStream_isMMapUsed is exported by the platform's libaaudio as a test API but is not in the NDK's headers or
// stub, so it is looked up at run time; -1 means the symbol is absent.
int mmapUsed(AAudioStream* stream) {
    using Fn = bool (*)(AAudioStream*);
    void* lib = dlopen("libaaudio.so", RTLD_NOW);
    auto fn = lib ? reinterpret_cast<Fn>(dlsym(lib, "AAudioStream_isMMapUsed")) : nullptr;
    int used = fn ? (fn(stream) ? 1 : 0) : -1;
    if (lib) dlclose(lib);
    return used;
}

}  // namespace

extern "C" JNIEXPORT jlong JNICALL
Java_dev_deathride_tv_SilentMmap_nativeOpen(JNIEnv*, jclass, jboolean exclusive) {
    AAudioStreamBuilder* builder = nullptr;
    aaudio_result_t r = AAudio_createStreamBuilder(&builder);
    if (r != AAUDIO_OK) {
        LOGI("silentMmap createStreamBuilder failed %d (%s)", r, AAudio_convertResultToText(r));
        return 0;
    }
    auto* s = new Silent();
    const aaudio_sharing_mode_t requested = exclusive ? AAUDIO_SHARING_MODE_EXCLUSIVE : AAUDIO_SHARING_MODE_SHARED;
    AAudioStreamBuilder_setDirection(builder, AAUDIO_DIRECTION_OUTPUT);
    AAudioStreamBuilder_setSharingMode(builder, requested);
    AAudioStreamBuilder_setPerformanceMode(builder, AAUDIO_PERFORMANCE_MODE_LOW_LATENCY);
    AAudioStreamBuilder_setUsage(builder, AAUDIO_USAGE_GAME);
    AAudioStreamBuilder_setContentType(builder, AAUDIO_CONTENT_TYPE_SONIFICATION);
    AAudioStreamBuilder_setFormat(builder, AAUDIO_FORMAT_PCM_I16);
    AAudioStreamBuilder_setChannelCount(builder, 2);
    AAudioStreamBuilder_setSampleRate(builder, 48000);
    AAudioStreamBuilder_setDataCallback(builder, onData, s);
    AAudioStreamBuilder_setErrorCallback(builder, onError, s);
    r = AAudioStreamBuilder_openStream(builder, &s->stream);
    AAudioStreamBuilder_delete(builder);
    if (r != AAUDIO_OK) {
        LOGI("silentMmap open failed %d (%s) requestedSharing=%s", r, AAudio_convertResultToText(r), sharingName(requested));
        delete s;
        return 0;
    }
    AAudioStream* st = s->stream;
    LOGI("silentMmap open requestedSharing=%s sharing=%s performanceMode=%s sampleRate=%d channels=%d format=%d "
         "framesPerBurst=%d bufferCapacity=%d bufferSize=%d framesPerDataCallback=%d deviceId=%d session=%d mmapUsed=%d",
         sharingName(requested), sharingName(AAudioStream_getSharingMode(st)),
         performanceName(AAudioStream_getPerformanceMode(st)), AAudioStream_getSampleRate(st),
         AAudioStream_getChannelCount(st), AAudioStream_getFormat(st), AAudioStream_getFramesPerBurst(st),
         AAudioStream_getBufferCapacityInFrames(st), AAudioStream_getBufferSizeInFrames(st),
         AAudioStream_getFramesPerDataCallback(st), AAudioStream_getDeviceId(st), AAudioStream_getSessionId(st),
         mmapUsed(st));
    r = AAudioStream_requestStart(st);
    if (r != AAUDIO_OK) {
        LOGI("silentMmap start failed %d (%s)", r, AAudio_convertResultToText(r));
        AAudioStream_close(st);
        delete s;
        return 0;
    }
    return reinterpret_cast<jlong>(s);
}

extern "C" JNIEXPORT void JNICALL
Java_dev_deathride_tv_SilentMmap_nativeClose(JNIEnv*, jclass, jlong handle) {
    auto* s = reinterpret_cast<Silent*>(handle);
    if (s == nullptr) return;
    AAudioStream_requestStop(s->stream);
    LOGI("silentMmap stopped callbacks=%lld framesWritten=%lld xRuns=%d error=%d",
         static_cast<long long>(s->callbacks.load()), static_cast<long long>(s->frames.load()),
         AAudioStream_getXRunCount(s->stream), s->error.load());
    AAudioStream_close(s->stream);
    delete s;
}
