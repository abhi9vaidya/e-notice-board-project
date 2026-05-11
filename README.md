# E-Notice Board

A cloud-based digital notice board system designed for academic institution campuses. This application is optimized for faculty administration workflows and always-on television display screens across campus departments.

Live Deployment URL: https://rbu-notice-board.web.app

## Project Overview

The E-Notice Board is a modern campus communication system that allows faculty and administrators to easily publish notices from a secure dashboard. Published notices are processed and synced in real time to dedicated television display routes (`/tv`). The display client renders these notices using automated slide loops, custom templates, scroll animations, and intelligent priority-based scheduling.

The system features:
- Allowlist-controlled Google Authentication for secure faculty onboarding.
- Multi-tier role management (Faculty and Administrator access levels).
- Advanced notice scheduling, scheduling calendars, and automated archival states.
- Seamless document and image hosting using Google Drive as a backend storage layer.
- AI-assisted OCR metadata extraction for uploaded notice files.
- Dedicated TV display system with multiple layout orientations and auto-alternating loops.

## Technical Architecture

The platform is designed around a modern Serverless Web App architecture to ensure high performance, real-time synchronization, and zero server maintenance overhead.

| Architectural Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite | Client runtime compiled for speed and type safety. |
| **Styling & Layout** | Tailwind CSS, shadcn/ui, Framer Motion | Fluid typography, customized layout frameworks, smooth micro-animations. |
| **Routing** | React Router v6 | Client-side page resolution and authentication guards. |
| **State & Data Sync** | TanStack Query, Firestore Snapshots | Real-time listeners for instant TV screen updates. |
| **Authentication** | Firebase Auth (Google Sign-In + Fallback) | Restricted allowlist login protocol for faculty members. |
| **Database** | Cloud Firestore | Real-time, NoSQL document store for notices and profile schema. |
| **Storage Engine** | Google Drive API via Apps Script Web App Proxy | Custom file pipeline with a 10MB limit and direct thumbnail resolvers. |
| **Hosting Platform** | Firebase Hosting | Optimized global CDN for lightning-fast loads. |
| **Local Verification** | Vitest, React Testing Library | Unit tests and regression suite. |

## Core Functional Systems

### 1. Unified Administration & Notice Workspace
- Faculty and Administrators get an end-to-end management board.
- Dynamic notice composer equipped with a full Markdown Editor, category-based theme engine, and active TV live preview.
- Granular publication control: configurable start time, auto-expiry threshold, and custom priority badges (Urgent, Important, General).
- Optimized ergonomics, such as hiding "Issued By" author metadata by default to maximize visible space on presentation screens.

### 2. Intelligent Document Shape Configurations
- **Landscape - Full Screen**: Fits standard landscape notices and documents across the entire width of the display interface.
- **Portrait - Side-by-Side (Dual-File Support)**: Specifically allows uploading and rendering of two separate documents or images side-by-side within a single notice slide, or automates pairing separate portrait-orientation notices together on the same screen to maximize space efficiency.

### 3. Smart Fallbacks and Display Resilience
- Real-time text extraction automatically reads text content from uploaded notice files to pre-fill metadata fields.
- Dynamic error handling: broken notice images automatically fallback to clean system containers or gracefully hide to ensure the TV layout never looks broken or unpolished.
- Height-aware autoscrolling handles long text strings, moving them smoothly from top to bottom before resetting, bypassing browser layout jumps.
- Custom stylized scrollbars provide a unified interface appearance across standard desktop, tablet, and TV environments.

### 4. Adaptive TV Rendering Engines
- **Single Mode**: Cycles through active notices one-by-one with per-priority transition times.
- **Multi-Grid Mode**: Splits the screen into high-priority announcements, a grid of upcoming events, and a dedicated Student Spotlight column.
- **Auto-Switch Mode**: Alternates intelligently between Single and Multi-Grid display modes on a timer.

---

## System Routes

| Location | Gating Policy | Main Responsibility |
|---|---|---|
| `/` | Public | Splash screen, public overview, and authentication portal. |
| `/tv` | Public | Always-on TV display presentation view. |
| `/manage-notices` | Authorized (Faculty/Admin) | Complete dashboard of all published, active, and scheduled notices. |
| `/add-notice` | Authorized (Faculty/Admin) | Composition interface (supports editing via `?edit=id`). |
| `/archive` | Authorized (Faculty/Admin) | Vault of expired and archived notices for reference. |
| `/categories` | Public | Directory filter of notice classifications. |
| `/profile` | Authorized (Faculty/Admin) | Departmental registration info and personal profile details. |
| `/settings` | Authorized (Faculty/Admin) | TV layout configurations, interface themes, and credentials. |
| `/admin` | Authorized (Admin Only) | User promotion, allowlist control, and campus-wide parameters. |
| `/about` | Public | Institutional documentation and project details. |

---

## Firestore Schema Reference

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
  "secondImageUrl": "string (optional)",
  "secondDocumentUrl": "string (optional)",
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

---

## Local Configuration and Deployment

### 1. Environment Preparation
Copy `.env.example` into a new `.env` file in your root folder and set the values.

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id
VITE_FIREBASE_APP_ID=app_id
VITE_GOOGLE_DRIVE_PROXY_URL=your_google_apps_script_url
VITE_GROQ_API_KEY=your_groq_vision_key
```

### 2. Project Bootstrapping
Install dependencies and run the local development server:

```bash
# Clone the repository
git clone https://github.com/abhi9vaidya/e-notice-board-project.git
cd e-notice-board-project

# Install node dependencies
npm install

# Start the local vite bundler
npm run dev
```
The application will be accessible at: `http://localhost:5173`

### 3. Firebase Deployment
To release database rules, storage rules, and frontend static assets:

```bash
# Verify type definitions and style guidelines
npm run lint

# Compile production bundle
npm run build

# Deploy assets and security settings
firebase deploy
```

---

## TV Hardware Installation Guide
- Mount display TVs in landscape layout with standard 1080p resolution.
- Configure device browsers (e.g., Google Chrome on Android TV or Raspberry Pi) to launch in kiosk mode pointing to: `https://your-domain.web.app/tv`
- The screen will dynamically catch real-time socket streams from Firestore. No manual reloads are required.

---

## Contributors

| Developer | Core Responsibilities |
|---|---|
| Abhinav Vaidya | Full-Stack Architecture, Database Design, Real-time Sync |
| Mansi Motghare | Backend Integration, Apps Script Proxy Pipelines |
| Parnavi Kite | Frontend Layouts, Interface Components, Responsive Design |
| Kartik Suchak | Automated Testing, Verification Suite, Technical Writing |

**Institution**: Shri Ramdeobaba College of Engineering and Management, Nagpur  
**Course**: B.Tech CSE, 6th Semester Mini Project (2026)
