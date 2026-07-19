import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import contactService from '@/services/contactService';
import type { Contact } from '@/types/contact';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  MapPin,
  Globe,
  Link2,
  Calendar,
  FileText,
  Star,
  Pencil,
  Trash2,
  ShieldAlert,
  ChevronRight,
  AlertTriangle,
  Clock,
  Hash,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

/* ============================
   Category color map
   ============================ */
const categoryStyles: Record<string, string> = {
  work: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  friend: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  family: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  personal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fetch contact
  useEffect(() => {
    const fetchContact = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await contactService.getContact(id);
        const data = response.data;
        const c = (data as any).contact || data;
        setContact(c);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Contact not found';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContact();
  }, [id]);

  /* ---- Actions ---- */
  const handleDelete = async () => {
    if (!contact || !id) return;
    try {
      await contactService.deleteContact(id);
      toast.success(`${contact.firstName} ${contact.lastName} moved to trash`, {
        action: {
          label: 'Undo (C++ Stack)',
          onClick: async () => {
            try {
              await contactService.undoDelete();
              toast.success('Contact restored successfully');
            } catch {
              toast.error('Failed to undo delete');
            }
          },
        },
        duration: 5000,
      });
      navigate(ROUTES.CONTACTS);
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!contact || !id) return;
    try {
      const response = await contactService.toggleFavorite(id);
      setContact(prev => prev ? { ...prev, isFavorite: response.data.isFavorite } : null);
      toast.success(`${contact.firstName} ${response.data.isFavorite ? 'added to' : 'removed from'} favorites`);
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

  const handleBlockToggle = async () => {
    if (!contact || !id) return;
    try {
      const response = await contactService.toggleBlock(id);
      setContact(prev => prev ? { ...prev, isBlocked: response.data.isBlocked } : null);
      toast.success(`${contact.firstName} ${response.data.isBlocked ? 'blocked' : 'unblocked'}`);
    } catch {
      toast.error('Failed to update block status');
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /* ---- Loading Skeleton ---- */
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-4 w-48 mb-6 rounded-lg" />
        <div className="max-w-4xl">
          <div className="skeleton h-52 rounded-2xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="skeleton h-44 rounded-2xl" />
            <div className="skeleton h-44 rounded-2xl" />
            <div className="skeleton h-36 rounded-2xl" />
            <div className="skeleton h-36 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  /* ---- Error / Not Found ---- */
  if (error || !contact) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-danger-500" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Contact Not Found</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm">
            {error || 'This contact does not exist or has been deleted.'}
          </p>
          <Link
            to={ROUTES.CONTACTS}
            className={cn(
              'inline-flex max-w-full items-center gap-2 px-6 py-2.5 rounded-xl',
              'text-sm font-bold text-white gradient-primary hover:opacity-90',
              'transition-all duration-200 cursor-pointer'
            )}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">Back to Contacts</span>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${contact.firstName} ${contact.lastName}`;
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-6 animate-fade-in min-w-0">
        <Link to={ROUTES.CONTACTS} className="hover:text-primary-500 transition-colors shrink-0">
          Contacts
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-[var(--text-primary)] font-medium truncate">{fullName}</span>
      </nav>

      <div className="max-w-4xl">
        {/* ─── Hero Card ─── */}
        <div className={cn(
          'rounded-2xl overflow-hidden mb-6',
          'bg-[var(--card-bg)] border border-[var(--card-border)]',
          'animate-fade-in-up stagger-1'
        )}>
          {/* Gradient banner */}
          <div className="h-24 gradient-accent relative">
            <div className="absolute inset-0 gradient-mesh opacity-50" />
          </div>

          {/* Profile section */}
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Avatar */}
              <div className={cn(
                'w-24 h-24 rounded-2xl border-4 border-[var(--card-bg)] flex items-center justify-center shrink-0 overflow-hidden',
                'shadow-lg',
                contact.profilePhoto ? '' : 'gradient-primary'
              )}>
                {contact.profilePhoto ? (
                  <img src={contact.profilePhoto} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{initials}</span>
                )}
              </div>

              {/* Name + badges */}
              <div className="flex-1 pt-14 sm:pt-2 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">{fullName}</h1>
                      {contact.isFavorite && (
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      )}
                      {contact.isBlocked && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-danger-500/10 text-danger-500 border border-danger-500/20 shrink-0">
                          Blocked
                        </span>
                      )}
                    </div>
                    {contact.designation && contact.company && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">
                        {contact.designation} at {contact.company}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={cn(
                        'px-3 py-1 rounded-lg text-xs font-bold capitalize border',
                        categoryStyles[contact.category] || categoryStyles.other
                      )}>
                        {contact.category}
                      </span>
                      {contact.tags?.map(tag => (
                        <span
                          key={tag}
                          className="max-w-[140px] truncate px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-primary-500/8 text-primary-400 border border-primary-500/15"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={handleFavoriteToggle}
                      className={cn(
                        'p-2.5 rounded-xl border transition-all cursor-pointer',
                        contact.isFavorite
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-transparent hover:text-amber-500'
                      )}
                      title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={cn('w-4 h-4', contact.isFavorite && 'fill-amber-500')} />
                    </button>
                    <button
                      onClick={handleBlockToggle}
                      className={cn(
                        'p-2.5 rounded-xl border transition-all cursor-pointer',
                        contact.isBlocked
                          ? 'bg-danger-500/10 text-danger-500 border-danger-500/20'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-transparent hover:text-danger-500'
                      )}
                      title={contact.isBlocked ? 'Unblock' : 'Block'}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/contacts/${id}/edit`}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
                        'text-xs font-bold text-white',
                        'gradient-primary hover:opacity-90',
                        'shadow-md shadow-primary-500/20',
                        'transition-all duration-200 cursor-pointer'
                      )}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className={cn(
                        'p-2.5 rounded-xl border transition-all cursor-pointer',
                        'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-transparent',
                        'hover:bg-danger-500/10 hover:text-danger-500 hover:border-danger-500/20'
                      )}
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Info Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Info */}
          <InfoCard
            icon={<Phone className="w-4 h-4" />}
            title="Contact Info"
            stagger={2}
          >
            <InfoRow
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={contact.phone}
              copyable
              onCopy={() => copyToClipboard(contact.phone, 'phone')}
              copied={copiedField === 'phone'}
              href={`tel:${contact.phone}`}
            />
            {contact.alternativePhone && (
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Alt Phone"
                value={contact.alternativePhone}
                copyable
                onCopy={() => copyToClipboard(contact.alternativePhone!, 'altPhone')}
                copied={copiedField === 'altPhone'}
                href={`tel:${contact.alternativePhone}`}
              />
            )}
            {contact.email && (
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={contact.email}
                copyable
                onCopy={() => copyToClipboard(contact.email!, 'email')}
                copied={copiedField === 'email'}
                href={`mailto:${contact.email}`}
              />
            )}
            {contact.birthday && (
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Birthday"
                value={new Date(contact.birthday).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
            )}
          </InfoCard>

          {/* Work Info */}
          {(contact.company || contact.designation || contact.department) && (
            <InfoCard
              icon={<Briefcase className="w-4 h-4" />}
              title="Work Info"
              stagger={3}
            >
              {contact.company && (
                <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company" value={contact.company} />
              )}
              {contact.designation && (
                <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Designation" value={contact.designation} />
              )}
              {contact.department && (
                <InfoRow icon={<User className="w-4 h-4" />} label="Department" value={contact.department} />
              )}
            </InfoCard>
          )}

          {/* Address */}
          {(contact.address || contact.city || contact.state || contact.country) && (
            <InfoCard
              icon={<MapPin className="w-4 h-4" />}
              title="Address"
              stagger={4}
            >
              {contact.address && (
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Street" value={contact.address} />
              )}
              {(contact.city || contact.state) && (
                <InfoRow
                  icon={<MapPin className="w-4 h-4" />}
                  label="City / State"
                  value={[contact.city, contact.state].filter(Boolean).join(', ')}
                />
              )}
              {contact.country && (
                <InfoRow icon={<Globe className="w-4 h-4" />} label="Country" value={contact.country} />
              )}
              {contact.zipCode && (
                <InfoRow icon={<Hash className="w-4 h-4" />} label="ZIP Code" value={contact.zipCode} />
              )}
            </InfoCard>
          )}

          {/* Social & Web */}
          {(contact.website || contact.linkedin) && (
            <InfoCard
              icon={<Globe className="w-4 h-4" />}
              title="Social & Web"
              stagger={5}
            >
              {contact.website && (
                <InfoRow
                  icon={<Globe className="w-4 h-4" />}
                  label="Website"
                  value={contact.website}
                  href={contact.website}
                  external
                />
              )}
              {contact.linkedin && (
                <InfoRow
                  icon={<Link2 className="w-4 h-4" />}
                  label="LinkedIn"
                  value={contact.linkedin}
                  href={contact.linkedin}
                  external
                />
              )}
            </InfoCard>
          )}

          {/* Notes */}
          {contact.notes && (
            <InfoCard
              icon={<FileText className="w-4 h-4" />}
              title="Notes"
              stagger={6}
              fullWidth
            >
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {contact.notes}
              </p>
            </InfoCard>
          )}
        </div>

        {/* ─── Metadata Footer ─── */}
        <div className={cn(
          'mt-6 rounded-2xl p-5',
          'bg-[var(--card-bg)] border border-[var(--card-border)]',
          'animate-fade-in-up stagger-7'
        )}>
          <div className="flex flex-wrap gap-6">
            <MetaStat icon={<Clock className="w-3.5 h-3.5" />} label="Created" value={formatDate(contact.createdAt)} />
            <MetaStat icon={<Clock className="w-3.5 h-3.5" />} label="Updated" value={formatDate(contact.updatedAt)} />
            {contact.lastContacted && (
              <MetaStat icon={<Phone className="w-3.5 h-3.5" />} label="Last Contacted" value={formatDate(contact.lastContacted)} />
            )}
            <MetaStat icon={<Hash className="w-3.5 h-3.5" />} label="Interactions" value={String(contact.contactCount || 0)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Sub-components
   ============================================ */

/* ---- Info Card ---- */
function InfoCard({ icon, title, stagger, fullWidth, children }: {
  icon: React.ReactNode;
  title: string;
  stagger: number;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      'rounded-2xl p-5',
      'bg-[var(--card-bg)] border border-[var(--card-border)]',
      'animate-fade-in-up',
      `stagger-${stagger}`,
      fullWidth && 'md:col-span-2'
    )}>
      <div className="flex items-center gap-2.5 mb-4 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/* ---- Info Row ---- */
function InfoRow({ icon, label, value, copyable, onCopy, copied, href, external }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 group min-w-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-[var(--text-tertiary)] shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] truncate">{label}</p>
          {href ? (
            <a
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="text-sm text-primary-500 hover:underline flex items-center gap-1 truncate"
            >
              <span className="truncate">{value}</span>
              {external && <ExternalLink className="w-3 h-3 shrink-0" />}
            </a>
          ) : (
            <p className="text-sm text-[var(--text-primary)] truncate">{value}</p>
          )}
        </div>
      </div>
      {copyable && onCopy && (
        <button
          onClick={onCopy}
          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-primary-500 hover:bg-primary-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
          title="Copy"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

/* ---- Meta Stat ---- */
function MetaStat({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[var(--text-tertiary)]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] truncate">{label}</p>
        <p className="text-xs font-medium text-[var(--text-secondary)] truncate">{value}</p>
      </div>
    </div>
  );
}

/* ---- Date formatter ---- */
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
