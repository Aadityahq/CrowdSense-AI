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
	- Reduced real-time crowd churn by slowing sync/poll intervals to `15s` and switching crowd updates to small drift instead of full random regeneration.
	- Removed random noise from route scoring so recommendations stay stable between refreshes.

## Notes

- Keep logs short and factual.
- Add one entry per work session or milestone.
- For each date, split updates into `Morning`, `Evening`, and `Night` sections.

## 2026-04-18

### Evening

- Performed full flow audit against target demo sequence (auth, role routing, backend token verification, real-time crowd, alerts, emergency, organizer).
- Backend/API runtime checks (live):
	- Verified API health and data endpoints return 200 (`/`, `/api/crowd`, `/api/alerts`, `/api/queues`, `/api/routes`).
	- Verified protected endpoints reject unauthenticated and fake tokens (`POST /api/alerts`, `GET /api/auth/me`).
	- Verified role-header spoofing no longer bypasses protection (`x-user-role: ADMIN` without bearer token still returns 401).
- Architecture checks (code-level):
	- Confirmed frontend sends Firebase ID token in API requests.
	- Confirmed backend verifies Firebase ID token and resolves role via Firestore user profile.
	- Confirmed role-based route redirection exists in login flow.
	- Confirmed crowd and alerts pages subscribe to Firestore listeners for real-time updates.
	- Confirmed route algorithm uses weighted cost formula: distance + (crowd_density * 0.5).
- Gaps found and recorded in bug tracker:
	- Added BUG-007: no manual admin crowd-zone update flow.
	- Added BUG-008: no admin alert-create UI wired to protected backend endpoint.
	- Added BUG-009: no toast/notification on new alerts.
	- Added BUG-010: emergency mode uses hardcoded start node A1.
	- Added BUG-011: positive /api/auth/me path still needs real token verification from browser session.

### Night

- Implemented priority integration fixes from audit findings:
	- Added admin alert broadcast form in `client/src/pages/AdminDashboard.jsx` wired to `api.createAlert`.
	- Added admin crowd-control form in `client/src/pages/AdminDashboard.jsx` with direct Firestore updates for selected zone density/queue.
	- Added success/error action feedback for both admin flows.
	- Upgraded emergency mode to use browser geolocation and nearest-zone mapping instead of hardcoded start node.
	- Upgraded organizer analytics with most crowded/least crowded zone metrics and operational insight badges.
	- Added live new-alert notification message on alerts page when unseen Firestore alert documents arrive.
- Validation:
	- Confirmed no file-level errors in updated frontend pages.
	- Verified frontend production build passes successfully after all updates.
- Documentation:
	- Updated bug tracker statuses for BUG-007, BUG-008, BUG-009, and BUG-010 to fixed (build-level verification).
	- Verified BUG-011 with a real Firebase ID token: GET /api/auth/me returned 200, POST /api/alerts returned 201, and POST /api/crowd/sync returned 200.
	- Confirmed backend role resolution from Firestore users/{uid} works for an ADMIN session.

## 2026-04-20

### Evening

- Implemented end-to-end email verification enforcement:
	- Updated signup flow to create Firebase account and send verification email immediately.
	- Stopped creating Firestore user docs during signup; moved profile creation to verified login path.
	- Added dedicated verify-email screen with resend and verification recheck actions.
	- Added frontend route `/verify-email` and protected-route enforcement for `emailVerified`.
- Updated login/session behavior:
	- Blocked unverified logins from entering the app.
	- Auto-resend verification email on unverified login attempt and redirect to verify-email flow.
	- Added `createUserIfNotExists` on verified login to ensure `users/{uid}` profile exists.

### Night

- Hardened server-side auth security:
	- Added backend middleware check for `decoded.email_verified`.
	- Protected APIs now return `403 Email not verified` for unverified accounts.
- Updated docs for submission readiness:
	- Expanded root `README.md` coverage with testing, accessibility, assumptions, and secure flow notes.
	- Updated `docs/README.md` with current security posture and verification architecture.
- Validation completed:
	- Verified no editor errors in all modified files.
	- Verified frontend build success after verification-flow integration.
- Auth UX polish for demo readiness:
	- Upgraded verify-email page with automatic verification polling (3-second interval) and auto-redirect after email is confirmed.
	- Updated unverified login behavior to keep session active for verification polling instead of forcing sign-out.
	- Added guided, user-friendly copy in signup/login/verify screens so next actions are always explicit.
	- Added visual UX refinements for auth hints, secure-access note, and verification progress messaging.
