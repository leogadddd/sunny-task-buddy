# 🚀 Phase 1 Setup Guide - Auth & GraphQL Backend

This guide will help you set up Phase 1 of the UpTrack backend from scratch.

## ✅ Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running (or Docker)
- Git

## 🎯 What We're Building

Phase 1 implements:

- User registration & login
- Session-based authentication
- GraphQL API with unified response format
- Frontend integration with React/Apollo

## 📦 Step 1: Backend Setup

### 1.1 Navigate to Backend

```bash
cd backend
```

### 1.2 Install Dependencies

Dependencies are already installed! If not:

```bash
npm install
```

### 1.3 Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update the database URL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uptrack_dev?schema=public"
PORT=4000
NODE_ENV=development
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
BETTER_AUTH_URL="http://localhost:4000"
```

## 🗄️ Step 2: Database Setup

### Option A: Using Docker (Recommended)

If you have the docker-compose.yml at the root:

```bash
# From project root
docker-compose up -d postgres
```

### Option B: Local PostgreSQL

Create the database:

```bash
psql -U postgres
CREATE DATABASE uptrack_dev;
\q
```

### 2.1 Run Migrations

```bash
npm run db:migrate
```

This creates the auth tables:

- users
- accounts
- sessions
- verifications

### 2.2 Verify Database

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555`

## 🚀 Step 3: Start Backend Server

```bash
npm run dev
```

Server runs at `http://localhost:4000`

GraphQL playground: `http://localhost:4000/graphql`

## 💻 Step 4: Frontend Setup

### 4.1 Navigate to Frontend

```bash
cd ../frontend
```

### 4.2 Install Dependencies (if needed)

```bash
npm install
```

### 4.3 Set Environment Variables

Create `frontend/.env`:

```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

### 4.4 Start Frontend

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

## 🧪 Step 5: Test Authentication Flow

### 5.1 Open Frontend

Go to `http://localhost:5173/auth`

### 5.2 Register a New User

1. Click "Sign Up" tab
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"

You should see a success toast and be auto-logged in!

### 5.3 Test Login

1. Refresh the page
2. Click "Sign In" tab
3. Enter the credentials
4. Click "Sign In"

You should be redirected to the dashboard!

### 5.4 Test GraphQL Directly

Open `http://localhost:4000/graphql` and run:

#### Register Mutation

```graphql
mutation {
  register(
    email: "john@example.com"
    password: "password123"
    name: "John Doe"
  ) {
    success
    message
    data {
      user {
        id
        email
        name
      }
      sessionToken
    }
    errors
  }
}
```

#### Login Mutation

```graphql
mutation {
  login(email: "john@example.com", password: "password123") {
    success
    message
    data {
      user {
        id
        email
        name
      }
      sessionToken
    }
    errors
  }
}
```

Copy the `sessionToken` from the response.

#### Me Query (with Authentication)

Add to HTTP Headers in GraphiQL:

```json
{
  "Authorization": "Bearer YOUR_SESSION_TOKEN_HERE"
}
```

Then run:

```graphql
query {
  me {
    success
    message
    data {
      user {
        id
        email
        name
        emailVerified
        createdAt
      }
    }
  }
}
```

## ✅ Phase 1 Acceptance Criteria

- [x] User can register through `/graphql`
- [x] User can login through `/graphql`
- [x] All responses follow `{ success, message, data, errors }` format
- [x] Frontend login/register pages call new GraphQL API
- [x] Session persists via sessionToken in localStorage
- [x] `/graphql` endpoint is live
- [x] `me` query returns current user when authenticated

## 🎉 Success!

If all tests pass, Phase 1 is complete!

## 📁 Project Structure

```
uptrack/
├── backend/
│   ├── src/
│   │   ├── server.ts               # Hono + Yoga server
│   │   ├── db/prisma.ts            # Prisma client
│   │   ├── auth/
│   │   │   ├── betterAuth.ts       # Auth logic
│   │   │   └── context.ts          # GraphQL context
│   │   ├── graphql/
│   │   │   ├── schema.ts           # Combined schema
│   │   │   ├── modules/auth/       # Auth module
│   │   │   └── utils/response.ts   # Unified responses
│   │   └── utils/errors.ts         # Custom errors
│   ├── prisma/schema.prisma        # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/Auth.tsx          # Updated login/register
│   │   ├── hooks/useAuth.ts        # Updated auth hook
│   │   └── lib/apollo/
│   │       ├── client.ts           # Apollo client config
│   │       └── queries.ts          # GraphQL queries/mutations
│   └── package.json
└── README.md
```

## 🐛 Troubleshooting

### Database Connection Error

- Check PostgreSQL is running: `pg_isready`
- Verify `.env` DATABASE_URL is correct
- Try: `docker-compose up -d postgres`

### Port Already in Use

Backend (4000):

```bash
lsof -ti:4000 | xargs kill -9
```

Frontend (5173):

```bash
lsof -ti:5173 | xargs kill -9
```

### GraphQL Errors

- Clear browser localStorage
- Check Network tab in DevTools
- Verify sessionToken is being sent
- Check backend logs

### Type Errors

```bash
cd backend && npm run db:generate
cd ../frontend && npm install
```

## 🚀 Next: Phase 2

Phase 2 will add:

- Organizations
- Projects
- Tasks
- Team collaboration

---

**Questions?** Check `backend/README.md` for detailed API docs.
