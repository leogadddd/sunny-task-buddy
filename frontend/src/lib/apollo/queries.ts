import { gql } from "@apollo/client";

// Auth Mutations
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        createdAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        createdAt
      }
    }
  }
`;

// User Queries
export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      createdAt
      organizations {
        id
        name
        description
        createdAt
      }
    }
  }
`;

// Organization Queries
export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      id
      name
      description
      createdAt
      createdBy {
        id
        name
        email
      }
      projects {
        id
        name
        status
        priority
      }
    }
  }
`;

export const ORGANIZATION_QUERY = gql`
  query Organization($id: ID!) {
    organization(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      projects {
        id
        name
        description
        status
        priority
        startDate
        endDate
        createdAt
      }
      members {
        id
        name
        email
      }
    }
  }
`;

// Organization Mutations
export const CREATE_ORGANIZATION_MUTATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      description
      createdAt
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_ORGANIZATION_MUTATION = gql`
  mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      name
      description
      updatedAt
    }
  }
`;

export const DELETE_ORGANIZATION_MUTATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;
