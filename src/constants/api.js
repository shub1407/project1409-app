// constants/api.js
const LOCAL_IP = "192.168.56.1" // ✅ Replace with your actual IP

export const API_CONFIG = {
  BASE_URL: __DEV__
    ? `http://${LOCAL_IP}:3000/api/v1`
    : "https://api.koiny.in/api/v1",

  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
}

// export const API_CONFIG = {
//   BASE_URL: "https://sync-server-1409.vercel.app/api/v1",

//   TIMEOUT: 15000,
//   RETRY_ATTEMPTS: 3,
// }

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    GOOGLE_LOGIN: "/auth/google",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    UPLOAD_AVATAR: "/user/avatar",
  },
  ACCOUNTS: {
    BASE: "/accounts",
    REORDER: "/accounts/reorder/bulk-update-order",
    ORDER: (id) => `/accounts/${id}/order`,
    BY_ID: (id) => `/accounts/${id}`,
  },
  CATEGORIES: {
    BASE: "/categories",
    DEFAULT: "/categories/default",
    BY_ID: (id) => `/categories/${id}`,
  },
  TRANSACTIONS: {
    BASE: "/transactions",
    BY_ID: (id) => `/transactions/${id}`,
    BY_ACCOUNT: (accountId) => `/transactions/account/${accountId}`,
    STATS: "/transactions/stats",
  },
  SCHEDULED_TRANSACTIONS: {
    BASE: "/scheduled-transactions",
    BY_ID: (id) => `/scheduled-transactions/${id}`,
    TOGGLE: (id) => `/scheduled-transactions/${id}/toggle`,
    CONFIRM: (id) => `/scheduled-transactions/${id}/confirm`,
    BALANCE_PREVIEW: (id) => `/scheduled-transactions/${id}/balance-preview`,
    UPCOMING: "/scheduled-transactions/upcoming",
    OVERDUE: "/scheduled-transactions/overdue",
    STATS: "/scheduled-transactions/stats",
    EXECUTE: "/scheduled-transactions/execute",
  },
  REPORTS: {
    STATS: "/reports/stats",
    MONTHLY_COMPARISON: "/reports/monthly-comparison",
    TOP_CATEGORIES: "/reports/top-categories",
  },
  FEEDBACK: {
    BASE: "/feedback",
    MY_FEEDBACK: "/feedback/my-feedback",
    BY_ID: (id) => `/feedback/${id}`,
  },
  SETTINGS: {
    ACCOUNT: "/settings/account",
  },
  HEALTH: "/health",
}

export const STORAGE_KEYS = {
  USER_TOKEN: "userToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "userData",
}
