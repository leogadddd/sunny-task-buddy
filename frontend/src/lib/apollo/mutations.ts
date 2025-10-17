import { gql } from "@apollo/client";

// Project Queries
export const PROJECTS_QUERY = gql`
  query Projects($workspaceId: ID) {
    projects(workspaceId: $workspaceId) {
      id
      name
      description
      status
      priority
      startDate
      endDate
      createdAt
      updatedAt
      workspace {
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
      workspace {
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
      workspace {
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
        workspace {
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
          id
          name
          slug
          description
          color
          status
          updatedAt
        }
      }
      errors
    }
  }
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
