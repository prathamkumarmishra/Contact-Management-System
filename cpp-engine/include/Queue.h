#ifndef QUEUE_H
#define QUEUE_H

#include <string>
#include <vector>
#include <stdexcept>

class Queue {
private:
    std::vector<std::string> data;
    int maxSize;

public:
    Queue(int capacity = 20);

    // Enqueue search query (FIFO)
    void enqueue(const std::string& query);

    // Dequeue search query
    std::string dequeue();

    // View front query
    std::string front() const;

    bool isEmpty() const;
    int size() const;
    void clear();
    
    // Retrieve all queries currently in queue
    std::vector<std::string> getAll() const;
};

#endif // QUEUE_H
