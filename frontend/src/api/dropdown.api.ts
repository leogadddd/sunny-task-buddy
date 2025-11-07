/**
 * Dropdown Mutation API Functions
 * Handles all dropdown-related API calls with optimistic updates support
 */

import { gql } from "@apollo/client";

// GraphQL Queries
export const GET_TASK_DROPDOWN_FIELDS = gql`
  query GetTaskDropdownFields($taskId: String!) {
    taskDropdownFields(taskId: $taskId) {
      id
      name
      description
      taskId
      options {
        id
        label
        color
        order
        fieldId
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK_SELECTED_OPTIONS = gql`
  query GetTaskSelectedOptions($taskId: String!) {
    taskSelectedOptions(taskId: $taskId) {
      id
      taskId
      optionId
      option {
        id
        label
        color
        order
      }
      createdAt
    }
  }
`;

// GraphQL Mutations
export const CREATE_DROPDOWN_FIELD = gql`
  mutation CreateTaskDropdownField(
    $taskId: String!
    $name: String!
    $description: String
  ) {
    createTaskDropdownField(
      taskId: $taskId
      name: $name
      description: $description
    ) {
      success
      message
      data {
        id
        name
        description
        taskId
        options {
          id
          label
          color
          order
        }
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const CREATE_DROPDOWN_OPTION = gql`
  mutation CreateTaskDropdownOption(
    $fieldId: String!
    $label: String!
    $color: String
    $order: Int
  ) {
    createTaskDropdownOption(
      fieldId: $fieldId
      label: $label
      color: $color
      order: $order
    ) {
      success
      message
      data {
        id
        label
        color
        order
        fieldId
      }
      errors
    }
  }
`;

export const UPDATE_DROPDOWN_OPTION = gql`
  mutation UpdateTaskDropdownOption(
    $id: String!
    $label: String
    $color: String
    $order: Int
  ) {
    updateTaskDropdownOption(
      id: $id
      label: $label
      color: $color
      order: $order
    ) {
      success
      message
      data {
        id
        label
        color
        order
      }
      errors
    }
  }
`;

export const DELETE_DROPDOWN_OPTION = gql`
  mutation DeleteTaskDropdownOption($id: String!) {
    deleteTaskDropdownOption(id: $id) {
      success
      message
      errors
    }
  }
`;

export const DELETE_DROPDOWN_FIELD = gql`
  mutation DeleteTaskDropdownField($id: String!) {
    deleteTaskDropdownField(id: $id) {
      success
      message
      errors
    }
  }
`;

export const SELECT_DROPDOWN_OPTION = gql`
  mutation SelectTaskDropdownOption($taskId: String!, $optionId: String!) {
    selectTaskDropdownOption(taskId: $taskId, optionId: $optionId) {
      id
      taskId
      optionId
      option {
        id
        label
        color
      }
      createdAt
    }
  }
`;

export const DESELECT_DROPDOWN_OPTION = gql`
  mutation DeselectTaskDropdownOption($taskId: String!, $optionId: String!) {
    deselectTaskDropdownOption(taskId: $taskId, optionId: $optionId)
  }
`;
