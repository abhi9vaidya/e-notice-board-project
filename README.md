# DIGITAL NOTICE BOARD (E-NOTICE BOARD)
> **A Smart Cloud-Based Digital Notice Display System for Educational Institutions**

## Table of Contents
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [System Workflow](#system-workflow)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Firestore Schema Overview](#firestore-schema-overview)
- [Screens / UI Pages](#screens--ui-pages)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Firebase Setup Steps](#firebase-setup-steps)
- [Deploy to Firebase Hosting](#deploy-to-firebase-hosting)
- [TV Kiosk Setup](#tv-kiosk-setup)
- [Google Drive Archive System](#google-drive-archive-system)
- [Future Scope](#future-scope)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Maintainers](#maintainers)

---

## Problem Statement
Traditional notice boards in colleges rely on paper notices, which are:
- **Inefficient:** Time-consuming to print, pin, and remove.
- **Cluttered:** Old notices often remain, burying new important information.
- **Static:** Cannot display dynamic content like videos or scrolling alerts.
- **Inaccessible:** Students must physically visit the board to check updates.

**Solution:** The **Digital Notice Board (E-Notice Board)** modernizes this process by allowing faculty to publish digital notices instantly to a TV display running in kiosk mode, ensuring timely and organized information dissemination.

---

## Key Features
- **Remote Management:** Faculty can post notices from anywhere via a secure web dashboard.
- **Real-time Updates:** Notices appear on the TV display instantly using Firebase Firestore.
- **TV Lockdown (Kiosk Mode):** Hardened security with secret key authorization, hidden gestures, and back-button restrictions for public displays.
- **Google Drive Archival:** Automatic offloading of notice attachments (Images/PDFs) to Google Drive to overcome Firebase storage limits.
- **Author Attribution:** Optional author/department name display with "Internal" visibility mode for management-only attribution.
- **Archive System:** Dedicated dashboard section for viewing and managing historical notices stored in Google Drive.
- **Automatic Cleanup:** Expired notices are automatically removed from the display flow.
- **Multimedia Support:** Supports text announcements, images, and PDFs.
- **Carousel Display:** Notices auto-rotate (carousel mode) on the TV screen.
- **Role-Based Access:** Secure login for authorized faculty members only.

---

## System Workflow
1.  **Faculty Dashboard:**
    - Faculty logs in -> Uploads Notice -> Sets Start/End Date -> Submits.
    - Data is stored in **Firestore** and media in **Firebase Storage**.
2.  **TV Display (Kiosk):**
    - TV Browser opens the web app URL.
    - App fetches *active* notices (where `today >= startDate` and `today <= endDate`).
    - Notices cycle continuously in a loop.

---

## Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **UI Library:** Material UI (MUI) / Shadcn UI
- **Routing:** React Router DOM
- **State Management:** React Hooks / Context API

### Backend (Serverless)
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Auth (Email/Password)
- **Storage:** Firebase Storage (for Images/PDFs)
- **Hosting:** Firebase Hosting

### Hardware / Deployment
- **Display:** Android TV / Fire TV Stick / Raspberry Pi
- **Software:** Kiosk Browser App (e.g., Fully Kiosk Browser)

---

## Architecture Overview

```ascii
+------------------+         +------------------+         +------------------+
|                  |         |                  |         |                  |
|  Faculty Device  |-------> |     Firebase     |-------> |    TV Display    |
| (Web Dashboard)  |         | (Auth, DB, Store)|         |   (Kiosk Mode)   |
|                  |         |                  |         |                  |
+------------------+         +------------------+         +------------------+
        |                             ^                            |
        |                             |                            |
        +------- Upload Notice -------+-------- Fetch Notices -----+
```

---

## Firestore Schema Overview

### 1. `users` Collection
Stores authorized faculty details.
```json
{
  "uid": "user_unique_id",
  "email": "faculty@college.edu",
  "role": "admin",
  "name": "Dr. Smith",
  "createdAt": "timestamp"
}
```

### 2. `notices` Collection
Stores notice data and archive metadata.
```json
{
  "id": "notice_unique_id",
  "title": "Exam Schedule",
  "description": "Mid-term exams start from...",
  "type": "text | image | pdf",
  "fileUrl": "...",
  "startDate": "timestamp",
  "endDate": "timestamp",
  "authorName": "Department of CS",
  "authorVisibility": "Public | Internal",
  "status": "Active | Archived",
  "driveLinkId": "google_drive_view_url",
  "driveFileId": "google_drive_file_id",
  "isPinned": false,
  "isActive": true,
  "postedBy": "user_email",
  "createdAt": "timestamp"
}
```

---

## Screens / UI Pages

### 1. Login Page
Secure entry point for faculty.
![Login Page](./screenshots/login.png)

### 2. Faculty Dashboard
Interface to view, add, and delete notices.
![Faculty Dashboard](./screenshots/dashboard.png)

### 3. TV Display Page
The public-facing view running on the TV. Features auto-rotating slides.
![TV Display](./screenshots/display.png)

---

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Firebase Project (Free Tier)

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Drive Archive Bridge (Apps Script Web App)
VITE_GOOGLE_DRIVE_BRIDGE_URL=https://script.google.com/macros/s/.../exec
```

---

## Running Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/smart-notice-display.git
   cd smart-notice-display
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the app.

---

## Firebase Setup Steps
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Authentication** (Email/Password provider).
4. Create a **Firestore Database** (Start in Test Mode).
5. Enable **Storage** for media uploads.
6. Copy the config object to your `.env` file.

---

## Deploy to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**
   ```bash
   firebase login
   firebase init
   ```
   - Select *Hosting*.
   - Use an existing project.
   - Set public directory to `dist`.
   - Configure as a single-page app (Yes).
   - Overwrite index.html (No - if prompted during re-deploy).

3. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

## TV Kiosk Setup
To run this on a TV:
1. **Device:** Use an Android TV, Amazon Fire Stick, or smart TV with a browser.
2. **Software:** Install a distinct Kiosk Browser app (e.g., *Fully Kiosk Browser*).
3. **Configuration:**
   - Set the **Start URL** to your hosted Firebase app URL (e.g., `https://your-project.web.app/display`).
   - Enable **Keep Screen On**.
   - Enable **Auto-Start on Boot**.
   - **Lock Navigation** bar to prevent exiting.

### 4. Digital Signage Hardening (New)
To prevent unauthorized tampering at public TV locations:
- **Secret Key Authorization:** Faculty can "Unlock" a display for management by appending `?admin_key=RBU2026` to the URL. This enables the `isAdminDevice` flag in local storage.
- **Hidden Gesture:** On locked displays, faculty can click the **RBU Logo 5 times** within 2 seconds to reveal a hidden "Management Login" button.
- **Back-button Trap:** Non-authorized devices are restricted from navigating away from the `/display` route.
- **Management Indicator:** Authorized devices display a small **"MANAGEMENT ON"** chip in the top-right corner of the board.

---

## Google Drive Archive System
To bypass the 5GB limit of the Firebase Storage free tier, we use a **Google Apps Script Bridge**:
1.  **Storage Logic:** All Images and PDFs attached to notices are uploaded directly to a dedicated Google Drive folder (`RBU_Notice_Archive`).
2.  **Archival:** When a notice is created/updated, metadata is stored in Firebase, while the heavy file resides in Drive. 
3.  **Bridge Security:** The bridge (Apps Script) handles CORS and Base64 conversion to allow secure browser-to-Drive uploads without exposing sensitive API keys in the frontend.

---

## Future Scope
- [ ] **Mobile App:** A React Native app for students to receive push notifications.
- [ ] **Weather/News Widget:** Add a ticker for weather and news updates.
- [ ] **Admin Panel:** Super-admin to manage faculty users.
- [ ] **Analytics:** Track how many times a notice was displayed.

---

## Contributing
Contributions are welcome!
1. Fork the repo.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.

---

## License
MIT License. See [LICENSE](LICENSE) for details.

---

## Acknowledgements
- React & Vite documentation.
- Firebase documentation.
- Shadcn UI / MUI components.

---

## Maintainers
- **Mansi Motghare**
- **Parnavi Kite**
- **Kartik Suchak**
- **Abhinav Vaidya**

---

We will also hooki the system up to **Google Drive** for all notice attachments, allowing for virtually unlimited storage of large PDFs and images. Plus, faculty now get automatic "Admin Device" status just by logging in once. Finally, we polished everything with a fresh, premium UI for the dashboard and login pages. 🚀
