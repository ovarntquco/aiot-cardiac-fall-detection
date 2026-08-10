cmake_minimum_required(VERSION 3.16)

# Find all Edge Impulse SDK and model source files.
file(GLOB_RECURSE EDGE_IMPULSE_SOURCES
    "${CMAKE_CURRENT_LIST_DIR}/edge-impulse-sdk/*.c"
    "${CMAKE_CURRENT_LIST_DIR}/edge-impulse-sdk/*.cc"
    "${CMAKE_CURRENT_LIST_DIR}/edge-impulse-sdk/*.cpp"
    "${CMAKE_CURRENT_LIST_DIR}/model-parameters/*.c"
    "${CMAKE_CURRENT_LIST_DIR}/model-parameters/*.cc"
    "${CMAKE_CURRENT_LIST_DIR}/model-parameters/*.cpp"
    "${CMAKE_CURRENT_LIST_DIR}/tflite-model/*.c"
    "${CMAKE_CURRENT_LIST_DIR}/tflite-model/*.cc"
    "${CMAKE_CURRENT_LIST_DIR}/tflite-model/*.cpp"
)

# Collect all directories so nested EI headers can be found.
file(GLOB_RECURSE EDGE_IMPULSE_ITEMS
    LIST_DIRECTORIES true
    "${CMAKE_CURRENT_LIST_DIR}/edge-impulse-sdk/*"
    "${CMAKE_CURRENT_LIST_DIR}/model-parameters/*"
    "${CMAKE_CURRENT_LIST_DIR}/tflite-model/*"
)

set(EDGE_IMPULSE_INCLUDE_DIRS
    "${CMAKE_CURRENT_LIST_DIR}"
    "${CMAKE_CURRENT_LIST_DIR}/edge-impulse-sdk"
    "${CMAKE_CURRENT_LIST_DIR}/model-parameters"
    "${CMAKE_CURRENT_LIST_DIR}/tflite-model"
)

foreach(item ${EDGE_IMPULSE_ITEMS})
    if(IS_DIRECTORY "${item}")
        list(APPEND EDGE_IMPULSE_INCLUDE_DIRS "${item}")
    endif()
endforeach()

list(REMOVE_DUPLICATES EDGE_IMPULSE_INCLUDE_DIRS)

idf_component_register(
    SRCS
        ${EDGE_IMPULSE_SOURCES}
        "ai_service.cpp"
    REQUIRES
        esp-dsp
        esp_timer
        mpu6050
    INCLUDE_DIRS
        ${EDGE_IMPULSE_INCLUDE_DIRS}
        "include"
)

# Edge Impulse uses C++11 or newer.
target_compile_features(
    ${COMPONENT_LIB}
    PUBLIC
        cxx_std_11
)

# Select the generic Edge Impulse porting implementation.
target_compile_definitions(
    ${COMPONENT_LIB}
    PUBLIC
        EI_PORTING_ESPRESSIF=1
)

# Avoid generated-library warnings stopping the build.
target_compile_options(
    ${COMPONENT_LIB}
    PRIVATE
        -Wno-error
        -Wno-unused-function
        -Wno-unused-variable
        -Wno-missing-field-initializers
)