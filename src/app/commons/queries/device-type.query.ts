import { gql } from 'apollo-angular';

export const GET_DEVICE_TYPES = gql`
  query GetDeviceTypes($pagination: PaginationInput) {
    deviceTypes(pagination: $pagination) {
      pagination {
          page
          size
          total
          totalPages
      }
      data {
          code
          createdAt
          deletedAt
          description
          id
          isActive
          name
          updatedAt
          warrantyMonth
      }
    }
  }
`;

export const GET_DEVICE_TYPE = gql`
  query GetDeviceType($id: ID!) {
    deviceType(id: $id) {
      id
      name
      code
      description
      isActive
      createdAt
      updatedAt
      warrantyMonth
    }
  }
`;

export const CREATE_DEVICE_TYPE = gql`
  mutation CreateDeviceType($input: CreateDeviceTypeInput!) {
    createDeviceType(input: $input) {
      id
      name
      code
      description
      isActive
      createdAt
      updatedAt
      warrantyMonth
    }
  }
`;

export const UPDATE_DEVICE_TYPE = gql`
  mutation UpdateDeviceType($id: ID!, $input: UpdateDeviceTypeInput!) {
    updateDeviceType(id: $id, input: $input) {
      id
      name
      code
      description
      isActive
      createdAt
      updatedAt
      warrantyMonth
    }
  }
`; 