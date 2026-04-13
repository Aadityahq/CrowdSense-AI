# CrowdSense AI Development Logs

## 2026-04-14

### Morning

- Initialized full repository scaffold:
	- Root setup (`package.json`, `.gitignore`, `.env.example`, root `README.md`).
	- Created folder structure for `client`, `server`, `docs`, `shared`, and `scripts`.
- Created core documentation set:
	- Added `docs/README.md`, `docs/TODO.md`, `docs/CONTEXT.md`, and this `docs/LOGS.md`.
	- Added transfer documentation in `docs/FEATURE_TRANSFER.md`.
	- Added docs usage notes in both `docs/README.md` and root `README.md`.
- Implemented frontend base application:
	- Set up Vite + React app shell with routing.
	- Added pages: Home, MapView, Navigation, Alerts, Emergency, AdminDashboard, Login.
	- Added reusable components: Navbar, Heatmap, RouteMap, AlertBox, Sidebar, Loader.
	- Added service layer and utility modules.
- Implemented backend base application:
	- Set up Express server, API routing, and middleware structure.
	- Added modular routes/controllers/services/models for crowd, route, queue, and alerts.
	- Added optional database bootstrapping behavior when `MONGODB_URI` is present.

### Evening

- Upgraded frontend UI to premium dashboard style:
	- Redesigned Home hero and CTA flow.
	- Redesigned Map view to dark control sidebar + map stage layout.
	- Redesigned Emergency page with stronger visual hierarchy.
	- Added map overlay cards, trend/status blocks, and improved spacing/visual polish.
- Implemented real map and route visuals:
	- Integrated `leaflet` + `react-leaflet`.
	- Rendered zone circles with density-based coloring.
	- Rendered route overlays using map polylines.
- Implemented end-to-end integration:
	- Added auth API (`/api/auth/login`) with JWT token generation.
	- Added auth and role middleware modules.
	- Added alert create/read APIs (`GET/POST /api/alerts`).
	- Wired frontend API layer (`apiGet`, `apiPost`, unified `api` object).
	- Connected Alerts and AdminDashboard pages to backend responses.
	- Added Login page and persisted token/user in localStorage.
- Implemented performance and intelligence upgrades:
	- Added crowd polling every 3 seconds from backend in context layer.
	- Added trend prediction (`increasing`, `decreasing`, `stable`).
	- Updated route cost formula to weighted cost:
		- `cost = distance + (crowd_density * 0.5)`.
	- Added safest-exit selection for Emergency mode.
	- Added Crowd Score and last-updated indicators to Map view.
- Added production-ready OTP auth flow:
	- Added signup and login OTP request endpoints.
	- Added OTP verification endpoint that issues JWT tokens.
	- Added role selection during authentication.
	- Removed Admin from the top navigation.
	- Added role-based redirection after login:
		- `USER` -> map experience
		- `ADMIN` -> control panel
		- `ORGANIZER` -> analytics dashboard
	- Added protected routes for USER, ADMIN, and ORGANIZER screens.
	- Added organizer dashboard for analytics-focused role UI.
	- Migrated frontend auth flow to Firebase Auth (email/password) with role lookup from Firestore.
	- Added dedicated signup screen that writes role profiles into Firestore (`users/{email}`).
	- Updated protected routes to check Firebase session state via `onAuthStateChanged`.
	- Added `firestore.rules` template for role-based security (`ADMIN` write on crowd/alerts, authenticated read).

### Night

- Added Firebase Firestore real-time path for crowd data:
	- Created `client/src/firebase.js` with guarded Firebase initialization.
	- Subscribed `CrowdContext` to the `crowd_zones` collection when Firebase config is available.
	- Preserved API polling fallback when Firebase env variables are not configured.
	- Added client Firebase env example file for setup guidance.
	- Added server-side Firestore read/write helpers and a `POST /api/crowd/sync` endpoint.
	- Added automatic backend crowd sync loop so the server can push live updates into Firestore.
	- Switched server Firebase setup to use the service account key from `server/config/serviceAccountKey.json`.
	- Added Firestore-backed alerts storage and seeded alert documents when empty.
	- Connected the Alerts page to Firestore real-time listeners with polling fallback.
	- Updated alert creation so new alerts can be written back into Firestore.
