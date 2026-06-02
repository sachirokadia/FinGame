# Windsurf Prompt: FinGame — Gamified Expense Tracker Full-Stack Web App

---

## Project Overview

Build a full-stack web application called **FinGame** — a gamified personal finance and expense tracker that turns saving money into an RPG-style quest. The target audience is Gen-Z and Millennials who find traditional banking apps boring. The experience should feel like a premium mobile game, not a spreadsheet.

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS v3 (with custom design tokens below)
- **Icons:** Google Material Symbols Outlined (loaded via Google Fonts CDN)
- **Fonts:** Montserrat (headings) + Inter (body) from Google Fonts
- **Charts:** Recharts
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT-based auth (register/login)
- **API:** RESTful JSON API

---

## Design System

### Colors (Tailwind custom tokens)
```js
colors: {
  "background":                "#0b1326",
  "surface":                   "#0b1326",
  "surface-dim":               "#0b1326",
  "surface-bright":            "#31394d",
  "surface-container-lowest":  "#060e20",
  "surface-container-low":     "#131b2e",
  "surface-container":         "#171f33",
  "surface-container-high":    "#222a3d",
  "surface-container-highest": "#2d3449",
  "surface-variant":           "#2d3449",
  "on-surface":                "#dae2fd",
  "on-surface-variant":        "#c7c4d7",
  "on-background":             "#dae2fd",
  "outline":                   "#908fa0",
  "outline-variant":           "#464554",
  "primary":                   "#c0c1ff",
  "on-primary":                "#1000a9",
  "primary-container":         "#8083ff",
  "on-primary-container":      "#0d0096",
  "primary-fixed":             "#e1e0ff",
  "primary-fixed-dim":         "#c0c1ff",
  "on-primary-fixed":          "#07006c",
  "on-primary-fixed-variant":  "#2f2ebe",
  "inverse-primary":           "#494bd6",
  "surface-tint":              "#c0c1ff",
  "secondary":                 "#4edea3",
  "on-secondary":              "#003824",
  "secondary-container":       "#00a572",
  "on-secondary-container":    "#00311f",
  "secondary-fixed":           "#6ffbbe",
  "secondary-fixed-dim":       "#4edea3",
  "on-secondary-fixed":        "#002113",
  "on-secondary-fixed-variant":"#005236",
  "tertiary":                  "#ffb95f",
  "on-tertiary":               "#472a00",
  "tertiary-container":        "#ca8100",
  "on-tertiary-container":     "#3e2400",
  "tertiary-fixed":            "#ffddb8",
  "tertiary-fixed-dim":        "#ffb95f",
  "on-tertiary-fixed":         "#2a1700",
  "on-tertiary-fixed-variant": "#653e00",
  "error":                     "#ffb4ab",
  "on-error":                  "#690005",
  "error-container":           "#93000a",
  "on-error-container":        "#ffdad6",
  "inverse-surface":           "#dae2fd",
  "inverse-on-surface":        "#283044",
}
```

### Typography (Tailwind custom tokens)
```js
fontFamily: {
  "display-lg":         ["Montserrat", "sans-serif"],
  "headline-lg":        ["Montserrat", "sans-serif"],
  "headline-lg-mobile": ["Montserrat", "sans-serif"],
  "title-md":           ["Inter", "sans-serif"],
  "body-lg":            ["Inter", "sans-serif"],
  "label-caps":         ["Inter", "sans-serif"],
}
fontSize: {
  "display-lg":         ["48px", { lineHeight:"56px", letterSpacing:"-0.02em", fontWeight:"800" }],
  "headline-lg":        ["32px", { lineHeight:"40px", fontWeight:"700" }],
  "headline-lg-mobile": ["24px", { lineHeight:"32px", fontWeight:"700" }],
  "title-md":           ["20px", { lineHeight:"28px", fontWeight:"600" }],
  "body-lg":            ["16px", { lineHeight:"24px", fontWeight:"400" }],
  "label-caps":         ["12px", { lineHeight:"16px", letterSpacing:"0.05em", fontWeight:"700" }],
}
```

### Spacing
```js
spacing: {
  "unit":              "4px",
  "container-margin":  "20px",
  "gutter":            "16px",
  "card-padding":      "24px",
  "stack-gap":         "12px",
}
```

