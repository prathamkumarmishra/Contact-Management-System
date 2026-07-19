import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { Mail, ArrowLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 gradient-mesh">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>

        {!isSent ? (
          <>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">Forgot Password?</h2>
            <p className="text-[var(--text-secondary)] text-center mb-8">Enter your email and we'll send you an OTP to reset your password.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={cn(
                    'w-full h-12 pl-12 pr-4 rounded-xl text-sm',
                    'bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--input-border)]',
                    'placeholder:text-[var(--text-tertiary)]',
                    'focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]',
                    'transition-all duration-200'
                  )} />
                </div>
              </div>

              <button type="submit" className={cn(
                'w-full py-3 rounded-xl text-sm font-semibold text-white',
                'gradient-primary hover:opacity-90 shadow-lg shadow-primary-500/25',
                'transition-all duration-200 hover:-translate-y-0.5'
              )}>
                Send OTP
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-success-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Check Your Email</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              We've sent an OTP to <strong>{email}</strong>. Check your inbox and enter the code.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to={ROUTES.LOGIN} className="inline-flex max-w-full items-center gap-2 text-sm text-primary-500 hover:text-primary-600">
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
