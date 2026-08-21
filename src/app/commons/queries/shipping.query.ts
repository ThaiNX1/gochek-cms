import { gql } from 'apollo-angular';

export const CREATE_VIETTEL_POST_ORDER = gql`
mutation CreateViettelPostOrder($input: CreateViettelPostOrderInput!) {
    createViettelPostOrder(input: $input) {
        id
        carrier
        lastError
        orderNumber
        partnerKey
        partnerStatusCode
        printUrl
        receiverAddress
        receiverName
        receiverPhone
        serialNumber
        shippingStatus
        stockHistoryId
        trackingNumber
        createdAt
        updatedAt
    }
}
`;

export const PRINT_VIETTEL_POST_ORDER = gql`
mutation PrintViettelPostOrder($input: PrintViettelPostOrderInput!) {
    printViettelPostOrder(input: $input) {
        id
        orderNumber
        printUrl
        serialNumber
        trackingNumber
    }
}
`;

export const GET_SHIPPING_ORDERS = gql`
query ShippingOrders($pagination: ShippingOrderSearchInput) {
    shippingOrders(pagination: $pagination) {
        data {
            id
            batchCode
            carrier
            createdAt
            deviceId
            lastError
            orderNumber
            partnerKey
            partnerStatusCode
            printUrl
            receiverAddress
            receiverName
            receiverPhone
            serialNumber
            shippingStatus
            stockHistoryId
            trackingNumber
            updatedAt
            stockHistory {
                id
                fromWarehouseId
                fromWarehouse {
                    id
                    name
                    code
                }
                warehouseId
                warehouse {
                    id
                    name
                    code
                }
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

export const UPDATE_SHIPPING_STATUS = gql`
mutation UpdateShippingStatus($input: UpdateShippingStatusInput!) {
    updateShippingStatus(input: $input) {
        id
        shippingStatus
        trackingNumber
        warehouseId
        fromWarehouseId
        toWarehouseId
    }
}
`;
