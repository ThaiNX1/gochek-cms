import { gql } from "apollo-angular";

export const GET_PROVINCES = gql`
query Provinces {
    provinces {
        code
        countryId
        id
        name
        name_with_type
        slug
        type
    }
}
`;

export const GET_WARDS_BY_PROVINCE = gql`
query WardsByProvince($provinceId: ID!) {
    wardsByProvince(provinceId: $provinceId) {
        code
        id
        name
        name_with_type
        path
        path_with_type
        provinceId
        slug
        type
    }
}
`;