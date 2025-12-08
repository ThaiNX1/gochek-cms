import { gql } from 'apollo-angular';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
        access_token
        menus
        user {
            id
            name
            email
            state
            organization {
                id
                name
                shortName
            }
            roles {
                id
                name
                code
            }
        }
        userPermissions
    }
  }
`;

export const CONFIRM_OTP = gql`
  mutation ConfirmOtp($otp: String!) {
    confirmOtp(otp: $otp)
  }
`;

export const RESEND_OTP = gql`
  mutation ResendOtp {
    resendOtp
  }
`;