# Backend — Smart Contact Management System

## Node.js + Express.js + MongoDB + JWT

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x | JavaScript runtime |
| Express.js | 4.x | Web framework |
| MongoDB | 7.x | NoSQL database |
| Mongoose | 8.x | MongoDB ODM |
| JWT | — | Stateless authentication |
| bcrypt | 5.x | Password hashing |
| Multer | 1.x | File upload handling |
| Cloudinary | 2.x | Cloud image hosting |
| Nodemailer | 6.x | Email service |
| Socket.io | 4.x | Real-time communication |
| Helmet | 8.x | Security headers |
| express-rate-limit | 7.x | Rate limiting |
| express-validator | 7.x | Input validation |
| Morgan | 1.x | HTTP request logging |
| Compression | 1.x | Response compression |
| CORS | 2.x | Cross-origin resource sharing |
| dotenv | 16.x | Environment variable management |

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB 7+)
- Cloudinary account
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required variables:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-contacts

# JWT
JWT_ACCESS_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@smartcontacts.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# C++ Engine
CPP_ENGINE_PATH=../cpp-engine/build/contact-engine
```

### Development

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### Production

```bash
npm start
```

---

## Folder Structure

```
src/
├── config/
│   ├── db.js              → MongoDB connection with Mongoose
│   ├── cloudinary.js       → Cloudinary SDK configuration
│   ├── env.js              → Environment variable validation
│   └── redis.js            → Redis client (optional caching)
│
├── controllers/
│   ├── authController.js   → Authentication request handlers
│   ├── contactController.js → Contact CRUD handlers
│   └── dashboardController.js → Dashboard & analytics handlers
│
├── routes/
│   ├── index.js            → Route aggregator
│   ├── authRoutes.js       → /api/v1/auth/*
│   ├── contactRoutes.js    → /api/v1/contacts/*
│   ├── searchRoutes.js     → /api/v1/search/*
│   └── dashboardRoutes.js  → /api/v1/dashboard/*
│
├── middleware/
│   ├── auth.js             → JWT verification middleware
│   ├── errorHandler.js     → Global error handling
│   ├── rateLimiter.js      → Rate limiting configurations
│   ├── upload.js           → Multer file upload config
│   └── validate.js         → Input validation middleware
│
├── models/
│   ├── User.js             → User Mongoose schema
│   ├── Contact.js          → Contact Mongoose schema
│   ├── SearchHistory.js    → Search history schema
│   └── ActivityLog.js      → Activity log schema
│
├── services/
│   ├── authService.js      → Authentication business logic
│   ├── contactService.js   → Contact business logic
│   ├── cppBridge.js        → Node.js ↔ C++ engine interface
│   └── emailService.js     → Email sending via Nodemailer
│
├── repositories/
│   ├── userRepo.js         → User data access layer
│   └── contactRepo.js      → Contact data access layer
│
├── validators/
│   ├── authValidator.js    → Auth input validation schemas
│   └── contactValidator.js → Contact input validation schemas
│
├── utils/
│   ├── logger.js           → Winston/Morgan logger setup
│   ├── responseHandler.js  → Standardized API responses
│   ├── tokenUtils.js       → JWT token generation & verification
│   └── fileUtils.js        → File parsing (CSV, Excel, JSON)
│
├── sockets/
│   └── socketHandler.js    → Socket.io event handlers
│
├── jobs/
│   ├── cleanupJob.js       → Permanent delete after 30 days
│   └── emailJob.js         → Email queue processing
│
├── database/
│   ├── seed.js             → Database seeder with sample data
│   └── migrations/         → Schema migration scripts
│
├── cpp-engine/
│   └── bridge.js           → child_process spawn wrapper for C++ binary
│
├── uploads/                → Runtime file upload directory
├── logs/                   → Runtime log directory
├── app.js                  → Express app configuration
└── server.js               → Server entry point
```

---

## Architecture

The backend follows **Clean Architecture** with clear separation of concerns:

```
Routes → Controllers → Services → Repositories → MongoDB
                          ↓
                     C++ Bridge → C++ Engine (child_process)
```

| Layer | Responsibility |
|---|---|
| **Routes** | Define endpoints, attach middleware |
| **Controllers** | Handle HTTP request/response, delegate to services |
| **Services** | Business logic, orchestrate repos and C++ engine |
| **Repositories** | Data access layer, Mongoose queries |
| **Models** | Mongoose schemas and validation |
| **Middleware** | Cross-cutting concerns (auth, errors, rate limiting) |

---

## API Endpoints

See full documentation: [API Documentation](../docs/API-Documentation/api-docs.md)

### Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/contacts` | Create contact |
| GET | `/api/v1/contacts` | List contacts |
| GET | `/api/v1/search/autocomplete` | Trie autocomplete |
| GET | `/api/v1/dashboard` | Dashboard stats |
