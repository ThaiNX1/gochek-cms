import { gql } from 'apollo-angular';

export const IMAGE_CONVERT_PROGRESS_SUBSCRIPTION = gql`
  subscription imageConvertProgress($jobId: String!) {
    imageConvertProgress(jobId: $jobId) {
      jobId
      message
      progress
      status
      results {
        error
        filename
        url
      }
    }
  }
`;

export const IMAGE_CONVERT_HISTORY_QUERY = gql`
  query getImageConvertHistory($page: Float!, $limit: Float!) {
    getImageConvertHistory(page: $page, limit: $limit) {
        data {
            id
            imageCount
            userId
            userName
            createdAt
            convertedImages
            aiToken
        }
        pagination {
            page
            total
            totalPages
        }
    }
  }
`;

export const CONVERT_BATCH_MUTATION = gql`
  mutation convertBatch($input: ImageConvertBatchInput!) {
    convertBatch(input: $input) {
      jobId
      progress
      status
      message
    }
  }
`;
