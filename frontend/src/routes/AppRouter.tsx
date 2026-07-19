/* oxlint-disable react/only-export-components */
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';

// Lazy-loaded pages for code splitting
import { lazy, Suspense, type ComponentType } from 'react';

function lazyLoad(factory: () => Promise<{ default: ComponentType }>) {
  const Component = lazy(factory);
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="page-container">
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl mt-6" />
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: ROUTES.HOME,
    element: lazyLoad(() => import('@/pages/Landing')),
  },
  {
    path: ROUTES.LOGIN,
    element: lazyLoad(() => import('@/pages/Login')),
  },
  {
    path: ROUTES.REGISTER,
    element: lazyLoad(() => import('@/pages/Register')),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: lazyLoad(() => import('@/pages/ForgotPassword')),
  },

  // Protected routes (wrapped in ProtectedRoute first, then AppLayout)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: lazyLoad(() => import('@/pages/Dashboard')),
          },
          {
            path: ROUTES.CONTACTS,
            element: lazyLoad(() => import('@/pages/Contacts')),
          },
          {
            path: ROUTES.ADD_CONTACT,
            element: lazyLoad(() => import('@/pages/AddContact')),
          },
          {
            path: ROUTES.EDIT_CONTACT,
            element: lazyLoad(() => import('@/pages/EditContact')),
          },
          {
            path: ROUTES.CONTACT_DETAIL,
            element: lazyLoad(() => import('@/pages/ContactDetail')),
          },
          {
            path: ROUTES.PROFILE,
            element: lazyLoad(() => import('@/pages/Profile')),
          },
          {
            path: ROUTES.SETTINGS,
            element: lazyLoad(() => import('@/pages/Settings')),
          },
          {
            path: ROUTES.STATISTICS,
            element: lazyLoad(() => import('@/pages/Statistics')),
          },
          {
            path: ROUTES.ABOUT,
            element: lazyLoad(() => import('@/pages/About')),
          },
          {
            path: ROUTES.TRASH,
            element: lazyLoad(() => import('@/pages/Trash')),
          },
        ],
      },
    ],
  },

  // 404
  {
    path: '*',
    element: lazyLoad(() => import('@/pages/NotFound')),
  },
]);
