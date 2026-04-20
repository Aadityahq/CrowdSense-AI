# CrowdSense AI

CrowdSense AI is a hackathon-ready smart stadium experience system that uses Firebase Auth and Firestore to help attendees navigate large venues, avoid crowded areas, reduce waiting times, and respond safely during emergencies.

## What it includes

- Live crowd heatmaps
- Smart route suggestions
- Queue time estimates
- Emergency guidance
- Admin monitoring dashboard
- Firebase Auth session handling
- Firestore-backed real-time updates

## Repository layout

- `client/` - React frontend
- `server/` - Node.js + Express backend
- `docs/` - project documentation and execution notes
- `shared/` - shared constants and stadium layout data
- `scripts/` - helper scripts for demo data

## Quick start

1. Copy `.env.example` to `.env` and add your Firebase Web app values.
2. Install dependencies in `client/` and `server/`.
3. Run `npm install` at the root if you want the combined dev script.
4. Start the app with `npm run dev`.

## How to use docs

- Open `docs/README.md` for documentation index and usage.
- Track build tasks in `docs/TODO.md`.
- Keep daily progress in `docs/LOGS.md`.
- Use `docs/FEATURE_TRANSFER.md` when applying CyberShield features.
