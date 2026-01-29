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
            models {
                id
                code
                name
                description
                isActive
            }
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

export const GET_MODELS = gql`
  query GetModels($pagination: PaginationInput) {
    models(pagination: $pagination) {
      pagination {
        page
        size
        total
        totalPages
      }
      data {
        id
        name
        code
        description
        isActive
        deviceTypeId
      }
    }
  }
`;

export const CREATE_MODEL = gql`
  mutation CreateModel($input: CreateModelInput!) {
    createModel(input: $input) {
      id
      name
      code
      description
      isActive
      deviceTypeId
    }
  }
`;
 

export const REMOVE_MODEL = gql`
  mutation DeleteModel($id: ID!) {
    deleteModel(id: $id)
  }
`;
 