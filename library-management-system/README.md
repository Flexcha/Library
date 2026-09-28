# Library Management System

A full-stack, enterprise-grade Library Management System web application built with **Node.js, Express, TypeScript, Prisma, MySQL 8.0, React 18, Vite, and Tailwind CSS**.

---

## 🌟 Features

- **Authentication & RBAC**: Dual-token JWT (15-min Access, 7-day Refresh with DB revocation), role-based access control (`ADMIN`, `LIBRARIAN`, `MEMBER`).
- **Catalog Management**: Author, Category (hierarchical), Publisher, Book title, and physical Book Copy inventory tracking (`AVAILABLE`, `BORROWED`, `RESERVED`, `MAINTENANCE`, `LOST`).
- **Circulation Desk**: Atomic checkout, return, auto-renew, and lost copy reporting. Enforces fine block rules (`FINE_MAX_UNPAID_BEFORE_BLOCK`) and loan period limits.
- **Reservations & Holds**: FIFO queuing for unavailable books. Auto-fulfill copy transition to `RESERVED` on return with 3-day pickup window expiration.
- **Fines & Billing**: Daily late fine calculation, partial/full fine payments, admin-only waiving with audit log.
- **Notifications**: Automated background job (`node-cron`) for 2-day due-soon alerts and status transitions.
- **Staff Dashboard & Reports**: Overdue report, top-borrowed books chart, category inventory summary, operational metrics.
- **Interactive OpenAPI Documentation**: Embedded Swagger UI at `/api-docs`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 20 LTS, Express.js, TypeScript, Prisma ORM, Zod, JWT (`jsonwebtoken` + `bcrypt`), `node-cron` |
| **Database** | MySQL 8.0 / SQLite (dev) |
| **Frontend** | React 18 + TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios |
| **API Docs** | `@asteasolutions/zod-to-openapi`, `swagger-ui-express` |
| **Testing** | Jest, Supertest, ts-jest |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 Quick Start with Docker

```bash
docker-compose up --build
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:3000/api/v1`
- **Swagger API Documentation**: `http://localhost:3000/api-docs`

---

## 🔑 Pre-Seeded Default Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@library.com` | `Admin123!` |
| **Librarian** | `librarian@library.com` | `Librarian123!` |
| **Member** | `member1@library.com` | `Member123!` |
