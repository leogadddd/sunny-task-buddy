# Better Auth Setup Guide

## 🎉 Authentication Implementation Complete!

Your Sunny Task Buddy app now uses **Better Auth** for authentication with:

- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ Email verification
- ✅ Password reset
- ✅ Database sessions (PostgreSQL)
- ✅ Secure account linking (manual only)
- ✅ Protected routes

---

## 🚀 Setup Instructions

### 1. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if prompted
6. For "Application type", choose "Web application"
7. Add authorized redirect URIs:
   - `http://localhost:4000/api/auth/callback/google` (development)
   - Your production URL + `/api/auth/callback/google` (production)
8. Copy the Client ID and Client Secret

### 2. Configure Gmail SMTP for Emails

**Option A: Gmail App Password (Recommended)**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new app password for "Mail"
5. Copy the 16-character password

**Option B: Create a New Gmail Account**

1. Create a dedicated Gmail account for your app (e.g., noreply@yourdomain.com)
2. Follow Option A steps to create an app password

### 3. Update Backend Environment Variables

Edit `backend/.env`:

```env
# Better Auth Configuration
BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password-here
EMAIL_FROM=noreply@sunnytaskbuddy.com
```

### 4. Database Migration

The database migration has already been applied! The following tables were created:

- `sessions` - User sessions
- `accounts` - OAuth and credential accounts
- `verifications` - Email verification tokens

If you need to reset the database:

```bash
cd backend
npm run db:reset
```

---

## 🔐 How Authentication Works

### Sign Up Flow

1. **Email/Password**:

   - User enters email, password, and name
   - Account created with `emailVerified: false`
   - Verification email sent to user
   - User clicks link to verify email
   - Can now access protected routes

2. **Google OAuth**:
   - User clicks "Sign up with Google"
   - Redirected to Google for authentication
   - Redirected back with OAuth token
   - Account automatically created and verified
   - User redirected to dashboard

### Sign In Flow

1. **Email/Password**:

   - User enters credentials
   - Better Auth verifies password
   - Session created with cookie
   - User redirected to dashboard

2. **Google OAuth**:
   - User clicks "Sign in with Google"
   - OAuth flow completes
   - Session created
   - User redirected to dashboard

### Account Linking (Security Feature)

**Automatic linking is DISABLED** for security. Here's why:

**Scenario**: User signs up with `user@example.com` using password. Later, they try to sign in with Google using the same email.

**Without protection**: Google account would automatically link → security risk if someone gained access to the Google account.

**With protection** (what we implemented):

1. If email exists, sign-in is blocked
2. User must:
   - Sign in with their original method (password)
   - Go to Settings page
   - Manually click "Link Account" for Google
   - Authenticate with Google
   - Now they can sign in with either method

This prevents unauthorized account takeovers.

---

## 🛡️ Security Features

1. **Database Sessions**:

   - Sessions stored in PostgreSQL
   - Can be revoked instantly
   - 7-day expiration
   - Secure HTTP-only cookies

2. **Email Verification**:

   - Required for email/password signups
   - Verification tokens expire in 24 hours
   - Prevents spam accounts

3. **Password Requirements**:

   - Minimum 8 characters
   - Can add complexity requirements in backend config

4. **CORS Protection**:

   - Only frontend URL allowed
   - Credentials required for requests

5. **Manual Account Linking**:
   - Prevents OAuth account hijacking
   - User must be authenticated to link

---

## 📁 File Structure

### Backend

```
backend/
├── src/
│   ├── auth.ts                 # Better Auth configuration
│   ├── index.ts                # Express server with auth routes
│   └── graphql/
│       ├── context.ts          # Includes Better Auth session
│       └── resolvers.ts        # Uses requireAuth helper
├── prisma/
│   └── schema.prisma           # Includes Better Auth tables
└── .env                        # Auth credentials (DO NOT COMMIT)
```

### Frontend

```
frontend/
├── src/
│   ├── lib/
│   │   ├── auth/
│   │   │   └── client.ts       # Better Auth client
│   │   └── apollo/
│   │       └── client.ts       # Apollo with cookies
│   ├── hooks/
│   │   └── useAuth.ts          # Auth hook
│   ├── components/
│   │   ├── ProtectedRoute.tsx  # Route guard
│   │   └── Sidebar.tsx         # User menu + signout
│   └── pages/
│       ├── Auth.tsx            # Login/signup with Google
│       ├── Settings.tsx        # Account linking page
│       └── Index.tsx           # Auto redirect based on auth
└── .env                        # API URLs
```

---

## 🧪 Testing the Setup

### 1. Start the Backend

```bash
cd backend
npm run dev
```

You should see:

```
🚀 Server ready at: http://localhost:4000
📊 GraphQL endpoint: http://localhost:4000/graphql
🔐 Auth endpoint: http://localhost:4000/api/auth/*
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Authentication

#### Email/Password Signup:

1. Go to `http://localhost:5173`
2. Click "Sign Up" tab
3. Enter name, email, password
4. Check email for verification link
5. Click verification link
6. Sign in with credentials
7. Should redirect to dashboard

#### Google OAuth:

1. Go to auth page
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to dashboard
5. Check Settings page - Google should be linked

#### Account Linking:

1. Create account with email/password
2. Sign out
3. Try to sign in with Google using same email
4. Should see error message
5. Sign in with password
6. Go to Settings
7. Click "Link Account" for Google
8. Complete Google auth
9. Now both methods work

### 4. Test Protected Routes

1. Open browser in incognito/private mode
2. Try to go to `http://localhost:5173/dashboard`
3. Should auto-redirect to `/auth`
4. After signing in, should access dashboard

---

## 🔧 Customization

### Change Session Duration

In `backend/src/auth.ts`:

```typescript
session: {
  expiresIn: 60 * 60 * 24 * 7, // Change to desired seconds
  updateAge: 60 * 60 * 24, // How often to refresh
}
```

### Disable Email Verification

In `backend/src/auth.ts`:

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: false, // Set to false
}
```

### Add More OAuth Providers

In `backend/src/auth.ts`:

```typescript
socialProviders: {
  google: { /* existing */ },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  },
  // Add more providers...
}
```

Then update frontend `Auth.tsx` to add the button.

---

## 🐛 Troubleshooting

### "Cannot find module 'better-auth'"

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Google OAuth redirect error

- Check redirect URI in Google Console matches exactly
- Should be: `http://localhost:4000/api/auth/callback/google`

### Email not sending

- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Make sure you're using App Password, not regular password
- Check Gmail settings allow less secure apps (if not using App Password)

### Session not persisting

- Check `credentials: "include"` in Apollo client
- Verify CORS allows credentials
- Check cookies are being set in browser DevTools

### TypeScript errors

- Run `npm run db:generate` in backend to regenerate Prisma client
- Restart your IDE/editor

---

## 📚 Additional Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Prisma Docs](https://www.prisma.io/docs)

---

## ✅ What's Next?

Your authentication is fully set up! Now you can:

1. ✅ Implement GraphQL resolvers for organizations, projects, tasks
2. ✅ Use `requireAuth()` helper in resolvers to protect mutations
3. ✅ Access `context.user` to get current user in resolvers
4. ✅ Build your dashboard and project management features

The authentication foundation is solid and production-ready! 🎉
