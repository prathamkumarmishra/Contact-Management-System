#ifndef SEARCH_H
#define SEARCH_H

#include "Contact.h"
#include <vector>
#include <string>

class Search {
public:
    // Binary Search on a sorted contact vector by name. Returns index of match or -1.
    static int binarySearch(const std::vector<Contact>& sortedContacts, const std::string& targetName);

    // Range search: returns all contacts with names starting within [startRange, endRange]
    static std::vector<Contact> rangeSearch(const std::vector<Contact>& sortedContacts, 
                                            const std::string& startRange, 
                                            const std::string& endRange);
};

#endif // SEARCH_H
