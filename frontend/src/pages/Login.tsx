import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { LogIn, Mail, Lock, Sparkles, Eye, EyeOff, Loader2, ShieldCheck, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/apiError';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      toast.success('Signed in successfully!');
      navigate(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'Invalid email or password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--bg-primary)] flex gradient-mesh">
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-500/15 blur-3xl" />
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 gradient-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-8 animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
          <p className="text-lg text-white/70 max-w-md">
            Sign in to manage your contacts with lightning-fast C++ powered search and analytics.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-cyan-200" />
              <p className="text-sm font-semibold text-white">Secure access</p>
              <p className="mt-1 text-xs leading-5 text-white/65">Protected sessions and encrypted passwords.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <UsersRound className="mb-2 h-5 w-5 text-cyan-200" />
              <p className="text-sm font-semibold text-white">Everything together</p>
              <p className="mt-1 text-xs leading-5 text-white/65">Your people, notes, and activity in one place.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-10 lg:p-14">
        <div className="w-full max-w-md animate-fade-in-up rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)]/85 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                Smart<span className="gradient-text">Contacts</span>
              </span>
            </div>
          </div>

          <div className="mb-8">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-500">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure workspace
            </span>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome back</h2>
            <p className="text-[var(--text-secondary)]">Enter your details to continue to your contacts.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Email Address
              </label>
              <div className={cn(
                'flex h-12 items-center gap-3 rounded-xl px-3',
                'bg-[var(--input-bg)] text-[var(--text-primary)]',
                'border border-[var(--input-border)]',
                'focus-within:border-primary-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
                'transition-all duration-200'
              )}>
                <Mail className="w-5 h-5 shrink-0 text-[var(--text-tertiary)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">
                  Password
                </label>
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary-500 hover:text-primary-600">
                  Forgot password?
                </Link>
              </div>
              <div className={cn(
                'flex h-12 items-center gap-3 rounded-xl px-3',
                'bg-[var(--input-bg)] text-[var(--text-primary)]',
                'border border-[var(--input-border)]',
                'focus-within:border-primary-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
                'transition-all duration-200'
              )}>
                <Lock className="w-5 h-5 shrink-0 text-[var(--text-tertiary)]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer min-w-0',
                'text-sm font-semibold text-white',
                'gradient-primary hover:opacity-90',
                'shadow-lg shadow-primary-500/25',
                'transition-all duration-200 hover:-translate-y-0.5',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <span className="truncate">Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 shrink-0" />
                  <span className="truncate">Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            New to SmartContacts?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary-500 hover:text-primary-600 font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
