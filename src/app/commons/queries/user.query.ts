import { gql } from 'apollo-angular';

export const GET_USERS = gql`
query GetUsers($pagination: PaginationInput) {
  users(pagination: $pagination) {
    data {
      id
      name
      email
      isActive
      isRequiredReLogin
      state
      createdAt
      updatedAt
      organization {
        id
        name
      }
      roles {
        id
        name
        code
      }
    }
    pagination {
      page
      size
      total
      totalPages
    }
  }
}
`;

export const SEARCH_USERS = gql`
query GetUsers($pagination: PaginationInput) {
  users(pagination: $pagination) {
    data {
      id
      name
      email
      isActive
      isRequiredReLogin
      state
      createdAt
      updatedAt
    }
    pagination {
      page
      size
      total
      totalPages
    }
  }
}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      isActive
      isRequiredReLogin
      state
      createdAt
      updatedAt
      organization {
        id
        name
      }
      roles {
        id
        name
        code
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      isActive
      isRequiredReLogin
      state
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      isActive
      isRequiredReLogin
      state
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const ASSIGN_USER_ROLE = gql`
  mutation AssignUserRole($userId: ID!, $roleId: ID!) {
    assignUserRole(userId: $userId, roleId: $roleId) {
      id
      name
      email
      roles {
        id
        name
        code
      }
    }
  }
`;

export const REMOVE_USER_ROLE = gql`
  mutation RemoveUserRole($userId: ID!, $roleId: ID!) {
    removeUserRole(userId: $userId, roleId: $roleId) {
      id
      name
      email
      roles {
        id
        name
        code
      }
    }
  }
`;

export const RESET_PASSWORD = gql`
mutation ResetPassword($id: ID!) {
    resetPassword(id: $id) {
        email
        id
    }
}
`; 