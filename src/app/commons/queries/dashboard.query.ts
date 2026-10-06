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

export const GET_LOG_MANUFACTURING_DASHBOARD = gql`
query LogManufacturingDashboard($input: LogManufacturingDashboardInput) {
    logManufacturingDashboard(input: $input) {
        range {
            fromTime
            toTime
            bucketMinutes
        }
        summary {
            uniqueDevices
            totalAttempts
            passedAttempts
            failedAttempts
            pendingAttempts
            firstPassedDevices
            finalPassedDevices
            firstPassYield
            finalYield
            failRate
            retestedDevices
            retestRate
        }
        timeline {
            bucketStart
            uniqueDevices
            totalAttempts
            passedAttempts
            failedAttempts
            pendingAttempts
            passRate
            failRate
        }
        byModel {
            key
            label
            uniqueDevices
            totalAttempts
            passedAttempts
            failedAttempts
            pendingAttempts
            passRate
            failRate
        }
        byDeviceState {
            key
            label
            uniqueDevices
            totalAttempts
            passedAttempts
            failedAttempts
            pendingAttempts
            passRate
            failRate
        }
        bySupplier {
            key
            label
            uniqueDevices
            totalAttempts
            passedAttempts
            failedAttempts
            pendingAttempts
            passRate
            failRate
        }
        topFailures {
            description
            failedAttempts
            uniqueDevices
            failShare
        }
        recentFailures {
            id
            serialNumber
            modelId
            modelCode
            modelName
            currentDeviceState
            supplierCode
            status
            testId
            testTime
            logDescription
            failureCountInRange
        }
        updatedAt
    }
}
`;

export const GET_NHANH_DASHBOARD = gql`
query NhanhDashboard($input: NhanhDashboardInput!) {
    nhanhDashboard(input: $input) {
        businessId
        partnerCredentialId
        updatedAt
        excludedGiftCategoryIds
        inventory {
            totalProducts
            totalRemain
            totalAvailable
            totalHolding
            totalShipping
            totalDamaged
        }
        inventoryByDepot {
            depotId
            depotName
            totalProducts
            totalRemain
            totalAvailable
            totalHolding
            totalShipping
            totalDamaged
        }
        topInventoryProducts {
            productId
            name
            code
            categoryId
            remain
            available
        }
        inventoryRisks {
            type
            productId
            name
            code
            remain
            available
            soldQuantity
            averageDailySales
            daysOfCover
            message
        }
        orders {
            lookbackDays
            totalOrders
            averageOrdersPerDay
            byChannel {
                channel
                channelName
                totalOrders
                averageOrdersPerDay
            }
        }
        todayOrders {
            totalOrders
            byStatus {
                status
                statusName
                count
            }
            byChannel {
                channel
                channelName
                totalOrders
                byStatus {
                    status
                    statusName
                    count
                }
            }
        }
    }
}
`;
