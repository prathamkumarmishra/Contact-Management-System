import { cn } from '@/utils/cn';
import { User, Mail, Shield, Calendar, Clock, Edit3, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import authService from '@/services/authService';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isLoading, setIsLoading] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'GU';

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Guest User';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEditStart = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setIsLoading(true);
    try {
      await authService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      toast.success('Profile updated successfully');
      await refreshProfile();
      setIsEditing(false);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setIsEditing(false);
  };

  const profileFields = [
    { icon: User, label: 'Full Name', value: fullName },
    { icon: Mail, label: 'Email', value: user?.email || 'user@example.com' },
    { icon: Shield, label: 'Role', value: (user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1) },
    { icon: Calendar, label: 'Member Since', value: formatDate(user?.createdAt) },
    { icon: Clock, label: 'Last Login', value: user?.lastLogin ? formatDate(user.lastLogin) : 'Current session' },
  ];

  return (
    <div className="page-container">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account information</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEditStart}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
              'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 border border-primary-500/20'
            )}
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className={cn(
        'rounded-2xl p-6 max-w-2xl',
        'bg-[var(--card-bg)] border border-[var(--card-border)]',
        'animate-fade-in-up'
      )}>
        {/* Avatar + Name Header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/20">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className={cn(
                      'flex-1 px-3 py-2 rounded-xl text-sm',
                      'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                      'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
                      'focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20'
                    )}
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className={cn(
                      'flex-1 px-3 py-2 rounded-xl text-sm',
                      'bg-[var(--bg-tertiary)] border border-[var(--border-color)]',
                      'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
                      'focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20'
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      'bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50'
                    )}
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{fullName}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{user?.email || 'user@example.com'}</p>
                <span className={cn(
                  'inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-medium',
                  'bg-primary-500/10 text-primary-500'
                )}>
                  {(user?.role || 'user').charAt(0).toUpperCase() + (user?.role || 'user').slice(1)}
                </span>
                {user?.isVerified && (
                  <span className={cn(
                    'inline-block mt-2 ml-2 px-3 py-0.5 rounded-full text-xs font-medium',
                    'bg-emerald-500/10 text-emerald-500'
                  )}>
                    ✓ Verified
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Profile Info Cards */}
        <div className="space-y-4">
          {profileFields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)]">
              <Icon className="w-5 h-5 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
