# 4. API Specification

## 4.1 Conventions

- Base path: `/api/v1`
- All bodies are JSON, `Content-Type: application/json`.
- Auth: `Authorization: Bearer <accessToken>` header on every protected endpoint.
- **Success envelope:**
```json
{
  "success": true,
  "data": { },
  "message": "OK",
  "timestamp": "2026-09-18T10:15:00Z"
}
```
- **Error envelope:**
```json
{
  "success": false,
  "error": {
    "code": "BOOK_NOT_FOUND",
    "message": "Book with id 5 not found",
    "details": []
  },
  "timestamp": "2026-09-18T10:15:00Z"
}
```
- **Pagination:** list endpoints accept `?page=0&size=20&sort=title,asc`. Response `data` is wrapped:
```json
{
  "content": [ ],
  "page": 0,
  "size": 20,
  "totalElements": 137,
  "totalPages": 7
}
```

## 4.2 RBAC Matrix

| Endpoint group | Guest | Member | Librarian | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse/search catalog (`GET /books*`) | ✅ | ✅ | ✅ | ✅ |
| Register/Login | ✅ | ✅ | ✅ | ✅ |
| Manage own profile | ❌ | ✅ | ✅ | ✅ |
| Create/edit/delete books, authors, categories, publishers | ❌ | ❌ | ✅ | ✅ |
| Manage book copies | ❌ | ❌ | ✅ | ✅ |
| Checkout / Return (any member) | ❌ | ❌ | ✅ | ✅ |
| Renew own loan | ❌ | ✅ | ✅ | ✅ |
| View own loans/reservations/fines/notifications | ❌ | ✅ | ✅ | ✅ |
| View all loans/reservations/fines | ❌ | ❌ | ✅ | ✅ |
| Place/cancel own reservation | ❌ | ✅ | ✅ | ✅ |
| Record fine payment | ❌ | ❌ | ✅ | ✅ |
| Waive a fine | ❌ | ❌ | ❌ | ✅ |
| View reports/dashboard | ❌ | ❌ | ✅ | ✅ |
| Manage user accounts | ❌ | ❌ | ❌ | ✅ |

## 4.3 Endpoints

### Auth
- `POST /auth/register` (Guest) -> 201
- `POST /auth/login` (Guest) -> 200
- `POST /auth/refresh` -> 200
- `POST /auth/logout` (Authenticated) -> 200
- `GET /auth/me` (Authenticated) -> 200

### Users (Admin / Self)
- `GET /users` (Admin)
- `GET /users/:id` (Admin / Self)
- `PUT /users/:id` (Admin / Self)
- `PATCH /users/:id/status` (Admin)
- `DELETE /users/:id` (Admin)

### Catalog
- `GET /books` (Public)
- `GET /books/:id` (Public)
- `POST /books` (Librarian, Admin)
- `PUT /books/:id` (Librarian, Admin)
- `DELETE /books/:id` (Admin)
- `GET /authors`, `POST /authors`
- `GET /authors/:id`, `PUT /authors/:id`, `DELETE /authors/:id`
- `GET /categories`, `POST /categories`
- `GET /categories/:id`, `PUT /categories/:id`, `DELETE /categories/:id`
- `GET /publishers`, `POST /publishers`
- `GET /publishers/:id`, `PUT /publishers/:id`, `DELETE /publishers/:id`
- `GET /books/:bookId/copies`
- `POST /books/:bookId/copies` (Librarian, Admin)
- `PATCH /copies/:id/status` (Librarian, Admin)

### Circulation
- `POST /loans` (Librarian, Admin)
- `PATCH /loans/:id/return` (Librarian, Admin)
- `POST /loans/:id/renew` (Member own, Librarian, Admin)
- `GET /loans` (Librarian/Admin all; Member auto-scoped to own)
- `GET /loans/:id` (Owner or staff)

### Reservations
- `POST /reservations` (Member)
- `GET /reservations` (Member own / Staff all)
- `PATCH /reservations/:id/cancel` (Owner or staff)

### Fines
- `GET /fines` (Member own / Staff all)
- `PATCH /fines/:id/pay` (Librarian, Admin)
- `PATCH /fines/:id/waive` (Admin)

### Notifications
- `GET /notifications` (Authenticated)
- `PATCH /notifications/:id/read` (Owner)

### Reports
- `GET /reports/overdue` (Librarian, Admin)
- `GET /reports/most-borrowed` (Librarian, Admin)
- `GET /reports/inventory-summary` (Librarian, Admin)
- `GET /reports/dashboard-summary` (Librarian, Admin)
