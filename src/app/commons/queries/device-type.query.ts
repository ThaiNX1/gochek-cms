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
            shortDescription
            id
            isActive
            name
            updatedAt
            warrantyMonth
            imageUrl
            imageUrlCallback
            models {
                id
                code
                name
                description
                price
                discountPrice
                warrantyMonth
                componentCount
                attributes
                isActive
                imageUrl
                imageUrlCallback
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
      shortDescription
      isActive
      createdAt
      updatedAt
      warrantyMonth
      imageUrl
      imageUrlCallback
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
      shortDescription
      isActive
      createdAt
      updatedAt
      warrantyMonth
      imageUrl
      imageUrlCallback
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
      shortDescription
      isActive
      createdAt
      updatedAt
      warrantyMonth
      imageUrl
      imageUrlCallback
    }
  }
`; 

export const DELETE_DEVICE_TYPE = gql`
  mutation DeleteDeviceType($id: ID!) {
    deleteDeviceType(id: $id)
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
        price
        discountPrice
        warrantyMonth
        componentCount
        attributes
        isActive
        deviceTypeId
        imageUrl
        imageUrlCallback
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
      price
      discountPrice
      warrantyMonth
      componentCount
      attributes
      isActive
      deviceTypeId
      imageUrl
      imageUrlCallback
    }
  }
`;

export const UPDATE_MODEL = gql`
  mutation UpdateModel($id: ID!, $input: UpdateModelInput!) {
    updateModel(id: $id, input: $input) {
      id
      name
      code
      description
      price
      discountPrice
      warrantyMonth
      componentCount
      attributes
      isActive
      deviceTypeId
      imageUrl
      imageUrlCallback
    }
  }
`;
 

export const REMOVE_MODEL = gql`
  mutation DeleteModel($id: ID!) {
    deleteModel(id: $id)
  }
`;

export const SYNC_NHANH_PRODUCTS = gql`
  mutation SyncNhanhProducts($input: SyncNhanhProductsInput!) {
    syncNhanhProducts(input: $input) {
      createdDeviceTypes
      createdMappings
      createdModels
      deactivatedDeviceTypes
      duplicateProductCodes
      errors {
        message
        nhanhProductId
        productCode
      }
      failed
      partial
      skipped
      updatedDeviceTypes
    }
  }
`;

export const GET_NHANH_PRODUCTS = gql`
  query NhanhProducts($input: NhanhCredentialInput!) {
    nhanhProducts(input: $input)
  }
`;

export const GET_NHANH_PRODUCT_MAPPINGS = gql`
  query NhanhProductMappings($input: NhanhProductMappingSearchInput) {
    nhanhProductMappings(input: $input) {
      id
      isActive
      modelId
      nhanhProductId
      partnerCredentialId
      productCode
      productName
    }
  }
`;

export const UPSERT_NHANH_PRODUCT_MAPPING = gql`
  mutation UpsertNhanhProductMapping($input: UpsertNhanhProductMappingInput!) {
    upsertNhanhProductMapping(input: $input) {
      id
      isActive
      modelId
      nhanhProductId
      partnerCredentialId
      productCode
      productName
    }
  }
`;
