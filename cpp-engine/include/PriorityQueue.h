#ifndef PRIORITYQUEUE_H
#define PRIORITYQUEUE_H

#include "Contact.h"
#include <vector>
#include <stdexcept>
#include <utility>

class PriorityQueue {
private:
    // Store pair of <Contact, priorityValue>. priorityValue is interaction count or last contacted timestamp.
    std::vector<std::pair<Contact, int>> heap;

    void heapifyUp(int index);
    void heapifyDown(int index);
    
    int parent(int i) const { return (i - 1) / 2; }
    int leftChild(int i) const { return (2 * i) + 1; }
    int rightChild(int i) const { return (2 * i) + 2; }

public:
    PriorityQueue();

    // Insert contact with priority weight
    void insert(const Contact& contact, int priority);

    // Extract maximum priority contact
    Contact extractMax();

    // View maximum priority contact without extracting
    Contact peekMax() const;

    bool isEmpty() const;
    int size() const;
    void clear();

    // Get top K contacts based on priority weight
    std::vector<Contact> getTopK(int k);
};

#endif // PRIORITYQUEUE_H
