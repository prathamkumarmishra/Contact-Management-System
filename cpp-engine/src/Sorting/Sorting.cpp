#include "Sorting.h"
#include <algorithm>
#include <cctype>

// Normalize case helper for comparisons
static std::string lowercase(std::string str) {
    std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c) {
        return std::tolower(c);
    });
    return str;
}

bool Sorting::compare(const Contact& a, const Contact& b, const std::string& field, const std::string& order) {
    bool isAsc = (order == "asc");
    
    if (field == "firstName" || field == "name") {
        std::string nameA = lowercase(a.getFullName());
        std::string nameB = lowercase(b.getFullName());
        return isAsc ? (nameA < nameB) : (nameA > nameB);
    }
    
    if (field == "company") {
        std::string compA = lowercase(a.company);
        std::string compB = lowercase(b.company);
        return isAsc ? (compA < compB) : (compA > compB);
    }
    
    if (field == "birthday") {
        // If birthday is empty, treat as infinite (push to bottom)
        if (a.birthday.empty()) return false;
        if (b.birthday.empty()) return true;
        return isAsc ? (a.birthday < b.birthday) : (a.birthday > b.birthday);
    }

    if (field == "lastContacted") {
        if (a.lastContacted.empty()) return false;
        if (b.lastContacted.empty()) return true;
        return isAsc ? (a.lastContacted < b.lastContacted) : (a.lastContacted > b.lastContacted);
    }

    if (field == "contactCount") {
        return isAsc ? (a.contactCount < b.contactCount) : (a.contactCount > b.contactCount);
    }

    // Default: Sort by created date
    return isAsc ? (a.createdAt < b.createdAt) : (a.createdAt > b.createdAt);
}

void Sorting::merge(std::vector<Contact>& contacts, int left, int mid, int right, const std::string& field, const std::string& order) {
    int n1 = mid - left + 1;
    int n2 = right - mid;

    std::vector<Contact> L(n1);
    std::vector<Contact> R(n2);

    for (int i = 0; i < n1; i++) L[i] = contacts[left + i];
    for (int i = 0; i < n2; i++) R[i] = contacts[mid + 1 + i];

    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (compare(L[i], R[j], field, order)) {
            contacts[k] = L[i];
            i++;
        } else {
            contacts[k] = R[j];
            j++;
        }
        k++;
    }

    while (i < n1) {
        contacts[k] = L[i];
        i++;
        k++;
    }

    while (j < n2) {
        contacts[k] = R[j];
        j++;
        k++;
    }
}

void Sorting::mergeSort(std::vector<Contact>& contacts, int left, int right, const std::string& field, const std::string& order) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    mergeSort(contacts, left, mid, field, order);
    mergeSort(contacts, mid + 1, right, field, order);
    merge(contacts, left, mid, right, field, order);
}

int Sorting::partition(std::vector<Contact>& contacts, int low, int high, const std::string& field, const std::string& order) {
    Contact pivot = contacts[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (compare(contacts[j], pivot, field, order)) {
            i++;
            std::swap(contacts[i], contacts[j]);
        }
    }
    std::swap(contacts[i + 1], contacts[high]);
    return i + 1;
}

void Sorting::quickSort(std::vector<Contact>& contacts, int low, int high, const std::string& field, const std::string& order) {
    if (low < high) {
        int pi = partition(contacts, low, high, field, order);
        quickSort(contacts, low, pi - 1, field, order);
        quickSort(contacts, pi + 1, high, field, order);
    }
}
