import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import heroArtwork from '@/assets/hero.png';
import {
  Sparkles,
  Search,
  Shield,
  Zap,
  BarChart3,
  Upload,
  Moon,
  Users,
  ArrowRight,
  ChevronRight,
  Globe,
  Code2,
  Cpu,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Github } from '@/components/common/icons';
import ThemeToggle from '@/components/layout/ThemeToggle';

const features = [
  {
    icon: Search,
    title: 'Lightning Search',
    description: 'Sub-millisecond autocomplete powered by a C++ Trie. Find any contact instantly.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'JWT authentication, encrypted passwords, rate limiting, and role-based access control.',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Zap,
    title: 'C++ Algorithm Engine',
    description: 'Advanced data structures for sorting, duplicate detection, and smart suggestions.',
    gradient: 'from-orange-500 to-amber-400',
  },
  {
    icon: BarChart3,
    title: 'Rich Analytics',
    description: 'Interactive dashboards that track growth, categories, companies, and activity.',
    gradient: 'from-fuchsia-500 to-pink-400',
  },
  {
    icon: Upload,
    title: 'Import & Export',
    description: 'CSV, Excel, PDF, and JSON support for moving thousands of contacts quickly.',
    gradient: 'from-rose-500 to-red-400',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description: 'Comfortable light, dark, and system-aware themes for long work sessions.',
    gradient: 'from-indigo-500 to-sky-400',
  },
];

const techStack = [
  { icon: Globe, label: 'React 19', desc: 'Frontend' },
  { icon: Code2, label: 'TypeScript', desc: 'Type Safety' },
  { icon: Cpu, label: 'C++ Engine', desc: 'DSA Algorithms' },
  { icon: Shield, label: 'Node.js', desc: 'Backend API' },
];

const stats = [
  { value: '10+', label: 'Data Structures' },
  { value: '<1ms', label: 'Search Speed' },
  { value: '30+', label: 'REST APIs' },
  { value: '100%', label: 'TypeScript' },
];

