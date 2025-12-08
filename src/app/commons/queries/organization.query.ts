import { gql } from "apollo-angular";

// Get all organizations with pagination
export const GET_ORGANIZATIONS = gql`
  query Organizations($pagination: PaginationInput) {
    organizations(pagination: $pagination) {
      data {
        id
        name
        shortName
        address
        description
        email
        phone
        createdAt
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

// Get organization by ID
export const GET_ORGANIZATION = gql`
  query Organization($id: ID!) {
    organization(id: $id) {
      id
      name
      shortName
      address
      description
      email
      phone
      createdAt
    }
  }
`;

// Create new organization
export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      address
      description
      email
      phone
      createdAt
    }
  }
`;

// Update organization
export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($id: ID!, $input: UpdateOrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      name
      address
      description
      email
      phone
      createdAt
    }
  }
`;

// Delete organization
export const DELETE_ORGANIZATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;

