# CrowdSense AI

CrowdSense AI is a full-stack smart event management platform for stadiums and large venues. It combines Firebase Authentication, Firestore real-time updates, and weighted route guidance to reduce congestion, improve navigation, and support emergency response.

## Vertical

Smart Event Experience / Crowd Management

## What It Solves

Large events fail when people cannot see crowd pressure, routes are not adaptive, and emergency handling is slow. CrowdSense AI gives attendees live crowd visibility, safer navigation, and direct emergency assistance while giving admins and organizers operational control.

## Core Features

- Live crowd heatmaps and zone cards
- Weighted safe-route recommendations
- Queue pressure and congestion visibility
- Emergency assistance request flow for attendees
- Admin alert publishing
- Organizer dashboard for operations and analytics
- Firebase email verification flow
- Forgot-password reset flow through Firebase Auth
- Role-based routing and dashboard access
- Firestore-backed real-time updates with API fallback

## User Roles

- `USER`: view crowd status, use routes, and request emergency assistance
- `ORGANIZER`: access organizer dashboard and operational views
- `ADMIN`: publish alerts, sync crowd data, and manage roles

## Authentication Flow

1. User signs up with Firebase Auth.
2. Firebase sends an email verification link.
3. Verified users can log in and are routed by Firestore role.
4. Unverified users are redirected to the verification page.
5. Users can request a password reset from the login screen.

## Role and Security Model

- Firebase ID tokens are verified on the backend.
- Backend checks `email_verified` before allowing protected APIs.
- Firestore stores user profiles at `users/{uid}` with `email` and `role`.
- Public signup defaults to `USER` only.
- Admin role assignment is backend-controlled.
- Firestore rules protect crowd and alert writes behind admin access.

## Main Screens

### Public / Auth

- Home
- Login
- Sign Up
- Verify Email
- Forgot Password

### Protected App

- Map
- Navigation
- Alerts
- Emergency
- Admin Dashboard
- Organizer Dashboard

## Frontend Flow

- Crowd data loads from Firestore when configured, otherwise from API polling.
- Heatmap and route views update live as crowd state changes.
- Emergency screen shows safer exit guidance and allows control-room assistance requests.
- Navbar shows role-aware dashboard links after login.

## Backend Flow

- Express API serves crowd, route, queue, alert, auth, and admin endpoints.
- Firebase Admin SDK verifies tokens and resolves user roles from Firestore.
- Admin-only APIs are protected with token verification and role checks.
- Crowd sync can be pushed by admins into Firestore.

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

Routes are scored using a weighted cost model that prefers safer, less crowded paths. The safest exit is shown during emergency mode, and the guidance adapts as crowd conditions change.

## Assumptions

- Crowd density is simulated for demo conditions.
- The venue is represented as a bounded set of zones and exits.
- User location is approximated by selected zone or browser geolocation.
- Network access is available for Firebase authentication and Firestore sync.

## Tech Stack

- Frontend: React, Vite, React Router, Leaflet, React-Leaflet
- Backend: Node.js, Express, Firebase Admin SDK
- Auth and Realtime: Firebase Auth, Firestore
- Tooling: nodemon, concurrently, firebase-tools

## Repository Layout

- `client/` - React frontend
- `server/` - Express API and Firebase Admin integration
- `docs/` - architecture notes, logs, bugs, and planning docs
- `shared/` - shared zone and route data
- `scripts/` - helper scripts

## Setup

1. Install dependencies from the repository root:
   - `npm install`
2. Configure environment files:
   - `client/.env` with real `VITE_FIREBASE_*` values and `VITE_API_URL`
   - `server/.env` with Firebase Admin/server values as needed
3. Make sure `server/config/serviceAccountKey.json` is present and valid for Firebase Admin.
4. Start both apps in development:
   - `npm run dev`
5. If ports are stuck from a previous run:
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

## Demo Flow

1. Log in as admin and update crowd or publish alerts.
2. Log in as organizer and open the organizer dashboard.
3. Log in as a normal user and observe live crowd changes on the map.
4. Trigger emergency assistance and show the safe exit guidance.
5. Demonstrate forgot-password and email verification flows.
6. If needed, promote a user to admin using the backend-controlled role route.

## Demo Credentials

Use these demo credentials during judging:

- Admin email: `admin@gmail.com`
- Admin password: `123456`

If you create separate organizer credentials, keep them in the same Firestore `users/{uid}` role format with `role: ORGANIZER`.

## Deployment

- Frontend: Firebase Hosting
- Backend: Cloud Run or local Express server for development/demo
- Firebase project: `crowdsense-ai-b80b9`

If a judge field asks for a deployed link, prefer the live UI URL first so they can see the app experience immediately.

## Testing Summary

Tested scenarios:

- Signup, login, logout, and token-authenticated API calls
- Email verification redirect flow
- Forgot-password reset email flow
- Live crowd updates reflected in map and dashboard widgets
- Admin alert publishing and user-side alert visibility
- Emergency assistance request flow
- Role-based route protection for `USER`, `ORGANIZER`, and `ADMIN`

## Accessibility and UX

- Responsive layouts for desktop and mobile
- High-contrast cards and clear action states
- Labeled form controls and visible feedback messages
- Color-coded heatmap plus textual density hints
- Unified auth pages for sign up, verify email, reset password, and login

## Documentation

- `docs/README.md` - docs folder overview
- `docs/LOGS.md` - day-wise progress logs
- `docs/bugs.md` - reproducible bug tracker and fixes
- `docs/TODO.md` - planning and execution tasks

## Notes for Judges

- The first admin must be assigned manually in Firestore.
- After the first admin exists, backend-controlled role promotion can be used safely.
- The current flow is designed to be demo-friendly, secure, and easy to explain.

## Final Submission Checklist

- Public GitHub repository is available and includes `client/`, `server/`, `docs/`, and this README.
- Firebase Auth email/password sign-in is enabled.
- Frontend env values are real, not placeholder strings.
- Firestore rules are deployed.
- Admin account is present in `users/{uid}` with `role: ADMIN`.
- Demo credentials are verified before presenting.
- The deployed UI link is the one you want judges to click first.
