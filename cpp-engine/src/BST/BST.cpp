#include "BST.h"

BSTNode::BSTNode(const Contact& contact) : data(contact), left(nullptr), right(nullptr) {}

BST::BST() : root(nullptr), nodeCount(0) {}

std::shared_ptr<BSTNode> BST::insertNode(std::shared_ptr<BSTNode> node, const Contact& contact) {
    if (!node) {
        nodeCount++;
        return std::make_shared<BSTNode>(contact);
    }

    // Sort key is full name: firstName + " " + lastName
    std::string key = contact.getFullName();
    std::string nodeKey = node->data.getFullName();

    if (key < nodeKey) {
        node->left = insertNode(node->left, contact);
    } else {
        node->right = insertNode(node->right, contact);
    }

    return node;
}

void BST::insert(const Contact& contact) {
    root = insertNode(root, contact);
}

std::shared_ptr<BSTNode> BST::findMinNode(std::shared_ptr<BSTNode> node) const {
    auto current = node;
    while (current && current->left) {
        current = current->left;
    }
    return current;
}

std::shared_ptr<BSTNode> BST::removeNode(std::shared_ptr<BSTNode> node, const std::string& contactId, const std::string& sortName) {
    if (!node) return nullptr;

    std::string nodeKey = node->data.getFullName();

    if (sortName < nodeKey) {
        node->left = removeNode(node->left, contactId, sortName);
    } else if (sortName > nodeKey) {
        node->right = removeNode(node->right, contactId, sortName);
    } else {
        // Node key matches the sortName. But there could be duplicates with the same name,
        // so we check if this node matches the unique contact ID.
        if (node->data.id != contactId) {
            // Traverse right to find potential duplicate name keys
            node->right = removeNode(node->right, contactId, sortName);
            return node;
        }

        // We found the correct node to delete.
        nodeCount--;

        // Case 1: No child or 1 child
        if (!node->left) {
            return node->right;
        } else if (!node->right) {
            return node->left;
        }

        // Case 2: 2 children. Find in-order successor (min in right subtree)
        auto successor = findMinNode(node->right);
        node->data = successor->data;
        node->right = removeNode(node->right, successor->data.id, successor->data.getFullName());
    }
    return node;
}

void BST::remove(const std::string& contactId, const std::string& sortName) {
    root = removeNode(root, contactId, sortName);
}

void BST::inorder(const std::shared_ptr<BSTNode>& node, std::vector<Contact>& result) const {
    if (!node) return;
    inorder(node->left, result);
    result.push_back(node->data);
    inorder(node->right, result);
}

std::vector<Contact> BST::inorderTraversal() const {
    std::vector<Contact> result;
    inorder(root, result);
    return result;
}

void BST::rangeHelper(const std::shared_ptr<BSTNode>& node, const std::string& start, const std::string& end, 
                      std::vector<Contact>& result) const {
    if (!node) return;

    std::string nodeKey = node->data.getFullName();

    // If node value is greater than start, search left child
    if (nodeKey > start) {
        rangeHelper(node->left, start, end, result);
    }

    // If node value is within range, add to list
    if (nodeKey >= start && nodeKey <= end) {
        result.push_back(node->data);
    }

    // If node value is less than end, search right child
    if (nodeKey < end) {
        rangeHelper(node->right, start, end, result);
    }
}

std::vector<Contact> BST::rangeQuery(const std::string& start, const std::string& end) const {
    std::vector<Contact> result;
    rangeHelper(root, start, end, result);
    return result;
}

int BST::size() const {
    return nodeCount;
}

void BST::clear() {
    root = nullptr;
    nodeCount = 0;
}
