#ifndef STACK_H
#define STACK_H

#include "Contact.h"
#include <vector>
#include <stdexcept>

class Stack {
private:
    std::vector<Contact> data;
    int maxSize;

public:
    Stack(int capacity = 20);

    // Push deleted contact to stack
    void push(const Contact& contact);

    // Pop and retrieve last deleted contact
    Contact pop();

    // View last deleted contact without removing it
    Contact peek() const;

    bool isEmpty() const;
    int size() const;
    void clear();
};

#endif // STACK_H
