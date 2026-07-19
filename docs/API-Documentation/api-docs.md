# API Documentation

## Smart Contact Management System — REST API Reference

**Base URL**: `http://localhost:5000/api/v1`

**Authentication**: All protected endpoints require a `Bearer` token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

---

## Table of Contents

- [Authentication](#authentication)
- [Contacts](#contacts)
- [Search](#search)
- [Dashboard & Analytics](#dashboard--analytics)
- [Import / Export](#import--export)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication

### Register User

```http
POST /auth/register
```

**Access**: Public

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Validation Rules**:
| Field | Rules |
|---|---|
| `firstName` | Required, 2-50 characters, letters only |
| `lastName` | Required, 2-50 characters, letters only |
| `email` | Required, valid email format, unique |
| `password` | Required, min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false
    }
  }
}
```

**Error Responses**:
| Code | Condition |
|---|---|
| `400` | Validation errors |
| `409` | Email already registered |

---

### Login

```http
POST /auth/login
```

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "avatar": "https://res.cloudinary.com/...",
      "isVerified": true
    }
  }
}
```

> **Note**: The refresh token is set as an `httpOnly` cookie named `refreshToken` with `SameSite=Strict`.

**Error Responses**:
| Code | Condition |
|---|---|
| `400` | Missing email or password |
| `401` | Invalid credentials |
| `403` | Email not verified |

---

### Refresh Access Token

```http
POST /auth/refresh
```

**Access**: Requires valid refresh token cookie

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Logout

```http
POST /auth/logout
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

> Clears the refresh token cookie and invalidates the token in the database.

---

### Forgot Password

```http
POST /auth/forgot-password
```

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

---

### Verify OTP

```http
POST /auth/verify-otp
```

**Access**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "otp": "482917"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "OTP verified",
  "data": {
    "resetToken": "temp_reset_token_..."
  }
}
```

---

### Reset Password

```http
POST /auth/reset-password
```

**Access**: Public (requires reset token from OTP verification)

**Request Body**:
```json
{
  "resetToken": "temp_reset_token_...",
  "newPassword": "NewSecureP@ss456"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Verify Email

```http
GET /auth/verify-email/:token
```

**Access**: Public

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### Get Current User

```http
GET /auth/me
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "avatar": "https://res.cloudinary.com/...",
      "isVerified": true,
      "lastLogin": "2026-07-09T10:30:00.000Z",
      "createdAt": "2026-06-15T08:00:00.000Z"
    }
  }
}
```

---

### Update Profile

```http
PUT /auth/profile
```

**Access**: JWT Required

**Request Body** (multipart/form-data):
```
firstName: "John"
lastName: "Doe"
avatar: <file>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "user": { ... }
  }
}
```

---

## Contacts

### Create Contact

```http
POST /contacts
```

**Access**: JWT Required

**Request Body** (multipart/form-data):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1-555-0123",
  "email": "jane@company.com",
  "company": "TechCorp",
  "designation": "Senior Developer",
  "department": "Engineering",
  "category": "work",
  "address": "123 Tech Street",
  "city": "San Francisco",
  "state": "California",
  "country": "USA",
  "zipCode": "94105",
  "website": "https://janesmith.dev",
  "linkedin": "https://linkedin.com/in/janesmith",
  "birthday": "1990-05-15",
  "notes": "Met at React Conf 2025",
  "tags": ["developer", "react", "conference"],
  "isFavorite": true,
  "profilePhoto": "<file>"
}
```

