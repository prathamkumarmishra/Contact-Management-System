import { cn } from '@/utils/cn';
import { Sparkles, Code2, Cpu, Globe, Shield, Zap } from 'lucide-react';
import { Github } from '@/components/common/icons';

const techDetails = [
  { icon: Globe, title: 'React 19 + TypeScript', desc: 'Modern frontend with type safety, hooks, and concurrent features.' },
  { icon: Code2, title: 'Node.js + Express', desc: 'RESTful API with clean architecture, JWT auth, and real-time updates.' },
  { icon: Cpu, title: 'C++17 Engine', desc: '10 advanced data structures for sub-millisecond search and intelligent sorting.' },
  { icon: Shield, title: 'MongoDB Atlas', desc: 'Cloud-hosted NoSQL database with compound indexes and TTL cleanup.' },
  { icon: Zap, title: 'Tailwind CSS + shadcn/ui', desc: 'Premium UI with glassmorphism, gradients, dark mode, and animations.' },
];

export default function About() {
  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            About <span className="gradient-text">SmartContacts</span>
          </h1>
          <p className="mt-3 text-[var(--text-secondary)] max-w-xl mx-auto">
            An enterprise-level Contact Management Platform powered by modern web technologies
            and advanced C++ algorithms.
          </p>
        </div>

        {/* Tech stack */}
        <div className="space-y-4 mb-12">
          {techDetails.map(({ icon: Icon, title, desc }, index) => (
            <div
              key={title}
              className={cn(
                'flex items-start gap-4 p-5 rounded-2xl',
                'bg-[var(--card-bg)] border border-[var(--card-border)]',
                'hover:border-primary-500/20 transition-all',
                'animate-fade-in-up',
                `stagger-${index + 1}`
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
              'text-sm font-semibold text-[var(--text-primary)]',
              'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]',
              'transition-all duration-200'
            )}
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
          <p className="mt-6 text-sm text-[var(--text-tertiary)]">
            © 2026 Smart Contact Management System. Built with ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
