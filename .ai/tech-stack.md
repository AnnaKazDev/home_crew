# Tech Stack – Home Crew

## Front-end

- **Astro 5** – static site generation with JavaScript “islands”; minimal JS, fast LCP.
- **React 19 (islands)** – interactive pieces only where needed (drag-and-drop, modals, forms).
- **TypeScript 5** – static typing for better DX and fewer runtime errors.
- **Tailwind CSS 4** – utility-first styling and a built-in design system.
- **shadcn/ui** – accessible React components built on Tailwind (modal, dialog, dropdown, etc.).

## Back-end

- **Supabase** (open-source BaaS)
  - PostgreSQL + extensions (row-level security; audit trails).
  - Built-in email/password auth, password reset, JWT sessions.
  - Realtime channels (optional in MVP, e.g., for status changes).
  - Auto-generated REST & GraphQL endpoints from the schema.

## AI / ML

- **OpenRouter.ai** – gateway to multiple LLM providers (OpenAI, Anthropic, Google). Supports spend limits per API key.

## Testing & Quality Assurance

- **Vitest** – fast unit testing framework for TypeScript/JavaScript with native ESM support.
- **React Testing Library** – testing utilities for React components with focus on user interactions.
- **Playwright** – end-to-end testing framework for modern web apps with cross-browser support.

## CI/CD & Hosting

- **GitHub Actions** – lint → test → build → preview → staging → manual approve → production.
- **Docker** – container image (Astro Node adapter) built in every pipeline.
- **DigitalOcean**
  - Droplet / App Platform for hosting the container.
  - VPC + TLS load balancer.
  - Managed Postgres or Supabase Cloud, with an upgrade path to AWS RDS when scaling.

## Rationale

1. **Fast MVP** – Supabase removes custom auth/server code; shadcn/ui accelerates UI build-out.
2. **Scalability** – Astro pre-render + Postgres replicas comfortably support the first tens of thousands of households.
3. **Cost** – initial cost < $100 USD/month (free/entry tiers); costs scale predictably with usage.
4. **Security** – TLS, encryption at rest, RLS; GitHub Secrets in CI.
5. **Flexibility** – React can be swapped with Vue 3 or Svelte without changing Astro; the database can migrate to RDS if needed.
