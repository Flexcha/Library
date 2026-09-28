# 5. Development Roadmap & Execution Plan

## 5.1 How to Use This Roadmap
Execute phases **in order** (Phase 0 through Phase 6). Within a phase, verify every task satisfies its Definition of Done.
Commit after each completed task using Conventional Commits, referencing the task ID (e.g. `feat(phase0): init project scaffold [0.1]`).

---

## 5.2 Phase 0 — Project Scaffolding & Environment
- **[0.1]** Backend project init: express, typescript, tsx, zod, jsonwebtoken, bcrypt, cors, helmet, dotenv, swagger-ui-express, node-cron.
- **[0.2]** Frontend project init: Vite + React + TypeScript + Tailwind CSS.
- **[0.3]** Docker Compose: mysql, backend, frontend.
- **[0.4]** Database schema & seeds: admin account, categories, sample books.
- **[0.5]** CI skeleton.

## 5.3 Phase 1 — Authentication & User Management
- **[1.1]** User & RefreshToken models.
- **[1.2]** Authenticate & Authorize middlewares.
- **[1.3]** JWT and bcrypt utility.
- **[1.4]** RefreshToken service.
- **[1.5]** Auth routes: register, login, refresh, logout, me.
- **[1.6]** Global error-handling middleware + AppError subclasses + standard envelope.
- **[1.7]** Profile routes (self).
- **[1.8]** Admin user management routes.
- **[1.9]** Frontend Auth context, login, register, protected routes.

## 5.4 Phase 2 — Catalog Management
- **[2.1]** Models: Book, Author, Category, Publisher, BookCopy, BookAuthor.
- **[2.2]** CRUD services & routes for Authors, Categories, Publishers.
- **[2.3]** Book CRUD routes with unique ISBN and relation handling.
- **[2.4]** Book search and pagination route.
- **[2.5]** Book Copy routes.
- **[2.6]** Admin Catalog UI.
- **[2.7]** Public Catalog Browse UI.

## 5.5 Phase 3 — Circulation (Borrow / Return / Renew)
- **[3.1]** Loan model.
- **[3.2]** Checkout service with transactional copy status & fine validation.
- **[3.3]** Return service.
- **[3.4]** Renew service.
- **[3.5]** Loans listing routes with role scoping.
- **[3.6]** Lost/damaged handling.
- **[3.7]** Overdue scheduled job.
- **[3.8]** Circulation UI (Circulation desk, My Loans).

## 5.6 Phase 4 — Reservations & Fines
- **[4.1]** Reservation model.
- **[4.2]** Place reservation.
- **[4.3]** Cancel reservation.
- **[4.4]** Wire reservation fulfillment on return.
- **[4.5]** Expire reservation scheduled job.
- **[4.6]** Reservation listing with queue position.
- **[4.7]** Fine model & calculation.
- **[4.8]** Fine routes: pay, waive.
- **[4.9]** Renewal active reservation block.
- **[4.10]** Reservations & Fines UI.

## 5.7 Phase 5 — Notifications & Reporting Dashboard
- **[5.1]** Notification model & routes.
- **[5.2]** Scheduled jobs for reminders.
- **[5.3]** Report service & routes (overdue, most-borrowed, inventory, dashboard summary).
- **[5.4]** Notifications UI & Staff Dashboard.

## 5.8 Phase 6 — Testing Hardening, Polish, Deployment
- **[6.1]** Test suite verification.
- **[6.2]** Security review checklist.
- **[6.3]** Performance & query optimization.
- **[6.4]** Swagger OpenAPI interactive documentation.
- **[6.5]** Dockerfile & packaging.
- **[6.6]** Final documentation.
