#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <sstream>
#include <unordered_set>
#include <nlohmann/json.hpp>

#include "Contact.h"
#include "Trie.h"
#include "BST.h"
#include "HashMap.h"
#include "Stack.h"
#include "Queue.h"
#include "PriorityQueue.h"
#include "Sorting.h"
#include "Search.h"

using json = nlohmann::json;

// Data Structure Instances
Trie autocompleteTrie;
BST alphabeticalBST;
HashMap phoneMap;
HashMap emailMap;
Stack deleteStack;
Queue searchHistoryQueue(20);
PriorityQueue interactionPQ;

// Map to store raw Contact objects by ID for fast O(1) lookups
std::unordered_map<std::string, Contact> contactStore;

// Helpers to serialize/deserialize Contacts
Contact jsonToContact(const json& j) {
    Contact c;
    c.id = j.value("id", "");
    c.firstName = j.value("firstName", "");
    c.lastName = j.value("lastName", "");
    c.phone = j.value("phone", "");
    c.alternativePhone = j.value("alternativePhone", "");
    c.email = j.value("email", "");
    c.company = j.value("company", "");
    c.designation = j.value("designation", "");
    c.department = j.value("department", "");
    c.category = j.value("category", "personal");
    c.city = j.value("city", "");
    c.state = j.value("state", "");
    c.country = j.value("country", "");
    c.zipCode = j.value("zipCode", "");
    c.website = j.value("website", "");
    c.linkedin = j.value("linkedin", "");
    c.birthday = j.value("birthday", "");
    c.notes = j.value("notes", "");
    
    if (j.contains("tags") && j["tags"].is_array()) {
        for (const auto& tag : j["tags"]) {
            c.tags.push_back(tag.get<std::string>());
        }
    }
    
    c.isFavorite = j.value("isFavorite", false);
    c.isBlocked = j.value("isBlocked", false);
    c.lastContacted = j.value("lastContacted", "");
    c.contactCount = j.value("contactCount", 0);
    c.createdAt = j.value("createdAt", "");
    return c;
}

json contactToJson(const Contact& c) {
    json j;
    j["id"] = c.id;
    j["firstName"] = c.firstName;
    j["lastName"] = c.lastName;
    j["phone"] = c.phone;
    j["alternativePhone"] = c.alternativePhone;
    j["email"] = c.email;
    j["company"] = c.company;
    j["designation"] = c.designation;
    j["department"] = c.department;
    j["category"] = c.category;
    j["city"] = c.city;
    j["state"] = c.state;
    j["country"] = c.country;
    j["zipCode"] = c.zipCode;
    j["website"] = c.website;
    j["linkedin"] = c.linkedin;
    j["birthday"] = c.birthday;
    j["notes"] = c.notes;
    j["tags"] = c.tags;
    j["isFavorite"] = c.isFavorite;
    j["isBlocked"] = c.isBlocked;
    j["lastContacted"] = c.lastContacted;
    j["contactCount"] = c.contactCount;
    j["createdAt"] = c.createdAt;
    return j;
}

// ----------------------------------------------------
// COMMAND HANDLERS
// ----------------------------------------------------

json handleLoad(const json& params) {
    if (!params.is_array()) {
        return {{"error", "load parameters must be a contact array"}};
    }

    // Clear old data first
    contactStore.clear();
    autocompleteTrie = Trie();
    alphabeticalBST.clear();
    phoneMap.clear();
    emailMap.clear();
    interactionPQ.clear();

    for (const auto& jContact : params) {
        Contact c = jsonToContact(jContact);
        
        // Save to core map store
        contactStore[c.id] = c;

        // Index in Trie (Index by first name, last name, and full name)
        autocompleteTrie.insert(c.firstName, c.id);
        autocompleteTrie.insert(c.lastName, c.id);
        autocompleteTrie.insert(c.getFullName(), c.id);

        // Index in BST (Alphabetical sorted tree)
        alphabeticalBST.insert(c);

        // Index in HashMap for O(1) duplicate checks
        phoneMap.insert(c.phone, c.id);
        if (!c.email.empty()) {
            emailMap.insert(c.email, c.id);
        }

        // Index in Priority Queue (Heap based)
        interactionPQ.insert(c, c.contactCount);
    }

    return {{"status", "success"}, {"contactsCount", contactStore.size()}};
}

json handleInsert(const json& params) {
    Contact c = jsonToContact(params);

    // O(1) Duplicate check using HashMaps
    if (phoneMap.exists(c.phone)) {
        return {{"status", "error"}, {"code", "DUPLICATE_PHONE"}, {"message", "Phone number already exists"}};
    }
    if (!c.email.empty() && emailMap.exists(c.email)) {
        return {{"status", "error"}, {"code", "DUPLICATE_EMAIL"}, {"message", "Email address already exists"}};
    }

    // Save
    contactStore[c.id] = c;
    autocompleteTrie.insert(c.firstName, c.id);
    autocompleteTrie.insert(c.lastName, c.id);
    autocompleteTrie.insert(c.getFullName(), c.id);
    alphabeticalBST.insert(c);
    phoneMap.insert(c.phone, c.id);
    if (!c.email.empty()) {
        emailMap.insert(c.email, c.id);
    }
    interactionPQ.insert(c, c.contactCount);

    return {{"status", "success"}, {"contact", contactToJson(c)}};
}