### Border Radius
```js
borderRadius: {
  "sm":      "0.25rem",
  "DEFAULT": "0.5rem",
  "md":      "0.75rem",
  "lg":      "1rem",
  "xl":      "1.5rem",
  "full":    "9999px",
}
```

### Global CSS Utilities (define in `index.css`)
```css
/* Glassmorphism card */
.glass-card {
  background: rgba(23, 31, 51, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
}

/* Indigo glow shadow */
.glow-indigo { box-shadow: 0 0 20px rgba(192, 193, 255, 0.3); }

/* Teal glow shadow */
.glow-teal   { box-shadow: 0 0 20px rgba(78, 222, 163, 0.3); }

/* Pulse glow animation (for CTA buttons) */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(78,222,163,0.3); transform: scale(1); }
  50%       { box-shadow: 0 0 40px rgba(78,222,163,0.6); transform: scale(1.05); }
}
.animate-pulse-glow { animation: pulse-glow 3s infinite ease-in-out; }

/* Sparkle shimmer on progress bars */
.progress-sparkle { position: relative; overflow: hidden; }
.progress-sparkle::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: sparkle 2s infinite;
}
@keyframes sparkle {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Floating animation (mascot / hero elements) */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
.float-anim { animation: float 3s ease-in-out infinite; }

/* Radial hero gradient overlay */
.hero-gradient {
  background: radial-gradient(circle at 50% 50%, rgba(192,193,255,0.15) 0%, rgba(11,19,38,0) 70%);
}
```

Primary buttons use an Electric Indigo → Teal gradient: `background: linear-gradient(135deg, #8083ff, #4edea3)`.
On press, apply `transform: scale(0.96)`.

---

## Application Pages & Features

### 1. Landing Page (`/`)

**Sections:**
- **Navbar** (fixed, glassmorphic): FinGame logo (wallet icon + wordmark in primary color), nav links "The Quest" & "Leaderboard", a 🔥 streak counter chip, CTA "Start Your Quest" button.
- **Hero Section**: Large headline "Master Your Money. Level Up Your Life.", subtitle copy, "Start Your Quest →" primary CTA button with pulse-glow animation. Include a hero illustration (SVG or decorative element) with float-anim. Show a "NEW SEASON LIVE" badge (pill chip, secondary color).
- **Features Section** ("Choose Your Class. Grind Your Goals."): Three glassmorphic cards:
  - 🧠 Smart Insights — AI-powered spending analysis, identifies "Boss Fights" (budget overage moments)
  - 🏆 Achievement Badges — 200+ badges (e.g. "Ramen Warrior", "Wealth Wizard")
  - ⚔️ Social Challenges — Co-op savings goals, seasonal raids with friends
  Each card shows a progress bar (progress-sparkle) and an icon.
- **Testimonials**: Carousel with 3 user reviews, each showing a star rating, quote, user level badge (e.g. "LVL 42"), name, and class title (e.g. "Shadow Assassin Tier").
- **Footer**: Minimal. Brand name + tagline.

---

### 2. Auth Pages (`/login`, `/register`)

- Glassmorphic card centered on the deep navy background.
- Logo at top.
- Fields: Email + Password (register also has Name + Confirm Password).
- "Sunken" input style: inner shadow to look recessed, focus glows with indigo border.
- CTA: gradient primary button.
- Link to switch between login/register.
- On success → redirect to `/dashboard`.

---

### 3. Dashboard (`/dashboard`) — Main App Screen

**Layout:** Mobile-first single column. Desktop: sidebar nav (left) + main content area.

**Bottom Navigation Bar (mobile):** 5 icons — Hub (grid_view), Quests (military_tech), Add (add — large, gradient pill), Story (auto_stories), Stats (leaderboard).

**Sections:**
- **Daily Energy Card** (glassmorphic, full width): Shows remaining daily budget — large number like `$142.50 REMAINING`. Subtitle from AI mascot "Fin says: 'You saved 5% more than last Tuesday! Level Up soon! 🚀'". Two action buttons: `+ ADD EXPENSE` and `📄 SCAN RECEIPT`.
- **Quest Log Widget** ("Quest Log" header + "VIEW ALL" link): Shows up to 2 active quests as glassmorphic mini-cards. Each quest shows: name (e.g. "💻 New Laptop Fund"), progress bar (progress-sparkle, 12px thick, fully rounded, green gradient fill), `$1,200 / $1,600 saved`, XP reward badge, and a streak text like "12 DAYS UNDER BUDGET – Don't break the chain!".
- **Recent Deeds** (transaction list): Each item shows: emoji category icon, transaction name (e.g. "Burger Quest"), subcategory + date, debit amount in error color (`-$18.40`), and an XP chip (`+5 XP` in secondary color).

