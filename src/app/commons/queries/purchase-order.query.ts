import { gql } from 'apollo-angular';

export const GET_PURCHASE_ORDERS = gql`
  query PurchaseOrders($pagination: PurchaseOrderSearchInput) {
    purchaseOrders(pagination: $pagination) {
      statusCounts {
        status
        count
      }
      pagination {
        page
        size
        total
        totalPages
      }
      data {
        id
        poNumber
        orderDate
        requestedDeliveryDate
        currency
        status
        paymentTerms
        factoryContact
        projectNote
        createdAt
        updatedAt
        supplierId
        supplier {
          id
          code
          name
        }
        approverId
        approver {
          id
          name
          email
        }
        rejectionReason
        items {
          id
          modelId
          modelCode
          modelName
          version
          quantity
          unitPrice
          lineTotal
          batches {
            id
            batchCode
            orderedQuantity
            generatedQuantity
            plannedProductionDate
            packagingVersion
            note
            status
            itemId
            shipments {
              id
              shipmentCode
              quantity
              status
            }
          }
        }
        shipments {
          id
          shipmentCode
          quantity
          expectedShipDate
          expectedArrivalDate
          carrier
          trackingNumber
          note
          status
          warehouseId
          shipmentBatches {
            id
            batchId
            quantity
          }
        }
      }
    }
  }
`;

export const GET_PURCHASE_ORDER_NUMBERS = gql`
  query PurchaseOrderNumbers($pagination: PurchaseOrderSearchInput) {
    purchaseOrders(pagination: $pagination) {
      data {
        poNumber
      }
    }
  }
`;

export const GET_PURCHASE_ORDER_SHIPMENT_CODES = gql`
  query PurchaseOrderShipmentCodes($pagination: PurchaseOrderSearchInput) {
    purchaseOrders(pagination: $pagination) {
      pagination {
        page
        totalPages
      }
      data {
        shipments {
          shipmentCode
        }
      }
    }
  }
`;

export const GET_PURCHASE_ORDER = gql`
  query PurchaseOrder($id: ID!) {
    purchaseOrder(id: $id) {
      id
      poNumber
      orderDate
      requestedDeliveryDate
      currency
      status
      paymentTerms
      factoryContact
      projectNote
      createdAt
      updatedAt
      supplierId
      supplier {
        id
        code
        name
      }
      createdBy {
        id
        name
        email
      }
      approverId
      approver {
        id
        name
        email
      }
      approvedAt
      approvalNote
      rejectionReason
      completedAt
      actualProcessedQuantity
      items {
        id
        modelId
        model {
          id
          name
          code
        }
        modelCode
        modelName
        version
        quantity
        unitPrice
        lineTotal
        batches {
          id
          batchCode
          orderedQuantity
          generatedQuantity
          plannedProductionDate
          firmwareVersion
          hardwareVersion
          packagingVersion
          serialPrefix
          note
          status
          itemId
        }
      }
      batches {
        id
        batchCode
        orderedQuantity
        generatedQuantity
        plannedProductionDate
        firmwareVersion
        hardwareVersion
        packagingVersion
        serialPrefix
        note
        status
        itemId
        item {
          id
          modelName
          modelCode
          version
        }
        shipments {
          id
          shipmentCode
          quantity
          status
          carrier
          trackingNumber
          expectedShipDate
          expectedArrivalDate
        }
      }
      shipments {
        id
        shipmentCode
        quantity
        expectedShipDate
        expectedArrivalDate
        carrier
        trackingNumber
        note
        status
        warehouseId
        warehouse {
          id
          name
        }
        shipmentBatches {
          id
          batchId
          quantity
          batch {
            id
            batchCode
            status
          }
        }
      }
    }
  }
`;

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      poNumber
      orderDate
      status
      currency
      supplierId
    }
  }
`;

export const UPDATE_PURCHASE_ORDER = gql`
  mutation UpdatePurchaseOrder($id: ID!, $input: UpdatePurchaseOrderInput!) {
    updatePurchaseOrder(id: $id, input: $input) {
      id
      poNumber
      status
      orderDate
      requestedDeliveryDate
    }
  }
`;

export const DELETE_PURCHASE_ORDER = gql`
  mutation DeletePurchaseOrder($id: ID!) {
    deletePurchaseOrder(id: $id)
  }
`;

export const CREATE_PURCHASE_ORDER_BATCH = gql`
  mutation CreatePurchaseOrderBatch($input: CreatePurchaseOrderBatchInput!) {
    createPurchaseOrderBatch(input: $input) {
      id
      batchCode
      orderedQuantity
      generatedQuantity
      plannedProductionDate
      firmwareVersion
      hardwareVersion
      packagingVersion
      note
      status
      itemId
      purchaseOrderId
    }
  }
`;

export const UPDATE_PURCHASE_ORDER_BATCH = gql`
  mutation UpdatePurchaseOrderBatch($id: ID!, $input: UpdatePurchaseOrderBatchInput!) {
    updatePurchaseOrderBatch(id: $id, input: $input) {
      id
      batchCode
      orderedQuantity
      generatedQuantity
      plannedProductionDate
      note
      status
      itemId
      purchaseOrderId
    }
  }
