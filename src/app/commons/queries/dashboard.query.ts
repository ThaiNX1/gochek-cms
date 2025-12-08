import { gql } from 'apollo-angular';

export const COUNT_END_USER_BY_JOB_STATUS = gql`
query CountEndUserByJobStatus($input: DashboardUserStatusCountInput) {
    countEndUserByJobStatus(
        input: $input
    ) {
        data {
            count
            status
        }
    }
}
`;

export const COUNT_END_USER_BY_STATUS = gql`
query CountEndUserByStatus($input: DashboardUserStatusCountInput) {
    countEndUserByStatus(input: $input) {
        data {
            activeUserCount
            inactiveUserCount
            month
            newUserCount
        }
        insightAnalysis
    }
}
`;

export const COUNT_CHECK_IN_OUT_STATUS_BY_MONTH = gql`
query CountCheckInOutStatusByMonth($input: DashboardUserStatusCountInput) {
    countCheckInOutStatusByMonth(input: $input) {
        data
        insightAnalysis
    }
}
`;
