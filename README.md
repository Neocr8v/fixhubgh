# Hostel Maintenance Reporting & Tracking System

A Next.js work-order system for university hostels: students report maintenance
issues with photos, admins route them to technicians, and everyone tracks
progress from report to resolved.

Built from the project brief: student reporting + image upload, technician
assignment, status tracking, and an analytics dashboard — plus the "advanced
features" (automatic priority detection and duplicate-complaint detection).

## Stack

- **Next.js 14** (App Router, TypeScript, Route Handlers as the API)
- **SQLite via Node's built-in `node:sqlite`** — no native module to compile,
  no `npm install` build step, just a single file at `data/hostel.db`
- **Tailwind CSS** for styling
- **Recharts** for the admin analytics dashboard
- JWT session cookies for auth (`jsonwebtoken` + `bcryptjs`)

## Getting started

**Requires Node.js 22.5 or newer** (Node.js 24+ recommended — that's where
`node:sqlite` is fully stable with no warning; on 22.5–23.x it works but logs
an experimental warning to the console, which is harmless).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A SQLite database is
created automatically on first run at `data/hostel.db`, seeded with demo
accounts and a handful of sample tickets.

### Demo accounts

| Role       | Email                     | Password   |
|------------|---------------------------|------------|
| Admin      | admin@hostel.edu          | admin123   |
| Technician | marcus.reid@hostel.edu    | tech123    |
| Technician | ines.okafor@hostel.edu    | tech123    |
| Technician | sam.lindqvist@hostel.edu  | tech123    |
| Student    | priya.n@student.edu       | student123 |
| Student    | tom.a@student.edu         | student123 |

These are also available as one-tap buttons on the login screen. New students
can self-register from the "Create an account" link.

## What's included

- **Students** — report an issue (title, category, room, description, optional
  photo), see status update live (Reported → Assigned → In progress →
  Resolved), read the full activity timeline on each ticket.
- **Admins** — an overview dashboard (tickets by category/status, 14-day
  trend, technician load, average resolution time), plus a filterable list of
  every ticket with technician assignment and priority overrides.
- **Technicians** — see only what's assigned to them, move a ticket from
  Assigned → In progress → Resolved, leave notes.
- **Automatic priority detection** — the wording of a report is scanned for
  urgent/high-severity signals (e.g. "gas leak", "no water", "sparking") and
  the ticket is pre-flagged accordingly; admins can still override it.
- **Duplicate detection** — new reports are checked against other open
  tickets in the same room/category with overlapping wording, and flagged so
  admins can spot hostel-wide problems (e.g. a building-wide water outage)
  instead of triaging the same issue six times.

## Notes on the image uploads

To keep setup to a single `npm install` with no file storage or cloud bucket
to configure, photos are stored as base64 inside the SQLite row (capped at
~4.5MB per photo). This is fine for a course project or small hostel; for a
production deployment you'd want to swap this for an object store (S3, R2,
etc.) and store just the URL.

## Project structure

```
app/
  api/            → route handlers (auth, issues, technicians, analytics)
  dashboard/      → student / admin / technician pages + issue detail
  page.tsx        → login / landing page
  register/       → student self-registration
components/       → shared UI (ticket cards, dashboards, charts)
lib/
  db.ts           → SQLite schema + seed data
  auth.ts         → session cookie helpers
  issues.ts       → priority detection, duplicate detection, ticket numbering
  constants.ts    → client-safe shared constants (categories, status labels)
data/             → SQLite database file (created on first run, gitignored)
```

## Production build

```bash
npm run build
npm run start
```

Set a real `SESSION_SECRET` environment variable in production (falls back to
a development default otherwise).