`;

export const UPDATE_PURCHASE_ORDER_BATCH_STATUS = gql`
  mutation UpdatePurchaseOrderBatchStatus($ids: [ID!]!, $status: PurchaseOrderBatchStatus!) {
    updatePurchaseOrderBatchStatus(ids: $ids, status: $status) {
      id
      batchCode
      orderedQuantity
      generatedQuantity
      plannedProductionDate
      note
      status
      itemId
      purchaseOrderId
    }
  }
`;

export const DELETE_PURCHASE_ORDER_BATCH = gql`
  mutation DeletePurchaseOrderBatch($id: ID!) {
    deletePurchaseOrderBatch(id: $id)
  }
`;

export const CREATE_PURCHASE_ORDER_SHIPMENT = gql`
  mutation CreatePurchaseOrderShipment($input: CreatePurchaseOrderShipmentInput!) {
    createPurchaseOrderShipment(input: $input) {
      id
      shipmentCode
      quantity
      expectedShipDate
      expectedArrivalDate
      carrier
      trackingNumber
      note
      status
      purchaseOrderId
      warehouseId
      shipmentBatches {
        id
        batchId
        quantity
      }
    }
  }
`;

export const UPDATE_PURCHASE_ORDER_SHIPMENT = gql`
  mutation UpdatePurchaseOrderShipment($id: ID!, $input: UpdatePurchaseOrderShipmentInput!) {
    updatePurchaseOrderShipment(id: $id, input: $input) {
      id
      shipmentCode
      quantity
      expectedShipDate
      expectedArrivalDate
      carrier
      trackingNumber
      note
      status
      purchaseOrderId
      warehouseId
      shipmentBatches {
        id
        batchId
        quantity
      }
    }
  }
`;

export const DELETE_PURCHASE_ORDER_SHIPMENT = gql`
  mutation DeletePurchaseOrderShipment($id: ID!) {
    deletePurchaseOrderShipment(id: $id)
  }
`;

export const UPDATE_PURCHASE_ORDER_SHIPMENT_STATUS = gql`
  mutation UpdatePurchaseOrderShipmentStatus($id: ID!, $status: PurchaseOrderShipmentStatus!) {
    updatePurchaseOrderShipmentStatus(id: $id, status: $status) {
      id
      shipmentCode
      status
    }
  }
`;

export const RECEIVE_PURCHASE_ORDER_SHIPMENT = gql`
  mutation ReceivePurchaseOrderShipment($input: ReceivePurchaseOrderShipmentInput!) {
    receivePurchaseOrderShipment(input: $input) {
      id
      shipmentCode
      status
      warehouseId
      warehouse {
        id
        name
        code
      }
      shipmentBatches {
        id
        batchId
        quantity
        batch {
          id
          batchCode
          status
        }
      }
    }
  }
`;

export const SUBMIT_PURCHASE_ORDER_FOR_APPROVAL = gql`
  mutation SubmitPurchaseOrderForApproval($id: ID!, $approverId: ID!) {
    submitPurchaseOrderForApproval(id: $id, approverId: $approverId) {
      id
      poNumber
      status
      approverId
    }
  }
`;

export const APPROVE_PURCHASE_ORDER = gql`
  mutation ApprovePurchaseOrder($id: ID!, $approvalNote: String) {
    approvePurchaseOrder(id: $id, approvalNote: $approvalNote) {
      id
      poNumber
      status
      approverId
      approvalNote
    }
  }
`;

export const REJECT_PURCHASE_ORDER = gql`
  mutation RejectPurchaseOrder($id: ID!, $rejectionReason: String) {
    rejectPurchaseOrder(id: $id, rejectionReason: $rejectionReason) {
      id
      poNumber
      status
      approverId
    }
  }
`;

export const CANCEL_PURCHASE_ORDER = gql`
  mutation CancelPurchaseOrder($id: ID!) {
    cancelPurchaseOrder(id: $id) {
      id
      poNumber
      status
    }
  }
`;

export const COMPLETE_PURCHASE_ORDER = gql`
  mutation CompletePurchaseOrder($id: ID!, $actualProcessedQuantity: Int!) {
    completePurchaseOrder(id: $id, actualProcessedQuantity: $actualProcessedQuantity) {
      id
      poNumber
      status
      actualProcessedQuantity
      completedAt
    }
  }
`;

export const GET_USERS_FOR_APPROVER = gql`
  query GetUsersForApprover($pagination: PaginationInput) {
    users(pagination: $pagination) {
      pagination {
        page
        size
        total
        totalPages
      }
      data {
        id
        name
        email
      }
    }
  }
`;

export const GET_MODELS_FOR_SELECT = gql`
  query GetModelsForSelect($pagination: PaginationInput) {
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
      }
    }
  }
`;

export const GET_SUPPLIERS_FOR_SELECT = gql`
  query GetSuppliersForSelect($pagination: PaginationInput) {
    suppliers(pagination: $pagination) {
      pagination {
        page
        size
        total
        totalPages
      }
      data {
        id
        code
        name
      }
    }
  }
`;
