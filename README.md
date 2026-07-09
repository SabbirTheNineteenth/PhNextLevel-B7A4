# RentNest 🏠 — Backend API

Backend for a rental property marketplace. Landlords list properties, tenants
submit rental requests and pay via **Stripe**, and admins moderate the platform.

## 🛠️ Tech Stack

- **Node.js + Express** — REST API
- **TypeScript** — type safety
- **PostgreSQL + Prisma** — database & ORM
- **JWT** — authentication
- **Zod** — input validation
- **Stripe** — payments
- **Swagger (swagger-ui-express)** — API docs at `/api-docs`

## 👥 Roles

| Role     | Can do                                                      |
| -------- | ---------------------------------------------------------- |
| TENANT   | Browse, submit rental requests, pay, review, manage profile |
| LANDLORD | Create/manage properties, approve/reject requests           |
| ADMIN    | Manage users, categories, oversee all listings & rentals    |

Users pick TENANT or LANDLORD at registration. ADMIN is created by the seed script.

---


## 🔑 Seeded Credentials

| Role     | Email                   | Password     |
| -------- | ----------------------- | ------------ |
| Admin    | admin@rentnest.com      | admin123     |
| Landlord | landlord@rentnest.com   | landlord123  |
| Tenant   | tenant@rentnest.com     | tenant123    |



---

## 💳 Payment Flow (Stripe, testable in Postman)

1. Tenant submits a rental request → landlord approves it (`status: APPROVED`).
2. Tenant calls `POST /api/payments/create` with `rentalRequestId`.
   → returns a `checkoutUrl` and `transactionId`.
3. Open `checkoutUrl` in a browser and pay with the Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date · CVC: any 3 digits · ZIP: any
4. Call `POST /api/payments/confirm` with `transactionId`.
   → payment becomes `COMPLETED` and the rental becomes `ACTIVE`.

> A Stripe webhook at `POST /api/payments/webhook` 


---

## 📦 Rental Status Flow

```
PENDING ──approve──> APPROVED ──pay──> ACTIVE ──complete──> COMPLETED ──> (review)
   └────reject────> REJECTED
```

---



## 📚 API Endpoints (summary)

Full interactive docs at **`/api-docs`**.

| Method | Endpoint                      | Access   |
| ------ | ----------------------------- | -------- |
| POST   | /api/auth/register            | Public   |
| POST   | /api/auth/login               | Public   |
| GET    | /api/auth/me                  | Auth     |
| GET    | /api/categories               | Public   |
| POST   | /api/categories               | Admin    |
| GET    | /api/properties               | Public   |
| GET    | /api/properties/:id           | Public   |
| POST   | /api/properties               | Landlord |
| PUT    | /api/properties/:id           | Landlord |
| DELETE | /api/properties/:id           | Landlord |
| POST   | /api/rentals                  | Tenant   |
| GET    | /api/rentals                  | Tenant   |
| GET    | /api/rentals/:id              | Auth     |
| GET    | /api/landlord/requests        | Landlord |
| PATCH  | /api/landlord/requests/:id    | Landlord |
| POST   | /api/payments/create          | Tenant   |
| POST   | /api/payments/confirm         | Auth     |
| GET    | /api/payments                 | Auth     |
| GET    | /api/payments/:id             | Auth     |
| POST   | /api/reviews                  | Tenant   |
| GET    | /api/admin/users              | Admin    |
| PATCH  | /api/admin/users/:id          | Admin    |
| GET    | /api/admin/properties         | Admin    |
| GET    | /api/admin/rentals            | Admin    |

---

## 📄 Response Format

**Success**

```json
{ "success": true, "message": "...", "data": { } }
```

**Error**

```json
{ "success": false, "message": "...", "errorDetails": [ { "path": "...", "message": "..." } ] }
```
