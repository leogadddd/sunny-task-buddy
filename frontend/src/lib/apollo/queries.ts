import { gql } from "@apollo/client";
import {
  USER_FRAGMENT,
  WORKSPACE_FRAGMENT,
  PROJECT_FRAGMENT,
} from "./fragments";

// Auth Mutations (Phase 1 - Unified Response Format)
export const REGISTER_MUTATION = gql`
  mutation Register(
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    register(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    ) {
      success
      message
      data {
        user {
          ...UserFragment
        }
        sessionToken
      }
      errors
    }
  }
  ${USER_FRAGMENT}
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
      data {
        user {
          ...UserFragment
        }
        sessionToken
      }
      errors
    }
  }
  ${USER_FRAGMENT}
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
      errors
    }
  }
`;

// User Queries
export const ME_QUERY = gql`
  query Me {
    me {
      success
      message
      data {
        user {
          ...UserFragment
        }
        sessionToken
      }
      errors
    }
  }
  ${USER_FRAGMENT}
`;

export const SEARCH_USERS_QUERY = gql`
  query SearchUsers($query: String!, $workspaceId: String, $limit: Int) {
    searchUsers(query: $query, workspaceId: $workspaceId, limit: $limit) {
      id
      email
      firstName
      lastName
      username
    }
  }
`;

// Workspace Queries (aligned with backend)
export const MY_WORKSPACES_QUERY = gql`
  query MyWorkspaces {
    myWorkspaces {
      success
      message
      data {
        workspaces {
          ...WorkspaceFragment
        }
      }
      errors
    }
  }
  ${WORKSPACE_FRAGMENT}
`;

export const WORKSPACE_BY_SLUG_QUERY = gql`
  query WorkspaceBySlug($slug: String!) {
    workspaceBySlug(slug: $slug) {
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

// Project Queries
export const PROJECTS_QUERY = gql`
  query Projects($workspaceId: String!) {
    projects(workspaceId: $workspaceId) {
      success
      message
      data {
        projects {
          ...ProjectFragment
        }
      }
      errors
    }
  }
  ${PROJECT_FRAGMENT}
`;

export const PROJECT_BY_SLUG_QUERY = gql`
  query ProjectBySlug($workspaceSlug: String!, $projectSlug: String!) {
    projectBySlug(workspaceSlug: $workspaceSlug, projectSlug: $projectSlug) {
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
