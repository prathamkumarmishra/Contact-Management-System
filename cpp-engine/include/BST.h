#ifndef BST_H
#define BST_H

#include "Contact.h"
#include <memory>
#include <vector>

class BSTNode {
public:
    Contact data;
    std::shared_ptr<BSTNode> left;
    std::shared_ptr<BSTNode> right;

    BSTNode(const Contact& contact);
};

class BST {
private:
    std::shared_ptr<BSTNode> root;
    int nodeCount;

    std::shared_ptr<BSTNode> insertNode(std::shared_ptr<BSTNode> node, const Contact& contact);
    std::shared_ptr<BSTNode> removeNode(std::shared_ptr<BSTNode> node, const std::string& contactId, const std::string& sortName);
    std::shared_ptr<BSTNode> findMinNode(std::shared_ptr<BSTNode> node) const;
    void inorder(const std::shared_ptr<BSTNode>& node, std::vector<Contact>& result) const;
    void rangeHelper(const std::shared_ptr<BSTNode>& node, const std::string& start, const std::string& end, std::vector<Contact>& result) const;

public:
    BST();
    
    // Insert contact
    void insert(const Contact& contact);
    
    // Remove contact
    void remove(const std::string& contactId, const std::string& sortName);
    
    // Get alphabetically sorted contacts
    std::vector<Contact> inorderTraversal() const;
    
    // Get contacts in range (e.g. names starting A to M)
    std::vector<Contact> rangeQuery(const std::string& start, const std::string& end) const;

    int size() const;
    void clear();
};

#endif // BST_H
