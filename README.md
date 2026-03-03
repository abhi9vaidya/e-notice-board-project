# E-Notice Board

> A cloud-based digital notice board system for campus TV displays — built as a B.Tech 6th Semester Project.

**Live:** https://mythical-geode-479809-m6.web.app

---

## Overview

Faculty post notices from a web dashboard; a TV screen running in kiosk mode auto-rotates them in real-time. The system supports rich media, role-based access, and AI-assisted notice creation.

---

## Features

- **Faculty Dashboard** — create, edit, and archive notices with a rich Markdown editor and live TV preview
- **TV Kiosk Display** — full-screen auto-rotating slides at `/tv`, optimised for 1080p screens
- **Google OAuth Login** — faculty sign in with institutional Google accounts; admin manages an email allowlist
- **Role-based Access** — `faculty` manage their own notices; `admin` manages all notices, users, and the allowlist
- **Media Uploads** — images and PDFs attached to notices are stored on Cloudinary
- **AI Text Extraction** — upload a PDF or image of a circular and AI extracts key points as a draft
- **Student Spotlight** — achievements category renders as a dedicated gold panel on the TV display
- **Kiosk Hardening** — back-button trap, hidden unlock gesture (tap logo × 5), per-device admin flag

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI | Shadcn UI + Tailwind CSS |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Firebase Firestore |
| Media | Cloudinary |
| Hosting | Firebase Hosting |
| Routing | React Router v6 |

---

## Firestore Schema

### `profiles/{uid}`
```json
{
  "name": "string",
  "email": "string",
  "department": "string",
  "role": "faculty | admin",
  "status": "pending | approved | rejected",
  "profilePhotoUrl": "string (optional)",
  "createdAt": "Timestamp"
}
```

### `notices/{id}`
```json
{
  "title": "string",
  "description": "string",
  "category": "academic | examinations | placements | events | announcements | achievements | other",
  "customCategory": "string (optional)",
  "priority": "high | medium | low",
  "template": "standard | split | full-image | text-only | featured",
  "templatePlacement": "left | right",
  "facultyName": "string",
  "facultyId": "string",
  "imageUrl": "string (optional)",
  "documentUrl": "string (optional)",
  "showIssuedBy": "boolean",
  "showValidTill": "boolean",
  "startTime": "Timestamp",
  "endTime": "Timestamp",
  "isArchived": "boolean",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `allowlist/{email}`
```json
{
  "addedAt": "Timestamp",
  "addedBy": "string (admin uid)"
}
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Login screen |
| `/dashboard` | Notice feed with category filters |
| `/manage-notices` | Add / edit / archive notices |
| `/add-notice` | Full-page notice editor with live TV preview |
| `/admin` | Admin panel — users, allowlist, all notices |
| `/archive` | Archived notices |
| `/categories` | Browse notices by category |
| `/profile` | Profile settings |
| `/tv` | TV kiosk display (full-screen, auto-rotating) |

---

## Local Setup

**Prerequisites:** Node.js 18+, a Firebase project, a Cloudinary account (both free tier).

```bash
# 1. Clone and install
git clone https://github.com/abhi9vaidya/e-notice-board-project.git
cd e-notice-board-project
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your Firebase and Cloudinary credentials — see .env.example for details

# 3. Run locally
npm run dev
# → http://localhost:5173
```

**Firebase setup:**
1. [Firebase Console](https://console.firebase.google.com) → create a project
2. Authentication → Sign-in method → enable **Google**
3. Firestore Database → create in production mode
4. Deploy rules: `firebase deploy --only firestore:rules`

---

## Deployment

```bash
npm run build
firebase deploy --only hosting
```

---

## TV Kiosk Setup

1. Navigate to `https://your-app.web.app/tv` on the TV browser
2. Use a kiosk browser (e.g. *Fully Kiosk Browser* on Android TV) with auto-start and screen-lock enabled
3. To unlock: tap the college logo **5 times** within 2 seconds

---

## Team

| Name | Role | Email |
|---|---|---|
| Abhinav Vaidya | Full-stack development, Firebase | abhinavvaidya2005@gmail.com |
| Mansi Motghare | Firebase backend, API integration | mansimotghare167@gmail.com |
| Parnavi Kitey | Frontend development, UI design | — |
| Kartik Suchak | Testing, documentation | suchakku@rknec.edu |

**Institution:** Shri Ramdeobaba College of Engineering and Management, Nagpur
**Course:** B.Tech Computer Science — 6th Semester Project (2026)

