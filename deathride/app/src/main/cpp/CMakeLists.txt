# P15 (perf only): the silentMmap arm's AAudio stream. app/build.gradle.kts wires this file only under -PsilentMmap=true,
# and passes DR_SILENT_MMAP=ON to the debug build type only, so a release build configures it and builds no library.
cmake_minimum_required(VERSION 3.22.1)
project(drsilentmmap LANGUAGES CXX)
option(DR_SILENT_MMAP "Build the perf-only AAudio MMAP silent stream" OFF)
if(DR_SILENT_MMAP)
    add_library(drsilentmmap SHARED silent_mmap.cpp)
    target_compile_options(drsilentmmap PRIVATE -Wall -Wextra -Werror)
    # libaaudio and liblog are NDK system libraries; nothing is downloaded or bundled.
    target_link_libraries(drsilentmmap aaudio log dl)
else()
    message(STATUS "drsilentmmap: DR_SILENT_MMAP is OFF, no library is built")
endif()
