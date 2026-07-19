#ifndef TRIE_H
#define TRIE_H

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

class TrieNode {
public:
    std::unordered_map<char, std::shared_ptr<TrieNode>> children;
    bool isEndOfWord;
    // Store matching contact IDs (handles multiple contacts with same search key name)
    std::vector<std::string> contactIds;

    TrieNode();
};

class Trie {
private:
    std::shared_ptr<TrieNode> root;
    int wordCount;

    void collectWords(const std::shared_ptr<TrieNode>& node, std::string currentPrefix, 
                      std::vector<std::pair<std::string, std::string>>& results, int limit) const;
                      
    std::shared_ptr<TrieNode> findNode(const std::string& prefix) const;

public:
    Trie();
    
    // Insert a word mapping to a contact ID
    void insert(const std::string& word, const std::string& contactId);
    
    // Autocomplete matching prefix, returning vector of pairs: <name, contactId>
    std::vector<std::pair<std::string, std::string>> autocomplete(const std::string& prefix, int limit = 10) const;
    
    // Remove a word/id mapping
    bool remove(const std::string& word, const std::string& contactId);

    int getWordCount() const;
};

#endif // TRIE_H
