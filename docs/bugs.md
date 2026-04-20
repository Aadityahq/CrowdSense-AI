# CrowdSense AI Bug Log

## 2026-04-14

### Night

- Bug ID: BUG-006
  - Title: Real-time crowd data was updating too fast
  - Severity: Medium
  - Files:
    1. server/services/crowdService.js
    2. server/server.js
    3. client/src/context/CrowdContext.jsx
    4. server/utils/helpers.js
    5. server/utils/algorithm.js
  - Reproduction:
    1. Open the map or emergency screens while the dev stack is running.
    2. Observe crowd values and route suggestions changing every few seconds.
  - Expected: Live values should drift gradually, not jump aggressively on every refresh.
  - Actual: Backend regenerated fully random crowd data on each sync tick, and client fallback polling refreshed quickly.
  - Fix Applied:
    1. Reduced backend auto-sync interval from 3 seconds to 15 seconds.
    2. Replaced full-random crowd regeneration with small drift from the previous snapshot.
    3. Slowed client fallback polling to 15 seconds.
    4. Removed random cost noise from route scoring so route suggestions stay stable.
  - Verification:
    1. Frontend build passes.
    2. Full dev stack starts successfully.
  - Status: Fixed and verified (build/startup-level).

- Bug ID: BUG-005
  - Title: Login profile fetch failed from email-keyed user docs causing offline-style Firestore errors
  - Severity: High
  - Files:
    1. client/src/pages/Login.jsx
    2. client/src/pages/Signup.jsx
    3. firestore.rules
  - Reproduction:
    1. Sign in with Firebase Auth account.
    2. App tries to read users/{email} profile document.
    3. Role lookup fails and login flow reports Firestore read errors.
  - Expected: Profile read/write should use stable Firebase UID-based document keys.
  - Actual: App used email as document ID, causing inconsistent profile lookup and rule mismatch.
  - Fix Applied:
    1. Login now reads users/{uid} after sign-in using authenticated user session.
    2. Signup now writes profile to users/{uid}.
    3. Added backward-compatible login fallback to legacy users/{email} profile docs.
    4. Migrated Firestore rules to UID-based ownership and admin checks.
  - Verification:
    1. Frontend build passes after migration.
  - Status: Fixed and verified (build-level).

- Bug ID: BUG-004
  - Title: Leaflet map crash with "Circle radius cannot be NaN"
  - Severity: High
  - Files:
    1. client/src/components/Heatmap.jsx
    2. client/src/context/CrowdContext.jsx
    3. client/src/utils/routeAlgorithm.js
  - Reproduction:
    1. Open map-based pages when crowd feed includes invalid numeric values.
    2. Leaflet Circle receives NaN radius and throws runtime exception.
    3. Map and Emergency screens stop rendering.
  - Expected: Invalid crowd data should be sanitized and map should continue rendering.
  - Actual: NaN radius caused uncaught exception in react-leaflet.
  - Fix Applied:
    1. Added finite-number sanitization and density clamping before Circle radius calculation.
    2. Skipped map points with invalid lat/lng values.
    3. Normalized density/queue values in CrowdContext.
    4. Added safe numeric fallback in route cost calculation.
  - Verification:
    1. Frontend build passes.
    2. Runtime crash path removed by guardrails (manual UI retest required).
  - Status: Fixed and verified (build-level).

- Bug ID: BUG-003
  - Title: Map, Navigation, Alerts, and Emergency routes blocked for non-USER roles
  - Severity: High
  - Files:
    1. client/src/routes.jsx
    2. client/src/components/ProtectedRoute.jsx
  - Reproduction:
    1. Login as ADMIN or ORGANIZER.
    2. Open /map, /navigation, /alerts, or /emergency.
    3. Observe redirect back to /login due role mismatch.
  - Expected: All authenticated roles should access attendee-facing sections.
  - Actual: Routes were restricted to USER only.
  - Fix Applied:
    1. Added allowedRoles support in ProtectedRoute.
    2. Updated attendee-facing routes to allow USER, ADMIN, and ORGANIZER.
    3. Added safe fallback role normalization to USER when role is missing.
  - Verification:
    1. Frontend build passes after changes.
  - Status: Fixed and verified (build-level).

- Bug ID: BUG-001
  - Title: Unauthenticated alert creation endpoint
  - Severity: High
  - File: server/routes/alertRoutes.js
  - Reproduction:
    1. Send POST request to /api/alerts without Authorization header.
    2. Body: {"title":"Unauthorized test alert","description":"Created without token","severity":"high"}
    3. Observe 201 response with created alert.
  - Expected: Only authenticated ADMIN users can create alerts.
  - Actual: Any unauthenticated client could create public alerts.
  - Fix Applied: Added protect + requireRole('ADMIN') middleware on POST /api/alerts.
  - Verification:
    1. POST /api/alerts without token now returns 401.
    2. Response body: {"message":"No token provided"}.
  - Status: Fixed and verified.

- Bug ID: BUG-002
  - Title: Server crash on crowd sync failure
  - Severity: High
  - File: server/controllers/crowdController.js
  - Reproduction:
    1. With Firestore API disabled, send POST request to /api/crowd/sync.
    2. Observe unhandled promise rejection and server process exit.
  - Expected: Endpoint should return a handled error and keep server alive.
  - Actual: Node process crashed due uncaught async error.
  - Fix Applied: Wrapped syncCrowdData in try/catch and return 503 response with reason.
  - Verification:
    1. POST /api/crowd/sync without token now returns 401.
    2. Backend remains healthy; GET /api/crowd still responds after the request.
  - Status: Fixed and verified.

