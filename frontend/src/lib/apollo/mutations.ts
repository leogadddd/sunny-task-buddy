import { gql } from "@apollo/client";
import { WORKSPACE_FRAGMENT, PROJECT_FRAGMENT } from "./fragments";

// Workspace Mutations (aligned with backend)
export const CREATE_WORKSPACE_MUTATION = gql`
  mutation CreateWorkspace(
    $name: String!
    $description: String
    $color: String
  ) {
    createWorkspace(name: $name, description: $description, color: $color) {
      success
      message
      data {
        workspace {
          ...WorkspaceFragment
        }
      }
      errors
    }
  }
  ${WORKSPACE_FRAGMENT}
`;

export const UPDATE_WORKSPACE_MUTATION = gql`
  mutation UpdateWorkspace(
    $id: String!
    $name: String
    $description: String
    $color: String
    $status: String
  ) {
    updateWorkspace(
      id: $id
      name: $name
      description: $description
      color: $color
      status: $status
    ) {
      success
      message
      data {
        workspace {
          ...WorkspaceFragment
        }
      }
      errors
    }
  }
  ${WORKSPACE_FRAGMENT}
`;

export const DELETE_WORKSPACE_MUTATION = gql`
  mutation DeleteWorkspace($id: String!) {
    deleteWorkspace(id: $id) {
      success
      message
      errors
    }
  }
`;

export const UPDATE_WORKSPACE_MEMBER_ROLE_MUTATION = gql`
  mutation UpdateWorkspaceMemberRole(
    $workspaceId: String!
    $userId: String!
    $role: String!
  ) {
    updateWorkspaceMemberRole(
      workspaceId: $workspaceId
      userId: $userId
      role: $role
    ) {
      success
      message
      data {
        workspace {
          ...WorkspaceFragment
        }
      }
      errors
    }
  }
  ${WORKSPACE_FRAGMENT}
`;

export const REMOVE_WORKSPACE_MEMBER_MUTATION = gql`
  mutation RemoveWorkspaceMember($workspaceId: String!, $userId: String!) {
    removeWorkspaceMember(workspaceId: $workspaceId, userId: $userId) {
      success
      message
      data {
        workspace {
          ...WorkspaceFragment
        }
      }
      errors
    }
  }
  ${WORKSPACE_FRAGMENT}
`;
export const ADD_WORKSPACE_MEMBER_MUTATION = gql`
  mutation AddWorkspaceMember(
    $workspaceId: String!
    $userId: String!
    $role: String
  ) {
    addWorkspaceMember(
      workspaceId: $workspaceId
      userId: $userId
      role: $role
    ) {
      success
      message
      data {
        workspace {
          ...WorkspaceFragment
        }
      }
      errors
    }
  }
  ${WORKSPACE_FRAGMENT}
`;
export const ANSWER_WORKSPACE_INVITATION_MUTATION = gql`
  mutation AnswerWorkspaceInvitation($workspaceId: String!, $accept: Boolean!) {
    answerWorkspaceInvitation(workspaceId: $workspaceId, accept: $accept) {
      success
      message
      errors
    }
  }
`;

// Project Mutations
export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject(
    $workspaceId: String!
    $name: String!
    $description: String
    $startDate: String
    $endDate: String
    $tags: [String!]
    $color: String
  ) {
    createProject(
      workspaceId: $workspaceId
      name: $name
      description: $description
      startDate: $startDate
      endDate: $endDate
      tags: $tags
      color: $color
    ) {
      success
      message
      data {
        project {
          ...ProjectFragment
        }
      }
      errors
    }
  }
  ${PROJECT_FRAGMENT}
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject(
    $id: String!
    $name: String
    $description: String
    $startDate: String
    $endDate: String
    $tags: [String!]
    $color: String
    $status: String
  ) {
    updateProject(
      id: $id
      name: $name
      description: $description
      startDate: $startDate
      endDate: $endDate
      tags: $tags
      color: $color
      status: $status
    ) {
      success
      message
      data {
        project {
          ...ProjectFragment
        }
      }
      errors
    }
  }
  ${PROJECT_FRAGMENT}
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: String!) {
    deleteProject(id: $id) {
      success
      message
      errors
    }
  }
`;
