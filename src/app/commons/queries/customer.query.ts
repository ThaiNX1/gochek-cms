import { gql } from 'apollo-angular';

export const GET_CUSTOMERS = gql`
  query GetCustomers($pagination: CustomerSearchInput) {
    customers(pagination: $pagination) {
      data {
        id
        fullName
        email
        phone
        source
        status
        metadata
        formKeyId
        assignedToId
        createdAt
        updatedAt
        description
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

export const GET_CUSTOMER = gql`
  query GetCustomer($id: String!) {
    customer(id: $id) {
      id
      fullName
      email
      phone
      company
      source
      status
      message
      ipAddress
      userAgent
      metadata
      formKeyId
      assignedToId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CUSTOMER_STATUS = gql`
  mutation UpdateCustomerStatus($input: UpdateCustomerStatusInput!) {
    updateCustomerStatus(input: $input) {
      id
      fullName
      email
      phone
      company
      source
      status
      createdAt
      updatedAt
    }
  }
`;
