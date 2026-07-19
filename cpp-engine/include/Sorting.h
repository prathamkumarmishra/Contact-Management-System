#ifndef SORTING_H
#define SORTING_H

#include "Contact.h"
#include <vector>
#include <string>

class Sorting {
private:
    static bool compare(const Contact& a, const Contact& b, const std::string& field, const std::string& order);
    static void merge(std::vector<Contact>& contacts, int left, int mid, int right, const std::string& field, const std::string& order);
    static int partition(std::vector<Contact>& contacts, int low, int high, const std::string& field, const std::string& order);

public:
    // Stable Merge Sort - O(N log N) time, N space. Used for name/string fields.
    static void mergeSort(std::vector<Contact>& contacts, int left, int right, const std::string& field, const std::string& order = "asc");

    // In-place Quick Sort - O(N log N) avg time, log N space. Used for numeric/date fields.
    static void quickSort(std::vector<Contact>& contacts, int low, int high, const std::string& field, const std::string& order = "asc");
};

#endif // SORTING_H
