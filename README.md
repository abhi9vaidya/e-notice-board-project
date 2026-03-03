# E-Notice Board
### Digital Notice Display System — Rashtrasant Baba Udgir College (RBU), Nagpur

A cloud-based digital notice board system built for campus TV displays. Faculty post notices from a web dashboard; the TV screen runs in kiosk mode and auto-rotates them in real-time.

**Live:** https://mythical-geode-479809-m6.web.app

---

## Project Info

| | |
|---|---|
| **Institution** | Shri Ramdeobaba College of Engineering and Management, Nagpur |
| **Course** | B.Tech Computer Science — 6th Semester Project |
| **Academic Year** | 2026 |
| **Team** | Abhinav Vaidya, Mansi Motghare, Parnavi Kitey, Kartik Suchak |

---

## What it does

- **Faculty Dashboard** — post, edit, archive notices with a rich editor and live TV preview
- **TV Kiosk Display** — auto-rotating slides at `/tv`, designed for 1080p screens
- **Google OAuth login** — faculty sign in with their Google account; admin controls an allowlist of approved emails
- **Role-based access** — `faculty` can manage their own notices; `admin` can manage all notices, users, and the allowlist
- **Cloudinary media** — images and PDFs attached to notices are uploaded to Cloudinary (free tier, no credit card)
- **AI text extraction** — upload a PDF/image of a circular and AI extracts the key points as a draft description
- **Student Spotlight** — achievements category displays in a separate gold panel on TV
- **Kiosk hardening** — back-button trap, hidden unlock gesture (logo × 5), admin device flag

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| UI | Shadcn UI + Tailwind CSS |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Firebase Firestore |
| Media | Cloudinary (unsigned upload preset) |
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
| `/` | Login screen (Google OAuth or admin email/password) |
| `/dashboard` | Notice feed with filters |
| `/manage-notices` | Add / edit / archive notices |
| `/add-notice` | Full-page notice editor with live TV preview |
| `/admin` | Admin panel — manage users, allowlist, all notices |
| `/archive` | Archived notices |
| `/categories` | Browse by category |
| `/profile` | Profile settings, change/set password |
| `/settings` | Account settings |
| `/tv` | TV kiosk display (full-screen, auto-rotating) |

---

## Local Setup

### Prerequisites
- Node.js 18+
- A Firebase project (free tier)
- A Cloudinary account (free tier)

### 1. Clone and install
```bash
git clone https://github.com/abhi9vaidya/e-notice-board-project.git
cd e-notice-board-project
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

See `.env.example` for all required variables and where to find them.

### 3. Firebase setup
1. [Firebase Console](https://console.firebase.google.com) → create a project
2. **Authentication** → Sign-in method → enable **Google**
3. **Firestore Database** → create in production mode
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`
5. Copy the web app config into your `.env`

### 4. Run locally
```bash
npm run dev
```
Open `http://localhost:5173`

---

## Deployment

```bash
npm run build
firebase deploy --only hosting
```

---

## TV Kiosk Setup

1. Open a browser on the TV and navigate to `https://your-app.web.app/tv`
2. Use a kiosk browser app (e.g. *Fully Kiosk Browser* on Android TV) with:
   - Start URL: `https://your-app.web.app/tv`
   - Keep Screen On: enabled
   - Auto-Start on Boot: enabled
   - Lock navigation bar
3. To unlock the display for management: click the RBU logo **5 times** within 2 seconds

---

## Branch Structure

| Branch | Description |
|---|---|
| `main` | Current production code |
| `backup-old-main` | Previous version backup |
| `feature/allowlist-oauth` | Feature branch (merged into main) |

---

## Team

| Name | Role |
|---|---|
| Abhinav Vaidya | Full-stack development, Firebase |
| Parnavi Kite | Frontend development, UI design |
| Kartik Suchak | Testing, documentation |
| Mansi Motghare | Firebase Backend integration, API Connectivity |

---

*Built as a 6th semester project.*
