import { gql } from "apollo-angular";

export const GENERATE_SERIAL_NUMBER_HISTORY = gql`
query GenerateHistories($pagination: GenerateHistorySearchInput) {
    generateHistories(pagination: $pagination) {
        data {
            createdAt
            createdById
            deletedAt
            descriptor
            endSerialNumber
            id
            linkDownload
            linkDownloadPath
            prefix
            startSerialNumber
            updatedAt
            createdBy {
                name
                email
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

export const ALL_PREFIX = gql`
query AllPrefix {
    allPrefix {
        endSerialNumber
        id
        prefix
        startSerialNumber
    }
}
`;