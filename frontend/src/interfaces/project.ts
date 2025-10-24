import { User } from "./users";
import { WorkspaceMember } from "./workspace";

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags: string[];
  color?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  workspaceId: string;
  createdBy: User;
  members: WorkspaceMember[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  color?: string;
  status?: string;
  workspaceId: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  color?: string;
  status?: string;
}
