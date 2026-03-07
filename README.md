# E-Notice Board

A cloud-based digital notice board for campus communication, optimized for both faculty workflow and always-on TV display screens.

Live URL: https://rbu-notice-board.web.app

## Overview

Faculty and admins create notices from a web dashboard. Notices are stored in Firestore and rendered in real time on a dedicated TV route (`/tv`) with animated slideshow and multi-view layouts.

The current version includes:
- Allowlist-first Google authentication for faculty onboarding
- Admin role management and access governance
- Notice scheduling, auto-archiving, and category-based display
- Image/PDF upload via Google Drive Apps Script proxy
- AI-assisted text extraction from uploaded images
- Configurable TV behavior (single, multi, and auto-switch modes)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Framer Motion |
| Routing | React Router v6 |
| State/Data | TanStack Query, custom hooks |
| Auth | Firebase Authentication (Google + optional email/password for admin/legacy) |
| Database | Cloud Firestore |
| File Storage Bridge | Google Drive via Apps Script Web App proxy |
| Hosting | Firebase Hosting |
| Testing | Vitest + Testing Library |

## Core Features

- Faculty and admin dashboard for end-to-end notice management
- Rich notice composer with Markdown editor and live TV preview
- Template support: `standard`, `split`, `full-image`, `text-only`, `featured`
- PDF/image notice uploads with generated metadata-aware naming
- Optional registration URL (QR-enabled in TV notice cards)
- Student Spotlight for `achievements` category (separate TV panel)
- Real-time TV updates from Firestore snapshots
- Auto-expiry and archive support
- TV themes (`dark`/`light`) and mode controls:
- `single`: slideshow with per-priority durations
- `multi`: overview layout with high-priority + grid + spotlight
- `auto`: timed alternation between single and multi

## Access and Authentication Flow

1. Admin adds faculty email to Firestore `allowlist`.
2. Faculty signs in with Google.
3. On first login, faculty confirms department.
4. Profile is created in Firestore as approved `faculty`.
5. Admin can promote users to `admin` from the Admin page.

Notes:
- Self-registration is intentionally disabled.
- Email/password login exists as fallback for admin/legacy accounts.

## Current Routes

| Route | Purpose |
|---|---|
| `/` | Entry route (splash + sign in + dashboard handoff) |
| `/tv` | Public TV display view |
| `/manage-notices` | Notice management list |
| `/add-notice` | Create/Edit notice page (`?edit=<id>` for edits) |
| `/archive` | Archived notices |
| `/categories` | Category view |
| `/profile` | Profile page |
| `/settings` | Settings page (TV controls, password tools; admin features gated) |
| `/admin` | Admin console (allowlist + role management) |
| `/about` | Public about page |

## Firestore Data Model

### `profiles/{uid}`
```json
{
  "name": "string",
  "department": "string",
  "email": "string",
  "phone": "string (optional)",
  "profilePhotoUrl": "string (optional)",
  "role": "faculty | admin",
  "status": "approved | pending | rejected",
  "createdAt": "Timestamp"
}
```

### `allowlist/{email}`
```json
{
  "department": "string (optional)",
  "addedAt": "Timestamp"
}
```

### `notices/{noticeId}`
```json
{
  "title": "string",
  "description": "string",
  "category": "academic | examinations | placements | events | announcements | achievements | other",
  "customCategory": "string (optional)",
  "priority": "high | medium | low",
  "template": "standard | split | full-image | text-only | featured",
  "templatePlacement": "left | right (optional)",
  "facultyName": "string",
  "facultyId": "string",
  "imageUrl": "string (optional)",
  "documentUrl": "string (optional)",
  "registrationUrl": "string (optional)",
  "pdfOrientation": "portrait | landscape (optional)",
  "showIssuedBy": "boolean (optional)",
  "showValidTill": "boolean (optional)",
  "showTextOverlay": "boolean (optional)",
  "startTime": "Timestamp",
  "endTime": "Timestamp",
  "isArchived": "boolean",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

## Environment Variables

Create `.env` from `.env.example` and provide values before running locally.

Required for current workflow:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GOOGLE_DRIVE_PROXY_URL` (Apps Script endpoint for uploads)

Optional:
- `VITE_GROQ_API_KEY` (AI extraction from uploaded images)
- `VITE_FIREBASE_MEASUREMENT_ID`

Important: `.env.example` currently includes some legacy placeholders (for older integrations). Follow the list above for the active implementation.

## Local Development

Prerequisites:
- Node.js 18+
- npm
- Firebase project with Auth + Firestore
- Deployed Google Apps Script proxy (see `docs/drive_proxy.gs`)

Install and run:

```bash
git clone https://github.com/abhi9vaidya/e-notice-board-project.git
cd e-notice-board-project
npm install
npm run dev
```

Local app URL: `http://localhost:5173`

## Firebase Setup Checklist

1. Create Firebase project.
2. Enable Google sign-in in Firebase Authentication.
3. Create Firestore database.
4. Deploy rules:
```bash
firebase deploy --only firestore:rules
```
5. Create at least one admin profile and seed allowlist entries.

## Build, Test, and Deploy

```bash
npm run lint
npm run test
npm run build
firebase deploy --only hosting
```

## TV Deployment Notes

- Open `https://<your-domain>/tv` on the display device.
- Use kiosk browser mode for full-screen persistence.
- TV display reads Firestore updates in real time.
- If tab remains hidden for long periods, the display auto-refreshes when visible again.

## Contributors

| Name | Focus |
|---|---|
| Abhinav Vaidya | Full-stack implementation, Firebase integration |
| Mansi Motghare | Backend integration and API work |
| Parnavi Kite | Frontend development and UI |
| Kartik Suchak | Testing and documentation |

Institution: Shri Ramdeobaba College of Engineering and Management, Nagpur  
Course: B.Tech CSE, 6th Semester Project (2026)
