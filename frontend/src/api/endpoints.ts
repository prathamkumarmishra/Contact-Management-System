export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    DELETE_ACCOUNT: '/auth/account'
  },
  CONTACTS: {
    BASE: '/contacts',
    TRASH: '/contacts/trash',
    BULK_DELETE: '/contacts/bulk',
    CLEAR_ALL: '/contacts/clear-all',
    CLEAR_TRASH: '/contacts/clear-trash',
    DETAIL: (id: string) => `/contacts/${id}`,
    RESTORE: (id: string) => `/contacts/${id}/restore`,
    FAVORITE: (id: string) => `/contacts/${id}/favorite`,
    BLOCK: (id: string) => `/contacts/${id}/block`,
    DUPLICATES: '/contacts/duplicates'
  },
  SEARCH: {
    AUTOCOMPLETE: '/search/autocomplete',
    GLOBAL: '/search',
    HISTORY: '/search/history'
  },
  DASHBOARD: {
    STATS: '/dashboard',
    STATISTICS: '/dashboard/statistics',
    CHARTS: '/dashboard/charts',
    ACTIVITY: '/dashboard/activity'
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_ALL_READ: '/notifications/mark-all-read',
    READ: (id: string) => `/notifications/${id}/read`,
    DELETE: (id: string) => `/notifications/${id}`
  }
} as const;
