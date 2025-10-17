# Auth Module (Pothos)

This module handles user authentication using Pothos GraphQL.

## Files

- **`schema.pothos.ts`** - Complete auth schema with types, queries, and mutations

## Schema Overview

### Types

- **User** - Auto-generated from Prisma User model
- **AuthData** - Contains user and sessionToken
- **AuthPayload** - Unified response format with success/message/data/errors

### Queries

- **`me`** - Get current authenticated user

### Mutations

- **`register(email, password, name?)`** - Register new user
- **`login(email, password)`** - Login and get session token
- **`logout`** - Logout and destroy session

## Usage

All types are automatically typed from Prisma models. No manual type definitions needed!

## Adding New Fields

1. Add field to Prisma User model
2. Run `npm run db:generate`
3. Add field in `schema.pothos.ts` User object
4. TypeScript will ensure type safety! ✅
