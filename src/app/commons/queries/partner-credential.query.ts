import { gql } from 'apollo-angular';

export const GET_PARTNER_CREDENTIALS = gql`
query PartnerCredentials($input: PartnerCredentialSearchInput) {
    partnerCredentials(input: $input) {
        id
        environment
        isActive
        lastLoginAt
        lastOwnerConnectAt
        ownerTokenExpiresAt
        partnerKey
        tokenExpiresAt
        username
        createdAt
        updatedAt
    }
}
`;

export const UPSERT_PARTNER_CREDENTIAL = gql`
mutation UpsertPartnerCredential($input: UpsertPartnerCredentialInput!) {
    upsertPartnerCredential(input: $input) {
        id
        environment
        isActive
        lastLoginAt
        lastOwnerConnectAt
        ownerTokenExpiresAt
        partnerKey
        tokenExpiresAt
        username
        createdAt
        updatedAt
    }
}
`;

export const REFRESH_VIETTEL_POST_TOKEN = gql`
mutation RefreshViettelPostToken($input: RefreshPartnerTokenInput!) {
    refreshViettelPostToken(input: $input) {
        id
        environment
        isActive
        lastLoginAt
        lastOwnerConnectAt
        ownerTokenExpiresAt
        partnerKey
        tokenExpiresAt
        username
        createdAt
        updatedAt
    }
}
`;

export const GET_NHANH_CREDENTIALS = gql`
query NhanhCredentials {
    nhanhCredentials {
        id
        environment
        isActive
        partnerKey
        appId
        businessId
        allowedDepotIds
        permissions
        lastVerifiedAt
        lastError
        createdAt
        updatedAt
    }
}
`;

export const UPSERT_NHANH_CREDENTIAL = gql`
mutation UpsertNhanhCredential($input: UpsertNhanhCredentialInput!) {
    upsertNhanhCredential(input: $input) {
        id
        environment
        isActive
        partnerKey
        appId
        businessId
        allowedDepotIds
        permissions
        lastVerifiedAt
        lastError
        createdAt
        updatedAt
    }
}
`;

export const VERIFY_NHANH_CREDENTIAL = gql`
mutation VerifyNhanhCredential($input: NhanhCredentialInput!) {
    verifyNhanhCredential(input: $input) {
        id
        name
    }
}
`;
