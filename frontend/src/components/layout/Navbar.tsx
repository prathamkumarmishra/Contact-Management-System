
import { cn } from '@/utils/cn';
import ThemeToggle from './ThemeToggle';
import NotificationPanel from './NotificationPanel';
import { Search, Bell, Menu, Sparkles, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import searchService from '@/services/searchService';
import type { Contact } from '@/types/contact';

interface NavbarProps {
  onMobileMenuOpen: () => void;
}

export default function Navbar({ onMobileMenuOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Contact[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Profile click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced C++ Trie Autocomplete prefix matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await searchService.autocomplete(searchQuery);
        setSuggestions(response.data || []);
        setFocusedIndex(-1);
      } catch (error) {
        console.error('Autocomplete query failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.CONTACTS}?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  // Keyboard navigation inside Trie autocomplete results dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1 < suggestions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        e.preventDefault();
        handleSuggestionClick(suggestions[focusedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
    setIsSearchFocused(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <header className={cn(
      'sticky top-0 z-30 h-16',
      'bg-[var(--bg-secondary)]/80 backdrop-blur-xl',
      'border-b border-[var(--border-color)]',
      'flex items-center justify-between px-4 lg:px-6 gap-3 sm:gap-4'
    )}>
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMobileMenuOpen}
          className={cn(
            'lg:hidden flex items-center justify-center w-10 h-10 rounded-xl',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-tertiary)] transition-colors'
          )}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar and suggestions container */}
        <div ref={searchContainerRef} className="relative flex-1 min-w-0 sm:max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className={cn(
              'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200',
              isSearchFocused ? 'text-primary-500' : 'text-[var(--text-tertiary)]'
            )} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search contacts... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full h-11 pl-11 pr-4 sm:pr-16 rounded-xl text-sm',
                'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
                'placeholder:text-[var(--text-tertiary)]',
                'border border-transparent',
                'transition-all duration-200',
                'focus:outline-none focus:border-primary-500/50 focus:bg-[var(--input-bg)]',
                'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
              )}
            />
            {isLoading ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <kbd className={cn(
                'hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2',
                'items-center gap-0.5 px-1.5 py-0.5 rounded-md',
                'text-[10px] font-medium text-[var(--text-tertiary)]',
                'bg-[var(--bg-secondary)] border border-[var(--border-color)] whitespace-nowrap'
              )}>
                Ctrl K
              </kbd>
            )}
          </form>

          {/* Autocomplete Suggestions Dropdown (Trie prefix matching) */}
          {isSearchFocused && searchQuery.trim() && (
            <div className={cn(
              'absolute left-0 right-0 mt-2 z-50 overflow-hidden',
              'rounded-2xl border border-[var(--border-color)] shadow-2xl',
              'bg-[var(--card-bg)]/95 backdrop-blur-xl animate-scale-in origin-top'
            )}>
              <div className="p-2 border-b border-[var(--border-color)] flex items-center justify-between gap-2 text-[11px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/50">
                <span className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
                  <span className="truncate">C++ TRIE AUTOCOMPLETE MATCHES</span>
                </span>
                <span className="hidden sm:inline shrink-0">↑↓ navigate</span>
              </div>
              
              <ul className="max-h-72 overflow-y-auto divide-y divide-[var(--border-color)]/30">
                {suggestions.length > 0 ? (
                  suggestions.map((contact, idx) => (
                    <li
                      key={contact.id}
                      onClick={() => handleSuggestionClick(contact.id)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 min-w-0',
                        focusedIndex === idx 
                          ? 'bg-primary-500/10 text-[var(--text-primary)] pl-5 border-l-2 border-primary-500' 
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      )}
                    >
                      {/* Photo Thumbnail */}
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-tertiary)]">
                        {contact.profilePhoto ? (
                          <img src={contact.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-semibold text-primary-500">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </span>
                        )}
                      </div>
                      
                      {/* Name & Company */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.company && (
                          <p className="flex items-center gap-1 min-w-0 text-xs text-[var(--text-tertiary)]">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{contact.company}</span>
                          </p>
                        )}
                      </div>
                      
                      {/* Category Pill */}
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize border shrink-0 max-w-[84px] truncate',
                        contact.category === 'work' && 'bg-primary-500/10 text-primary-500 border-primary-500/20',
                        contact.category === 'family' && 'bg-success-500/10 text-success-500 border-success-500/20',
                        contact.category === 'friend' && 'bg-warning-500/10 text-warning-500 border-warning-500/20',
                        contact.category === 'personal' && 'bg-accent-500/10 text-accent-500 border-accent-500/20',
                        contact.category === 'other' && 'bg-[var(--text-tertiary)]/10 text-[var(--text-secondary)] border-[var(--border-color)]'
                      )}>
                        {contact.category}
                      </span>
                    </li>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-[var(--text-tertiary)]">
                    No matching contacts found in Trie
                  </div>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <NotificationPanel />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              'flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-xl min-w-0 max-w-[180px]',
              'hover:bg-[var(--bg-tertiary)] transition-all duration-200'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-lg overflow-hidden border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-tertiary)] bg-cover bg-center text-primary-500 text-xs font-bold'
            )} style={user?.avatar ? { backgroundImage: `url(${user.avatar})` } : {}}>
              {!user?.avatar && `${user?.firstName[0] || 'U'}${user?.lastName[0] || ''}`}
            </div>
            <span className="hidden md:block text-sm font-medium text-[var(--text-primary)] truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </span>
          </button>

          {isProfileOpen && (
            <div className={cn(
              'absolute right-0 top-12 z-50 w-48',
              'rounded-xl border border-[var(--border-color)]',
              'bg-[var(--card-bg)] shadow-lg',
              'animate-scale-in origin-top-right'
            )}>
              <div className="p-3 border-b border-[var(--border-color)]">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { navigate(ROUTES.PROFILE); setIsProfileOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => { navigate(ROUTES.SETTINGS); setIsProfileOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={() => { logout(); setIsProfileOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-danger-500 hover:bg-danger-500/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
