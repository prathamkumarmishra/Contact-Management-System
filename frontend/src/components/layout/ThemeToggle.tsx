import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useState, useRef, useEffect } from 'react';

const themes = [
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'system' as const, icon: Monitor, label: 'System' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl',
          'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]',
          'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          'transition-all duration-200 focus-ring'
        )}
        aria-label={`Current theme: ${currentTheme.label}. Click to change.`}
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-12 z-50 min-w-[140px]',
            'rounded-xl border border-[var(--border-color)]',
            'bg-[var(--card-bg)] shadow-lg',
            'animate-scale-in origin-top-right'
          )}
        >
          {themes.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-2.5 text-sm min-w-0',
                'transition-colors duration-150',
                'first:rounded-t-xl last:rounded-b-xl',
                theme === value
                  ? 'text-primary-500 bg-primary-500/10 font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
