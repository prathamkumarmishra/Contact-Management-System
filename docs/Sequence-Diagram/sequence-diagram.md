# Sequence Diagrams

## Smart Contact Management System — Key Workflow Sequences

---

## 1. User Registration & Email Verification

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant MongoDB
    participant Nodemailer

    User->>Frontend: Fill registration form
    Frontend->>Frontend: Validate with Zod schema
    Frontend->>Backend: POST /api/v1/auth/register
    Backend->>Backend: Validate input (express-validator)
    Backend->>MongoDB: Check if email exists
    MongoDB-->>Backend: Email check result

    alt Email already exists
        Backend-->>Frontend: 409 Conflict
        Frontend-->>User: Show "Email already registered"
    else Email available
        Backend->>Backend: Hash password (bcrypt, 12 rounds)
        Backend->>Backend: Generate verification token
        Backend->>MongoDB: Create user document
        MongoDB-->>Backend: User created
        Backend->>Nodemailer: Send verification email
        Nodemailer-->>Backend: Email sent
        Backend-->>Frontend: 201 Created
        Frontend-->>User: Show "Check your email"
        User->>Frontend: Click verification link
        Frontend->>Backend: GET /api/v1/auth/verify-email/:token
        Backend->>MongoDB: Update isVerified = true
        Backend-->>Frontend: 200 Verified
        Frontend-->>User: Redirect to Login
    end
```

---

## 2. Login with JWT Token Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Redux
    participant Backend
    participant MongoDB

    User->>Frontend: Enter email & password
    Frontend->>Backend: POST /api/v1/auth/login

    Backend->>MongoDB: Find user by email
    MongoDB-->>Backend: User document

    alt User not found or invalid password
        Backend-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error toast
    else Valid credentials
        Backend->>Backend: Compare password (bcrypt)
        Backend->>Backend: Generate Access Token (JWT, 15min)
        Backend->>Backend: Generate Refresh Token (JWT, 7d)
        Backend->>MongoDB: Store refresh token
        Backend-->>Frontend: 200 OK { accessToken, user }
        Note right of Backend: Refresh token set as httpOnly cookie
        Frontend->>Redux: dispatch(setCredentials)
        Redux-->>Frontend: Auth state updated
        Frontend-->>User: Redirect to Dashboard
    end

    Note over Frontend,Backend: Later, when access token expires...

    Frontend->>Backend: API request (expired token)
    Backend-->>Frontend: 401 Token Expired

    Frontend->>Backend: POST /api/v1/auth/refresh
    Note right of Frontend: Sends httpOnly cookie automatically
    Backend->>Backend: Verify refresh token
    Backend->>Backend: Generate new access token
    Backend-->>Frontend: 200 OK { accessToken }
    Frontend->>Redux: Update token
    Frontend->>Backend: Retry original request
    Backend-->>Frontend: 200 OK (success)
```

---

## 3. Create Contact with Duplicate Detection

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant CppEngine as C++ Engine
    participant MongoDB

    User->>Frontend: Fill contact form
    Frontend->>Frontend: Validate with Zod
    Frontend->>Backend: POST /api/v1/contacts

    Backend->>Backend: Validate input
    Backend->>Backend: Authenticate JWT

    Backend->>CppEngine: {"action": "check_duplicate", "phone": "...", "email": "..."}
    CppEngine->>CppEngine: HashMap.exists(phone)
    CppEngine->>CppEngine: HashMap.exists(email)
    CppEngine-->>Backend: {"isDuplicate": false}

    alt Duplicate detected
        CppEngine-->>Backend: {"isDuplicate": true, "matchedId": "..."}
        Backend-->>Frontend: 409 Duplicate found
        Frontend-->>User: Show duplicate warning dialog
    else No duplicate
        Backend->>MongoDB: Create contact document
        MongoDB-->>Backend: Contact created

        Backend->>CppEngine: {"action": "index_contact", "contact": {...}}
        CppEngine->>CppEngine: Trie.insert(firstName)
        CppEngine->>CppEngine: Trie.insert(lastName)
        CppEngine->>CppEngine: BST.insert(contact)
        CppEngine->>CppEngine: HashMap.insert(phone, id)
        CppEngine->>CppEngine: HashMap.insert(email, id)
        CppEngine-->>Backend: {"status": "indexed"}

        Backend->>MongoDB: Log activity (create)
        Backend-->>Frontend: 201 Created
        Frontend-->>User: Show success toast
    end