json handleSearch(const json& params) {
    std::string query = params.value("query", "");
    if (query.empty()) return {{"results", json::array()}};

    // Log query in search history queue
    searchHistoryQueue.enqueue(query);

    // Search via Trie Autocomplete (matches prefixes of first, last or full name)
    auto matches = autocompleteTrie.autocomplete(query, 10);

    json results = json::array();
    std::unordered_set<std::string> uniqueIds; // Filter duplicate match IDs

    for (const auto& match : matches) {
        std::string id = match.second;
        if (uniqueIds.find(id) == uniqueIds.end()) {
            uniqueIds.insert(id);
            if (contactStore.find(id) != contactStore.end()) {
                results.push_back(contactToJson(contactStore[id]));
            }
        }
    }

    return {{"results", results}};
}

json handleDelete(const json& params) {
    std::string id = params.value("id", "");
    if (id.empty() || contactStore.find(id) == contactStore.end()) {
        return {{"status", "error"}, {"message", "Contact not found"}};
    }

    Contact c = contactStore[id];

    // Remove from active DS
    autocompleteTrie.remove(c.firstName, c.id);
    autocompleteTrie.remove(c.lastName, c.id);
    autocompleteTrie.remove(c.getFullName(), c.id);
    
    alphabeticalBST.remove(c.id, c.getFullName());
    phoneMap.remove(c.phone);
    if (!c.email.empty()) {
        emailMap.remove(c.email);
    }

    // Push to LIFO Stack to support Undo
    deleteStack.push(c);

    // Remove from memory store
    contactStore.erase(id);

    return {{"status", "success"}, {"message", "Contact deleted"}, {"contact", contactToJson(c)}};
}

json handleUndo() {
    if (deleteStack.isEmpty()) {
        return {{"status", "error"}, {"message", "No deleted contacts available to restore"}};
    }

    // Pop from stack and re-insert
    Contact c = deleteStack.pop();
    
    contactStore[c.id] = c;
    autocompleteTrie.insert(c.firstName, c.id);
    autocompleteTrie.insert(c.lastName, c.id);
    autocompleteTrie.insert(c.getFullName(), c.id);
    alphabeticalBST.insert(c);
    phoneMap.insert(c.phone, c.id);
    if (!c.email.empty()) {
        emailMap.insert(c.email, c.id);
    }
    interactionPQ.insert(c, c.contactCount);

    return {{"status", "success"}, {"contact", contactToJson(c)}};
}

json handleGetSorted(const json& params) {
    std::string field = params.value("field", "firstName");
    std::string order = params.value("order", "asc");

    std::vector<Contact> contacts;
    
    if (field == "firstName") {
        // Retrieve directly from BST inorder traversal (guarantees O(N) alphabetical names list)
        contacts = alphabeticalBST.inorderTraversal();
        if (order == "desc") {
            std::reverse(contacts.begin(), contacts.end());
        }
    } else {
        // Collect all contacts
        for (const auto& pair : contactStore) {
            contacts.push_back(pair.second);
        }

        // Sort dynamically using QuickSort or MergeSort
        if (field == "company" || field == "birthday") {
            Sorting::mergeSort(contacts, 0, contacts.size() - 1, field, order);
        } else {
            Sorting::quickSort(contacts, 0, contacts.size() - 1, field, order);
        }
    }

    json jArray = json::array();
    for (const auto& c : contacts) {
        jArray.push_back(contactToJson(c));
    }
    return {{"contacts", jArray}};
}

json handleGetRecent(const json& params) {
    int k = params.value("limit", 5);
    
    // Priority Queue: extracts top K elements
    std::vector<Contact> topK = interactionPQ.getTopK(k);
    
    json jArray = json::array();
    for (const auto& c : topK) {
        jArray.push_back(contactToJson(c));
    }
    return {{"contacts", jArray}};
}

json handleGetHistory() {
    // Queue: FIFO list
    std::vector<std::string> history = searchHistoryQueue.getAll();
    return {{"history", history}};
}

json handleCheckDuplicate(const json& params) {
    std::string phone = params.value("phone", "");
    std::string email = params.value("email", "");

    bool phoneExists = phoneMap.exists(phone);
    bool emailExists = !email.empty() && emailMap.exists(email);

    return {
        {"duplicate", phoneExists || emailExists},
        {"details", {
            {"phone", phoneExists},
            {"email", emailExists}
        }}
    };
}

int main() {
    std::string line;
    // Process JSON lines over stdio
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;

        try {
            json request = json::parse(line);
            std::string command = request.value("command", "");
            json params = request.value("params", json::object());
            json response;

            if (command == "load") {
                response = handleLoad(params);
            } else if (command == "insert") {
                response = handleInsert(params);
            } else if (command == "search") {
                response = handleSearch(params);
            } else if (command == "delete") {
                response = handleDelete(params);
            } else if (command == "undo") {
                response = handleUndo();
            } else if (command == "getSorted") {
                response = handleGetSorted(params);
            } else if (command == "getRecent") {
                response = handleGetRecent(params);
            } else if (command == "getHistory") {
                response = handleGetHistory();
            } else if (command == "checkDuplicate") {
                response = handleCheckDuplicate(params);
            } else if (command == "ping") {
                response = {{"status", "pong"}};
            } else {
                response = {{"status", "error"}, {"message", "Unknown command: " + command}};
            }

            // Print response back as a single line JSON
            std::cout << response.dump() << std::endl;
        } catch (const std::exception& e) {
            json errorResponse = {{"status", "error"}, {"message", std::string("Exception: ") + e.what()}};
            std::cout << errorResponse.dump() << std::endl;
        }
    }
    return 0;
}
