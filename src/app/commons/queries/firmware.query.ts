import { gql } from 'apollo-angular';

export const GET_FIRMWARES = gql`
query GetFirmwares($pagination: PaginationInput) {
    firmwares(pagination: $pagination) {
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
            id
            isActive
            name
            filePath
            fileName
            releaseNotes
            version
            type
        }
    }
}
`;

export const GET_FIRMWARE_BY_ID = gql`
query GetFirmware($id: ID!) {
    firmware(id: $id) {
        createdAt
        deletedAt
        description
        id
        isActive
        name
        filePath
        releaseNotes
        version
        fileName
        md5
        deviceTypes {
            id
            name
            switchCount
            code
        }
    }
}
`;

export const CREATE_FIRMWARE = gql`
mutation CreateFirmware($input: CreateFirmwareInput!) {
    createFirmware(input: $input) {
        createdAt
        deletedAt
        description
        id
        isActive
        name
        filePath
        releaseNotes
        version
        fileName
        md5
        deviceTypes {
            id
            name
            switchCount
            code
        }
    }
}
`;

export const UPDATE_FIRMWARE = gql`
mutation UpdateFirmware($id: ID!, $input: UpdateFirmwareInput!) {
    updateFirmware(id: $id, input: $input) {
        createdAt
        deletedAt
        description
        id
        isActive
        name
        filePath
        releaseNotes
        version
        fileName
        md5
        deviceTypes {
            id
            name
            switchCount
            code
        }
    }
}
`;

export const DELETE_FIRMWARE = gql`
mutation DeleteFirmware($id: ID!) {
    deleteFirmware(id: $id)
}
`;