- Stability and runtime improvements:
	- Changed default server/client API port usage from `5000` to `5001` to avoid local conflicts.
	- Diagnosed and resolved repeated `EADDRINUSE` issues during dev testing.
	- Verified key API responses via curl for crowd, alerts, and login endpoints.
	- Installed required dependencies (`leaflet`, `react-leaflet`, `jsonwebtoken`, Vite React plugin, Firebase SDK, Firebase CLI tools).
	- Added Firestore auto-sync guard so permission errors disable the loop after the first failure instead of spamming logs.
- Validation and quality checks:
	- Ran repeated file-level error checks after major edits.
	- Confirmed no syntax/type errors in modified frontend/backend/docs files.
- Firebase console configuration sync:
	- Applied the current Firebase Web App values to `client/.env` (API key, auth domain, project ID, storage bucket, sender ID, app ID, database URL, measurement ID).
	- Updated `client/.env.example` to include `VITE_FIREBASE_DATABASE_URL` and `VITE_FIREBASE_MEASUREMENT_ID` placeholders.
	- Added Firebase CLI project config files: `firebase.json` and `.firebaserc` mapped to project `crowdsense-ai-b80b9`.
	- Verified Firebase env values were loaded correctly; frontend startup failure was due to missing `start` script in client package scripts.
	- Added `start` script alias in `client/package.json` so both `npm start` and `npm run dev` work.

- End-to-end live verification:
	- Confirmed backend is live on port `5001` and frontend dev server is live (`5173`/`5174`).
	- Verified crowd and alerts APIs return live payloads.
	- Verified auth endpoints now require role payload (`signup` and `login` return OTP-sent responses when role is provided).
	- Verified frontend production build passes successfully via `npm run build`.
	- Firebase rules deployment remains blocked until CLI auth is completed with `npx firebase login`.

- Bug testing and hardening:
	- Reproduced unauthorized alert creation via `POST /api/alerts` without auth.
	- Reproduced backend crash path triggered by `POST /api/crowd/sync` when Firestore API is disabled.
	- Added admin protection middleware to write endpoints: `POST /api/alerts` and `POST /api/crowd/sync`.
	- Added defensive error handling in crowd controller to prevent server termination on sync failures.
	- Added dedicated bug tracking file `docs/bugs.md` with issue IDs, repro steps, and statuses.
	- Verified fixes live: both protected endpoints now return `401` without token and backend remains stable after sync probes.
	- Fixed frontend map crash (`Circle radius cannot be NaN`) by adding numeric sanitization in heatmap rendering and crowd normalization.
	- Fixed emergency screen dependency failure caused by shared map crash path.
	- Migrated Firebase profile documents from email-keyed IDs to UID-keyed IDs in login/signup flow.
	- Updated Firestore rules to UID-based ownership and UID-based admin-role checks.
	- Added backward-compatible login fallback for legacy `users/{email}` profile documents during transition.
	- Diagnosed recurring `EADDRINUSE` dev startup failures as stale Node listeners on ports `5001`, `5173`, `5174`, and `5175`.
	- Cleared stale listeners and verified clean startup with backend on `5001` and frontend on `5173`.
	- Added root script `kill-ports` to safely clear stale listeners on `5001`, `5173`, `5174`, and `5175`.
	- Updated root `dev` script to run `kill-ports` before launching server/client concurrently.
	- Corrected `client/.env` API base URL back to `http://localhost:5001` (it was incorrectly set to Vite port `5175`).

## Notes

- Keep logs short and factual.
- Add one entry per work session or milestone.
- For each date, split updates into `Morning`, `Evening`, and `Night` sections.
