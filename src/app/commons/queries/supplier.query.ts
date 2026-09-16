import { gql } from 'apollo-angular';

export const GET_SUPPLIERS = gql`
  query GetSuppliers($pagination: PaginationInput) {
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
        contactPerson
        phone
        email
        address
        taxCode
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_SUPPLIER = gql`
  query GetSupplier($id: ID!) {
    supplier(id: $id) {
      id
      code
      name
      contactPerson
      phone
      email
      address
      taxCode
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUPPLIER_BY_CODE = gql`
  query GetSupplierByCode($code: String!) {
    supplierByCode(code: $code) {
      id
      code
      name
      contactPerson
      phone
      email
      address
      taxCode
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: CreateSupplierInput!) {
    createSupplier(input: $input) {
      id
      code
      name
      contactPerson
      phone
      email
      address
      taxCode
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($id: ID!, $input: UpdateSupplierInput!) {
    updateSupplier(id: $id, input: $input) {
      id
      code
      name
      contactPerson
      phone
      email
      address
      taxCode
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SUPPLIER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id)
  }
`;
