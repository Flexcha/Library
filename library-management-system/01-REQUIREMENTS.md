# 1. Requirements Specification

## 1.1 Executive Summary

Build a web application that lets a library digitize its catalog and circulation process: staff manage books and physical copies, members search the catalog and borrow/reserve books online-adjacent to an in-person pickup model, and the system automatically tracks due dates, overdue fines, and reservation queues.

## 1.2 Goals & Success Criteria

- G1: Staff can fully manage the catalog (books, authors, categories, publishers, physical copies) without touching the database directly.
- G2: A checkout/return can be completed by a librarian in under 3 clicks/API calls once the member and copy are identified.
- G3: The system never allows two members to simultaneously hold the same physical copy (data integrity guarantee).
- G4: Overdue items and fines are computed automatically, not manually.
- G5: Members can see their own loan history, active loans, due dates, reservations, and fines without staff involvement.

## 1.3 Scope

### In Scope (v1)
- Single library branch (no multi-branch transfer logic).
- Book catalog CRUD with authors (many-to-many), categories (hierarchical), publishers.
- Physical copy-level inventory tracking (a "book" is a title; a "copy" is a physical instance with its own status).
- Borrowing, returning, renewing.
- Reservation queue for titles with zero available copies.
- Fine calculation for late returns; manual mark-as-paid/waived by staff (no online payment gateway).
- Role-based access: Admin, Librarian, Member, Guest (unauthenticated, browse-only).
- Notifications (in-app; email is a stretch goal, not required for v1).
- Basic reporting dashboard for staff (overdue list, most-borrowed, inventory summary).

### Out of Scope (v1)
- Multi-branch / inter-branch transfers.
- Online payment processing for fines.
- Barcode scanner hardware integration.
- Book reviews/ratings (deferred to a documented Phase 2 module, see §1.5 Module I).
- Mobile native apps (responsive web only).
- Third-party ISBN/metadata lookup.

## 1.4 User Roles & Personas

| Role | Description | Key capabilities |
|---|---|---|
| **Guest** | Unauthenticated visitor | Browse/search catalog, view book detail and availability. Cannot borrow, reserve, or see personal data. |
| **Member** | Registered patron | Everything a Guest can do, plus: borrow (via staff-mediated checkout), reserve, renew own loans, view own loans/fines/notifications, cancel own reservations. |
| **Librarian** | Front-desk staff | Everything a Member can do (read access to catalog), plus: manage catalog (books/authors/categories/publishers/copies), perform checkout/return for any member, manage reservations, mark fines paid, view reports. |
| **Admin** | System administrator | Everything a Librarian can do, plus: manage user accounts (create/suspend/deactivate, role changes), waive fines, full report access. |

## 1.5 Functional Requirements

### Module A — Authentication & User Management
- **FR-A1: Registration.** Email must be unique. Password minimum 8 characters; stored only as BCrypt hash. Default `role=MEMBER`, `status=ACTIVE`.
- **FR-A2: Login.** Returns short-lived JWT access token and longer-lived refresh token. Invalid credentials return `401`. Locked/suspended accounts return `403`.
- **FR-A3: Token refresh.** Refresh token exchanged for new access token; single-use or rotated on refresh.
- **FR-A4: Profile management.** Users may edit name/phone/address. Cannot change own `role` or `status`.
- **FR-A5: Account administration.** Admin can list, suspend, reactivate, or delete user accounts.

### Module B — Catalog Management
- **FR-B1: Create/edit/delete book titles.** ISBN is unique (`409 Conflict` on duplicate). Deleting a book is blocked (`409 Conflict`) if any copy is on active loan.
- **FR-B2: Manage authors/categories/publishers.** CRUD on authors, categories, publishers. Hierarchical categories supported.
- **FR-B3: Manage physical copies.** Statuses: `AVAILABLE`, `BORROWED`, `RESERVED`, `LOST`, `DAMAGED`, `WITHDRAWN`. `copy_code` is unique.
- **FR-B4: Availability visibility.** Detail view shows `totalCopies` and `availableCopies`.

### Module C — Search & Discovery
- **FR-C1: Catalog search.** Case-insensitive partial title, author, category matches. Paginated and sortable.
- **FR-C2: Filtering.** By category and "available now".
- **FR-C3: Book detail page.** Full detail, authors, availability counts, and staff copy list.

### Module D — Circulation (Borrowing & Returns)
- **FR-D1: Checkout.** Staff-mediated. Target copy must be `AVAILABLE` (else `409`). Copy becomes `BORROWED`, loan created (`due_date = today + 14 days`, status `ONGOING`). Member must be `ACTIVE` and under fine limit.
- **FR-D2: Return.** Staff-mediated. Return date set, status `RETURNED`. Copy becomes `AVAILABLE` (or `RESERVED` if reservation waiting). Late return generates fine.
- **FR-D3: Renewal.** Extends due date by loan period, increments `renewal_count`. Blocked if `renewal_count >= maxRenewals` or active reservation exists.
- **FR-D4: My loans.** Member can view their own loans.
- **FR-D5: Lost/damaged handling.** Loan closed, copy flagged `LOST`/`DAMAGED`, fine issued.
- **FR-D6: Overdue detection.** Automatic scheduled job or read-time status flags `OVERDUE` loans.

### Module E — Reservations
- **FR-E1: Place reservation.** Cannot reserve if member already has active loan or reservation for title. Assigned next `queue_position`.
- **FR-E2: Cancel reservation.** Member or staff can cancel pending reservation.
- **FR-E3: Reservation fulfillment.** On copy return, copy becomes `RESERVED` and top reservation becomes `READY` with 3-day pickup window.
- **FR-E4: Reservation visibility.** Member sees position in queue.

### Module F — Fines & Payments
- **FR-F1: Automatic fine calculation.** Days overdue × daily rate (default 5,000).
- **FR-F2: View fines.** Member sees unpaid/paid fines.
- **FR-F3: Record payment.** Staff marks fine as `PAID`.
- **FR-F4: Waive fine.** Admin waives fine with reason, recording `waived_by`.

### Module G — Notifications
- **FR-G1: Due-soon reminder.** In-app notification 2 days before due date.
- **FR-G2: Overdue alert.** Notification when loan becomes overdue.
- **FR-G3: Reservation-ready alert.** Notification when reserved book is ready for pickup.

### Module H — Reporting & Dashboard (Staff)
- **FR-H1: Overdue report.** Overdue loans with borrower info.
- **FR-H2: Most-borrowed report.** Ranked list of titles by borrow count.
- **FR-H3: Inventory summary.** Copy counts grouped by status.
- **FR-H4: Dashboard landing page.** Active loans, overdue count, pending reservations, unpaid fines total.

### Module I — Reviews & Ratings (Deferred)
Reserved in database schema; implementation deferred.