```

---

## 4. Search with C++ Trie Autocomplete

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Debouncer
    participant Backend
    participant CppEngine as C++ Engine
    participant MongoDB

    User->>Frontend: Type "Jo" in search bar

    Frontend->>Debouncer: Set 300ms debounce
    Note right of Debouncer: Wait for user to stop typing

    Debouncer->>Backend: GET /api/v1/search/autocomplete?q=Jo

    Backend->>CppEngine: {"action": "autocomplete", "prefix": "Jo", "limit": 10}

    CppEngine->>CppEngine: Trie.findNode("Jo")
    CppEngine->>CppEngine: Collect all words below node
    CppEngine->>CppEngine: Sort results alphabetically
    CppEngine-->>Backend: {"results": ["John Doe", "John Smith", "Joseph Brown"], "time_ms": 0.2}

    Backend-->>Frontend: 200 OK { suggestions: [...] }
    Frontend-->>User: Show autocomplete dropdown

    User->>Frontend: Select "John Doe"

    Frontend->>Backend: GET /api/v1/search?q=John+Doe

    Backend->>CppEngine: {"action": "search_history_add", "query": "John Doe"}
    CppEngine->>CppEngine: Queue.enqueue("John Doe")

    Backend->>MongoDB: Find contacts matching "John Doe"
    MongoDB-->>Backend: Matching contacts

    Backend-->>Frontend: 200 OK { contacts: [...] }
    Frontend-->>User: Display search results
```

---

## 5. Delete & Undo with C++ Stack

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant CppEngine as C++ Engine
    participant MongoDB

    User->>Frontend: Click delete on contact

    Frontend->>Frontend: Show confirmation dialog
    User->>Frontend: Confirm delete

    Frontend->>Backend: DELETE /api/v1/contacts/:id

    Backend->>MongoDB: Find contact by ID
    MongoDB-->>Backend: Contact data

    Backend->>CppEngine: {"action": "push_undo", "contact": {...}}
    CppEngine->>CppEngine: Stack.push(contact)
    CppEngine-->>Backend: {"status": "pushed", "stackSize": 3}

    Backend->>MongoDB: Update isDeleted=true, deletedAt=now
    MongoDB-->>Backend: Updated

    Backend->>CppEngine: {"action": "remove_from_index", "contact": {...}}
    CppEngine->>CppEngine: Trie.remove(name)
    CppEngine->>CppEngine: BST.remove(name)
    CppEngine-->>Backend: {"status": "removed"}

    Backend->>MongoDB: Log activity (delete)
    Backend-->>Frontend: 200 OK { message: "Deleted" }
    Frontend-->>User: Show toast with "Undo" button

    alt User clicks Undo (within 10 seconds)
        User->>Frontend: Click "Undo"
        Frontend->>Backend: POST /api/v1/contacts/:id/restore

        Backend->>CppEngine: {"action": "pop_undo"}
        CppEngine->>CppEngine: Stack.pop()
        CppEngine-->>Backend: {"contact": {...}}

        Backend->>MongoDB: Update isDeleted=false, deletedAt=null
        MongoDB-->>Backend: Restored

        Backend->>CppEngine: {"action": "index_contact", "contact": {...}}
        CppEngine->>CppEngine: Re-index in Trie, BST, HashMap
        CppEngine-->>Backend: {"status": "indexed"}

        Backend-->>Frontend: 200 OK { contact: {...} }
        Frontend-->>User: Contact reappears in list
    else Undo timeout
        Note over Frontend: Toast disappears after 10s
        Note over Backend: Contact remains soft-deleted
        Note over Backend: Permanent delete after 30 days (background job)
    end
```

---

## 6. Dashboard Load Sequence

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant TanStackQuery as TanStack Query
    participant Backend
    participant MongoDB
    participant CppEngine as C++ Engine

    User->>Frontend: Navigate to Dashboard

    Frontend->>TanStackQuery: Check cache for dashboard data

    alt Cache hit (< 5 min old)
        TanStackQuery-->>Frontend: Return cached data
        Frontend-->>User: Render dashboard instantly
        Note right of TanStackQuery: Background refetch triggered
    else Cache miss
        par Parallel API calls
            TanStackQuery->>Backend: GET /api/v1/dashboard
            and
            TanStackQuery->>Backend: GET /api/v1/dashboard/charts
            and
            TanStackQuery->>Backend: GET /api/v1/dashboard/activity
        end

        Backend->>MongoDB: Aggregate: total, favorites, blocked, monthly
        MongoDB-->>Backend: Statistics

        Backend->>MongoDB: Aggregate: category distribution
        MongoDB-->>Backend: Pie chart data

        Backend->>MongoDB: Aggregate: monthly growth (last 12 months)
        MongoDB-->>Backend: Line chart data

        Backend->>MongoDB: Aggregate: top 10 companies
        MongoDB-->>Backend: Bar chart data

        Backend->>CppEngine: {"action": "get_recent", "limit": 5}
        CppEngine->>CppEngine: PriorityQueue.getTopK(5)
        CppEngine-->>Backend: Recently contacted list

        Backend->>MongoDB: Find recent 20 activity logs
        MongoDB-->>Backend: Activity timeline

        Backend-->>TanStackQuery: All responses
        TanStackQuery->>TanStackQuery: Cache responses (staleTime: 5 min)
        TanStackQuery-->>Frontend: Dashboard data ready

        Frontend-->>User: Render stats, charts, timeline
    end
```