**Validation Rules**:
| Field | Rules |
|---|---|
| `firstName` | Required, 2-50 chars |
| `lastName` | Required, 2-50 chars |
| `phone` | Required, valid phone format |
| `email` | Optional, valid email format |
| `company` | Optional, max 100 chars |
| `category` | Enum: `personal`, `work`, `family`, `friend`, `other` |
| `website` | Optional, valid URL |
| `linkedin` | Optional, valid URL |
| `birthday` | Optional, valid date (past) |
| `notes` | Optional, max 500 chars |
| `tags` | Optional, array of strings (max 10) |
| `profilePhoto` | Optional, image file (max 5MB, jpg/png/webp) |

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": {
    "contact": {
      "id": "64b2c3d4e5f6a7b8c9d0e1f2",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+1-555-0123",
      "email": "jane@company.com",
      "company": "TechCorp",
      "profilePhoto": "https://res.cloudinary.com/...",
      "category": "work",
      "isFavorite": true,
      "isBlocked": false,
      "tags": ["developer", "react", "conference"],
      "createdAt": "2026-07-09T11:00:00.000Z",
      "updatedAt": "2026-07-09T11:00:00.000Z"
    }
  }
}
```

---

### List Contacts

```http
GET /contacts
```

**Access**: JWT Required

**Query Parameters**:
| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | Number | 1 | Page number |
| `limit` | Number | 20 | Items per page (max 100) |
| `sort` | String | `-createdAt` | Sort field (prefix `-` for descending) |
| `category` | String | — | Filter by category |
| `company` | String | — | Filter by company |
| `city` | String | — | Filter by city |
| `isFavorite` | Boolean | — | Filter favorites only |
| `isBlocked` | Boolean | — | Filter blocked only |
| `tags` | String | — | Comma-separated tag filter |

**Example**: `GET /contacts?page=1&limit=10&sort=firstName&category=work&city=San Francisco`

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "contacts": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "totalPages": 16,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### Get Single Contact

```http
GET /contacts/:id
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "contact": { ... }
  }
}
```

**Error**: `404` if not found or doesn't belong to user.

---

### Update Contact

```http
PUT /contacts/:id
```

**Access**: JWT Required

**Request Body**: Same fields as Create (all optional — partial update supported).

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "contact": { ... }
  }
}
```

---

### Delete Contact (Soft Delete)

```http
DELETE /contacts/:id
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Contact moved to trash",
  "data": {
    "contact": {
      "id": "...",
      "isDeleted": true,
      "deletedAt": "2026-07-09T11:30:00.000Z"
    }
  }
}
```

> The contact is pushed to the C++ Stack for undo capability.

---

### Restore Contact

```http
POST /contacts/:id/restore
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Contact restored",
  "data": {
    "contact": { ... }
  }
}
```

---

### Bulk Delete

```http
DELETE /contacts/bulk
```

**Access**: JWT Required

**Request Body**:
```json
{
  "contactIds": [
    "64b2c3d4e5f6a7b8c9d0e1f2",
    "64b2c3d4e5f6a7b8c9d0e1f3",
    "64b2c3d4e5f6a7b8c9d0e1f4"
  ]
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "3 contacts moved to trash",
  "data": {
    "deletedCount": 3
  }
}
```

---

### Toggle Favorite

```http
PUT /contacts/:id/favorite
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Contact marked as favorite",
  "data": {
    "isFavorite": true
  }
}
```

---

### Toggle Block

```http
PUT /contacts/:id/block
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Contact blocked",
  "data": {
    "isBlocked": true
  }
}
```

---

### Get Favorites

```http
GET /contacts/favorites
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "contacts": [ ... ],
    "total": 12
  }
}
```

---

### Get Trash

```http
GET /contacts/trash
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "contacts": [ ... ],
    "total": 5
  }
}
```

---

### Detect Duplicates

```http
GET /contacts/duplicates
```

**Access**: JWT Required

> Uses the C++ HashMap engine to find contacts with matching phone numbers or email addresses.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "duplicateGroups": [
      {
        "field": "phone",
        "value": "+1-555-0123",
        "contacts": [
          { "id": "...", "firstName": "Jane", "lastName": "Smith" },
          { "id": "...", "firstName": "J.", "lastName": "Smith" }
        ]
      }
    ],
    "totalDuplicates": 3
  }
}
```

---

## Search

### Autocomplete

```http
GET /search/autocomplete?q=Jo&limit=10
```

**Access**: JWT Required

> Uses the C++ Trie engine for O(L) prefix traversal.

**Query Parameters**:
| Parameter | Type | Default | Description |
|---|---|---|---|
| `q` | String | Required | Search prefix (min 1 char) |
| `limit` | Number | 10 | Max suggestions |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      { "id": "...", "name": "John Doe", "company": "TechCorp" },
      { "id": "...", "name": "John Smith", "company": "DataInc" },
      { "id": "...", "name": "Joseph Brown", "company": "WebCo" }
    ],
    "engineTime": "0.2ms"
  }
}
```

---

### Global Search

```http
GET /search?q=John+Doe&category=work&city=San+Francisco
```

**Access**: JWT Required

