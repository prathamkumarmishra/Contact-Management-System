#include "Search.h"
#include <algorithm>
#include <cctype>

static std::string lowercase(std::string str) {
    std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    return str;
}

int Search::binarySearch(const std::vector<Contact>& sortedContacts, const std::string& targetName) {
    if (sortedContacts.empty() || targetName.empty()) return -1;

    std::string target = lowercase(targetName);
    int low = 0;
    int high = sortedContacts.size() - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        std::string midName = lowercase(sortedContacts[mid].getFullName());

        if (midName == target) {
            return mid;
        }
        
        if (midName < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1; // Not found
}

std::vector<Contact> Search::rangeSearch(const std::vector<Contact>& sortedContacts, 
                                        const std::string& startRange, 
                                        const std::string& endRange) {
    std::vector<Contact> results;
    if (sortedContacts.empty()) return results;

    std::string start = lowercase(startRange);
    std::string end = lowercase(endRange);

    // Find the first index where name >= start using binary search (lower bound)
    auto itStart = std::lower_bound(sortedContacts.begin(), sortedContacts.end(), start, 
        [](const Contact& contact, const std::string& val) {
            return lowercase(contact.getFullName()) < val;
        });

    // Find the first index where name > end using binary search (upper bound)
    auto itEnd = std::upper_bound(sortedContacts.begin(), sortedContacts.end(), end, 
        [](const std::string& val, const Contact& contact) {
            return val < lowercase(contact.getFullName());
        });

    // Copy range matches
    for (auto it = itStart; it != itEnd; ++it) {
        results.push_back(*it);
    }

    return results;
}
