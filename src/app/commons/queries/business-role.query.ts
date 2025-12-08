import { gql } from 'apollo-angular';

export const GET_BUSINESS_ROLES = gql`
  query GetBusinessRoles($pagination: PaginationInput) {
    businessRoles(pagination: $pagination) {
      data {
        id
        name
        code
        description
        isActive
        createdAt
        updatedAt
        permissions
        parent {
          id
          name
        }
        children {
          id
          name
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

export const GET_BUSINESS_ROLE = gql`
  query GetBusinessRole($id: ID!) {
    businessRole(id: $id) {
      id
      name
      code
      description
      isActive
      createdAt
      updatedAt
      permissions
      parent {
        id
        name
      }
      children {
        id
        name
      }
    }
  }
`;

export const GET_BUSINESS_ROLE_BY_CODE = gql`
  query GetBusinessRoleByCode($code: RoleCode!) {
    businessRoleByCode(code: $code) {
      id
      name
      code
      description
      isActive
      createdAt
      updatedAt
      permissions
      parent {
        id
        name
      }
      children {
        id
        name
      }
    }
  }
`;

export const CREATE_BUSINESS_ROLE = gql`
  mutation CreateBusinessRole($input: CreateBusinessRoleInput!) {
    createBusinessRole(input: $input) {
      id
      name
      code
      description
      isActive
      createdAt
      updatedAt
      permissions
    }
  }
`;

export const UPDATE_BUSINESS_ROLE = gql`
  mutation UpdateBusinessRole($id: ID!, $input: UpdateBusinessRoleInput!) {
    updateBusinessRole(id: $id, input: $input) {
      id
      name
      code
      description
      isActive
      createdAt
      updatedAt
      permissions
    }
  }
`;

export const DELETE_BUSINESS_ROLE = gql`
  mutation DeleteBusinessRole($id: ID!) {
    deleteBusinessRole(id: $id)
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

export const GET_PERMISSIONS = gql`
query Permissions {
    permissions {
        action
        code
        createdAt
        deletedAt
        description
        id
        isActive
        name
        type
        updatedAt
    }
  }
`;