# Gym SaaS — Backend API

Multi-tenant SaaS gym management platform. Each gym is an isolated **Organization** (tenant). Built with Node.js, Express 5, Prisma 7, and SQLite (dev) / PostgreSQL (prod).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Database | SQLite (dev) · PostgreSQL (prod) |
| Auth | JWT (15m access) + Refresh Tokens (7d) |
| Validation | Zod v4 |
| Scheduler | node-cron |

---

## Features

- **Multi-tenant** — every query is scoped to the caller's organization
- **5 roles** — SUPER_ADMIN, ORG_ADMIN, BRANCH_MANAGER, TRAINER, MEMBER
- **8 modules** — Auth, Organization, Branches, Users, Plans, Subscriptions, Attendance, Payments
- **Auto subscription renewal** — daily cron at 00:05 AM
- **Auto unfreeze** — frozen subscriptions resume automatically when freeze period ends
- **Rate limiting** — 10 req/15min on login, 300 req/15min globally
- **Full API docs** — open `API_DOCS.html` in a browser (4 tabs: API reference, DB schema, roles, mobile guide)

---

## Prerequisites

- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node)
- **Git**

---

## Quick Start (Local / SQLite)

### 1. Clone the repository

```bash
git clone https://github.com/AnimeshCriterion/gym-backend.git
cd gym-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and verify the values (defaults work for local dev):

```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
JWT_SECRET=change_me_to_a_random_32_char_secret
JWT_REFRESH_SECRET=change_me_to_another_random_32_char_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Generate Prisma client and push schema

```bash
npx prisma generate
npx prisma db push
```

This creates `dev.db` (SQLite file) with all tables.

### 5. Start the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server runs at **http://localhost:3000**

### 6. Verify it's working

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

---

## Project Structure

```
gym-backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app.js                 # Express app setup (CORS, helmet, rate limit)
│   ├── server.js              # Entry point — DB connect, cron, listen
│   ├── config/
│   │   ├── db.js              # Prisma client
│   │   ├── env.js             # Env validation (Zod)
│   │   └── logger.js          # HTTP request logger
│   ├── common/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js       # JWT verification
│   │   │   ├── role.middleware.js       # RBAC authorization
│   │   │   ├── error.middleware.js      # Global error handler
│   │   │   └── rate-limit.middleware.js # express-rate-limit config
│   │   └── utils/
│   │       └── response.js    # Consistent JSON response helpers
│   ├── modules/
│   │   ├── auth/              # Register org, login, refresh, logout, change password
│   │   ├── organization/      # Org CRUD (SUPER_ADMIN)
│   │   ├── branches/          # Branch CRUD
│   │   ├── users/             # Member/trainer management
│   │   ├── plans/             # Membership plan CRUD
│   │   ├── subscriptions/     # Subscribe, freeze, unfreeze, cancel, auto-renew
│   │   ├── attendance/        # Check-in / check-out
│   │   └── payments/          # Payment recording and revenue reports
│   └── routes/
│       └── v1.routes.js       # Mounts all module routers under /api/v1
├── API_DOCS.html              # Full API documentation (open in browser)
├── .env.example               # Environment variable template
└── package.json
```

---

## API Overview

All endpoints are prefixed with `/api/v1`.

| Module | Base Path | Key Endpoints |
|--------|-----------|---------------|
| Auth | `/auth` | POST /register, /login, /refresh, /logout, /change-password, GET /me, PUT /me |
| Organization | `/organizations` | GET, PUT (SUPER_ADMIN only) |
| Branches | `/branches` | CRUD |
| Users | `/users` | CRUD, trainer auto-scoping |
| Plans | `/plans` | CRUD (ORG_ADMIN), GET (all roles) |
| Subscriptions | `/subscriptions` | POST, freeze, unfreeze, cancel, auto-renew |
| Attendance | `/attendance` | check-in, check-out, GET /my, GET (branch view) |
| Payments | `/payments` | CRUD, revenue summary |

For the full request/response documentation open **`API_DOCS.html`** in your browser.

---

## Role Permissions Summary

| Action | SUPER_ADMIN | ORG_ADMIN | BRANCH_MANAGER | TRAINER | MEMBER |
|--------|:-----------:|:---------:|:--------------:|:-------:|:------:|
| Manage organizations | ✔ | own | ✘ | ✘ | ✘ |
| Manage branches | ✔ | ✔ | ✘ | ✘ | ✘ |
| Add users | ✔ | ✔ | ✔ | ✘ | ✘ |
| Manage plans | ✔ | ✔ | ✘ | ✘ | ✘ |
| Create subscriptions | ✔ | ✔ | ✔ | ✘ | ✘ |
| View own subscription | ✔ | ✔ | ✔ | ✔ | ✔ |
| Check in / out | ✔ | ✔ | ✔ | ✔ | ✔ |
| View branch attendance | ✔ | ✔ | ✔ | ✔ | own |
| Record payments | ✔ | ✔ | ✔ | ✘ | ✘ |
| Revenue reports | ✔ | ✔ | ✔ | ✘ | ✘ |

---

## Migrating to PostgreSQL

1. Provision a PostgreSQL database
2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/gym_db"
   ```
3. Update `prisma/schema.prisma` datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## Available Scripts

```bash
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema to DB without migrations (dev only)
npm run db:migrate   # Run migrations (use in production)
npm run db:studio    # Open Prisma Studio (visual DB browser)
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✔ | DB connection string |
| `PORT` | ✔ | Server port (default: 3000) |
| `NODE_ENV` | ✔ | `development` or `production` |
| `CORS_ORIGIN` | ✔ | Allowed origins (`*` for dev, domain for prod) |
| `JWT_SECRET` | ✔ | Access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✔ | Refresh token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | ✔ | Access token TTL (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | ✔ | Refresh token TTL (default: `7d`) |

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set strong random `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ chars)
- [ ] Set `CORS_ORIGIN` to your actual domain(s)
- [ ] Switch `DATABASE_URL` to PostgreSQL
- [ ] Run `npx prisma migrate deploy` (not `db push`)
- [ ] Run behind a reverse proxy (nginx / Caddy) with HTTPS
- [ ] Set up process manager (PM2 or systemd)