**Query Parameters**:
| Parameter | Type | Description |
|---|---|---|
| `q` | String | Full search query |
| `category` | String | Filter by category |
| `company` | String | Filter by company |
| `city` | String | Filter by city |
| `isFavorite` | Boolean | Filter favorites |
| `page` | Number | Pagination |
| `limit` | Number | Items per page |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "contacts": [ ... ],
    "total": 3,
    "query": "John Doe",
    "filters": { "category": "work", "city": "San Francisco" }
  }
}
```

---

### Search History

```http
GET /search/history
```

**Access**: JWT Required

> Returns the last 20 searches from the C++ Queue (FIFO).

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "history": [
      { "query": "John Doe", "resultCount": 3, "createdAt": "..." },
      { "query": "TechCorp", "resultCount": 8, "createdAt": "..." }
    ]
  }
}
```

---

## Dashboard & Analytics

### Dashboard Summary

```http
GET /dashboard
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "totalContacts": 1247,
    "favorites": 89,
    "blocked": 12,
    "addedThisMonth": 34,
    "addedThisWeek": 8,
    "trashCount": 5,
    "categoryCounts": {
      "personal": 320,
      "work": 580,
      "family": 150,
      "friend": 180,
      "other": 17
    },
    "recentContacts": [ ... ],
    "recentActivity": [ ... ]
  }
}
```

---

### Detailed Statistics

```http
GET /dashboard/statistics
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "mostContacted": [ ... ],
    "topCompanies": [
      { "company": "TechCorp", "count": 45 },
      { "company": "DataInc", "count": 32 }
    ],
    "favoriteRatio": 7.1,
    "blockedRatio": 0.9,
    "averageContactsPerMonth": 28,
    "contactsWithEmail": 89.2,
    "contactsWithPhoto": 45.6
  }
}
```

---

### Chart Data

```http
GET /dashboard/charts
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "categoryDistribution": {
      "labels": ["Personal", "Work", "Family", "Friend", "Other"],
      "values": [320, 580, 150, 180, 17]
    },
    "monthlyGrowth": {
      "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      "values": [22, 31, 28, 45, 38, 34, 8]
    },
    "topCompanies": {
      "labels": ["TechCorp", "DataInc", "WebCo", "StartupX", "BigOrg"],
      "values": [45, 32, 28, 21, 18]
    }
  }
}
```

---

### Activity Timeline

```http
GET /dashboard/activity?limit=20
```

**Access**: JWT Required

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "...",
        "action": "create",
        "description": "Created contact Jane Smith",
        "timestamp": "2026-07-09T11:00:00.000Z"
      },
      {
        "id": "...",
        "action": "delete",
        "description": "Deleted contact Bob Jones",
        "timestamp": "2026-07-09T10:45:00.000Z"
      }
    ]
  }
}
```

---

## Import / Export

### Import Contacts

```http
POST /contacts/import
```

**Access**: JWT Required

**Request** (multipart/form-data):
```
file: <contacts.csv | contacts.xlsx | contacts.json>
```

**Supported Formats**:
| Format | MIME Type | Max Size |
|---|---|---|
| CSV | `text/csv` | 10MB |
| Excel | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | 10MB |
| JSON | `application/json` | 10MB |

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "imported": 45,
    "skipped": 3,
    "duplicates": 2,
    "errors": [
      { "row": 12, "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

---

### Export Contacts

```http
GET /contacts/export/:format
```

**Access**: JWT Required

**Path Parameters**:
| Parameter | Values |
|---|---|
| `format` | `csv`, `excel`, `pdf`, `json` |

**Query Parameters**:
| Parameter | Type | Description |
|---|---|---|
| `category` | String | Filter by category before export |
| `isFavorite` | Boolean | Export only favorites |
| `ids` | String | Comma-separated IDs for selective export |

**Response**: File download with appropriate `Content-Type` and `Content-Disposition` headers.

---

## Error Handling

All error responses follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes

| HTTP Status | Error Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Input validation failed |
| `401` | `UNAUTHORIZED` | Missing or invalid token |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `404` | `NOT_FOUND` | Resource not found |
| `409` | `CONFLICT` | Duplicate resource |
| `429` | `RATE_LIMITED` | Too many requests |
| `500` | `INTERNAL_ERROR` | Server error |

---

## Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| Auth endpoints | 5 requests | 15 minutes |
| Contact CRUD | 100 requests | 15 minutes |
| Search | 60 requests | 1 minute |
| Import/Export | 10 requests | 15 minutes |
| Dashboard | 30 requests | 1 minute |

Rate limit headers are included in every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1720523400
```
