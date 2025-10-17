# 🧪 Quick Testing Guide

## Start the Application

### Terminal 1 - Backend

```bash
cd /home/reefbeef/Projects/personal/uptrack/backend
npm run dev
```

✅ Backend runs on: http://localhost:4000
✅ GraphQL Playground: http://localhost:4000/graphql

### Terminal 2 - Frontend

```bash
cd /home/reefbeef/Projects/personal/uptrack/frontend
npm run dev
```

✅ Frontend runs on: http://localhost:5173

---

## Test Sequence

### 1. Authentication

1. Navigate to http://localhost:5173
2. Click "Get Started" or go to `/auth`
3. Register a new account:
   - Email: test@example.com
   - Password: password123
   - Name: Test User
4. Should redirect to `/dashboard`

### 2. Create Workspace

1. On dashboard, click "Create Workspace" button
2. Fill in the form:
   - Name: "My First Workspace"
   - Description: "Testing workspace creation"
   - Color: Choose any color
3. Click "Create Workspace"
4. Should see success toast
5. Workspace icon should appear in left sidebar

### 3. View Workspace

1. Click the workspace icon in sidebar
2. Should navigate to `/w/my-first-workspace`
3. Should see:
   - Workspace name and description
   - Member count (1 - you)
   - Projects count (0 - not implemented yet)
   - Your user in the members list

### 4. Create More Workspaces

1. Go back to dashboard
2. Click the "+" button in sidebar
3. Create another workspace: "Test Workspace 2"
4. Should see both workspaces in sidebar

### 5. Update Workspace

**Via GraphQL Playground** (for now):

```graphql
mutation {
  updateWorkspace(
    id: "YOUR_WORKSPACE_ID"
    name: "Updated Workspace Name"
    color: "#10b981"
  ) {
    success
    message
    data {
      workspace {
        id
        name
        slug
        color
      }
    }
  }
}
```

### 6. Delete Workspace

1. Right-click on any workspace icon in sidebar
2. Click "Delete Workspace"
3. Confirm deletion
4. Should see success toast
5. Workspace should disappear from sidebar

---

## GraphQL Testing Examples

### Query: Get My Workspaces

```graphql
query {
  myWorkspaces {
    success
    message
    data {
      workspaces {
        id
        name
        slug
        description
        color
        status
        createdBy {
          id
          name
          email
        }
        members {
          id
          name
          email
        }
      }
    }
    errors
  }
}
```

### Query: Get Workspace by Slug

```graphql
query {
  workspaceBySlug(slug: "my-first-workspace") {
    success
    message
    data {
      workspace {
        id
        name
        slug
        description
        color
        members {
          id
          name
          email
        }
      }
    }
    errors
  }
}
```

### Mutation: Create Workspace

```graphql
mutation {
  createWorkspace(
    name: "GraphQL Test Workspace"
    description: "Created via GraphQL Playground"
    color: "#f59e0b"
  ) {
    success
    message
    data {
      workspace {
        id
        name
        slug
        color
        members {
          name
          email
        }
      }
    }
    errors
  }
}
```

### Mutation: Update Workspace

```graphql
mutation {
  updateWorkspace(
    id: "YOUR_WORKSPACE_ID"
    name: "Updated Name"
    description: "New description"
  ) {
    success
    message
    data {
      workspace {
        id
        name
        slug
        description
      }
    }
  }
}
```

### Mutation: Delete Workspace

```graphql
mutation {
  deleteWorkspace(id: "YOUR_WORKSPACE_ID") {
    success
    message
    errors
  }
}
```

---

## Expected Behaviors

### ✅ Success Cases

- Creating workspace generates unique slug
- Creator is automatically added as member
- Only members can view workspace
- Only creator can delete workspace
- Workspace appears in sidebar immediately
- Toast notifications show on all actions

### ⚠️ Error Cases to Test

- Try accessing `/w/non-existent-slug` - should show "Access Denied"
- Try creating workspace with empty name - should show validation error
- Try creating workspace with name > 50 chars - should show validation error
- Try updating another user's workspace name - should fail (need 2 accounts)
- Try deleting another user's workspace - should fail (need 2 accounts)

---

## Troubleshooting

### Backend Issues

**Error: "ObjectRef<Project> has not been implemented"**

- ✅ Fixed: Projects relation commented out until Project schema created

**Error: Port 4000 already in use**

```bash
lsof -ti:4000 | xargs kill -9
```

**Error: Database connection failed**

```bash
cd backend
docker-compose -f docker-compose.dev.yml up -d
```

### Frontend Issues

**Error: Module not found**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**TypeScript cache issues**

- Restart VS Code
- Or run: `rm -rf .vscode/ts-cache`

---

## What's Working

✅ User authentication (register, login, logout)
✅ Workspace CRUD operations
✅ Slug auto-generation
✅ Member management (auto-add creator)
✅ Authorization checks
✅ Responsive UI with workspace sidebar
✅ Toast notifications
✅ Error handling

## What's Next

⏳ Project schema and CRUD
⏳ Task schema and CRUD
⏳ Member invitations
⏳ Workspace settings page
⏳ Role-based permissions
