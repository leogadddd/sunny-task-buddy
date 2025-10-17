# Frontend Migration: Organization → Workspace

## Status: In Progress

### Completed ✅

1. **Apollo Queries** (`/frontend/src/lib/apollo/queries.ts`)

   - Replaced `ORGANIZATIONS_QUERY` with `MY_WORKSPACES_QUERY`
   - Replaced `ORGANIZATION_BY_SLUG_QUERY` with `WORKSPACE_BY_SLUG_QUERY`
   - Updated to match backend unified response format

2. **Apollo Mutations** (`/frontend/src/lib/apollo/mutations.ts`)

   - Replaced `CREATE_ORGANIZATION_MUTATION` with `CREATE_WORKSPACE_MUTATION`
   - Added `UPDATE_WORKSPACE_MUTATION` and `DELETE_WORKSPACE_MUTATION`
   - Updated to match backend unified response format

3. **Workspace API** (`/frontend/src/api/workspace.api.ts`)

   - Created new workspace API with proper error handling
   - Matches backend response structure (success/message/data/errors)
   - Implements: getWorkspaces, getWorkspaceBySlug, createWorkspace, updateWorkspace, deleteWorkspace

4. **Workspace Store** (`/frontend/src/stores/workspace.store.ts`)

   - Created Zustand store with workspace terminology
   - Implements optimistic updates
   - Uses sonner for toast notifications
   - Matches backend field names (no role/joinedAt for members)

5. **Create Workspace Dialog** (`/frontend/src/components/dialogs/CreateWorkspaceDialog.tsx`)

   - Updated from CreateOrganizationDialog
   - Uses workspace terminology
   - Validates name length (max 50 characters to match backend)

6. **Dashboard Page** (`/frontend/src/pages/Dashboard.tsx`)
   - Updated imports to use workspace store
   - Changed UI text from "organization" to "workspace"

### Pending ⏳

1. **Routes Configuration** (`/frontend/src/config/routes.config.tsx`)

   - Change `/o/:slug` to `/w/:slug` for workspaces
   - Rename Organization component import

2. **Organization Page** (`/frontend/src/pages/organization/Organization.tsx`)

   - Rename file to `Workspace.tsx`
   - Update to use workspace API and store
   - Remove `role` and `joinedAt` fields (not in backend)
   - Update authorization check

3. **Sidebar Components** (`/frontend/src/components/organization-sidebar/`)

   - Rename folder to `workspace-sidebar`
   - Update OrganizationItem → WorkspaceItem
   - Update OrganizationIcon (can keep as is, generic icon component)
   - Update Sidebar to use workspace store

4. **Layout Component** (`/frontend/src/components/layout/Layout.tsx`)

   - Update sidebar references

5. **Old Files to Delete**
   - `/frontend/src/api/organization.api.ts`
   - `/frontend/src/stores/organization.store.ts`
   - `/frontend/src/components/dialogs/CreateOrganizationDialog.tsx`

### Key Backend Alignment Changes

**Backend Structure:**

```typescript
model Workspace {
  id: String
  slug: String (unique, auto-generated)
  name: String
  description: String?
  color: String
  status: String (active/archived)
  createdById: String
  createdBy: User
  members: User[] (direct relation, no join table)
  projects: Project[]
}
```

**Response Format:**

```typescript
{
  success: boolean
  message: string
  data?: { workspace: Workspace } | { workspaces: Workspace[] }
  errors?: string[]
}
```

**Key Differences from Old Frontend:**

- No `OrganizationMember` model/table
- Members are direct User relations (no role, joinedAt fields)
- Slug is auto-generated from name (with uniqueness check)
- Creator is automatically added as member on creation
- Status field for active/archived workspaces

### Next Steps

1. Update routes from `/o/` to `/w/`
2. Rename and update Organization page → Workspace page
3. Rename and update sidebar components
4. Test full flow: create, view, update, delete workspace
5. Clean up old organization files
