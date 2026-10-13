# HRO — Hiring Requisition & Onboarding (Frontend Foundation)

HRO is an enterprise hiring requisition and onboarding platform built for two internal roles: **Hiring Manager** and **HR Specialist**.

This repository contains the **Frontend Foundation Phase**, establishing:

- Production-grade Design Token and Theming Engine (`styles/tokens.css` with zero raw hex in UI).
- App Shell with collapsible 240px/64px sidebar, breadcrumbs, command palette (`Ctrl+K`), and instantaneous demo role switcher.
- Restyled component library with composite domain components (`DataTable`, `StatCard`, `StatusBadge`, `StageStepper`, `KanbanColumn`).
- Typed mock data layer with simulated latency (300–700ms) and versioned browser persistence (`hro:v1`).
- Role-aware routing with active route guards.

---

## Getting Started

### Prerequisites

- Node.js LTS (>= 20.x, pinned in `.nvmrc`)
- pnpm (>= 9.x)

### Setup & Local Development

```bash
# Clone the repository
git clone https://github.com/adityaworxx/HRO.git
cd HRO

# Install dependencies (strictly managed with pnpm)
pnpm install

# Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Verification & Quality Scripts

```bash
# Run one-click comprehensive verification gate
pnpm verify

# Individual checks
pnpm lint          # Strict ESLint with architecture boundary rules
pnpm typecheck     # TypeScript strict type checking
pnpm check:tokens  # Token police: blocks raw hex/rgb outside tokens.css
pnpm test          # Vitest unit test suite
pnpm build         # Production Next.js build
```

---

## Design System Catalog

Visit `/design-system` in your browser (hidden from main navigation) to inspect all tokens, type scale, spacing grids, status badges, and component interactive states in both Dark and Light themes.

---

## Switching to a Real Backend

1. Open `services/http/httpApi.ts` and implement the HTTP client methods matching `HroApiClient`.
2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_DATA_SOURCE=http
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```
3. No UI components, routes, or custom hooks require any alteration.
