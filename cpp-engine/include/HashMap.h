#ifndef HASHMAP_H
#define HASHMAP_H

#include <string>
#include <vector>
#include <list>
#include <utility>

class HashMap {
private:
    int capacity;
    int size;
    float maxLoadFactor;
    
    // Hash table buckets. Each bucket contains a list of key-value pairs (key, contactId)
    std::vector<std::list<std::pair<std::string, std::string>>> table;

    // DJB2 hash algorithm
    unsigned long hashFunction(const std::string& key) const;
    void rehash();

public:
    HashMap(int initialCapacity = 101);
    
    // Insert mapping
    void insert(const std::string& key, const std::string& contactId);
    
    // Find matching contact ID by key. Returns empty string if not found.
    std::string find(const std::string& key) const;
    
    // Check if key exists
    bool exists(const std::string& key) const;
    
    // Remove mapping
    bool remove(const std::string& key);

    int getSize() const;
    float getLoadFactor() const;
    void clear();
};

#endif // HASHMAP_H
