import { gql } from "@apollo/client";

// Auth Mutations (Phase 1 - Unified Response Format)
export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String) {
    register(email: $email, password: $password, name: $name) {
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
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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
`;

// Workspace Queries (aligned with backend)
export const MY_WORKSPACES_QUERY = gql`
  query MyWorkspaces {
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
          createdAt
          updatedAt
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
`;

export const WORKSPACE_BY_SLUG_QUERY = gql`
  query WorkspaceBySlug($slug: String!) {
    workspaceBySlug(slug: $slug) {
      success
      message
      data {
        workspace {
          id
          name
          slug
          description
          color
          status
          createdAt
          updatedAt
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
`;
