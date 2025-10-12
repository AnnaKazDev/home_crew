# Home Crew – Household Chores Planner

![build](https://img.shields.io/github/actions/workflow/status/your-org/home-crew/ci.yml?branch=main)  
![license](https://img.shields.io/github/license/your-org/home-crew)  
![node](https://img.shields.io/badge/node-22.14.0-blue)

> Home Crew is a responsive web application that helps families fairly plan, assign, and track everyday household chores.

---

## Table of Contents
1. [Project Description](#project-description)  
2. [Tech Stack](#tech-stack)  
3. [Getting Started Locally](#getting-started-locally)  
4. [Available Scripts](#available-scripts)  
5. [Project Scope](#project-scope)  
6. [Project Status](#project-status)  
7. [License](#license)

---

## Project Description
Home Crew lets up to 10 family members share a **To Do / Done** board for each day, choose from **50 predefined tasks** or add custom ones, drag-and-drop to update status, and assign who is responsible—all backed by Supabase. The system logs every action and supports English UI with full responsiveness on mobile, tablet, and desktop.

Key features  
- Admin creates a household and invites members via a 6-digit PIN  
- Email/password authentication with password-reset flow  
- Daily calendar view with “To Do” and “Done” columns  
- Drag-and-drop or click to mark tasks complete  
- Task assignment to any household member  
- Points accumulate for completed chores (gamification; reward UI post-MVP)  
- Audit log stored in PostgreSQL  
- GDPR-compliant data storage & right-to-erasure

_Target success metric_: **≥ 2 chores added per active member per day**.

---

## Tech Stack

### Front-end
- **Astro 5** – static site generator with island architecture  
- **React 19** (islands) – interactive components (drag-and-drop, modals)  
- **TypeScript 5** – static typing  
- **Tailwind CSS 4** – utility-first styling  
- **shadcn/ui** – accessible component library

### Back-end
- **Supabase** (PostgreSQL, RLS, auth, audit)  
- Optional realtime channels for live status updates

### Tooling & Infrastructure
- **OpenRouter.ai** – multi-provider LLM gateway  
- **GitHub Actions** – lint → test → build → preview → staging → production  
- **Docker** – container image (Astro Node adapter)  
- **DigitalOcean** – hosting & managed Postgres/Supabase Cloud

---

## Getting Started Locally

### Prerequisites
- **Node 22.14.0**  
  ```bash
  nvm install 22.14.0
  nvm use 22.14.0
  ```
- **Supabase CLI** (for local development)
  ```bash
  npm install -g supabase
  # or
  brew install supabase/tap/supabase
  ```

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-org/home-crew.git
cd home-crew

# 2. Install dependencies
npm install      # or pnpm install

# 3. Initialize Supabase (if not already done)
supabase init

# 4. Start Supabase locally
supabase start

# 5. Run database migrations
supabase db reset --local

# 6. Configure environment
cp .env.example .env   # add local Supabase keys from step 4

# 7. Start dev server
npm run dev
```
Open http://localhost:3001 to view the app.

### Building for production
```bash
npm run build
npm run preview   # Local preview of production build
```

---

## Available Scripts

| Command           | Description                               |
|-------------------|-------------------------------------------|
| `npm run dev`     | Start Astro dev server with hot-reload     |
| `npm run build`   | Build static & server output               |
| `npm run preview` | Preview production build locally           |
| `npm run astro`   | Run arbitrary Astro CLI commands           |
| `npm run lint`    | Lint all source files                      |
| `npm run lint:fix`| Lint and auto-fix issues                    |
| `npm run format`  | Prettier formatting for JSON/CSS/MD        |

---

## Project Scope

### In scope (MVP)
- User registration (Admin / Member)  
- Household creation & member join via PIN  
- Daily To Do / Done board with drag-and-drop  
- 50 predefined chores + CRUD for custom chores  
- Assignment of chores to household members  
- Audit log of all actions  
- English UI, fully responsive  
- Data privacy & GDPR compliance

### Out of scope (MVP)
- Push/SMS notifications  
- Multiple households per account  
- Statistics dashboard or data export  
- Native mobile apps  
- Real-time updates (optional enhancement only)

---

## Roadmap / Planned Features

- **Gamification & Rewards** – accumulate points for each completed chore and exchange them for configurable rewards (e.g., extra screen time, cinema ticket etc). Points are stored already; reward UI planned post-MVP.

---

## Project Status
| Version | Stage | Notes |
|---------|-------|-------|
| `v0.0.1` | 🚧 **Work in progress** | Core MVP features under active development. See [project board](https://github.com/your-org/home-crew/projects/1) for current tasks. |

---

## License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ ☕ 📚 🤖 ⚡</p>
