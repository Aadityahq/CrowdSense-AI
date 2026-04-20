# CrowdSense AI Documentation

## Overview

CrowdSense AI is a smart event operations platform for stadiums and large venues. It combines Firebase Authentication, Firestore-backed real-time crowd visibility, weighted route guidance, emergency assistance, and admin/organizer control surfaces to reduce congestion and improve safety.

This docs folder captures the working product, the implementation decisions, and the handoff details needed to understand how the system behaves end to end.

## What The Product Does

- Shows live crowd density through heatmaps and zone cards.
- Recommends safer paths using a weighted route score.
- Lets attendees request emergency assistance.
- Lets admins publish alerts and sync crowd state.
- Gives organizers an operations dashboard for monitoring.
- Protects access with Firebase Auth, email verification, and role-based routing.

## Main Application Surfaces

### Public / Authentication

- Home
- Login
- Sign Up
- Verify Email
- Forgot Password

### Protected Experience

- Map
- Navigation
- Alerts
- Emergency
- Admin Dashboard
- Organizer Dashboard

## Architecture At A Glance

### Frontend

- Built with React and Vite.
- Uses React Router for page routing.
- Uses Firebase Auth for login, signup, verification, and password reset.
- Uses Firestore listeners for live data when Firebase is configured.
- Falls back to API polling when realtime Firestore access is not available.

### Backend

- Built with Express.
- Uses Firebase Admin SDK to verify ID tokens.
- Resolves user roles from Firestore user profiles.
- Protects admin-only write paths with middleware.
- Exposes operational APIs for crowd, routes, queues, alerts, auth, and admin actions.

### Data Model

- User profiles live in `users/{uid}`.
- Roles are stored in Firestore as `USER`, `ORGANIZER`, or `ADMIN`.
- Crowd state is stored in `crowd_zones`.
- Alerts are stored in `alerts`.

## Core Modules

- Attendee web app
- Admin dashboard
- Organizer dashboard
- Firebase auth session flow
- Email verification gate for account activation
- Password reset flow
- Real-time crowd data layer
- Route and prediction logic
- Emergency assistance request flow

## User Roles

- `USER`: can view crowd data, navigate, and request emergency assistance.
- `ORGANIZER`: can access the organizer dashboard and operational views.
- `ADMIN`: can publish alerts, sync crowd data, and manage roles.

## Authentication Flow

1. User signs up with Firebase Auth.
2. Firebase sends a verification email.
3. User opens the verify-email page and can resend the link if needed.
4. The app auto-checks verification status and redirects when confirmed.
5. Login reloads the Firebase user to avoid stale verification state.
6. Protected routes and protected APIs require verification before access.
7. Forgot password sends a reset email through Firebase Auth.

## Security Posture

- Firebase ID tokens are verified on protected backend routes.
- Backend checks `email_verified` before allowing protected APIs.
- Firestore user profiles are created after verified login.
- Public signup defaults to `USER` only.
- Admin role assignment is backend-controlled.
- Firestore rules protect crowd and alert writes behind admin access.
- Admin promotion is handled through backend-controlled endpoints rather than frontend trust.

## Frontend Flow

- Crowd data loads from Firestore when Firebase is configured.
- If Firebase is not available, the app continues using API polling.
- Heatmaps and zone cards render current crowd state.
- Route recommendations adapt to crowd pressure.
- Emergency mode shows safer exits and lets users request control-room assistance.
- Navbar reveals role-aware dashboard links after login.
- Login, signup, verify-email, and forgot-password screens are designed as one guided auth flow.

## Backend Flow

- Express API serves crowd, route, queue, alert, auth, and admin endpoints.
- Firebase Admin SDK verifies tokens and resolves user roles from Firestore.
- Admin-only APIs are protected with token verification and role checks.
- Crowd sync can be pushed by admins into Firestore.
- Role updates are handled only from the backend.

## API Routes

### Public

- `GET /` - health message
- `GET /api/crowd` - current crowd data
- `GET /api/routes` - suggested routes
- `GET /api/queues` - queue data
- `GET /api/alerts` - alert list

### Protected

- `GET /api/auth/me` - current verified session
- `POST /api/alerts/emergency-assistance` - emergency assistance request
- `POST /api/alerts` - create admin alert
- `POST /api/crowd/sync` - sync crowd snapshot as admin
- `PATCH /api/auth/users/:uid/role` - admin role update endpoint
- `POST /api/admin/make-admin` - dedicated admin promotion endpoint

## Smart Routing Logic

Routes are scored using a weighted cost model that prefers safer, less crowded paths. The system uses crowd density and queue pressure to bias users away from congested zones. During emergency mode, the safest exit is highlighted and the guidance updates as conditions change.

## Demo Flow

Use this sequence during judging:

1. Sign up a new attendee and verify the email.
2. Log in as a normal user and show the map, alerts, and emergency flow.
3. Log in as organizer and show the organizer dashboard.
4. Log in as admin and show crowd sync, alerts, and role management.
5. Trigger forgot-password and show the reset email flow.
6. Trigger emergency assistance and show the safe-route guidance.

## Setup

1. Install dependencies from the repository root:
	- `npm install`
2. Configure the frontend environment:
	- `client/.env` should contain real `VITE_FIREBASE_*` values and `VITE_API_URL`
3. Configure the backend environment if needed:
	- `server/.env` for server-specific settings
4. Make sure the Firebase service account file exists:
	- `server/config/serviceAccountKey.json`
5. Start both apps in development:
	- `npm run dev`
6. If ports are stuck from a previous run:
	- `npm run kill-ports`

## Useful Scripts

From the repository root:

- `npm run dev` - start client and server together after clearing stale ports
- `npm run dev:client` - start the Vite client only
- `npm run dev:server` - start the Express server only
- `npm run start` - start the server workspace
- `npm run kill-ports` - clear common dev ports used by the project

From the workspace packages:

- `npm run build -w client` - build the production frontend bundle
- `npm run start -w client` - start the Vite client directly
- `npm run start -w server` - start the Express server directly

## Repository Layout

- `client/` - React frontend
- `server/` - Express API and Firebase Admin integration
- `docs/` - architecture notes, logs, bugs, and planning docs
- `shared/` - shared zone and route data
- `scripts/` - helper scripts

## Assumptions

- Crowd density is simulated for demo conditions.
- The venue is represented as a bounded set of zones and exits.
- User location is approximated by the selected zone or browser geolocation.
- Network access is available for Firebase authentication and Firestore sync.

## Testing Summary

Tested scenarios:

- Signup, login, logout, and token-authenticated API calls
- Email verification redirect flow
- Forgot-password reset email flow
- Live crowd updates reflected in map and dashboard widgets
- Admin alert publishing and user-side alert visibility
- Emergency assistance request flow
- Role-based route protection for `USER`, `ORGANIZER`, and `ADMIN`

## Accessibility And UX

- Responsive layouts for desktop and mobile
- High-contrast cards and clear action states
- Labeled form controls and visible feedback messages
- Color-coded heatmap plus textual density hints
- Unified auth pages for sign up, verify email, reset password, and login

## Docs Index

- `docs/README.md` - this overview and docs map
- `docs/CONTEXT.md` - problem statement and solution direction
- `docs/TODO.md` - execution checklist and pending work
- `docs/LOGS.md` - dated progress and implementation notes
- `docs/bugs.md` - bug tracker with repro steps and fixes
- `docs/FEATURE_TRANSFER.md` - reusable feature transfer notes

