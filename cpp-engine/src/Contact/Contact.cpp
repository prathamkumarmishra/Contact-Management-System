#include "Contact.h"

Contact::Contact() 
    : isFavorite(false), isBlocked(false), contactCount(0) {}

std::string Contact::getFullName() const {
    return firstName + " " + lastName;
}

bool Contact::operator<(const Contact& other) const {
    // Sort primarily by first name, secondary by last name
    if (firstName != other.firstName) {
        return firstName < other.firstName;
    }
    return lastName < other.lastName;
}

bool Contact::operator==(const Contact& other) const {
    return id == other.id;
}
