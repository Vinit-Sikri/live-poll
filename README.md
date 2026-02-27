<div align="center">

# 🗳️ Live Polling System

### A Resilient Real-Time Polling Platform for Teachers & Students

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Online-brightgreen?style=for-the-badge)](https://live-poll-front.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Vinit-Sikri/live-poll)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)

</div>

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <strong>🧑‍🏫 Teacher — Poll Creation</strong><br/>
      <sub><a href="https://live-poll-front.onrender.com/teacher">live-poll-front.onrender.com/teacher</a></sub><br/><br/>
      <img src="screenshots/teacher-dashboard.png" alt="Teacher Dashboard — Poll Creation" width="100%"/>
    </td>
    <td align="center" width="50%">
      <strong>🧑‍🎓 Student — Answer Question</strong><br/>
      <sub><a href="https://live-poll-front.onrender.com/vote">live-poll-front.onrender.com/vote</a></sub><br/><br/>
      <img src="screenshots/student-vote.png" alt="Student Vote Screen with Timer" width="100%"/>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>📊 Live Question Results</strong><br/>
      <sub><a href="https://live-poll-front.onrender.com/results">live-poll-front.onrender.com/results</a></sub><br/><br/>
      <img src="screenshots/results.png" alt="Live Poll Results with Correct Answer Highlighted" width="100%"/>
    </td>
    <td align="center" width="50%">
      <strong>📜 Poll History</strong><br/>
      <sub><a href="https://live-poll-front.onrender.com/history">live-poll-front.onrender.com/history</a></sub><br/><br/>
      <img src="screenshots/poll-history.png" alt="Poll History with All Past Questions" width="100%"/>
    </td>
  </tr>
</table>

> 💡 **To add screenshots:** Create a `screenshots/` folder in the repo root, and save images as `teacher-dashboard.png`, `student-vote.png`, `results.png`, and `poll-history.png`.

---

## ✨ Overview

**Live Polling System** is a full-stack, real-time polling application built for classroom interactions. It supports two personas — **Teacher** and **Student** — and is engineered for resilience: refreshing the page mid-poll never breaks the experience.

> 🔄 **Key Differentiator:** If a student joins 30 seconds into a 60-second poll, their timer correctly shows **30 seconds** — not 60. The server is always the source of truth.

---

## 🔗 Live Pages

| Page | URL | Description |
|---|---|---|
| 🧑‍🏫 Teacher Dashboard | [/teacher](https://live-poll-front.onrender.com/teacher) | Create polls & manage sessions |
| 🧑‍🎓 Student Vote | [/vote](https://live-poll-front.onrender.com/vote) | Answer active poll questions |
| 📊 Live Results | [/results](https://live-poll-front.onrender.com/results) | Real-time result visualization |
| 📜 Poll History | [/history](https://live-poll-front.onrender.com/history) | View all past polls from DB |

---

## 🚀 Features

### 👩‍🏫 Teacher (Admin)
- Create polls with custom questions, multiple options, and a **configurable time limit** (dropdown)
- Mark a **correct answer** per poll for instant result highlighting
- View **real-time live results** as students vote (e.g., "Option A: 40%, Option B: 60%")
- Access **full poll history** with aggregate results — fetched from DB, never local storage
- Ask a new question only when all students have answered or no poll is active

### 🧑‍🎓 Student (User)
- Enter a unique name on first visit (scoped per tab/session)
- Receive questions **instantly** via WebSocket when teacher posts them
- **Server-synchronized countdown timer** shown in real time (red countdown top-right)
- Submit a single answer per question; view live results with correct answer highlighted after submission
- **Chat popup** available for student-teacher interaction

### 🔒 Resilience & Integrity
- **State recovery** — refresh mid-poll and the UI resumes exactly where it left off
- **Race condition protection** — double-voting is prevented server-side regardless of client manipulation
- **Optimistic UI** — instant feedback with graceful error rollback
- **Error handling** — app stays functional even when DB is temporarily unreachable

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (TypeScript, Custom Hooks) |
| **Backend** | Node.js + Express (TypeScript) |
| **Real-time** | Socket.io |
| **Database** | MongoDB / PostgreSQL |
| **Hosting** | Render (Frontend + Backend) |

---

## 🏗️ Architecture

```
live-poll/
├── client/                       # React Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI Components
│   │   ├── hooks/
│   │   │   ├── useSocket.ts      # Socket.io abstraction hook
│   │   │   └── usePollTimer.ts   # Server-synced countdown timer
│   │   ├── pages/
│   │   │   ├── Teacher/          # Poll creation dashboard (/teacher)
│   │   │   ├── Student/          # Vote page (/vote)
│   │   │   ├── Results/          # Live results view (/results)
│   │   │   └── History/          # Poll history view (/history)
│   │   └── context/              # Global state (Context API / Redux)
│
├── server/                       # Node.js + Express Backend
│   ├── controllers/              # Request handlers (thin layer)
│   ├── services/
│   │   └── PollService.ts        # Core business logic & DB interaction
│   ├── socket/
│   │   └── PollSocketHandler.ts  # WebSocket event routing
│   ├── models/                   # DB schemas (Poll, Option, Vote)
│   └── routes/                   # REST API endpoints
```

### Design Patterns
- **Controller-Service Pattern** — business logic separated from socket/route handlers
- **Custom Hooks** — `useSocket`, `usePollTimer` for clean separation of concerns
- **Optimistic UI** — immediate updates that revert on failure
- **Server as Source of Truth** — timer, vote counts, and state all server-driven

---

## ⚙️ Getting Started

### Prerequisites
- Node.js `>= 18.x`
- MongoDB or PostgreSQL running locally (or a cloud connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/Vinit-Sikri/live-poll.git
cd live-poll
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env    # Add your DB connection string and PORT
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
cp .env.example .env    # Add VITE_API_URL pointing to your backend
npm run dev
```

### 4. Open in Browser
```
Teacher:  http://localhost:5173/teacher
Student:  http://localhost:5173/vote
Results:  http://localhost:5173/results
History:  http://localhost:5173/history
```

---

## 🌐 Deployment

Both frontend and backend are hosted on **Render**.

| Service | URL |
|---|---|
| 🖥️ Frontend | [https://live-poll-front.onrender.com](https://live-poll-front.onrender.com/) |
| 🔌 Backend | Deployed on Render (internal service) |

> ⚠️ **Note:** Hosted on Render's free tier — the backend may take ~30 seconds to spin up after inactivity. Please wait a moment on first load.

---

## 🔌 API & Socket Reference

### REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/polls` | Fetch all past polls (Poll History) |
| `GET` | `/api/polls/active` | Get current active poll state (for recovery) |
| `POST` | `/api/polls` | Create a new poll |

### Socket Events

| Event | Direction | Description |
|---|---|---|
| `poll:start` | Server → Client | Broadcast new poll to all students |
| `poll:vote` | Client → Server | Student submits an answer |
| `poll:results` | Server → Client | Live result update pushed to all |
| `poll:end` | Server → Client | Poll timer expired, show results |
| `student:join` | Client → Server | Student registers their name |

---

## 📋 Environment Variables

### Server `.env`
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
# or
DATABASE_URL=your_postgres_connection_string
CLIENT_URL=http://localhost:5173
```

### Client `.env`
```env
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Key Technical Decisions

**Why is the server the timer authority?**
Each client receives the poll's `startTime` from the server on join/reconnect and calculates remaining time as `duration - (now - startTime)`. This ensures late joiners see an accurate countdown without any per-tick server push.

**How is double-voting prevented?**
Vote submissions are validated server-side against a `votes` collection keyed on `(pollId, studentId)`. Even if a client spams the socket event or manipulates client-side state, the server rejects any duplicate vote at the database level.

**How does state recovery work?**
On page load/refresh, the client calls `GET /api/polls/active`. If a poll is live, the server returns full state including `startTime`, options, and existing votes — and the UI reconstructs itself from that snapshot.

---

## 📄 License

This project was built as part of the **Intervue.io SDE Intern Assignment**.

---

<div align="center">

Built with ❤️ by **[Vinit Sikri](https://github.com/Vinit-Sikri)**

⭐ Star this repo if you found it helpful!

</div>