---

### 4. Add Expense Modal / Screen (`/add`)

- Triggered from the "+" nav button.
- Fields: Amount (large numeric input, centered), Category (horizontal scroll chip selector with emoji — 🍔 Food, ☕ Coffee, 🚗 Transport, 🛍️ Shopping, ⚡ Utilities, 🎮 Gaming), Note (optional text), Date (defaults to today).
- Category chips are pill-shaped with emoji + label.
- Submit button: gradient primary "Log Deed →".
- On submit → save expense, award XP, show a brief XP gain toast animation (`+5 XP ⚡`).

---

### 5. Quests & Badges Page (`/quests`)

**Layout has 3 tabs/sections:**

**Journey (Level Map):**
- Vertical or horizontal progress chain showing: Level 10 (completed ✓), Level 14 YOU ARE HERE (star icon, highlighted), Level 15 (locked 🔒), Level 20 (locked 🔒 with Mystery reward).
- Use connecting lines between levels with active/inactive states.

**Active Quests:**
- List of quest cards (glassmorphic). Each shows: Quest name, XP reward badge, description (e.g. "Save $500 in your Emergency Fund"), thick progress bar with sparkle, progress text (`$325 / $500`), percentage, and a motivational micro-copy ("Almost there!").
- Example quests:
  - "Vault Builder" — Save $500 in Emergency Fund — 65%
  - "Home Chef Streak" — No Dining Out for 3 days — 2/3 Days

**Hall of Fame (Badges):**
- Grid of badge icons in hexagonal frames with metallic gradients.
- Locked badges shown in grayscale/dim.
- Earned badges: workspace_premium (First Save), eco (Budget King), auto_graph (Investor), shield (Protector), diamond (Whale).

**Friends Ranking:**
- Leaderboard list. Current user ("YOU") highlighted. Each row: rank position, avatar circle, name, XP amount.
- "Compare Stats" CTA button.

---

### 6. Analytics / Spending Story Page (`/story`)

**Sections:**
- **Week Header**: "Your Week in Numbers" with a badge label like "Legendary Questing."
- **Total Mana Spent**: Large number `$1,240.50`, with a trending indicator (`+12% vs Last Week`).
- **Spending Intensity Chart**: Bar chart (Recharts) showing daily spend for the week. Highlight the peak day (Saturday). Use gradient fills — purple-to-teal for under-budget days, orange-to-red for over-budget days.
- **Top Power-Ups (Categories)**:
  - 🍔 Dining — 45% — horizontal progress bar
  - 🎮 Gaming — 30% — horizontal progress bar
- **Achievement unlocked card**: "Budget Boss — Under limit for 7 consecutive days! +500 XP GAINED" (glassmorphic, with secondary color glow).
- **Action buttons**: "Flex Your Stats" (share) and "Download Story" (download as image/PDF).

---

### 7. Stats / Leaderboard Page (`/stats`)

- Global or friends leaderboard table. Columns: Rank, Player, Level, XP, Streak 🔥.
- Highlight the logged-in user's row.
- A personal stats summary card: Current Level, Total XP, Current Streak, Badges Earned.
- A monthly spending chart (line or area chart, Recharts).

---

## Database Schema (Prisma)

```prisma
model User {
  id         String    @id @default(cuid())
  email      String    @unique
  name       String
  password   String
  level      Int       @default(1)
  xp         Int       @default(0)
  streak     Int       @default(0)
  createdAt  DateTime  @default(now())
  expenses   Expense[]
  quests     UserQuest[]
  badges     UserBadge[]
}

model Expense {
  id         String   @id @default(cuid())
  userId     String
  amount     Float
  category   String
  note       String?
  date       DateTime @default(now())
  xpAwarded  Int      @default(0)
  user       User     @relation(fields: [userId], references: [id])
}

model Quest {
  id          String      @id @default(cuid())
  name        String
  description String
  xpReward    Int
  targetValue Float
  type        String      // "save", "streak", "limit"
  userQuests  UserQuest[]
}

model UserQuest {
  id        String   @id @default(cuid())
  userId    String
  questId   String
  progress  Float    @default(0)
  completed Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id])
  quest     Quest    @relation(fields: [questId], references: [id])
}

model Badge {
  id         String      @id @default(cuid())
  name       String
  icon       String
  xpRequired Int
  userBadges UserBadge[]
}

model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeId   String
  earnedAt  DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  badge     Badge    @relation(fields: [badgeId], references: [id])
}
```

