# Application Flowcharts

## Smart Contact Management System — User & System Flows

---

## 1. Main Application Flow

```mermaid
flowchart TD
    A["🌐 Landing Page"] --> B{"User Authenticated?"}
    B -->|No| C["🔐 Login Page"]
    B -->|Yes| D["📊 Dashboard"]

    C --> E["📝 Register"]
    C --> F["🔑 Forgot Password"]
    C --> G["✅ Login Success"]

    E --> H["📧 Email Verification"]
    H --> G

    F --> I["📱 OTP Verification"]
    I --> J["🔒 Reset Password"]
    J --> C

    G --> D

    D --> K["👥 Contacts"]
    D --> L["📈 Statistics"]
    D --> M["⚙️ Settings"]
    D --> N["👤 Profile"]

    K --> O["➕ Add Contact"]
    K --> P["✏️ Edit Contact"]
    K --> Q["🗑️ Delete Contact"]
    K --> R["🔍 Search"]
    K --> S["📥 Import"]
    K --> T["📤 Export"]

    Q --> U["♻️ Undo Delete"]
```

---

## 2. Authentication Flow

```mermaid
flowchart TD
    A["User submits credentials"] --> B["POST /api/v1/auth/login"]
    B --> C{"Valid credentials?"}

    C -->|No| D["Return 401 Unauthorized"]
    C -->|Yes| E["Generate JWT Access Token (15 min)"]

    E --> F["Generate Refresh Token (7 days)"]
    F --> G["Store refresh token in DB"]
    G --> H["Set refresh token as httpOnly cookie"]
    H --> I["Return access token + user data"]

    I --> J["Frontend stores token in Redux"]
    J --> K["Axios interceptor attaches token"]

    K --> L{"Token expired?"}
    L -->|No| M["API request succeeds"]
    L -->|Yes| N["POST /api/v1/auth/refresh"]

    N --> O{"Refresh token valid?"}
    O -->|Yes| P["Issue new access token"]
    O -->|No| Q["Redirect to Login"]

    P --> K
```

---

## 3. Contact CRUD Flow

```mermaid
flowchart TD
    A["User action on Contact"] --> B{"Action Type"}

    B -->|Create| C["Fill ContactForm"]
    C --> D["Validate with Zod"]
    D --> E{"Valid?"}
    E -->|No| F["Show validation errors"]
    E -->|Yes| G["POST /api/v1/contacts"]
    G --> H["Check duplicates via C++ HashMap"]
    H --> I{"Duplicate found?"}
    I -->|Yes| J["Warn user, offer merge"]
    I -->|No| K["Save to MongoDB"]
    K --> L["Insert into C++ Trie"]
    L --> M["Insert into C++ BST"]
    M --> N["Log activity"]
    N --> O["Return success + toast"]

    B -->|Read| P["GET /api/v1/contacts"]
    P --> Q["Fetch from MongoDB"]
    Q --> R["Render ContactList / ContactCard"]

    B -->|Update| S["Fill form with existing data"]
    S --> T["PUT /api/v1/contacts/:id"]
    T --> U["Update MongoDB + C++ structures"]
    U --> N

    B -->|Delete| V["DELETE /api/v1/contacts/:id"]
    V --> W["Soft delete (isDeleted = true)"]
    W --> X["Push to C++ Stack (undo)"]
    X --> Y["Show toast with Undo button"]
    Y --> Z{"User clicks Undo?"}
    Z -->|Yes| AA["Pop from C++ Stack"]
    AA --> AB["Restore contact (isDeleted = false)"]
    Z -->|No| AC["Contact stays in trash"]
```

---

## 4. Search Flow (C++ Trie Engine)

```mermaid
flowchart TD
    A["User types in search bar"] --> B["Debounce input (300ms)"]
    B --> C["GET /api/v1/search/autocomplete?q=prefix"]

    C --> D["Backend receives query"]
    D --> E["Send to C++ Engine via stdin"]
    E --> F["C++ Trie: traverse prefix"]

    F --> G{"Prefix exists?"}
    G -->|No| H["Return empty results"]
    G -->|Yes| I["Collect all words under prefix node"]

    I --> J["Return sorted suggestions (max 10)"]
    J --> K["Backend receives JSON response"]
    K --> L["Return to frontend"]

    L --> M["Render autocomplete dropdown"]
    M --> N{"User selects suggestion?"}

    N -->|Yes| O["Execute full search"]
    N -->|No| P["Continue typing"]

    O --> Q["Enqueue query to C++ Queue (history)"]
    Q --> R["Fetch matching contacts from MongoDB"]
    R --> S["Display results"]
```

---

## 5. Import/Export Flow

```mermaid
flowchart TD
    A["User clicks Import"] --> B["Select file (CSV/Excel/JSON)"]
    B --> C["Upload via Multer"]
    C --> D["Parse file contents"]
    D --> E["Validate each contact"]

    E --> F{"All valid?"}
    F -->|No| G["Return validation errors with row numbers"]
    F -->|Yes| H["Check duplicates via C++ HashMap"]

    H --> I["Insert non-duplicate contacts"]
    I --> J["Update C++ Trie & BST"]
    J --> K["Log import activity"]
    K --> L["Return success with count"]

    M["User clicks Export"] --> N["Select format"]
    N --> O{"Format?"}
    O -->|CSV| P["Generate CSV string"]
    O -->|Excel| Q["Generate XLSX with exceljs"]
    O -->|PDF| R["Generate PDF with pdfkit"]
    O -->|JSON| S["Serialize contacts array"]

    P --> T["Download file"]
    Q --> T
    R --> T
    S --> T
```

---

## 6. Dashboard Data Flow

```mermaid
flowchart TD
    A["User navigates to Dashboard"] --> B["GET /api/v1/dashboard"]
    B --> C["Aggregate statistics from MongoDB"]

    C --> D["Total Contacts"]
    C --> E["Favorites Count"]
    C --> F["Blocked Count"]
    C --> G["This Month Added"]

    B --> H["GET /api/v1/dashboard/charts"]
    H --> I["Category distribution (Pie)"]
    H --> J["Monthly growth (Line)"]
    H --> K["Top companies (Bar)"]

    B --> L["GET /api/v1/dashboard/activity"]
    L --> M["Recent 20 activities"]

    D --> N["Render StatCards with animated counters"]
    E --> N
    F --> N
    G --> N

    I --> O["Render Chart.js components"]
    J --> O
    K --> O

    M --> P["Render Activity Timeline"]
```
