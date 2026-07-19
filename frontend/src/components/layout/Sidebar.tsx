import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import { useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Star,
  BarChart3,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  Download
} from 'lucide-react';
import ioService from '@/services/ioService';
import { toast } from 'sonner';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { path: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { path: ROUTES.CONTACTS, icon: Users, label: 'Contacts' },
  { path: ROUTES.ADD_CONTACT, icon: UserPlus, label: 'Add Contact' },
  { path: ROUTES.STATISTICS, icon: BarChart3, label: 'Statistics' },
  { path: ROUTES.SETTINGS, icon: Settings, label: 'Settings' },
  { path: ROUTES.ABOUT, icon: Info, label: 'About' },
];

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    const toastId = toast.loading('Importing contacts into C++ Engine...');
    try {
      const response = await ioService.importCSV(file);
      toast.success(`Import completed! Loaded ${response.data.importedCount} contacts into C++ store.`, { id: toastId });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Delay reload to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to import CSV file';
      toast.error(errMsg, { id: toastId });
    }
  };

  const handleExportClick = async () => {
    const toastId = toast.loading('Generating contacts CSV export...');
    try {
      await ioService.exportCSV();
      toast.success('CSV file downloaded successfully', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export contacts CSV', { id: toastId });
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col',
          'bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]',
          'transition-all duration-300 ease-in-out',
          // Desktop
          'lg:relative lg:translate-x-0',
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          // Mobile
          isMobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px]'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-[var(--border-color)]',
          isCollapsed ? 'justify-center' : 'gap-3'
        )}>
          <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in min-w-0">
              <h1 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                Smart<span className="gradient-text">Contacts</span>
              </h1>
              <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                Management System
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path ||
              (path === ROUTES.CONTACTS && location.pathname.startsWith('/contacts') && location.pathname !== ROUTES.ADD_CONTACT);

            return (
              <NavLink
                key={path}
                to={path}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl min-w-0',
                  'text-sm font-medium transition-all duration-200',
                  isCollapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-primary-500/10 text-primary-500 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
                )}
                title={isCollapsed ? label : undefined}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive && 'drop-shadow-sm')} />
                {!isCollapsed && <span className="truncate">{label}</span>}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-glow" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Hidden File Input for CSV Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />

        {/* CSV Import/Export Buttons */}
        <div className="px-3 pb-2 space-y-2">
          <button
            onClick={handleImportClick}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer',
              'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]',
              'border border-dashed border-[var(--border-color)]',
              isCollapsed ? 'justify-center px-0 border-none' : ''
            )}
            title={isCollapsed ? 'Import CSV' : undefined}
          >
            <Upload className="w-4.5 h-4.5 shrink-0 text-primary-500" />
            {!isCollapsed && <span className="truncate">Import CSV</span>}
          </button>
          
          <button
            onClick={handleExportClick}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer',
              'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]',
              'border border-dashed border-[var(--border-color)]',
              isCollapsed ? 'justify-center px-0 border-none' : ''
            )}
            title={isCollapsed ? 'Export CSV' : undefined}
          >
            <Download className="w-4.5 h-4.5 shrink-0 text-success-500" />
            {!isCollapsed && <span className="truncate">Export CSV</span>}
          </button>
        </div>

        {/* Favorites shortcut */}
        {!isCollapsed && (
          <div className="px-3 pb-3">
            <NavLink
              to={`${ROUTES.CONTACTS}?filter=favorites`}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl min-w-0',
                'text-sm font-medium transition-all duration-200',
                'text-[var(--text-secondary)] hover:bg-warning-500/10 hover:text-warning-500',
                'border border-dashed border-[var(--border-color)]'
              )}
            >
              <Star className="w-5 h-5 shrink-0 text-warning-500" />
              <span className="truncate">Favorites</span>
            </NavLink>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-center p-3 border-t border-[var(--border-color)]">
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
              'hover:bg-[var(--sidebar-hover)] transition-all duration-200'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
