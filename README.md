# CrowdSense AI

CrowdSense AI is a full-stack smart event management platform for stadiums and large venues. It combines Firebase Auth, Firestore real-time updates, and AI-assisted route logic to reduce congestion, improve navigation, and support emergency response.

## Vertical

Smart Event Experience / Crowd Management

## Repository Layout

- `client/` - React + Vite frontend
- `server/` - Node.js + Express API
- `docs/` - architecture notes, logs, and execution docs
- `shared/` - shared static data (zones, exits, routes)
- `scripts/` - local helper scripts

## Problem Statement

Large events suffer from congestion, poor wayfinding, and delayed response during emergencies. Attendees often move blindly into dense zones while organizers lack real-time visibility to act early.

## Approach and Core Logic

1. **Real-time crowd visibility**
	Crowd zone snapshots are published to Firestore and streamed to clients via `onSnapshot` (with API polling fallback).

2. **Role-based control model**
	- `USER`: can view crowd state, receive safer routes, and request emergency assistance.
	- `ORGANIZER`: operational visibility and management actions.
	- `ADMIN`: can publish alerts and update operational crowd data.

3. **Smart routing using weighted cost**
	Candidate paths are scored by a weighted function using crowd density and queue pressure. The lowest-cost safe path is shown to the attendee.

## How It Works

1. User logs in with Firebase Auth.
2. Frontend loads crowd zones and alert stream.
3. Heatmap and zone cards reflect live occupancy.
4. Admin/organizer actions update Firestore/API state.
5. Users get updated route recommendations.
6. During emergency, user can trigger "Alert Control Room" and receive safe-exit guidance.

## Key Features

- Live heatmap for crowd density
- Queue pressure and congestion visibility
- Route recommendation toward safer exits
- Emergency mode and assistance request flow
- Role-aware dashboards and protected APIs

## Security Model

- Firebase ID tokens are verified on backend protected routes.
- Email verification is enforced before route access and API authorization.
- Admin-only backend routes are guarded with role middleware.
- Firestore rules enforce:
  - signed-in read access for operational collections
  - admin-only writes for `crowd_zones` and `alerts`
  - prevention of self-elevation to admin via profile writes

Security features:

- Email verification enforced
- Firebase Authentication used
- Backend validates `email_verified` claim
- Role-based access control implemented

## Assumptions

- Crowd density values are simulated for demo conditions.
- A venue can be represented as bounded zones and exits.
- User device location/zone is approximated by selected source zone.
- Network quality is sufficient for periodic sync.

## Testing Summary

Tested scenarios:

- Signup, login, logout, and token-authenticated API calls
- Live crowd updates reflected in map/home widgets
- Admin alert publishing and user-side alert visibility
- Emergency assistance request flow from attendee screen
- Role-based route protection (USER/ORGANIZER/ADMIN)

## Accessibility and UX

- Responsive layout for desktop and mobile
- High-contrast status cards and labeled controls
- Color-coded heatmap plus textual density hints
- Clear action states for loading, success, and error feedback

## Tech Stack

- Frontend: React, Vite, React Router, Leaflet
- Backend: Node.js, Express
- Auth and Realtime: Firebase Auth, Firestore
- Optional deployment target: Cloud Run / Firebase Hosting

## Setup

1. Install root dependencies:
	- `npm install`
2. Configure environment files:
	- root `.env` as needed
	- `client/.env` with `VITE_FIREBASE_*` and API URL
	- `server/.env` with Firebase Admin credentials and server config
3. Run full stack in dev mode:
	- `npm run dev`
4. If ports are occupied:
	- `npm run kill-ports`

## Demo Flow (Judge-Friendly)

1. Login as admin and update crowd/alerts.
2. Open attendee view and observe real-time updates.
3. Trigger emergency action and verify assistance request is recorded.
4. Show safer path guidance adapting to crowd conditions.

## Documentation Index

- `docs/README.md` - docs folder overview
- `docs/LOGS.md` - day-wise progress logs
- `docs/bugs.md` - reproducible bug tracker and fixes
- `docs/TODO.md` - planned tasks