---

## Backend API Endpoints (Express)

```
POST   /api/auth/register         — Register new user
POST   /api/auth/login            — Login, returns JWT

GET    /api/expenses              — Get logged-in user's expenses (auth required)
POST   /api/expenses              — Add new expense, auto-awards XP
DELETE /api/expenses/:id          — Delete expense

GET    /api/quests                — Get all quests + user progress
POST   /api/quests/:id/update     — Update quest progress

GET    /api/badges                — Get all badges + earned status

GET    /api/stats/weekly          — Weekly spending summary for /story page
GET    /api/stats/leaderboard     — Global XP leaderboard

GET    /api/user/me               — Get current user profile (level, xp, streak)
```

All protected routes require `Authorization: Bearer <token>` header.
On each expense added, the backend should:
1. Save the expense.
2. Award XP (e.g. base 2 XP + category bonus).
3. Check if any quests are completed and update status.
4. Check if any badges should be unlocked.
5. Recalculate user level (e.g. every 500 XP = 1 level).
6. Update streak (consecutive days with at least 1 expense logged).

---

## Seeding

Seed the database with:
- 5 default Quests (Vault Builder, Home Chef Streak, Budget Boss, Frugal Week, First Save).
- 8 default Badges (First Save, Budget King, Investor, Protector, Whale, Ramen Warrior, Streak Lord, Wealth Wizard).
- 1 demo User with sample expenses across multiple categories.

---

## Folder Structure

```
fingame/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI (GlassCard, ProgressBar, XPChip, Badge, QuestCard, ExpenseItem, BottomNav, Navbar)
│   │   ├── pages/           # LandingPage, LoginPage, RegisterPage, Dashboard, AddExpense, QuestsPage, StoryPage, StatsPage
│   │   ├── hooks/           # useAuth, useExpenses, useQuests
│   │   ├── api/             # Axios instance + API calls
│   │   ├── store/           # Zustand or Context for auth + user state
│   │   ├── styles/          # index.css (global CSS + utilities above)
│   │   └── App.tsx          # React Router routes
│   ├── tailwind.config.ts   # Full design token config above
│   └── vite.config.ts
│
├── server/                  # Express + Prisma backend
│   ├── src/
│   │   ├── routes/          # auth.ts, expenses.ts, quests.ts, badges.ts, stats.ts, user.ts
│   │   ├── middleware/       # authMiddleware.ts (JWT verify)
│   │   ├── services/        # xpService.ts, questService.ts, badgeService.ts
│   │   └── index.ts         # Express app entry
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── tsconfig.json
│
└── README.md
```

---

## Additional UX Notes

- All cards use the `.glass-card` class (glassmorphism style).
- Progress bars are always 12px tall, fully rounded (`rounded-full`), with `.progress-sparkle` shimmer on the fill.
- XP gains show as a toast notification (animated chip, slides in from top, fades out after 2s): `+5 XP ⚡` in secondary/mint color.
- Level badges are hexagonal where possible (use CSS clip-path or SVG).
- Streak counters always show 🔥 icon with tertiary (sunset orange) color and a CSS pulse animation.
- Mobile bottom navigation bar is fixed at the bottom, glassmorphic, with the center "+" button elevated as a gradient pill.
- All interactive buttons should have `active:scale-95` transition.
- The entire app is dark-mode only (`class="dark"` on `<html>`).
- Use `react-router-dom` for routing with protected routes (redirect to `/login` if no token).

---

## Summary Checklist for Windsurf

- [ ] Initialize monorepo with `client/` (Vite+React+TS) and `server/` (Express+TS)
- [ ] Configure Tailwind with all design tokens above
- [ ] Add global CSS utilities to `index.css`
- [ ] Set up Prisma with the schema above + PostgreSQL connection
- [ ] Build all 7 pages matching the descriptions above
- [ ] Build all reusable components
- [ ] Wire up Express REST API with JWT auth
- [ ] Implement XP, quest, badge, streak logic in backend services
- [ ] Seed database with default data
- [ ] Add `.env.example` for `DATABASE_URL` and `JWT_SECRET`
