import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[var(--bg-primary)]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl border-4 border-primary-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-[var(--text-secondary)] font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
