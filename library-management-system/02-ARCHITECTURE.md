# 2. System Architecture

## 2.1 Technology Stack & Justification

| Layer | Technology | Why |
|---|---|---|
| Backend runtime | Node.js 20 LTS + Express.js 4.x + TypeScript | Lightweight, unopinionated HTTP layer; compile-time safety. |
| ORM / DB access | Prisma ORM over MySQL 8.0 / SQLite | Type-safe query builder, migration tooling, relational safety. |
| Auth | `jsonwebtoken` + `bcrypt`, custom Express middleware | Stateless JWT auth (15m access, 7d refresh in DB). |
| Validation | `zod` schemas + `validate(schema)` middleware | Reusable validation and OpenAPI spec generation. |
| API docs | `swagger-ui-express` + `@asteasolutions/zod-to-openapi` | Interactive Swagger documentation at `/api-docs`. |
| Testing | Jest + Supertest | Unit & integration testing. |
| Frontend | React 18 + TypeScript (Vite), TanStack Query / Hooks, Tailwind CSS | High-performance SPA with modern UI. |

## 2.2 Backend Structure
```
src/
├── index.ts                      # server bootstrap (listen, cron jobs)
├── app.ts                        # Express app: middleware wiring, route mounting
├── config/
│   ├── env.ts                    # Zod-validated environment config
│   ├── prisma.ts                 # PrismaClient singleton
│   └── swagger.ts                # Swagger wiring
├── middleware/
│   ├── authenticate.ts           # verifies JWT, attaches req.user
│   ├── authorize.ts              # role guard factory
│   ├── validate.ts               # validate(schema) middleware
│   ├── errorHandler.ts           # standard error envelope
│   └── asyncHandler.ts           # async route wrapper
├── common/
│   ├── ApiResponse.ts            # response helpers
│   ├── pagination.ts             # pagination helpers
│   └── errors/                   # AppError, NotFoundError, ConflictError, etc.
├── modules/
│   ├── auth/
│   ├── user/
│   ├── catalog/
│   ├── circulation/
│   ├── reservation/
│   ├── fine/
│   ├── notification/
│   └── report/
└── routes/
    └── index.ts                  # mounts modules under /api/v1
```
