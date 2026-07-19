#ifndef CONTACT_H
#define CONTACT_H

#include <string>
#include <vector>

class Contact {
public:
    std::string id;
    std::string firstName;
    std::string lastName;
    std::string phone;
    std::string alternativePhone;
    std::string email;
    std::string company;
    std::string designation;
    std::string department;
    std::string category;
    std::string city;
    std::string state;
    std::string country;
    std::string zipCode;
    std::string website;
    std::string linkedin;
    std::string birthday;
    std::string notes;
    std::vector<std::string> tags;
    bool isFavorite;
    bool isBlocked;
    std::string lastContacted;
    int contactCount;
    std::string createdAt;

    Contact();
    
    // Helper to get full name
    std::string getFullName() const;
    
    // Overloaded operators for sorting and comparisons
    bool operator<(const Contact& other) const;
    bool operator==(const Contact& other) const;
};

#endif // CONTACT_H
