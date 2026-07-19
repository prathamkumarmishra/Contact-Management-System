#include "HashMap.h"
#include <algorithm>

HashMap::HashMap(int initialCapacity) 
    : capacity(initialCapacity), size(0), maxLoadFactor(0.75), table(initialCapacity) {}

unsigned long HashMap::hashFunction(const std::string& key) const {
    // DJB2 Hash Algorithm
    unsigned long hash = 5381;
    for (char c : key) {
        hash = ((hash << 5) + hash) + c; // hash * 33 + c
    }
    return hash % capacity;
}

void HashMap::rehash() {
    int oldCapacity = capacity;
    capacity = capacity * 2 + 1; // Keep prime-like size
    
    std::vector<std::list<std::pair<std::string, std::string>>> oldTable = std::move(table);
    table = std::vector<std::list<std::pair<std::string, std::string>>>(capacity);
    size = 0;

    for (int i = 0; i < oldCapacity; i++) {
        for (const auto& pair : oldTable[i]) {
            insert(pair.first, pair.second);
        }
    }
}

void HashMap::insert(const std::string& key, const std::string& contactId) {
    if (key.empty()) return;

    // Check load factor
    if (getLoadFactor() > maxLoadFactor) {
        rehash();
    }

    unsigned long index = hashFunction(key);
    
    // Check if key already exists, overwrite if matching
    for (auto& pair : table[index]) {
        if (pair.first == key) {
            pair.second = contactId;
            return;
        }
    }

    table[index].push_back({key, contactId});
    size++;
}

std::string HashMap::find(const std::string& key) const {
    if (key.empty()) return "";

    unsigned long index = hashFunction(key);
    for (const auto& pair : table[index]) {
        if (pair.first == key) {
            return pair.second;
        }
    }
    return "";
}

bool HashMap::exists(const std::string& key) const {
    return !find(key).empty();
}

bool HashMap::remove(const std::string& key) {
    if (key.empty()) return false;

    unsigned long index = hashFunction(key);
    auto& bucket = table[index];

    for (auto it = bucket.begin(); it != bucket.end(); ++it) {
        if (it->first == key) {
            bucket.erase(it);
            size--;
            return true;
        }
    }
    return false;
}

int HashMap::getSize() const {
    return size;
}

float HashMap::getLoadFactor() const {
    return static_cast<float>(size) / capacity;
}

void HashMap::clear() {
    table = std::vector<std::list<std::pair<std::string, std::string>>>(capacity);
    size = 0;
}
