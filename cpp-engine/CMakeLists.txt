cmake_minimum_required(VERSION 3.14)
project(SmartContactEngine VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Configure build output paths
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# Download nlohmann/json library header-only dependency automatically
include(FetchContent)
FetchContent_Declare(
  json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG v3.11.3
)
FetchContent_MakeAvailable(json)

# Locate local headers
include_directories(include)

# Collect all C++ source files
file(GLOB_RECURSIVE SRC_FILES 
    src/Contact/*.cpp
    src/Trie/*.cpp
    src/BST/*.cpp
    src/HashMap/*.cpp
    src/Stack/*.cpp
    src/Queue/*.cpp
    src/Sorting/*.cpp
    src/Search/*.cpp
    src/main.cpp
)

# Output build targets
add_executable(contact-engine ${SRC_FILES})

# Link libraries
target_link_libraries(contact-engine PRIVATE nlohmann_json::nlohmann_json)

# Copy headers configurations if needed
target_compile_definitions(contact-engine PRIVATE VERSION="1.0.0")
