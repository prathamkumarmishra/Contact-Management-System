#include "Queue.h"
#include <algorithm>

Queue::Queue(int capacity) : maxSize(capacity) {}

void Queue::enqueue(const std::string& query) {
    if (query.empty()) return;

    // Check if query already exists in the recent history, move it to the end
    auto it = std::find(data.begin(), data.end(), query);
    if (it != data.end()) {
        data.erase(it);
    }

    // Evict oldest query (index 0) if size matches limit
    if (data.size() >= static_cast<size_t>(maxSize)) {
        data.erase(data.begin());
    }

    data.push_back(query);
}

std::string Queue::dequeue() {
    if (isEmpty()) {
        throw std::underflow_error("Queue is empty. Cannot dequeue.");
    }
    std::string val = data.front();
    data.erase(data.begin());
    return val;
}

std::string Queue::front() const {
    if (isEmpty()) {
        throw std::underflow_error("Queue is empty. Cannot read front.");
    }
    return data.front();
}

bool Queue::isEmpty() const {
    return data.empty();
}

int Queue::size() const {
    return data.size();
}

void Queue::clear() {
    data.clear();
}

std::vector<std::string> Queue::getAll() const {
    // Return copy of the list. We reverse it so that the most recent search is index 0
    std::vector<std::string> reversed = data;
    std::reverse(reversed.begin(), reversed.end());
    return reversed;
}
