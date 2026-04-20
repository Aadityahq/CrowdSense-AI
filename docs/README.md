# CrowdSense AI Documentation

## Overview

CrowdSense AI is designed to improve the physical event experience in large venues by combining Firebase Auth, Firestore-backed real-time crowd visibility, route optimization, queue guidance, and emergency coordination.

## Core modules

- Attendee web app
- Admin dashboard
- Firebase Auth session flow
- Email verification gate for account activation
- Real-time crowd data layer
- Route and prediction logic

## Project goals

- Reduce crowd congestion
- Minimize waiting time
- Improve in-venue navigation
- Provide emergency support

## How To Use This Docs Folder

- Start with `CONTEXT.md` to understand the problem and solution direction.
- Use `TODO.md` as the execution checklist while building.
- Record each dev session and major decisions in `LOGS.md`.
- Read `FEATURE_TRANSFER.md` when reusing CyberShield modules (auth, roles, alerts).
- Use this file (`README.md`) as the table of contents for new team members.

## Current Security Posture

- Firebase Auth session required for protected views and APIs.
- Email verification is enforced in frontend route guards and backend token middleware.
- Firestore user profile creation is deferred until first verified login.
- Privileged role assignment is admin-controlled (public signup defaults to USER).
