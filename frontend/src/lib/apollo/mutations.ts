import { gql } from "@apollo/client";

// Project Queries
export const PROJECTS_QUERY = gql`
  query Projects($organizationId: ID) {
    projects(organizationId: $organizationId) {
      id
      name
      description
      status
      priority
      startDate
      endDate
      createdAt
      updatedAt
      organization {
        id
        name
      }
      assignees {
        id
        name
        email
      }
      tasks {
        id
        title
        status
        priority
        dueDate
      }
    }
  }
`;

export const PROJECT_QUERY = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      priority
      startDate
      endDate
      createdAt
      updatedAt
      organization {
        id
        name
      }
      assignees {
        id
        name
        email
      }
      tasks {
        id
        title
        description
        status
        priority
        dueDate
        createdAt
        assignee {
          id
          name
          email
        }
        createdBy {
          id
          name
          email
        }
      }
    }
  }
`;

// Project Mutations
export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      status
      priority
      startDate
      endDate
      createdAt
      organization {
        id
        name
      }
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      status
      priority
      startDate
      endDate
      updatedAt
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

// Task Queries
export const TASKS_QUERY = gql`
  query Tasks($projectId: ID) {
    tasks(projectId: $projectId) {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
      project {
        id
        name
      }
      assignee {
        id
        name
        email
      }
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const TASK_QUERY = gql`
  query Task($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
      project {
        id
        name
        organization {
          id
          name
        }
      }
      assignee {
        id
        name
        email
      }
      createdBy {
        id
        name
        email
      }
    }
  }
`;

// Task Mutations
export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      project {
        id
        name
      }
      assignee {
        id
        name
        email
      }
      createdBy {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      updatedAt
      assignee {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;
