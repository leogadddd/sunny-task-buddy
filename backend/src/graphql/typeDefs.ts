export const typeDefs = `#graphql
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String
    createdAt: DateTime!
    updatedAt: DateTime!
    organizations: [Organization!]!
  }

  type Organization {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    createdBy: User!
    projects: [Project!]!
    members: [User!]!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: ProjectStatus!
    priority: Priority!
    startDate: DateTime
    endDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    organization: Organization!
    tasks: [Task!]!
    assignees: [User!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    priority: Priority!
    dueDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    project: Project!
    assignee: User
    createdBy: User!
  }

  enum ProjectStatus {
    PLANNING
    IN_PROGRESS
    ON_HOLD
    COMPLETED
    CANCELLED
  }

  enum TaskStatus {
    TODO
    IN_PROGRESS
    IN_REVIEW
    DONE
    CANCELLED
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateOrganizationInput {
    name: String!
    description: String
  }

  input UpdateOrganizationInput {
    name: String
    description: String
  }

  input CreateProjectInput {
    name: String!
    description: String
    organizationId: ID!
    priority: Priority = MEDIUM
    startDate: DateTime
    endDate: DateTime
  }

  input UpdateProjectInput {
    name: String
    description: String
    status: ProjectStatus
    priority: Priority
    startDate: DateTime
    endDate: DateTime
  }

  input CreateTaskInput {
    title: String!
    description: String
    projectId: ID!
    priority: Priority = MEDIUM
    dueDate: DateTime
    assigneeId: ID
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: TaskStatus
    priority: Priority
    dueDate: DateTime
    assigneeId: ID
  }

  type Query {
    # Auth
    me: User

    # Organizations
    organizations: [Organization!]!
    organization(id: ID!): Organization

    # Projects
    projects(organizationId: ID): [Project!]!
    project(id: ID!): Project

    # Tasks
    tasks(projectId: ID): [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Organizations
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(id: ID!, input: UpdateOrganizationInput!): Organization!
    deleteOrganization(id: ID!): Boolean!

    # Projects
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Tasks
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;
