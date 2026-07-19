# C++ Algorithm Engine — Smart Contact Management System

## C++17 Data Structures & Algorithms Engine

---

## Overview

The C++ Algorithm Engine is a standalone, high-performance binary that implements advanced data structures for contact management operations. It communicates with the Node.js backend via **stdin/stdout JSON protocol** using `child_process.spawn()`.

This engine provides sub-millisecond performance for operations that would be slower in JavaScript:
- **Trie**: Prefix-based autocomplete search
- **HashMap**: O(1) duplicate detection
- **Merge Sort**: Stable alphabetical sorting
- **Priority Queue**: Recently contacted ranking
- **Stack**: Undo delete operations
- **Queue**: Search history management
- **BST**: Ordered traversal and range queries
- **Binary Search**: Efficient lookup in sorted data
- **Graph**: Relationship suggestions

---

## Data Structures & Complexity

| Data Structure | Feature | Time Complexity | Space Complexity |
|---|---|---|---|
| **Trie** | Autocomplete, prefix search | Insert: O(L), Search: O(L), Autocomplete: O(L + N) | O(ALPHABET × L × N) |
| **HashMap** | Duplicate detection | Insert: O(1) avg, Lookup: O(1) avg | O(N) |
| **Merge Sort** | Alphabetical sorting | O(N log N) guaranteed | O(N) |
| **Quick Sort** | Numeric field sorting | O(N log N) average, O(N²) worst | O(log N) |
| **Binary Search** | Search in sorted data | O(log N) | O(1) |
| **Priority Queue** | Recently contacted | Insert: O(log N), ExtractMax: O(log N) | O(N) |
| **Stack** | Undo delete | Push: O(1), Pop: O(1) | O(N) |
| **Queue** | Search history | Enqueue: O(1), Dequeue: O(1) | O(K) fixed |
| **BST** | Alphabetical storage, range queries | Insert: O(log N) avg, InOrder: O(N) | O(N) |
| **Graph** | Relationship suggestions | BFS: O(V + E) | O(V + E) |

Where: L = word length, N = number of contacts, K = history size, V = vertices, E = edges

---

## Communication Protocol

The engine reads JSON commands from **stdin** and writes JSON responses to **stdout**, one per line.

### Request Format

```json
{
  "action": "autocomplete",
  "params": {
    "prefix": "Jo",
    "limit": 10
  }
}
```

### Response Format

```json
{
  "status": "ok",
  "data": {
    "results": ["John Doe", "Joseph Smith", "Jordan Lee"],
    "count": 3
  },
  "time_ms": 0.15
}
```

### Supported Actions

| Action | Description | C++ Data Structure |
|---|---|---|
| `load_contacts` | Initialize all data structures with contact data | All |
| `autocomplete` | Get prefix-based suggestions | Trie |
| `prefix_search` | Find all contacts matching prefix | Trie |
| `check_duplicate` | Check if phone/email already exists | HashMap |
| `find_duplicates` | Find all duplicate contacts | HashMap |
| `sort` | Sort contacts by field | MergeSort / QuickSort |
| `binary_search` | Search in sorted contacts | BinarySearch |
| `push_undo` | Push deleted contact to undo stack | Stack |
| `pop_undo` | Pop last deleted contact | Stack |
| `peek_undo` | View last deleted without removing | Stack |
| `add_search` | Add query to search history | Queue |
| `get_history` | Get search history | Queue |
| `get_recent` | Get recently contacted (top K) | PriorityQueue |
| `bst_insert` | Insert contact into BST | BST |
| `bst_inorder` | Get alphabetically sorted contacts | BST |
| `bst_range` | Get contacts in name range | BST |
| `suggest_connections` | Suggest related contacts | Graph |
| `index_contact` | Add contact to all search structures | Trie + BST + HashMap |
| `remove_from_index` | Remove contact from all structures | Trie + BST + HashMap |

---

## Building

### Prerequisites
- C++ compiler with C++17 support:
  - **Linux**: g++ 9+ or clang 10+
  - **macOS**: Xcode 12+ (Apple Clang)
  - **Windows**: MSVC 2019+ or MinGW-w64
- CMake 3.16+

### Build Instructions

```bash
cd cpp-engine
mkdir build
cd build
cmake ..
cmake --build .
```

The compiled binary will be at `build/contact-engine` (or `build/contact-engine.exe` on Windows).

### Running Manually

```bash
echo '{"action": "autocomplete", "params": {"prefix": "Jo", "limit": 5}}' | ./build/contact-engine
```

---

## Folder Structure

```
cpp-engine/
├── include/                → Header files
│   ├── Contact.h           → Contact data model
│   ├── Trie.h              → Trie (prefix tree) interface
│   ├── BST.h               → Binary Search Tree interface
│   ├── HashMap.h            → Hash table interface
│   ├── Stack.h              → Stack (LIFO) interface
│   ├── Queue.h              → Queue (FIFO) interface
│   ├── PriorityQueue.h      → Max-heap interface
│   ├── Sorting.h            → MergeSort & QuickSort interface
│   ├── Search.h             → Binary search interface
│   └── Graph.h              → Adjacency list graph interface
│
├── src/
│   ├── Contact/
│   │   └── Contact.cpp      → Contact model implementation
│   ├── Trie/
│   │   └── Trie.cpp         → Trie insert, search, autocomplete
│   ├── BST/
│   │   └── BST.cpp          → BST insert, delete, traversal, range query
│   ├── HashMap/
│   │   └── HashMap.cpp      → Hash table with chaining, duplicate detection
│   ├── Stack/
│   │   └── Stack.cpp        → Stack for undo delete
│   ├── Queue/
│   │   └── Queue.cpp        → Fixed-size queue for search history
│   ├── Sorting/
│   │   ├── MergeSort.cpp    → Stable sort implementation
│   │   └── QuickSort.cpp    → In-place sort implementation
│   ├── Search/
│   │   └── BinarySearch.cpp → Binary search with bounds
│   ├── Graph/
│   │   └── Graph.cpp        → Adjacency list, BFS, community detection
│   └── main.cpp             → Entry point: JSON command router
│
├── CMakeLists.txt           → CMake build configuration
└── README.md                → This file
```

---

## Design Decisions

1. **Standalone Binary**: The C++ engine runs as a separate process, not a native Node.js addon. This avoids `node-gyp` build issues and keeps the engine language-agnostic.

2. **JSON over stdio**: Simple, debuggable protocol. No need for sockets, shared memory, or FFI. The overhead of JSON parsing is negligible compared to the algorithmic speedup.

3. **RAII Memory Management**: All dynamically allocated nodes (Trie, BST, Graph) are properly cleaned up in destructors. No memory leaks.

4. **Template-free Design**: Classes use concrete `Contact` types instead of templates for readability and maintainability. Generics are not needed since all operations are contact-specific.

5. **Stable Sorting**: Merge Sort is used for name-based sorting to preserve the relative order of contacts with identical sort keys. Quick Sort is used for numeric fields where stability doesn't matter.
