# VedaAI – AI Assessment Creator

An AI-powered question paper generator for teachers.

## 🚀 Live Demo
- Frontend: [Vercel Link]
- Backend: [Railway Link]

## 🛠️ Tech Stack
- **Frontend:** Next.js + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB
- **AI:** Anthropic Claude API

## 📁 Architecture

# VedaAI – AI Assessment Creator

An AI-powered question paper generator for teachers.

## 🚀 Live Demo
- Frontend: [Vercel Link - Coming Soon]
- Backend: [Railway Link - Coming Soon]

## 🛠️ Tech Stack

### Frontend
- Next.js 16 + TypeScript
- Inline CSS Styling
- Axios for API calls

### Backend
- Node.js + Express + TypeScript
- MongoDB (Database)
- Anthropic Claude API (AI Generation)

## 📁 Project Architecture

```
vedaai-project/
├── frontend/                 # Next.js Application
│   └── app/
│       ├── create/           # Assignment Creation Form
│       │   └── page.tsx
│       └── result/[id]/      # Generated Question Paper
│           └── page.tsx
│
└── backend/                  # Express API Server
    └── src/
        ├── config/
│       │   └── db.ts         # MongoDB Connection
        ├── models/
        │   └── Assignment.ts # MongoDB Schema
        ├── routes/
        │   └── assignment.ts # API Routes + AI Generation
        └── workers/
            └── generationWorker.ts
```

## 🔄 How It Works (Approach)

1. **Teacher fills form** → Title, Subject, Due Date, Question Types, Marks, Difficulty
2. **Backend saves** → Assignment stored in MongoDB with status `pending`
3. **AI Generation** → Claude API generates structured question paper
4. **Frontend polls** → Every 3 seconds checks if paper is ready
5. **Result displayed** → Formatted question paper with sections, difficulty badges, marks

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Anthropic API Key

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Run backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open browser: `http://localhost:3000/create`

## 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assignments/create` | Create new assignment |
| GET | `/api/assignments/:id` | Get assignment by ID |
| GET | `/api/assignments` | Get all assignments |

## ✨ Features
- AI-powered question paper generation
- Sections (A, B, C) with difficulty tags
- Student info section (Name, Roll No, Section)
- Print / Save as PDF
- Real-time generation status
- Form validation