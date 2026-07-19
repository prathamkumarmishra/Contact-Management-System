import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  UserPlus, 
  Pencil, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Cake, 
  CheckCheck, 
  X, 
  FileDown, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import notificationService from '@/services/notificationService';
import type { Notification } from '@/types/notification';
import { toast } from 'sonner';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch initial values & poll for unread count
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll unread count every 30s
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch full notifications list when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications(1, 20);
      if (response.success) {
        setNotifications(response.data.notifications);
        // Sync unread count with current loaded items
        const count = response.data.notifications.filter(n => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        const deletedItem = notifications.find(n => n._id === id);
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (deletedItem && !deletedItem.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    setIsOpen(false);
    
    // Redirect if there is a reference ID
    if (notification.referenceId) {
      // Soft deletion redirects are direct to trash, update/creation to detail page
      if (notification.type === 'contact_deleted') {
        navigate('/trash');
      } else {
        navigate(`/contacts/${notification.referenceId}`);
      }
    }
  };

  // Helper for type-based icon styling
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contact_created':
        return {
          icon: UserPlus,
          bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        };
      case 'contact_updated':
        return {
          icon: Pencil,
          bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
      case 'contact_deleted':
        return {
          icon: Trash2,
          bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        };
      case 'contact_restored':
        return {
          icon: RotateCcw,
          bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
        };
      case 'import_complete':
        return {
          icon: FileDown,
          bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
        };
      case 'duplicate_detected':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        };
      case 'birthday_reminder':
        return {
          icon: Cake,
          bg: 'bg-pink-500/10 text-pink-500 border-pink-500/20'
        };
      default:
        return {
          icon: Sparkles,
          bg: 'bg-primary-500/10 text-primary-500 border-primary-500/20'
        };
    }
  };

  // Simple relative time helper
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center justify-center w-10 h-10 rounded-xl',
          'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]',
          'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          'transition-all duration-200 outline-none',
          isOpen && 'bg-[var(--border-color)] text-[var(--text-primary)]'
        )}
        aria-label="Notifications"
      >
        <Bell className={cn('w-5 h-5', isOpen && 'animate-wiggle')} />
        {unreadCount > 0 && (
          <span className={cn(
            'absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
            'bg-rose-500 text-white shadow-sm ring-2 ring-[var(--bg-secondary)]'
          )}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={cn(
          'absolute right-0 mt-2 z-50 w-80 sm:w-96 overflow-hidden',
          'rounded-2xl border border-[var(--border-color)] shadow-2xl',
          'bg-[var(--card-bg)]/95 backdrop-blur-xl animate-scale-in origin-top-right'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-primary)]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors font-medium outline-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--border-color)]/30">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--text-tertiary)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-3" />
                <span className="text-sm">Loading notifications...</span>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => {
                const config = getNotificationIcon(item.type);
                const IconComponent = config.icon;
                return (
                  <div
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    className={cn(
                      'group relative flex gap-3 p-4 cursor-pointer transition-all duration-150',
                      !item.isRead 
                        ? 'bg-primary-500/[0.03] hover:bg-primary-500/[0.07]' 
                        : 'hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    {/* Unread marker bar */}
                    {!item.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-500" />
                    )}

                    {/* Icon */}
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center border shrink-0',
                      config.bg
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-baseline justify-between gap-1.5 mb-0.5">
                        <span className={cn(
                          'text-sm truncate',
                          !item.isRead ? 'font-semibold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'
                        )}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 font-medium">
                          {getRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {/* Action buttons (Appear on hover) */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-[var(--card-bg)] pl-6 py-2">
                      {!item.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(item._id, e)}
                          title="Mark as read"
                          className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-primary-500 hover:bg-[var(--bg-tertiary)] transition-all outline-none"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(item._id, e)}
                        title="Delete notification"
                        className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-[var(--bg-tertiary)] transition-all outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-tertiary)] mb-3 border border-[var(--border-color)]">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <span className="text-sm font-semibold text-[var(--text-secondary)] mb-1">No notifications</span>
                <p className="text-xs text-[var(--text-tertiary)] max-w-[200px]">
                  When contacts are added, modified or deleted, updates will show here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
