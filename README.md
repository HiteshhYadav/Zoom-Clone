# 📹 Zoom Clone — Fullstack Video Conferencing Platform

A modern, high-performance web application clone of **Zoom** built with **Next.js (App Router)** on the frontend and **Python FastAPI** with **SQLite** on the backend. Designed to replicate Zoom’s user experience, design system, and meeting workflows with pixel-perfect accuracy.

---

## 🌟 Key Features

### 1. 🏠 Landing Dashboard
- **Iconic Action Grid**: Big 4 Zoom tiles — **New Meeting** (Orange), **Join** (Blue), **Schedule** (Blue), and **Share Screen** (Blue).
- **Live Clock & Calendar Widget**: Dynamic real-time clock, date formatting, and Personal Meeting ID (PMI) quick launcher.
- **Tabbed Meeting Center**:
  - **Upcoming Meetings**: Scheduled sessions with countdowns, meeting IDs, 1-click start, copy invite link, and delete.
  - **Recent & Ended**: Full meeting history with duration logs and room reopen triggers.
- **Sidebar & Navbar**: Left navigation rail with active status pills and top bar with search, notification badges, and user profile.

### 2. ⚡ Instant Meeting Creation
- Instant one-click meeting launch.
- Automatic generation of unique, collision-free Zoom-format Meeting IDs (`xxx-xxxx-xxxx`).
- Shareable invitation link generation (`http://localhost:3000/meeting/{code}`).
- Auto-redirect directly into the meeting room.

### 3. 🚪 Join Meeting Flow
- Join via Meeting ID or direct URL.
- Customized display name configuration.
- Pre-joining audio/video toggles (e.g., "Mute microphone", "Turn off camera").
- Validation against database records with clear error states.

### 4. 📅 Meeting Scheduling
- Full scheduling modal with topic, description, date picker, time picker, duration selector, and timezone auto-detection.
- Auto-generated encrypted meeting ID and waiting room flags.
- Instant synchronization with SQLite database and Upcoming Meetings list.

### 5. 🎥 Rich Meeting Room Experience
- **Video Stage**:
  - Adaptive gallery/speaker grid supporting multiple participants.
  - Live webcam mirror stream with graceful animated avatar fallback when camera is toggled off.
  - Simulated remote attendees with active speaking halos and audio level indicators.
- **Screen Sharing**: Interactive presentation slide deck and architecture diagram mode.
- **Toolbar Controls**: Mute/Unmute, Start/Stop Video, Security, Participants counter, Live Chat, Record toggle, and End Meeting.
- **Real-Time Collaboration**:
  - **Live WebSocket Chat**: Instant messaging with timestamps and sender identifiers.
  - **Emoji Reactions**: Floating emoji particles (👏, 👍, ❤️, 😂, 😮, 🎉) and "Raise Hand" indicator.
  - **Host Controls**: "Mute All" participants and single-click participant removal.

---

## 🏗️ Architecture & Database Schema

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│       Next.js 14 Frontend       │           │      Python FastAPI Backend     │
│   (App Router, Vanilla CSS,     │ ────────> │   (REST API + WebSocket Server) │
│         Lucide React)           │           └────────────────┬────────────────┘
└─────────────────────────────────┘                            │
                                                               │ SQLAlchemy ORM
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │      SQLite Relational DB       │
                                              │  (users, meetings, participants)│
                                              └─────────────────────────────────┘
```

### Database Tables & Schema

#### `users` Table
| Column | Type | Description |
|---|---|---|
| `id` | `INTEGER` (PK) | Auto-incrementing unique User ID |
| `name` | `VARCHAR(100)` | Full name of the user |
| `email` | `VARCHAR(255)` | Unique user email address |
| `avatar_url` | `VARCHAR(500)` | Optional avatar image link |
| `created_at` | `DATETIME` | Account creation timestamp |

#### `meetings` Table
| Column | Type | Description |
|---|---|---|
| `id` | `INTEGER` (PK) | Unique record ID |
| `meeting_code` | `VARCHAR(20)` | Zoom-style formatted code (`847-3921-5064`) |
| `title` | `VARCHAR(255)` | Meeting topic / name |
| `description` | `TEXT` | Optional agenda or description |
| `host_id` | `INTEGER` (FK) | Reference to `users.id` |
| `status` | `VARCHAR(20)` | `scheduled` \| `active` \| `ended` |
| `scheduled_at` | `DATETIME` | Scheduled date and time |
| `duration_minutes`| `INTEGER` | Meeting duration in minutes |
| `password` | `VARCHAR(20)` | Optional passcode |
| `created_at` | `DATETIME` | Timestamp created |
| `started_at` | `DATETIME` | Timestamp started |
| `ended_at` | `DATETIME` | Timestamp concluded |

#### `participants` Table
| Column | Type | Description |
|---|---|---|
| `id` | `INTEGER` (PK) | Unique participation record |
| `meeting_id` | `INTEGER` (FK) | Reference to `meetings.id` |
| `user_id` | `INTEGER` (FK) | Optional reference to `users.id` |
| `display_name` | `VARCHAR(100)` | Visible participant name |
| `joined_at` | `DATETIME` | Timestamp joined |
| `left_at` | `DATETIME` | Timestamp exited |
| `is_muted` | `BOOLEAN` | Current audio mute state |
| `is_video_on` | `BOOLEAN` | Current camera state |
| `role` | `VARCHAR(20)` | `host` \| `co-host` \| `participant` |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** and **npm**

### Single-Command Launch (Recommended)
Run both backend and frontend concurrently with the included launcher:

```bash
python run.py
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Manual Setup (Step-by-Step)

#### 1. Backend (FastAPI + SQLite)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Note: The database `zoom_clone.db` is automatically created and seeded with sample meetings and a default user on startup.*

#### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/users/me` | Fetch current logged-in default user |
| `POST` | `/api/meetings` | Create a new instant meeting |
| `POST` | `/api/meetings/schedule` | Schedule a future meeting |
| `GET` | `/api/meetings/upcoming` | List upcoming scheduled meetings |
| `GET` | `/api/meetings/recent` | List recent / ended meetings |
| `GET` | `/api/meetings/{code}` | Retrieve meeting details by code |
| `POST` | `/api/meetings/{code}/join` | Join an existing meeting room |
| `POST` | `/api/meetings/{code}/start` | Start a scheduled meeting |
| `POST` | `/api/meetings/{code}/end` | End an active meeting |
| `DELETE` | `/api/meetings/{code}` | Delete a scheduled meeting |
| `WS` | `/ws/{code}?name={name}` | WebSocket for real-time chat, reactions & signaling |

---

## 💡 Design Decisions & Assumptions

1. **Default User**: As specified in the requirements, authentication is streamlined by assuming a default logged-in user (`John Doe`), focusing full attention on high-fidelity Zoom UX, meeting lifecycles, and real-time state.
2. **Video Experience**: Integrates local webcam streams via `navigator.mediaDevices.getUserMedia` when camera permissions are enabled, with high-polish Zoom avatar tiles for multi-participant and camera-off modes.
3. **Responsive Design**: Designed with CSS variables and responsive flex/grid layouts for desktop, tablet, and mobile displays.
4. **WebSocket Architecture**: FastAPI's native WebSocket engine coordinates room broadcasts for joins, exits, live chat messages, mute synchronization, and emoji reactions.
