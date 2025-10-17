# UpTrack Backend - Phase 1

GraphQL API powered by **Hono** + **GraphQL Yoga** + **Prisma** + **Better Auth**

## 🎯 Phase 1 Features

- ✅ User Registration & Login
- ✅ Session Management with Tokens
- ✅ Unified API Response Format
- ✅ GraphQL Endpoint at `/graphql`
- ✅ Type-safe with TypeScript

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.ts                 # Hono server + Yoga setup
│   ├── db/
│   │   └── prisma.ts             # Prisma client singleton
│   ├── auth/
│   │   ├── betterAuth.ts         # Auth logic (register/login/session)
│   │   └── context.ts            # GraphQL context creator
│   ├── graphql/
│   │   ├── schema.ts             # Combined GraphQL schema
│   │   ├── modules/
│   │   │   └── auth/
│   │   │       ├── typeDefs.ts   # Auth type definitions
│   │   │       ├── resolvers.ts  # Auth resolvers
│   │   │       └── index.ts      # Module export
│   │   └── utils/
│   │       └── response.ts       # Unified response helpers
│   ├── utils/
│   │   └── errors.ts             # Custom error classes
│   └── types/
│       └── context.d.ts          # GraphQL context type
├── prisma/
│   └── schema.prisma             # Database schema
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

#### 1. Start PostgreSQL

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start PostgreSQL in a Docker container on port 5432.

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment

The `.env` file should already be configured to connect to the Docker PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uptrack_dev?schema=public"
PORT=4000
BETTER_AUTH_SECRET="your-secret-key-change-in-production-min-32-chars"
BETTER_AUTH_URL="http://localhost:4000"
```

#### 4. Run Migrations

```bash
npm run db:migrate
```

#### 5. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:4000`

#### 6. Stop Database (when done)

```bash
docker-compose -f docker-compose.dev.yml down
```

To stop and remove all data:

```bash
docker-compose -f docker-compose.dev.yml down -v
```

### Option 2: Using Local PostgreSQL

If you have PostgreSQL installed locally:

#### 1. Create Database

```bash
psql -U postgres
CREATE DATABASE uptrack_dev;
\q
```

#### 2. Follow steps 2-5 from Option 1

## 📊 GraphQL API

### Endpoint

```
http://localhost:4000/graphql
```

GraphiQL playground is enabled in development.

### Unified Response Format

All mutations and queries return this shape:

```typescript
{
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
```

### Available Operations

#### Register User

```graphql
mutation Register {
  register(
    email: "user@example.com"
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
        emailVerified
        createdAt
      }
      sessionToken
    }
    errors
  }
}
```

#### Login

```graphql
mutation Login {
  login(email: "user@example.com", password: "password123") {
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

#### Get Current User

```graphql
query Me {
  me {
    success
    message
    data {
      user {
        id
        email
        name
        emailVerified
      }
      sessionToken
    }
  }
}
```

**Note:** Include the session token in the Authorization header:

```
Authorization: Bearer <sessionToken>
```

#### Logout

```graphql
mutation Logout {
  logout {
    success
    message
  }
}
```

## 🗄️ Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Reset database (⚠️ Development only!)
npm run db:reset
```

### Schema

The database includes these tables:

- **users** - User accounts
- **accounts** - Auth provider accounts (credentials)
- **sessions** - Active user sessions
- **verifications** - Email verification tokens

## 🔐 Authentication Flow

1. **Register:** User creates account → Returns user + session token
2. **Login:** User logs in → Returns user + session token
3. **Session:** Frontend stores token → Sends in Authorization header
4. **Protected Queries:** Backend validates token → Attaches user to context
5. **Logout:** Delete session from database

## 🛠️ Development

### Watch Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## 📝 Next Steps (Phase 2)

- [ ] Organizations
- [ ] Projects
- [ ] Tasks
- [ ] Team members
- [ ] File uploads

## 🧪 Testing with cURL

### Register

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(email: \"test@example.com\", password: \"password123\", name: \"Test User\") { success message data { user { id email } sessionToken } } }"
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(email: \"test@example.com\", password: \"password123\") { success message data { user { id email } sessionToken } } }"
  }'
```

### Me (with token)

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "query": "query { me { success message data { user { id email name } } } }"
  }'
```

## 📚 Tech Stack

- **Hono** - Fast, lightweight web framework
- **GraphQL Yoga** - Fully-featured GraphQL server
- **Prisma** - Next-gen ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **Better Auth** - Authentication pattern

---

Built with ❤️ for UpTrack