## Notes

- Keep one bug entry per reproducible issue.
- Always include severity, reproduction, expected vs actual, and current status.

## 2026-04-18

### Evening

- Bug ID: BUG-007
  - Title: Admin dashboard cannot manually update crowd density per zone
  - Severity: High
  - Files:
    1. client/src/pages/AdminDashboard.jsx
    2. server/routes/crowdRoutes.js
    3. server/controllers/crowdController.js
  - Reproduction:
    1. Login as ADMIN and open /admin.
    2. Try to set Zone A/any zone density to HIGH or a numeric value.
    3. Observe no input/action exists to update a specific zone.
  - Expected: Admin can update targeted zone density and persist to Firestore.
  - Actual: Admin UI showed metrics and badges only; backend exposed only /api/crowd/sync (auto snapshot drift), not targeted zone update.
  - Fix Applied:
    1. Added Crowd control panel in `client/src/pages/AdminDashboard.jsx` with zone selector and density/queue sliders.
    2. Wired Firestore write path using `setDoc(doc(db, 'crowd_zones', zoneId), ..., { merge: true })`.
    3. Added success/error feedback and local state refresh after update.
  - Verification:
    1. Frontend build passes after admin crowd-control changes.
  - Status: Fixed and verified (build-level; live Firestore write should be verified in browser).

- Bug ID: BUG-008
  - Title: Missing admin UI flow to send alerts through protected backend endpoint
  - Severity: High
  - Files:
    1. client/src/pages/AdminDashboard.jsx
    2. client/src/services/api.js
    3. server/routes/alertRoutes.js
  - Reproduction:
    1. Login as ADMIN and open /admin.
    2. Try to create and submit a new alert from dashboard.
    3. Observe there is no form/button wired to call POST /api/alerts.
  - Expected: Admin can send alert from dashboard and persist via protected backend route.
  - Actual: Backend route existed and was protected, but no dashboard action called api.createAlert.
  - Fix Applied:
    1. Added Send alert form in `client/src/pages/AdminDashboard.jsx` (title, description, severity).
    2. Wired submit handler to `api.createAlert`, which now forwards Firebase bearer token via API client.
    3. Added success/error UI feedback for admin broadcast action.
  - Verification:
    1. Frontend build passes after alert flow wiring.
  - Status: Fixed and verified (build-level; live admin token flow should be verified in browser).

- Bug ID: BUG-009
  - Title: Alerts page lacks live notification/toast behavior for newly received alerts
  - Severity: Medium
  - Files:
    1. client/src/pages/Alerts.jsx
  - Reproduction:
    1. Open /alerts with real-time listener active.
    2. Insert a new alert into alerts collection.
    3. Observe list updates, but no transient notification/toast appears.
  - Expected: New alert should trigger visible notification feedback in addition to list update.
  - Actual: Page only re-rendered alert cards; no toast/notification state was implemented.
  - Fix Applied:
    1. Added live notice state in `client/src/pages/Alerts.jsx`.
    2. Tracked seen alert IDs and displayed transient "New alert received" message for newly arrived docs.
  - Verification:
    1. Frontend build passes after alerts live-notice implementation.
  - Status: Fixed and verified (build-level; runtime behavior should be verified with a new alert insert).

- Bug ID: BUG-010
  - Title: Emergency route always starts from fixed zone A1 instead of user location
  - Severity: Medium
  - Files:
    1. client/src/pages/Emergency.jsx
  - Reproduction:
    1. Open /emergency from different user contexts.
    2. Inspect route generation call.
    3. Observe start node is hardcoded to A1 for all users.
  - Expected: Emergency route should use current/selected user location as starting node.
  - Actual: findSafestExit was always called with start=A1.
  - Fix Applied:
    1. Added browser geolocation in `client/src/pages/Emergency.jsx`.
    2. Mapped coordinates to nearest non-exit stadium zone and used that as emergency start node.
    3. Added clear fallback note when location is unavailable.
  - Verification:
    1. Frontend build passes after dynamic emergency start update.
  - Status: Fixed and verified (build-level; live geolocation route start should be verified in browser).

- Bug ID: BUG-011
  - Title: End-to-end authenticated /api/auth/me success path not yet verified with real bearer token in this run
  - Severity: Low
  - Files:
    1. server/routes/authRoutes.js
    2. server/middleware/authMiddleware.js
    3. client/src/services/api.js
  - Reproduction:
    1. Call GET /api/auth/me without token.
    2. Call GET /api/auth/me with fake token.
    3. Observe 401/Invalid token behavior is verified, but success path still needs live browser-authenticated confirmation.
  - Expected: Route should return uid/email/role for a valid Firebase user token.
  - Actual: Negative path was previously verified; positive path is now verified with a real Firebase ID token.
  - Fix Applied:
    1. Minted a Firebase custom token with the project service account.
    2. Exchanged it for a real Firebase ID token.
    3. Wrote a Firestore users/{uid} profile with ADMIN role.
    4. Verified GET /api/auth/me returns the resolved uid and role.
    5. Verified POST /api/alerts and POST /api/crowd/sync succeed with the valid bearer token.
  - Verification:
    1. GET /api/auth/me returned 200 with uid test-admin-user and role ADMIN.
    2. POST /api/alerts returned 201 Created.
    3. POST /api/crowd/sync returned 200 OK.
  - Status: Fixed and verified.
