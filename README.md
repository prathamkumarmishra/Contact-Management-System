<div align="center">

# 🚀 Smart Contact Management System

### An Enterprise-Level Contact Management Platform powered by Modern Web Technologies and Advanced C++ Algorithms

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![C++](https://img.shields.io/badge/C++-17-00599C?style=for-the-badge&logo=cplusplus)](https://isocpp.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

A production-ready, portfolio-worthy Smart Contact Management System that combines **React 19 + TypeScript** frontend, **Node.js + Express + MongoDB** backend, and a **C++17 Algorithm Engine** for lightning-fast searching, sorting, and intelligent organization of thousands of contacts.

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [C++ Algorithm Engine](#-c-algorithm-engine)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication with access & refresh tokens
- Email verification with OTP
- Forgot password flow
- Role-based access control (Admin / User)

### 👥 Contact Management
- Full CRUD operations with rich contact profiles (25+ fields)
- Profile photo upload via Cloudinary CDN
- Favorites, blocking, and tagging
- Soft delete with undo/restore (powered by C++ Stack)
- Duplicate detection (powered by C++ HashMap)
- Bulk operations (delete, export)

### 🔍 Intelligent Search
- **Instant autocomplete** powered by C++ Trie data structure
- Prefix search with sub-millisecond response times
- Advanced filters (company, city, category, favorites)
- Search history tracking (powered by C++ Queue)

### 📊 Analytics Dashboard
- Real-time statistics with animated counters
- Interactive charts (Bar, Pie, Line) via Chart.js
- Contact growth trends, category distribution, favorite ratio
- Activity timeline with recent actions
- Top companies and most contacted insights

### 📥 Import / Export
- Import contacts from CSV, Excel, JSON
- Export to CSV, Excel, PDF, JSON

### 🎨 Premium UI/UX
- Dark / Light mode with system preference detection
- Glassmorphism, gradients, and micro-animations
- Responsive design (mobile, tablet, desktop)
- Skeleton loading states, empty states, error states
- Keyboard shortcuts for power users
- Toast notifications with undo actions

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│           React 19 + TypeScript + Tailwind               │
│           shadcn/ui + Framer Motion                      │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (Axios + TanStack Query)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                               │
│           Node.js + Express + MongoDB                    │
│           JWT + Socket.io + Cloudinary                   │
└────────┬────────────────────────────────┬───────────────┘
         │                                │
         ▼                                ▼
┌─────────────────┐          ┌────────────────────────────┐
│    MongoDB       │          │    C++ ALGORITHM ENGINE     │
│    Atlas         │          │    Trie · BST · HashMap     │
│                  │          │    Stack · Queue · Sort     │
│    Users         │          │    Binary Search · Graph    │
│    Contacts      │          │    Priority Queue           │
│    SearchHistory │          │                            │
│    ActivityLog   │          │    (child_process bridge)   │
└─────────────────┘          └────────────────────────────┘
```

The backend communicates with the C++ engine via **stdin/stdout JSON protocol** using Node.js `child_process`. This gives us the performance of compiled C++ for compute-heavy operations (search, sort, duplicate detection) while keeping the web stack in JavaScript/TypeScript.

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library with latest concurrent features |
| TypeScript | Type-safe development |
| Vite | Lightning-fast build tool |
| Tailwind CSS | Utility-first CSS framework |
| shadcn/ui | Premium accessible UI components |
| Framer Motion | Smooth animations & transitions |
| React Router | Client-side routing |
| React Hook Form + Zod | Form handling & validation |
| TanStack Query | Server state management & caching |
| Redux Toolkit | Client state management |
| Chart.js | Interactive charts & analytics |
| Axios | HTTP client with interceptors |
| Lucide React | Beautiful icon set |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM for MongoDB |
| JWT | Stateless authentication |
| bcrypt | Password hashing |
| Multer | File upload handling |
| Cloudinary | Image CDN & transformations |
| Nodemailer | Email service (OTP, verification) |
| Socket.io | Real-time communication |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| express-validator | Input validation |
| Morgan | HTTP request logging |
| Compression | Response compression |

### C++ Engine
| Technology | Purpose |
|---|---|
| C++17 | High-performance algorithm implementations |
| Trie | Autocomplete & prefix search |
| HashMap | O(1) duplicate detection |
| Merge Sort | Stable alphabetical sorting |
| Quick Sort | Fast numeric field sorting |
| Binary Search | O(log N) lookup in sorted data |
| Priority Queue | Recently contacted ranking |
| Stack | Undo delete operations |
| Queue | Search history (FIFO) |
| BST | Ordered storage & range queries |
| Graph | Relationship suggestions |

---

## 📁 Project Structure

```
Smart-Contact-Management-System/
├── frontend/                → React + TypeScript + Tailwind CSS
│   ├── public/
│   └── src/
│       ├── assets/          → Images, fonts, static files
│       ├── components/      → Reusable UI components
│       │   ├── common/      → Button, Modal, Input, Toast
│       │   ├── layout/      → Sidebar, Navbar, Footer
│       │   ├── forms/       → ContactForm, LoginForm
│       │   ├── dashboard/   → StatCard, ChartWidget
│       │   └── contacts/    → ContactCard, ContactList
│       ├── pages/           → Route-level page components
│       ├── hooks/           → Custom React hooks
│       ├── context/         → React context providers
│       ├── redux/           → Redux Toolkit store & slices
│       ├── services/        → Business logic services
│       ├── api/             → Axios instance & endpoints
│       ├── utils/           → Helper functions
│       ├── types/           → TypeScript type definitions
│       ├── constants/       → App constants & config
│       ├── styles/          → Global CSS & animations
│       └── routes/          → Router configuration
│
├── backend/                 → Node.js + Express + MongoDB
│   └── src/
│       ├── config/          → Database, Cloudinary, env config
│       ├── controllers/     → Request handlers
│       ├── routes/          → Express route definitions
│       ├── middleware/      → Auth, error handling, rate limiting
│       ├── models/          → Mongoose schemas
│       ├── services/        → Business logic layer
│       ├── repositories/    → Data access layer
│       ├── validators/      → Input validation schemas
│       ├── utils/           → Logger, response helpers
│       ├── sockets/         → Socket.io handlers
│       ├── jobs/            → Background jobs
│       ├── database/        → Seed data & migrations
│       └── cpp-engine/      → Node.js ↔ C++ bridge
│
├── cpp-engine/              → C++17 DSA Algorithms
│   ├── include/             → Header files
│   └── src/
│       ├── Trie/            → Autocomplete & prefix search
│       ├── BST/             → Alphabetical storage
│       ├── HashMap/         → Duplicate detection
│       ├── Stack/           → Undo delete
│       ├── Queue/           → Search history
│       ├── Sorting/         → Merge sort, Quick sort
│       ├── Search/          → Binary search
│       ├── Graph/           → Relationship suggestions
│       └── Contact/         → Contact data model
│
├── docs/                    → Documentation & Diagrams
├── postman/                 → API Collections
└── docker/                  → Docker configurations
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm 10+
- **MongoDB Atlas** account (or local MongoDB)
- **C++ compiler** with C++17 support (g++ 9+, clang 10+, MSVC 2019+)
- **CMake** 3.16+
- **Cloudinary** account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Smart-Contact-Management-System.git
   cd Smart-Contact-Management-System
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, Cloudinary keys, etc.
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Build C++ Engine**
   ```bash
   cd cpp-engine
   mkdir build && cd build
   cmake ..
   cmake --build .
   ```

5. **Open your browser**
   ```
   Frontend: http://localhost:5173
   Backend:  http://localhost:5000
   ```

---

## 📚 API Documentation

Full API documentation is available in [docs/API-Documentation/api-docs.md](docs/API-Documentation/api-docs.md).

### Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/contacts` | Create contact |
| GET | `/api/v1/contacts` | List contacts |
| GET | `/api/v1/contacts/:id` | Get contact |
| PUT | `/api/v1/contacts/:id` | Update contact |
| DELETE | `/api/v1/contacts/:id` | Delete contact |
| GET | `/api/v1/search/autocomplete` | Autocomplete (C++ Trie) |
| GET | `/api/v1/dashboard` | Dashboard stats |
| POST | `/api/v1/contacts/import` | Import contacts |
| GET | `/api/v1/contacts/export/:format` | Export contacts |

---

## 📸 Screenshots

*Screenshots will be added after frontend implementation.*

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by a passionate developer**

⭐ Star this repository if you found it helpful!

</div>
