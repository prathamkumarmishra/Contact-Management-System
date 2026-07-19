#include "PriorityQueue.h"
#include <algorithm>

PriorityQueue::PriorityQueue() {}

void PriorityQueue::heapifyUp(int index) {
    while (index > 0 && heap[parent(index)].second < heap[index].second) {
        std::swap(heap[parent(index)], heap[index]);
        index = parent(index);
    }
}

void PriorityQueue::heapifyDown(int index) {
    int maxIndex = index;
    int left = leftChild(index);
    int right = rightChild(index);
    int s = heap.size();

    if (left < s && heap[left].second > heap[maxIndex].second) {
        maxIndex = left;
    }
    if (right < s && heap[right].second > heap[maxIndex].second) {
        maxIndex = right;
    }

    if (index != maxIndex) {
        std::swap(heap[index], heap[maxIndex]);
        heapifyDown(maxIndex);
    }
}

void PriorityQueue::insert(const Contact& contact, int priority) {
    heap.push_back({contact, priority});
    heapifyUp(heap.size() - 1);
}

Contact PriorityQueue::extractMax() {
    if (isEmpty()) {
        throw std::underflow_error("Priority Queue is empty. Cannot extract.");
    }
    Contact result = heap[0].first;
    heap[0] = heap.back();
    heap.pop_back();
    if (!heap.empty()) {
        heapifyDown(0);
    }
    return result;
}

Contact PriorityQueue::peekMax() const {
    if (isEmpty()) {
        throw std::underflow_error("Priority Queue is empty. Cannot peek.");
    }
    return heap[0].first;
}

bool PriorityQueue::isEmpty() const {
    return heap.empty();
}

int PriorityQueue::size() const {
    return heap.size();
}

void PriorityQueue::clear() {
    heap.clear();
}

std::vector<Contact> PriorityQueue::getTopK(int k) {
    std::vector<Contact> topK;
    // Create copy of heap to extract elements without modifying original PQ
    PriorityQueue tempPQ = *this;

    int limit = std::min(k, tempPQ.size());
    for (int i = 0; i < limit; i++) {
        topK.push_back(tempPQ.extractMax());
    }

    return topK;
}
