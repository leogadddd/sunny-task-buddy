# 🚀 Quick Start Guide

## Prerequisites

- Node.js v18+ installed
- PostgreSQL running (via Docker)
- Terminal access

---

## 🏃 Start in 3 Steps

### 1️⃣ Start Database

```bash
cd /home/reefbeef/Projects/personal/uptrack/backend
docker-compose -f docker-compose.dev.yml up -d
```

### 2️⃣ Start Backend

```bash
cd /home/reefbeef/Projects/personal/uptrack/backend
npm run dev
```

✅ Backend running at: http://localhost:4000

### 3️⃣ Start Frontend

```bash
# Open new terminal
cd /home/reefbeef/Projects/personal/uptrack/frontend
npm run dev
```

✅ Frontend running at: http://localhost:5173

---

## ✨ First Time Setup

If you haven't set up the project yet:

```bash
# Backend setup
cd backend
npm install
npm run db:migrate

# Frontend setup
cd ../frontend
npm install
```

---

## 🧪 Quick Test

1. Open http://localhost:5173
2. Click "Get Started"
3. Register: test@example.com / password123
4. Click "Create Workspace"
5. Fill: Name: "My Workspace", Color: any
6. Click workspace icon in left sidebar
7. View workspace at /w/my-workspace

**Expected:** See workspace details with 1 member (you) ✅

---

## 🛑 Troubleshooting

### Port Already in Use

```bash
# Kill backend
lsof -ti:4000 | xargs kill -9

# Kill frontend
lsof -ti:5173 | xargs kill -9
```

### Database Not Running

```bash
cd backend
docker-compose -f docker-compose.dev.yml up -d
docker ps  # Verify container is running
```

### Module Not Found

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 📖 Full Documentation

- **MIGRATION_STATUS.md** - Complete migration overview
- **TESTING_GUIDE.md** - Detailed testing instructions
- **MIGRATION_COMPLETE.md** - Technical implementation details

---

## 🎯 What's Working Right Now

✅ User authentication (register, login, logout)  
✅ Workspace CRUD (create, read, update, delete)  
✅ Member management (auto-add creator)  
✅ Authorization (member-only access)  
✅ Responsive UI with sidebar  
✅ Toast notifications

---

## 🔜 Coming Next

⏳ Project management  
⏳ Task tracking  
⏳ Member invitations  
⏳ Role-based permissions

---

**Ready to code!** 🎉
