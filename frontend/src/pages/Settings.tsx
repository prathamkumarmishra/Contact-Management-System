import { cn } from '@/utils/cn';
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  ChevronDown,
  ChevronUp,
  Lock,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import authService from '@/services/authService';
import contactService from '@/services/contactService';
import ioService from '@/services/ioService';

type SettingsSection = 'appearance' | 'notifications' | 'privacy' | 'language' | 'data' | null;

// Notification prefs stored in localStorage
interface NotificationPrefs {
  emailOnNewContact: boolean;
  browserSounds: boolean;
  desktopAlerts: boolean;
}

// Language prefs stored in localStorage
interface LanguagePrefs {
  language: string;
  timezone: string;
  dateFormat: string;
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  emailOnNewContact: true,
  browserSounds: true,
  desktopAlerts: false,
};

const DEFAULT_LANGUAGE: LanguagePrefs = {
  language: 'en',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'ja', label: 'Japanese (日本語)' },
  { value: 'zh', label: 'Chinese (中文)' },
];

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'IST (UTC+5:30)' },
  { value: 'America/New_York', label: 'EST (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'PST (UTC-8)' },
  { value: 'Europe/London', label: 'GMT (UTC+0)' },
  { value: 'Europe/Berlin', label: 'CET (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'JST (UTC+9)' },
  { value: 'Australia/Sydney', label: 'AEST (UTC+10)' },
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
];

function loadPrefs<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [expandedSection, setExpandedSection] = useState<SettingsSection>('appearance');

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() =>
    loadPrefs('settings_notifications', DEFAULT_NOTIFICATIONS)
  );

  // Language prefs
  const [langPrefs, setLangPrefs] = useState<LanguagePrefs>(() =>
    loadPrefs('settings_language', DEFAULT_LANGUAGE)
  );

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changePwLoading, setChangePwLoading] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Data management
  const [clearAllLoading, setClearAllLoading] = useState(false);
  const [clearTrashLoading, setClearTrashLoading] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist notification prefs
  useEffect(() => {
    localStorage.setItem('settings_notifications', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  // Persist language prefs
  useEffect(() => {
    localStorage.setItem('settings_language', JSON.stringify(langPrefs));
  }, [langPrefs]);

  const toggleSection = (section: SettingsSection) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const updateNotif = (key: keyof NotificationPrefs) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preference updated');
  };

  const updateLang = (key: keyof LanguagePrefs, value: string) => {
    setLangPrefs(prev => ({ ...prev, [key]: value }));
    toast.success('Preference saved');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangePwLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully! Please login again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Logout after password change
      setTimeout(() => { logout(); }, 1500);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setChangePwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }
    setDeleteLoading(true);
    try {
      await authService.deleteAccount(deletePassword);
      toast.success('Account deleted. Redirecting...');
      localStorage.removeItem('accessToken');
      setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to delete account';
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = async () => {
    const toastId = toast.loading('Exporting contacts as CSV...');
    try {
      await ioService.exportCSV();
      toast.success('CSV downloaded successfully', { id: toastId });
    } catch {
      toast.error('Failed to export CSV', { id: toastId });
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    const toastId = toast.loading('Importing contacts...');
    try {
      const result = await ioService.importCSV(file);
      toast.success(`Imported ${result.data.importedCount} contacts`, { id: toastId });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import failed', { id: toastId });
    }
  };

  const handleClearAll = async () => {
    setClearAllLoading(true);
    try {
      const result = await contactService.clearAll();
      toast.success(`Deleted ${result.data.deletedCount} contacts permanently`);
      setShowClearAllConfirm(false);
    } catch {
      toast.error('Failed to clear contacts');
    } finally {
      setClearAllLoading(false);
    }
  };

  const handleClearTrash = async () => {
    setClearTrashLoading(true);
    try {
      const result = await contactService.clearTrash();
      toast.success(`Removed ${result.data.deletedCount} contacts from trash`);
    } catch {
      toast.error('Failed to clear trash');
    } finally {
      setClearTrashLoading(false);
    }
  };

  // Toggle switch component
  const Toggle = ({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <button
        onClick={onToggle}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
          enabled ? 'bg-primary-500' : 'bg-[var(--bg-tertiary)] border border-[var(--border-color)]'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );

  // Section header component
  const SectionHeader = ({
    icon: Icon,
    title,
    desc,
    section,
    iconColor = 'text-[var(--text-tertiary)]',
    index
  }: {
    icon: typeof Bell;
    title: string;
    desc: string;
    section: SettingsSection;
    iconColor?: string;
    index: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className={cn(
        'w-full rounded-2xl p-5 text-left',
        'bg-[var(--card-bg)] border border-[var(--card-border)]',
        'hover:border-primary-500/20 transition-all cursor-pointer',
        expandedSection === section && 'border-primary-500/30 shadow-md shadow-primary-500/5',
        'animate-fade-in-up',
        `stagger-${index}`
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={cn('w-5 h-5', iconColor)} />
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
            <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
          </div>
        </div>
        {expandedSection === section
          ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
          : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
        }
      </div>
    </button>
  );

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Configure your preferences</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* ═══════════ APPEARANCE ═══════════ */}
        <div className={cn(
          'rounded-2xl p-5',
          'bg-[var(--card-bg)] border border-[var(--card-border)]',
          expandedSection === 'appearance' && 'border-primary-500/30 shadow-md shadow-primary-500/5',
          'animate-fade-in-up stagger-1'
        )}>
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary-500" />
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">Appearance</h2>
                <p className="text-xs text-[var(--text-secondary)]">Customize look and feel</p>
              </div>
            </div>
            {expandedSection === 'appearance'
              ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
              : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
            }
          </button>
          {expandedSection === 'appearance' && (
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] animate-fade-in-up">
              <p className="text-xs text-[var(--text-tertiary)] mb-3">Choose your preferred theme</p>
              <div className="flex gap-3">
                {(['light', 'dark', 'system'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all',
                      theme === t
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ NOTIFICATIONS ═══════════ */}
        <SectionHeader
          icon={Bell}
          title="Notifications"
          desc="Configure notification preferences"
          section="notifications"
          iconColor="text-amber-500"
          index={2}
        />
        {expandedSection === 'notifications' && (
          <div className={cn(
            'rounded-2xl p-5 -mt-2',
            'bg-[var(--card-bg)] border border-[var(--card-border)]',
            'animate-fade-in-up'
          )}>
            <Toggle
              enabled={notifPrefs.emailOnNewContact}
              onToggle={() => updateNotif('emailOnNewContact')}
              label="Email on new contact added"
            />
            <div className="border-t border-[var(--border-color)]" />
            <Toggle
              enabled={notifPrefs.browserSounds}
              onToggle={() => updateNotif('browserSounds')}
              label="Browser notification sounds"
            />
            <div className="border-t border-[var(--border-color)]" />
            <Toggle
              enabled={notifPrefs.desktopAlerts}
              onToggle={() => updateNotif('desktopAlerts')}
              label="Desktop notification alerts"
            />
          </div>
        )}

        {/* ═══════════ PRIVACY & SECURITY ═══════════ */}
        <SectionHeader
          icon={Shield}
          title="Privacy & Security"
          desc="Manage your security settings"
          section="privacy"
          iconColor="text-emerald-500"
          index={3}
        />
        {expandedSection === 'privacy' && (
          <div className={cn(
            'rounded-2xl p-5 -mt-2 space-y-5',
            'bg-[var(--card-bg)] border border-[var(--card-border)]',
            'animate-fade-in-up'
          )}>
            {/* Change Password */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-primary-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Change Password</h3>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-sm',
                      'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                      'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
                      'focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20'
                    )}
                  />
                  <button
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-sm',
                      'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                      'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
                      'focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20'
                    )}
                  />
                  <button
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl text-sm',
                    'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                    'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
                    'focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20'
                  )}
                />
                <button
                  onClick={handleChangePassword}
                  disabled={changePwLoading}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50'
                  )}
                >
                  {changePwLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Change Password
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)]" />

            {/* Delete Account */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-semibold text-red-500">Danger Zone</h3>
              </div>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    'bg-red-500/10 text-red-500 border border-red-500/20',
                    'hover:bg-red-500/20'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </button>
              ) : (
                <div className={cn(
                  'p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3'
                )}>
                  <p className="text-sm text-red-500 font-medium">
                    ⚠️ This will permanently delete your account and ALL your contacts. This action cannot be undone.
                  </p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl text-sm',
                      'bg-[var(--bg-tertiary)] border border-red-500/30',
                      'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
                      'focus:outline-none focus:border-red-500/50'
                    )}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                        'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
                      )}
                    >
                      {deleteLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                        'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ LANGUAGE & REGION ═══════════ */}
        <SectionHeader
          icon={Globe}
          title="Language & Region"
          desc="Set language and timezone"
          section="language"
          iconColor="text-blue-500"
          index={4}
        />
        {expandedSection === 'language' && (
          <div className={cn(
            'rounded-2xl p-5 -mt-2 space-y-4',
            'bg-[var(--card-bg)] border border-[var(--card-border)]',
            'animate-fade-in-up'
          )}>
            {/* Language */}
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1.5 font-medium">Language</label>
              <select
                value={langPrefs.language}
                onChange={(e) => updateLang('language', e.target.value)}
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl text-sm',
                  'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                  'text-[var(--text-primary)]',
                  'focus:outline-none focus:border-primary-500/50'
                )}
              >
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1.5 font-medium">Timezone</label>
              <select
                value={langPrefs.timezone}
                onChange={(e) => updateLang('timezone', e.target.value)}
                className={cn(
                  'w-full px-4 py-2.5 rounded-xl text-sm',
                  'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                  'text-[var(--text-primary)]',
                  'focus:outline-none focus:border-primary-500/50'
                )}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            {/* Date Format */}
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1.5 font-medium">Date Format</label>
              <div className="flex gap-2 flex-wrap">
                {DATE_FORMATS.map(df => (
                  <button
                    key={df.value}
                    onClick={() => updateLang('dateFormat', df.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-xs font-medium transition-all',
                      langPrefs.dateFormat === df.value
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                    )}
                  >
                    {df.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ DATA MANAGEMENT ═══════════ */}
        <SectionHeader
          icon={Database}
          title="Data Management"
          desc="Export, import, or delete your data"
          section="data"
          iconColor="text-violet-500"
          index={5}
        />
        {expandedSection === 'data' && (
          <div className={cn(
            'rounded-2xl p-5 -mt-2 space-y-4',
            'bg-[var(--card-bg)] border border-[var(--card-border)]',
            'animate-fade-in-up'
          )}>
            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all',
                'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                'hover:border-primary-500/30 hover:shadow-sm'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Export Contacts as CSV</p>
                <p className="text-xs text-[var(--text-tertiary)]">Download all contacts in CSV format</p>
              </div>
            </button>

            {/* Import CSV */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportCSV}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all',
                'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                'hover:border-primary-500/30 hover:shadow-sm'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Import Contacts from CSV</p>
                <p className="text-xs text-[var(--text-tertiary)]">Upload a CSV file to bulk import contacts</p>
              </div>
            </button>

            <div className="border-t border-[var(--border-color)]" />

            {/* Clear Trash */}
            <button
              onClick={handleClearTrash}
              disabled={clearTrashLoading}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all',
                'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                'hover:border-amber-500/30 hover:shadow-sm disabled:opacity-50'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                {clearTrashLoading
                  ? <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  : <Trash2 className="w-5 h-5 text-amber-500" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Clear Trash</p>
                <p className="text-xs text-[var(--text-tertiary)]">Permanently delete all contacts in trash</p>
              </div>
            </button>

            {/* Clear All Contacts */}
            {!showClearAllConfirm ? (
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all',
                  'bg-red-500/5 border border-red-500/20',
                  'hover:bg-red-500/10'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-500">Delete All Contacts</p>
                  <p className="text-xs text-red-400/70">Permanently remove every contact from your account</p>
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                <p className="text-sm text-red-500 font-medium">
                  ⚠️ This will permanently delete ALL your contacts. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    disabled={clearAllLoading}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                      'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
                    )}
                  >
                    {clearAllLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Yes, Delete All
                  </button>
                  <button
                    onClick={() => setShowClearAllConfirm(false)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                      'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
