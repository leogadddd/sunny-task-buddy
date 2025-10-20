import { Project } from "./project";
import { User } from "./users";

export interface WorkspaceMember {
  id: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  status: "INVITED" | "ACTIVE";
  user: User;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  members: WorkspaceMember[];
  projects?: Project[];
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  color?: string;
  status?: string;
}
