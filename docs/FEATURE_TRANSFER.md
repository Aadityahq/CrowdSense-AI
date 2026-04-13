# Feature Transfer Document
## CyberShield -> CrowdSense AI

## Overview

This document explains how core features from the CyberShield project can be reused and adapted for CrowdSense AI.

### Goals

- Reuse existing architecture (MERN stack patterns)
- Reduce development time
- Maintain scalability and modular design
- Focus on crowd intelligence features instead of rebuilding basics

## Feature Mapping

| CyberShield Feature | CrowdSense AI Equivalent | Description |
| --- | --- | --- |
| Authentication System | User Login System | Login for attendees and admins |
| Role-Based Access Control | Role-Based Dashboard | Attendee, Admin, Organizer |
| Notification System | Real-Time Alerts | Crowd and emergency alerts |
| Report System | Crowd and Zone Reports | Admin logs and monitoring |
| Admin Dashboard | Event Control Dashboard | Crowd monitoring and broadcasts |
| Backend APIs | Crowd APIs | Data handling for routes, alerts, queues |

## Transfer Strategy

### Directly reusable

- Auth structure (JWT flow)
- Middleware architecture
- Notification and alert logic
- Admin dashboard module structure

### Needs modification

- Models (`Report` -> `CrowdZone`)
- APIs (`scam-detection` -> `crowd-prediction` and `routing`)
- UI (`security views` -> `map-first venue views`)

## Assumptions

- Crowd data is simulated for hackathon demo mode
- Users interact via web app
- Real-time updates use Firebase or short-interval polling

## Benefits

- Faster development
- Cleaner architecture reuse
- Strong backend story for judges
- More time for innovation and demo quality

---

## Reusable Code Modules

The snippets below are ready to fit this repository style (CommonJS, server default port 5001).

## 1) Auth System

### `server/middleware/authMiddleware.js`

```js
const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = { protect };
```

### `server/models/User.js`

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'ORGANIZER'],
      default: 'USER',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
```

### `server/controllers/authController.js`

```js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function login(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '1d' },
  );

  return res.json({ token, user });
}

module.exports = { login };
```

## 2) Notification -> Alert System

### `server/models/Alert.js`

```js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Alert', alertSchema);
```

### `server/controllers/alertController.js`

```js
const Alert = require('../models/Alert');

async function createAlert(req, res) {
  const alert = await Alert.create(req.body);
  return res.json(alert);
}

async function getAlerts(req, res) {
  const alerts = await Alert.find().sort({ createdAt: -1 });
  return res.json(alerts);
}

module.exports = { createAlert, getAlerts };
```

## 3) Role-Based Access

### `server/middleware/roleMiddleware.js`

```js
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    return next();
  };
}

module.exports = { authorize };
```

## 4) Admin Dashboard Structure

### `client/src/pages/AdminDashboard.jsx`

```jsx
export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded">
          <h2>Total Crowd</h2>
          <p>1200</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h2>High Risk Zones</h2>
          <p>3</p>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <h2>Active Alerts</h2>
          <p>5</p>
        </div>
      </div>
    </div>
  );
}
```

## 5) API Structure

### `server/routes/alertRoutes.js`

```js
const express = require('express');
const { createAlert, getAlerts } = require('../controllers/alertController');

const router = express.Router();

router.post('/', createAlert);
router.get('/', getAlerts);

module.exports = router;
```

## 6) Frontend API Service

### `client/src/services/alertService.js`

```js
export async function fetchAlerts() {
  const response = await fetch('http://localhost:5001/api/alerts');
  return response.json();
}
```

## 7) Connect Everything

### `server/server.js`

```js
const express = require('express');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
app.use(express.json());

app.use('/api/alerts', alertRoutes);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on ${port}`));
```

---

## Final Result

With this transfer path, CrowdSense AI can quickly inherit:

- Auth system
- Role-based access
- Alert system
- Admin dashboard structure
- API module patterns

This makes the architecture story much stronger in hackathon judging: production-like backend reuse adapted for real-time crowd intelligence.