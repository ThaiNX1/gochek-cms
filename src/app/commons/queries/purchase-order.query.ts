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
          status
          batchId
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
        status
        batchId
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
      plannedProductionDate
      note
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
      status
      purchaseOrderId
      batchId
    }
  }
`;

export const DELETE_PURCHASE_ORDER_SHIPMENT = gql`
  mutation DeletePurchaseOrderShipment($id: ID!) {
    deletePurchaseOrderShipment(id: $id)
  }
`;

export const SUBMIT_PURCHASE_ORDER_FOR_APPROVAL = gql`
  mutation SubmitPurchaseOrderForApproval($id: ID!, $approverId: ID) {
    submitPurchaseOrderForApproval(id: $id, approverId: $approverId) {
      id
      poNumber
      status
      approverId
    }
  }
`;

export const APPROVE_PURCHASE_ORDER = gql`
  mutation ApprovePurchaseOrder($id: ID!) {
    approvePurchaseOrder(id: $id) {
      id
      poNumber
      status
      approverId
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
