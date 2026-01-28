import { gql } from 'apollo-angular';

// ==================== WEBSITE BANNER ====================

export const GET_WEBSITE_BANNERS = gql`
query GetWebsiteBanners($pagination: PaginationInput) {
  websiteBanners(pagination: $pagination) {
    data {
      id
      title
      imageUrl
      imageUrlCallback
      order
      isActive
      createdAt
      updatedAt
    }
    pagination {
      page
      size
      totalPages
      total
    }
  }
}
`;

export const GET_WEBSITE_BANNER = gql`
query GetWebsiteBanner($id: String!) {
  websiteBanner(id: $id) {
    id
    title
    imageUrl
    imageUrlCallback
    order
    isActive
    createdAt
    updatedAt
  }
}
`;

export const CREATE_WEBSITE_BANNER = gql`
mutation CreateWebsiteBanner($input: CreateWebsiteBannerInput!) {
  createWebsiteBanner(input: $input) {
    id
    title
    imageUrl
    order
    isActive
    createdAt
    updatedAt
  }
}
`;

export const UPDATE_WEBSITE_BANNER = gql`
mutation UpdateWebsiteBanner($id: String!, $input: UpdateWebsiteBannerInput!) {
  updateWebsiteBanner(id: $id, input: $input) {
    id
    title
    imageUrl
    order
    isActive
    updatedAt
  }
}
`;

export const REMOVE_WEBSITE_BANNER = gql`
mutation RemoveWebsiteBanner($id: String!) {
  removeWebsiteBanner(id: $id)
}
`;