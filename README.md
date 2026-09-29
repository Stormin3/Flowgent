# Flowgent

Visual workflow automation builder — connect apps with triggers and actions on a node-based canvas, no Zapier subscription required.

View the live demo in AI Studio: https://ai.studio/apps/db73401c-63d8-4110-a7e8-ff7b9e270979

## Features

- **Visual workflow builder** — drag-and-drop canvas for triggers and actions (e.g. "new Gmail email" → "post to Slack #alerts")
- **App integrations** — connect apps and authorize connections from the Connections view
- **Step-level error handling** — per-step rules: stop, continue, retry (with exponential backoff), fallback step, or notify
- **Workflow templates** — start from prebuilt templates or the included example workflow
- **Run monitoring** — watch workflow executions and step status
- **AI research chatbot** — Gemini-powered assistant for building and refining workflows
- **Dashboard** — overview of workflows, active/inactive status, and recent activity
- **Dark mode** — system-aware theme with manual toggle
- **Local persistence** — workflows stored in SQLite via the bundled Express server

## Quickstart

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy the environment template and fill in your values:
   `cp .env.example .env`

   | Variable | Purpose |
   |---|---|
   | `GEMINI_API_KEY` | Powers the research chatbot |
   | `APP_URL` | Public URL for OAuth callbacks and API endpoints |

3. Run the dev server (serves the Express API + Vite frontend):
   `npm run dev`
4. Production build and start:
   `npm run build && npm start`
5. Type-check:
   `npm run lint`

## Tech stack

React 19 · @xyflow/react · Express · better-sqlite3 · Vite · Tailwind CSS 4 · Gemini AI · Framer Motion

## Project structure

- `src/components/` — `WorkflowBuilder`, `Dashboard`, `ResearchChatbot`, `AppsView`, `ConnectionsView`, `MonitoringView`, `TemplatesView`, `Sidebar`
- `src/data/` — workflow `types` and prebuilt `templates`
- `server.ts` — Express API with SQLite persistence

## Notes

- An example workflow ("Process Important Emails": Gmail trigger → Slack alert) is seeded on first load so you can see the builder in action immediately.
- Workflow data persists in a local SQLite database created by the Express server — no external database to configure.
