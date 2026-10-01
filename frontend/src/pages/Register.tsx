import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { UserPlus, Mail, Lock, User, Sparkles, Eye, EyeOff, Loader2, CheckCircle2, Circle, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/apiError';

const passwordRuleMessage =
  'Password must be 8+ characters with uppercase, lowercase, number, and special character.';

function getPasswordError(password: string) {
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[\W_]/.test(password)
  ) {
    return passwordRuleMessage;
  }
  return '';
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = getPasswordError(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password
      });
      if (result.isAuthenticated) {
        toast.success(`Welcome, ${result.user.firstName}! Your account is ready.`);
        navigate(ROUTES.DASHBOARD);
      } else {
        toast.success('Registration successful! Please verify your email, then sign in.');
        navigate(ROUTES.LOGIN);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'Failed to create your account'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--bg-primary)] flex gradient-mesh">
      <div className="pointer-events-none absolute -bottom-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 gradient-accent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-8 animate-float">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Join Us Today</h1>
          <p className="text-lg text-white/70 max-w-md">
            Create your account and start managing contacts with enterprise-level tools.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {[
              ['Fast setup', 'Start organizing in less than a minute.', Zap],
              ['Private by design', 'Your account is protected from day one.', ShieldCheck],
            ].map(([title, description, Icon]) => (
              <div key={title as string} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                <div>
                  <p className="text-sm font-semibold text-white">{title as string}</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">{description as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-10 lg:p-14">
        <div className="w-full max-w-md animate-fade-in-up rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)]/85 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-8">
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
              <Sparkles className="h-3.5 w-3.5" /> Get started in minutes
            </span>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create your account</h2>
            <p className="text-[var(--text-secondary)]">Keep the people you care about organized and close.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">First Name</label>
                <div className={cn(
                  'flex h-12 items-center gap-3 rounded-xl px-3',
                  'bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--input-border)]',
                  'focus-within:border-primary-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
                  'transition-all duration-200'
                )}>
                  <User className="w-5 h-5 shrink-0 text-[var(--text-tertiary)]" />
                  <input id="firstName" type="text" placeholder="John" autoComplete="given-name" minLength={2} required disabled={isLoading} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={cn(
                    'h-full min-w-0 flex-1 bg-transparent text-sm outline-none',
                    'placeholder:text-[var(--text-tertiary)]',
                  )} />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Last Name</label>
                <div className={cn(
                  'flex h-12 items-center gap-3 rounded-xl px-3',
                  'bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--input-border)]',
                  'focus-within:border-primary-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
                  'transition-all duration-200'
                )}>
                  <User className="w-5 h-5 shrink-0 text-[var(--text-tertiary)]" />
                  <input id="lastName" type="text" placeholder="Doe" autoComplete="family-name" minLength={2} required disabled={isLoading} value={lastName} onChange={(e) => setLastName(e.target.value)} className={cn(
                    'h-full min-w-0 flex-1 bg-transparent text-sm outline-none',
                    'placeholder:text-[var(--text-tertiary)]',
                  )} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email</label>
              <div className={cn(
                'flex h-12 items-center gap-3 rounded-xl px-3',
                'bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--input-border)]',
                'focus-within:border-primary-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
                'transition-all duration-200'
              )}>
                <Mail className="w-5 h-5 shrink-0 text-[var(--text-tertiary)]" />
                <input id="email" type="email" placeholder="you@example.com" autoComplete="email" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} className={cn(
                  'h-full min-w-0 flex-1 bg-transparent text-sm outline-none',
                  'placeholder:text-[var(--text-tertiary)]',
                )} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password</label>
              <div className={cn(
                'flex h-12 items-center gap-3 rounded-xl px-3',
                'bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--input-border)]',
                'focus-within:border-primary-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
                'transition-all duration-200'
              )}>
                <Lock className="w-5 h-5 shrink-0 text-[var(--text-tertiary)]" />
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Aa1@password" autoComplete="new-password" minLength={8} required disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} className={cn(
                  'h-full min-w-0 flex-1 bg-transparent text-sm outline-none',
                  'placeholder:text-[var(--text-tertiary)]',
                )} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2" aria-live="polite">
                {[
                  ['8+ characters', password.length >= 8],
                  ['Uppercase letter', /[A-Z]/.test(password)],
                  ['Lowercase letter', /[a-z]/.test(password)],
                  ['Number or symbol', /(?=.*[0-9])(?=.*[\W_])/.test(password)],
                ].map(([label, met]) => (
                  <span key={label as string} className={cn('flex items-center gap-1.5 text-xs', met ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-tertiary)]')}>
                    {met ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    {label as string}
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-2 cursor-pointer min-w-0',
              'text-sm font-semibold text-white',
              'gradient-primary hover:opacity-90',
              'shadow-lg shadow-primary-500/25',
              'transition-all duration-200 hover:-translate-y-0.5',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <span className="truncate">Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 shrink-0" />
                  <span className="truncate">Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-500 hover:text-primary-600 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
