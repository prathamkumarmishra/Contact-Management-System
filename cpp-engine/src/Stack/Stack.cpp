#include "Stack.h"

Stack::Stack(int capacity) : maxSize(capacity) {}

void Stack::push(const Contact& contact) {
    // If stack exceeds capacity, remove the oldest element (at index 0)
    if (data.size() >= static_cast<size_t>(maxSize)) {
        data.erase(data.begin());
    }
    data.push_back(contact);
}

Contact Stack::pop() {
    if (isEmpty()) {
        throw std::underflow_error("Stack is empty. Cannot pop.");
    }
    Contact last = data.back();
    data.pop_back();
    return last;
}

Contact Stack::peek() const {
    if (isEmpty()) {
        throw std::underflow_error("Stack is empty. Cannot peek.");
    }
    return data.back();
}

bool Stack::isEmpty() const {
    return data.empty();
}

int Stack::size() const {
    return data.size();
}

void Stack::clear() {
    data.clear();
}
