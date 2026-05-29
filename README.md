# Skill Tracker

A React + Firebase web app for tracking learning progress, weekly goals, journal entries, and portfolio projects in one place. It includes a demo mode, dark mode, progress analytics, skill resources, and a resume-style profile export.

## Live Demo

https://skill-tracker-vault.netlify.app/

## Features

- Email/password and Google authentication with Firebase Auth
- Demo mode with seeded sample data stored in `localStorage`
- Skill tracking by category, level, XP, progress, and saved learning resources
- Weekly focus goals with completion tracking and automatic weekly rollover
- Daily learning journal with skill-linked XP awards
- Portfolio project cards with links, cover images, media attachments, and linked skills
- Dashboard analytics for skill distribution, growth velocity, activity heatmap, streaks, and goal progress
- Profile editor with resume preview and print/PDF export
- Light/dark theme toggle

## Tech Stack

- React 19
- Vite
- React Router
- Firebase Auth and Firestore
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js
- npm
- A Firebase project if you want to use real authentication and Firestore persistence

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Vite will start a local development server and print the URL in the terminal, usually `http://localhost:5173`.

### Build For Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Firebase Setup

Firebase is initialized in `src/lib/firebase.js`.

To connect the app to your own Firebase project:

1. Create a Firebase project.
2. Enable Authentication providers:
   - Email/password
   - Google, if you want Google sign-in
3. Create a Firestore database.
4. Replace the Firebase config in `src/lib/firebase.js` with your project config.

User data is stored in the `users` collection using the authenticated user's UID as the document ID.

## Demo Mode

The app supports a built-in demo login. Demo data is generated locally and persisted in the browser under:

```text
skill-tracker-demo-data
```

Demo mode is useful for exploring the app without creating a Firebase account.

## Project Structure

```text
src/
  components/
    Layout.jsx
    MasteryCelebration.jsx
    Navigation.jsx
  contexts/
    AuthContext.jsx
    DataContext.jsx
  lib/
    firebase.js
  pages/
    Auth.jsx
    Dashboard.jsx
    Journal.jsx
    Portfolio.jsx
    Profile.jsx
    Skills.jsx
  App.jsx
  main.jsx
```

## Available Routes

- `/auth` - sign in, sign up, Google auth, password reset, and demo login
- `/` - dashboard overview
- `/skills` - skill tracking and resource locker
- `/journal` - daily learning journal
- `/portfolio` - project portfolio
- `/profile` - profile settings and resume export

## Notes

- Uploaded profile photos, project cover images, and media attachments are stored as browser-readable data URLs in app state and then persisted through the existing data layer.
- The resume export uses the browser print flow, so choose "Save as PDF" from the print dialog to create a PDF.
- Firestore writes are handled automatically after user data has loaded.