const highlights = [
  'C++ Trie autocomplete',
  'BST sorted contact index',
  'Secure JWT sessions',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-[var(--bg-secondary)]/85 backdrop-blur-xl',
        'border-b border-[var(--border-color)]'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)] truncate">
              Smart<span className="gradient-text">Contacts</span>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            <Link
              to={ROUTES.LOGIN}
              className={cn(
                'hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium whitespace-nowrap',
                'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                'hover:bg-[var(--bg-tertiary)] transition-all duration-200'
              )}
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className={cn(
                'inline-flex items-center justify-center h-10 px-4 sm:px-5 rounded-lg text-sm font-semibold whitespace-nowrap',
                'bg-primary-500 hover:bg-primary-600 text-white',
                'shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
                'transition-all duration-200 hover:-translate-y-0.5'
              )}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className={cn(
        'relative overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16',
        'border-b border-[var(--border-color)]',
        'bg-[linear-gradient(180deg,var(--bg-secondary)_0%,var(--bg-primary)_100%)]'
      )}>
        <img
          src={heroArtwork}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[-80px] top-24 w-[430px] max-w-[72vw] opacity-15 dark:opacity-20"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--bg-primary)_0%,transparent_100%)] opacity-80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className={cn(
              'inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-lg mb-7',
              'bg-primary-500/10 border border-primary-500/20',
              'text-primary-500 text-sm font-semibold',
              'animate-fade-in-down'
            )}>
              <Zap className="w-4 h-4" />
              <span className="truncate">Powered by C++ Algorithm Engine</span>
              <ChevronRight className="w-4 h-4" />
            </div>

            <h1 className={cn(
              'text-4xl sm:text-5xl lg:text-7xl font-extrabold',
              'text-[var(--text-primary)] leading-tight',
              'animate-fade-in-up'
            )}>
              Smart Contact Management System
            </h1>

            <p className={cn(
              'mt-6 text-base sm:text-xl text-[var(--text-secondary)]',
              'max-w-2xl leading-relaxed',
              'animate-fade-in-up stagger-2'
            )}>
              Manage, search, organize, and analyze contacts from one fast workspace built with React,
              TypeScript, Node.js, MongoDB, and a C++ algorithm engine.
            </p>

            <div className={cn(
              'mt-7 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]',
              'animate-fade-in-up stagger-3'
            )}>
              {highlights.map(item => (
                <span key={item} className="inline-flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                  <span className="truncate">{item}</span>
                </span>
              ))}
            </div>

            <div className={cn(
              'mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3',
              'animate-fade-in-up stagger-4'
            )}>
              <Link
                to={ROUTES.REGISTER}
                className={cn(
                  'group inline-flex min-w-0 items-center justify-center gap-2 px-6 py-3 rounded-lg',
                  'text-sm sm:text-base font-semibold text-white',
                  'gradient-primary hover:opacity-90',
                  'shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40',
                  'transition-all duration-300 hover:-translate-y-1'
                )}
              >
                <span className="truncate">Start Managing Contacts</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={ROUTES.DASHBOARD}
                className={cn(
                  'inline-flex min-w-0 items-center justify-center gap-2 px-6 py-3 rounded-lg',
                  'text-sm sm:text-base font-semibold text-[var(--text-primary)]',
                  'bg-[var(--bg-secondary)] border border-[var(--border-color)]',
                  'hover:border-primary-500/30 hover:shadow-lg',
                  'transition-all duration-300 hover:-translate-y-1'
                )}
              >
                <Users className="w-5 h-5" />
                <span className="truncate">View Dashboard</span>
              </Link>
            </div>
          </div>

          <div className={cn(
            'mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl',
            'animate-fade-in-up stagger-5'
          )}>
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className={cn(
                  'rounded-lg p-4',
                  'bg-[var(--card-bg)]/85 border border-[var(--card-border)]',
                  'shadow-sm backdrop-blur-sm'
                )}
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{value}</div>
                <div className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1 truncate">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--text-tertiary)] mb-8 font-medium">
            Built with modern technologies
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 min-w-0 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{label}</p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Everything You Need to{' '}
              <span className="gradient-text">Manage Contacts</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              A full-featured platform with enterprise-grade tools, a polished UI, and algorithm-powered performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description, gradient }, index) => (
              <div
                key={title}
                className={cn(
                  'group relative p-6 rounded-lg',
                  'bg-[var(--card-bg)] border border-[var(--card-border)]',
                  'hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5',
                  'transition-all duration-300 hover:-translate-y-1',
                  'animate-fade-in-up',
                  `stagger-${index + 1}`
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
                  `bg-gradient-to-br ${gradient}`,
                  'shadow-lg text-white'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-primary-400/20 bg-primary-600 px-4 sm:px-6 lg:px-8 py-16">
        <img
          src={heroArtwork}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-1/2 w-56 -translate-y-1/2 opacity-15"
        />
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <Star className="w-10 h-10 text-white/80 mb-5" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              Build a cleaner contact workflow with fast search, secure storage, and smart analytics from day one.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to={ROUTES.REGISTER}
              className={cn(
                'group inline-flex min-w-0 items-center justify-center gap-2 px-6 py-3 rounded-lg',
                'text-sm font-semibold text-primary-700',
                'bg-white hover:bg-white/90',
                'shadow-xl shadow-black/10',
                'transition-all duration-300 hover:-translate-y-1'
              )}
            >
              <span className="truncate">Create Free Account</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex min-w-0 items-center justify-center gap-2 px-6 py-3 rounded-lg',
                'text-sm font-semibold text-white',
                'bg-white/10 hover:bg-white/20 border border-white/20',
                'transition-all duration-300 hover:-translate-y-1'
              )}
            >
              <Github className="w-5 h-5" />
              <span className="truncate">View Source</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
              SmartContacts
            </span>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] text-center">
            (c) 2026 Smart Contact Management System.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              Terms
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
