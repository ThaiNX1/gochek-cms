import { gql } from 'apollo-angular';

export const GET_WAREHOUSES = gql`
query GetWarehouses($pagination: WarehouseSearchInput) {
    warehouses(pagination: $pagination) {
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
            address
            description
            managerName
            phone
            isActive
            nhanhDepotId
            nhanhPartnerCredentialId
            nhanhPartnerCredential {
                id
                appId
                businessId
                environment
                isActive
            }
            nhanhInfo {
                credentialId
                depotId
                depotName
                businessId
                appId
            }
            createdAt
            updatedAt
            deletedAt
        }
    }
}
`;

export const GET_ACTIVE_WAREHOUSES = gql`
query GetActiveWarehouses {
    activeWarehouses {
        id
        name
        code
        address
        managerName
        phone
        isActive
    }
}
`;

export const CREATE_WAREHOUSE = gql`
mutation CreateWarehouse($input: CreateWarehouseInput!) {
    createWarehouse(input: $input) {
        id
        name
        code
        address
        description
        managerName
        phone
        isActive
        createdAt
        updatedAt
    }
}
`;

export const UPDATE_WAREHOUSE = gql`
mutation UpdateWarehouse($id: ID!, $input: UpdateWarehouseInput!) {
    updateWarehouse(id: $id, input: $input) {
        id
        name
        code
        address
        description
        managerName
        phone
        isActive
        createdAt
        updatedAt
    }
}
`;

export const DELETE_WAREHOUSE = gql`
mutation DeleteWarehouse($id: ID!) {
    deleteWarehouse(id: $id)
}
`;

export const GET_NHANH_DEPOTS = gql`
query NhanhDepots($input: NhanhCredentialInput!) {
    nhanhDepots(input: $input) {
        id
        name
        raw
    }
}
`;

export const CONFIGURE_WAREHOUSE_NHANH = gql`
mutation ConfigureWarehouseNhanh($input: ConfigureWarehouseNhanhInput!) {
    configureWarehouseNhanh(input: $input) {
        id
        name
        code
        nhanhDepotId
        nhanhPartnerCredentialId
        nhanhPartnerCredential {
            id
            appId
            businessId
            environment
            isActive
        }
    }
}
`;
