export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  CONTACTS: '/contacts',
  ADD_CONTACT: '/contacts/new',
  EDIT_CONTACT: '/contacts/:id/edit',
  CONTACT_DETAIL: '/contacts/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  STATISTICS: '/statistics',
  ABOUT: '/about',
  TRASH: '/trash',
} as const;

export type RouteKey = keyof typeof ROUTES;
