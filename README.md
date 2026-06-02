# FinGame

Gamified personal finance tracker — turn saving money into an RPG-style quest.

## Quick Start

### 1. Backend (Terminal 1)

```bash
cd fingame/server
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

API: **http://localhost:5000**

### 2. Frontend (Terminal 2)

```bash
cd fingame/client
npm install
npm run dev
```

App: **http://localhost:5173**

### Demo Account

| Field | Value |
|-------|-------|
| Email | `hero@fingame.com` |
| Password | `password123` |

## Features

- Landing page with hero, features, leaderboard preview, testimonials
- JWT auth (register / login)
- Dashboard with daily budget, quest log, recent expenses
- Add expense modal with category chips + XP toast
- Quests page with level map, active quests, badge hall of fame, friends ranking
- Story page with weekly spending charts (Recharts)
- Stats page with leaderboard + monthly chart
- Desktop sidebar navigation + mobile bottom nav

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Database:** SQLite file on your machine (`fingame/server/prisma/dev.db`) — no Supabase or cloud database

### Local database setup (one command)

```bash
cd fingame/server
npm run db:setup
```

This generates the Prisma client, creates `prisma/dev.db`, and seeds demo data. All auth and game data stay in that local file.

See [fingame/README.md](fingame/README.md) for API reference and environment variables.
