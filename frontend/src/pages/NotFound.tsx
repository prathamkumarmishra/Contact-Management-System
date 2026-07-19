import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 gradient-mesh">
      <div className="text-center animate-fade-in-up">
        <h1 className="text-8xl font-extrabold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Page Not Found</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to={ROUTES.DASHBOARD}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
              'text-sm font-semibold text-white',
              'gradient-primary hover:opacity-90',
              'shadow-lg shadow-primary-500/25',
              'transition-all duration-200 hover:-translate-y-0.5'
            )}
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
              'text-sm font-semibold text-[var(--text-primary)]',
              'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]',
              'transition-all duration-200'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
