import { gql } from 'apollo-angular';

export const GET_STOCK_OVERVIEW = gql`
query StockOverview($warehouseId: String) {
    stockOverview(warehouseId: $warehouseId) {
        totalInStock
        totalShipped
        byBatch {
            batchCode
            remaining
            total
            warehouseId
            warehouseName
        }
        byModel {
            inStock
            modelId
            modelName
            shipped
        }
        byWarehouse {
            inStock
            shipped
            warehouseId
            warehouseName
        }
        lowStockBatches {
            batchCode
            remaining
            total
            warehouseId
            warehouseName
        }
    }
}
`;

export const GET_STOCK_BATCHES = gql`
query StockBatches($warehouseId: String) {
    stockBatches(warehouseId: $warehouseId) {
        batchCode
        expectedQuantity
        importedQuantity
        remainingQuantity
        shippedCount
        startSerialNumber
        endSerialNumber
        importedAt
        supplier
        warehouseId
        warehouseName
    }
}
`;

export const GET_STOCK_HISTORIES = gql`
query StockHistories($pagination: StockHistorySearchInput) {
    stockHistories(pagination: $pagination) {
        data {
            batchCode
            carrier
            createdAt
            deletedAt
            deviceId
            eventAt
            eventType
            id
            metadata
            note
            performedById
            quantity
            serialNumber
            shippingStatus
            shippingUpdatedAt
            warehouseId
            warehouse {
                id
                name
                code
            }
            fromWarehouseId
            fromWarehouse {
                id
                name
                code
            }
            toWarehouseId
            toWarehouse {
                id
                name
                code
            }
            trackingNumber
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

export const CREATE_STOCK_BATCH = gql`
mutation CreateStockBatch($input: CreateStockBatchInput!) {
    createStockBatch(input: $input) {
        batchCode
        expectedQuantity
        importedQuantity
        remainingQuantity
        shippedCount
        startSerialNumber
        endSerialNumber
        importedAt
        supplier
        warehouseId
        warehouseName
    }
}
`;

export const SHIP_DEVICE = gql`
mutation ShipDevice($input: ShipDeviceInput!) {
    shipDevice(input: $input) {
        id
        serialNumber
    }
}
`;

export const SHIP_DEVICE_BATCH = gql`
mutation ShipDeviceBatch($input: ShipDeviceBatchInput!) {
    shipDeviceBatch(input: $input) {
        id
        serialNumber
    }
}
`;

export const TRANSFER_DEVICE = gql`
mutation TransferDevice($input: TransferDeviceInput!) {
    transferDevice(input: $input) {
        id
        serialNumber
    }
}
`;

export const TRANSFER_DEVICE_BATCH = gql`
mutation TransferDeviceBatch($input: TransferDeviceBatchInput!) {
    transferDeviceBatch(input: $input) {
        id
        serialNumber
    }
}
`;
