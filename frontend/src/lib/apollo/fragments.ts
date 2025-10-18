import { gql } from "@apollo/client";

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    emailVerified
    firstName
    lastName
    image
    bio
    username
    color
  }
`;

export const WORKSPACE_MEMBER_FRAGMENT = gql`
  fragment WorkspaceMemberFragment on WorkspaceMember {
    id
    role
    status
    user {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const WORKSPACE_FRAGMENT = gql`
  fragment WorkspaceFragment on Workspace {
    id
    slug
    name
    description
    color
    status
    createdAt
    updatedAt
    createdBy {
      ...UserFragment
    }
    members {
      ...WorkspaceMemberFragment
    }
  }
  ${USER_FRAGMENT}
  ${WORKSPACE_MEMBER_FRAGMENT}
`;
