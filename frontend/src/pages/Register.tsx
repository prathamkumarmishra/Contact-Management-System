import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { UserPlus, Mail, Lock, User, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import authService from '@/services/authService';
import { toast } from 'sonner';

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

function getApiErrorMessage(err: any) {
  const details = err.response?.data?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((detail) => detail.message).join(' ');
  }
  return err.response?.data?.message || 'Failed to register account';
}

export default function Register() {
  const navigate = useNavigate();
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
      await authService.register({ firstName, lastName, email, password });
      toast.success('Registration successful! Please log in.');
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      console.error(err);
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-mesh">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 gradient-accent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-8 animate-float">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Join Us Today</h1>
          <p className="text-lg text-white/70 max-w-md">
            Create your account and start managing contacts with enterprise-level tools.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
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

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create Account</h2>
          <p className="text-[var(--text-secondary)] mb-8">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <input id="firstName" type="text" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={cn(
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
                  <input id="lastName" type="text" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={cn(
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
                <input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className={cn(
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
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Aa1@password" required value={password} onChange={(e) => setPassword(e.target.value)} className={cn(
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
              <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
                {passwordRuleMessage}
              </p>
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
