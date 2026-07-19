#include "Trie.h"
#include <algorithm>
#include <cctype>

TrieNode::TrieNode() : isEndOfWord(false) {}

Trie::Trie() : root(std::make_shared<TrieNode>()), wordCount(0) {}

// Normalize words to lowercase for case-insensitive matching
static std::string toLowercase(std::string str) {
    std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    return str;
}

void Trie::insert(const std::string& word, const std::string& contactId) {
    if (word.empty()) return;
    
    std::string normWord = toLowercase(word);
    auto current = root;

    for (char c : normWord) {
        if (current->children.find(c) == current->children.end()) {
            current->children[c] = std::make_shared<TrieNode>();
        }
        current = current->children[c];
    }

    current->isEndOfWord = true;
    
    // Add contact ID if not already indexed
    if (std::find(current->contactIds.begin(), current->contactIds.end(), contactId) == current->contactIds.end()) {
        current->contactIds.push_back(contactId);
    }
    wordCount++;
}

std::shared_ptr<TrieNode> Trie::findNode(const std::string& prefix) const {
    std::string normPrefix = toLowercase(prefix);
    auto current = root;

    for (char c : normPrefix) {
        if (current->children.find(c) == current->children.end()) {
            return nullptr;
        }
        current = current->children[c];
    }
    return current;
}

void Trie::collectWords(const std::shared_ptr<TrieNode>& node, std::string currentPrefix, 
                        std::vector<std::pair<std::string, std::string>>& results, int limit) const {
    if (!node || results.size() >= static_cast<size_t>(limit)) return;

    if (node->isEndOfWord) {
        for (const auto& id : node->contactIds) {
            results.push_back({currentPrefix, id});
            if (results.size() >= static_cast<size_t>(limit)) return;
        }
    }

    // Recurse children
    for (const auto& pair : node->children) {
        collectWords(pair.second, currentPrefix + pair.first, results, limit);
    }
}

std::vector<std::pair<std::string, std::string>> Trie::autocomplete(const std::string& prefix, int limit) const {
    std::vector<std::pair<std::string, std::string>> results;
    if (prefix.empty()) return results;

    auto startNode = findNode(prefix);
    if (!startNode) return results;

    // Normalize prefix casing back to the standard prefix we matched
    collectWords(startNode, prefix, results, limit);
    return results;
}

bool Trie::remove(const std::string& word, const std::string& contactId) {
    if (word.empty()) return false;
    
    std::string normWord = toLowercase(word);
    
    // Helper lambda for recursive deletion
    auto removeHelper = [&](auto& self, const std::shared_ptr<TrieNode>& current, const std::string& key, size_t depth) -> bool {
        if (!current) return false;

        // Base case: we reached the end of the word
        if (depth == key.length()) {
            if (!current->isEndOfWord) return false;

            // Remove contact ID
            auto it = std::find(current->contactIds.begin(), current->contactIds.end(), contactId);
            if (it != current->contactIds.end()) {
                current->contactIds.erase(it);
            }

            // If no other contact IDs share this word, mark isEndOfWord as false
            if (current->contactIds.empty()) {
                current->isEndOfWord = false;
                wordCount--;
            }

            // Return true if this node has no children and is not a word end, meaning parent can delete it
            return current->children.empty() && !current->isEndOfWord;
        }

        char c = key[depth];
        if (current->children.find(c) == current->children.end()) return false;

        bool shouldDeleteChild = self(self, current->children[c], key, depth + 1);

        if (shouldDeleteChild) {
            current->children.erase(c);
            // Return true if current node can be deleted from parent
            return current->children.empty() && !current->isEndOfWord;
        }

        return false;
    };

    return removeHelper(removeHelper, root, normWord, 0);
}

int Trie::getWordCount() const {
    return wordCount;
}
