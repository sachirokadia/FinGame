# FinGame — Gamified Expense Tracker

Turn saving money into an RPG-style quest. Track expenses, earn XP, complete quests, unlock badges, and climb the leaderboard.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Recharts
- **Backend:** Node.js + Express + TypeScript + Prisma
- **Database:** SQLite (local file at `server/prisma/dev.db`) — no Supabase; data never leaves your machine

## Quick Start

### 1. Backend

```bash
cd fingame/server
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Server runs at **http://localhost:5000**

### 2. Frontend

```bash
cd fingame/client
npm install
npm run dev
```

App runs at **http://localhost:5173**

### Demo Account

- **Email:** `hero@fingame.com`
- **Password:** `password123`

## Features

- Landing page with hero, features, testimonials
- JWT auth (register / login)
- Dashboard with daily budget, quest log, recent expenses
- Add expense modal with category chips + XP toast
- Quests page with level map, active quests, badge hall of fame
- Story page with weekly spending charts
- Stats page with leaderboard + monthly chart

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/user/me` | Profile |
| GET/POST | `/api/expenses` | List / add expenses |
| GET | `/api/quests` | User quests |
| GET | `/api/badges` | Badges + earned status |
| GET | `/api/stats/weekly` | Weekly analytics |
| GET | `/api/stats/leaderboard` | XP leaderboard |

## Environment Variables

See `server/.env.example`:

```
# Local SQLite — stored as server/prisma/dev.db (not Supabase / not cloud)
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_here"
PORT=5000
```

Do not point `DATABASE_URL` at a Supabase or other hosted URL unless you intentionally switch providers and update `prisma/schema.prisma`.
