import { gql } from 'apollo-angular';

export const GET_DEVICES = gql`
  query GetDevices($pagination: DeviceSearchInput) {
    devices(pagination: $pagination) {
      pagination {
          page
          size
          total
          totalPages
      }
      data {
          createdAt
          deletedAt
          description
          deviceTypeId
          firmwareVersion
          hardwareVersion
          id
          isActive
          name
          serialNumber
          deviceInfo
          state
          activeAt
          expiredAt
          deviceType {
              id
              name
              code
              models {
                id
                code
                name
                description
                isActive
              }
          }
          model {
            id
            code
            name
            description
            isActive
          }
          organization {
              id
              name
          }
      }
    }
  }
`;

export const GET_DEVICE = gql`
  query GetDevice($id: ID!) {
    device(id: $id) {
      id
      name
      serialNumber
      description
      firmwareVersion
      hardwareVersion
      isActive
      createdAt
      updatedAt
      deviceType {
        id
        name
        code
      }
      organization {
        id
        name
      }
    }
  }
`;

export const CREATE_DEVICE = gql`
  mutation CreateDevice($input: CreateDeviceInput!) {
    createDevice(input: $input) {
      id
      name
      serialNumber
      description
      firmwareVersion
      hardwareVersion
      isActive
      createdAt
      updatedAt
      deviceType {
        id
        name
        code
      }
      organization {
        id
        name
      }
    }
  }
`;

export const UPDATE_DEVICE = gql`
  mutation UpdateDevice($id: ID!, $input: UpdateDeviceInput!) {
    updateDevice(id: $id, input: $input) {
      id
      name
      serialNumber
      description
      firmwareVersion
      hardwareVersion
      isActive
      createdAt
      updatedAt
      modelId
      deviceType {
        id
        name
        code
      }
      model {
        id
        code
        name
        description
        isActive
      }
      organization {
        id
        name
      }
    }
  }
`;

export const DELETE_DEVICE = gql`
  mutation DeleteDevice($id: ID!) {
    deleteDevice(id: $id)
  }
`;

export const IMPORT_DEVICE = gql`
  mutation ImportDevice($file: Upload!) {
    importDevice(file: $file){
      serialNumber
      name
    }
  }
`;

export const ASSIGN_DEVICE_TO_ORGANIZATION = gql`
  mutation AssignDeviceToOrganization($deviceId: ID!, $organizationId: ID!) {
    assignDeviceToOrganization(deviceId: $deviceId, organizationId: $organizationId) {
        createdAt
        deletedAt
        description
        deviceTypeId
        firmwareVersion
        hardwareVersion
        id
        isActive
        name
        serialNumber
        deviceType {
            id
            name
            code
        }
        organization {
            id
            name
        }
    }
  }
`;

export const REMOVE_DEVICE_FROM_ORGANIZATION = gql`
  mutation RemoveDeviceFromOrganization($deviceIds: [String!]!) {
    removeDeviceFromOrganization(deviceIds: $deviceIds) {
      id
    }
  }
`;

export const GET_ALL_ORGANIZATION_DEVICES = gql`
query DevicesByOrganization {
  devicesByOrganization {
    id
    isActive
    name
    organizationId
    serialNumber
    roomId
    state
    controlSwitch1
    controlSwitch2
    controlSwitch3
    controlSwitch4
    firmwareId
    otaStatus
    deviceType {
      id
      code
      switchCount
      firmwareId
    }
  }
}
`;

export const GENERATE_SERIAL_NUMBER = gql`
mutation GenerateSerialNumber($input: DeviceGenerateSerialNumberInput!) {
    generateSerialNumber(input: $input)
}
`;

export const SUBSCRIBE_GENERATE_SERIAL_NUMBER_PROGRESS = gql`
subscription GenerateSerialNumberProgress($exportId: String) {
    generateSerialNumberProgress(exportId: $exportId) {
        error
        exportId
        message
        progress
        status
        url
        userId
    }
}
`;