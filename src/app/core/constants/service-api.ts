export const serviceAPI = {
    auth: {
        login: 'rest/auth/1/session',
        logout: 'rest/auth/1/session',
        forgotPassword: 'cms/user/forgot-password',
        changePassword: 'cms/user/change-password',
        skipChangePassword: 'cms/user/skip-changing-password',
        resetPassword: 'cms/user/reset-password',
        checkToken: 'cms/user/forgot-password-token?token={token}',
        loginByPhone: 'app/user/signin',
        loginRole: 'karofi/app/user/roleSignin',
        userInfo: 'app/user/detail'
    }
};
