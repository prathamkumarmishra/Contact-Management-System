export const APP_NAME = 'SmartContacts';
export const APP_DESCRIPTION = 'Enterprise-Level Contact Management Platform';
export const APP_VERSION = '1.0.0';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const CATEGORIES = [
  { value: 'personal', label: 'Personal', color: '#6366f1' },
  { value: 'work', label: 'Work', color: '#06b6d4' },
  { value: 'family', label: 'Family', color: '#22c55e' },
  { value: 'friend', label: 'Friend', color: '#f59e0b' },
  { value: 'other', label: 'Other', color: '#8b5cf6' },
] as const;

export const SORT_OPTIONS = [
  { value: 'firstName', label: 'Alphabetical (A-Z)' },
  { value: '-firstName', label: 'Alphabetical (Z-A)' },
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'company', label: 'Company' },
  { value: 'birthday', label: 'Birthday' },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const DEBOUNCE_MS = 300;
export const TOAST_DURATION = 5000;
export const UNDO_TIMEOUT = 10000;
