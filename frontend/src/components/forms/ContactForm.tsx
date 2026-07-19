import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/utils/cn';
import type { Contact, ContactFormData } from '@/types/contact';
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
  Tag,
  Star,
  Upload,
  X,
  Plus,
  Camera,
  ChevronDown,
  Loader2
} from 'lucide-react';

/* ============================
   Props
   ============================ */
interface ContactFormProps {
  mode: 'create' | 'edit';
  initialData?: Contact;
  onSubmit: (data: ContactFormData) => Promise<void>;
  isSubmitting?: boolean;
}

/* ============================
   Category definitions
   ============================ */
const CATEGORIES = [
  { value: 'personal', label: 'Personal', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  { value: 'work', label: 'Work', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
  { value: 'family', label: 'Family', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  { value: 'friend', label: 'Friend', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  { value: 'other', label: 'Other', color: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
] as const;

/* ============================
   Component
   ============================ */
export default function ContactForm({ mode, initialData, onSubmit, isSubmitting = false }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ContactFormData>({
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phone: initialData?.phone || '',
      alternativePhone: initialData?.alternativePhone || '',
      email: initialData?.email || '',
      company: initialData?.company || '',
      designation: initialData?.designation || '',
      department: initialData?.department || '',
      category: initialData?.category || 'personal',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || '',
      zipCode: initialData?.zipCode || '',
      website: initialData?.website || '',
      linkedin: initialData?.linkedin || '',
      birthday: initialData?.birthday ? initialData.birthday.split('T')[0] : '',
      notes: initialData?.notes || '',
      tags: initialData?.tags || [],
      isFavorite: initialData?.isFavorite || false,
    },
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialData?.profilePhoto || null
  );
  const [tagInput, setTagInput] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    work: true,
    address: false,
    social: false,
    notes: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const watchedCategory = watch('category');
  const watchedTags = watch('tags') || [];
  const watchedFavorite = watch('isFavorite');

  /* ---- Photo handlers ---- */
  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setValue('profilePhoto', file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [setValue]);

  const removePhoto = useCallback(() => {
    setPhotoPreview(null);
    setValue('profilePhoto', undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [setValue]);

  /* ---- Tag handlers ---- */
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || watchedTags.includes(tag)) {
      setTagInput('');
      return;
    }
    setValue('tags', [...watchedTags, tag]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  /* ---- Section toggle ---- */
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  /* ---- Submit ---- */
  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  /* ---- Shared input styles ---- */
  const inputCls = cn(
    'w-full min-w-0 px-4 py-3 rounded-xl text-sm',
    'bg-[var(--input-bg)] text-[var(--text-primary)]',
    'placeholder:text-[var(--text-tertiary)]',
    'border border-[var(--input-border)]',
    'focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10',
    'focus:outline-none transition-all duration-200'
  );

  const labelCls = 'text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5 min-w-0';

  const errorCls = 'text-[11px] text-danger-500 mt-1';

  /* ======== Render ======== */
  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* ─── Profile Photo + Category + Favorite ─── */}
      <div className={cn(
        'rounded-2xl p-6',
        'bg-[var(--card-bg)] border border-[var(--card-border)]',
        'animate-fade-in-up stagger-1'
      )}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative w-24 h-24 rounded-2xl overflow-hidden group cursor-pointer',
                'border-2 border-dashed border-[var(--border-color)]',
                'hover:border-primary-500/50 transition-all duration-300',
                'flex items-center justify-center bg-[var(--bg-tertiary)]'
              )}
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Upload className="w-6 h-6 text-[var(--text-tertiary)] mx-auto mb-1" />
                  <span className="text-[10px] text-[var(--text-tertiary)]">Upload</span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            {photoPreview && (
              <button
                type="button"
                onClick={removePhoto}
                className="text-[10px] text-danger-500 hover:underline cursor-pointer"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Category + Favorite */}
          <div className="flex-1 w-full space-y-4">
            {/* Category Pills */}
            <div>
              <span className={labelCls}>Category</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setValue('category', cat.value as ContactFormData['category'])}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer',
                      watchedCategory === cat.value
                        ? `${cat.color} ring-2 ring-offset-1 ring-offset-[var(--card-bg)]`
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-secondary)]'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Toggle */}
            <button
              type="button"
              onClick={() => setValue('isFavorite', !watchedFavorite)}
              className={cn(
                'inline-flex max-w-full items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer',
                watchedFavorite
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-secondary)]'
              )}
            >
              <Star className={cn('w-4 h-4 shrink-0', watchedFavorite && 'fill-amber-500')} />
              <span className="truncate">{watchedFavorite ? 'Starred as Favorite' : 'Add to Favorites'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Section: Personal Info ─── */}
      <SectionCard
        icon={<User className="w-4 h-4" />}
        title="Personal Information"
        subtitle="Name, phone, and email"
        expanded={expandedSections.personal}
        onToggle={() => toggleSection('personal')}
        stagger={2}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className={labelCls}>First Name *</label>
            <input
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
                maxLength: { value: 50, message: 'Max 50 characters' }
              })}
              placeholder="John"
              className={inputCls}
            />
            {errors.firstName && <p className={errorCls}>{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className={labelCls}>Last Name *</label>
            <input
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
                maxLength: { value: 50, message: 'Max 50 characters' }
              })}
              placeholder="Doe"
              className={inputCls}
            />
            {errors.lastName && <p className={errorCls}>{errors.lastName.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>
              <Phone className="w-3 h-3 shrink-0" />
              Phone Number *
            </label>
            <input
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[\d+\-() ]{7,20}$/,
                  message: 'Enter a valid phone number'
                }
              })}
              placeholder="+1 (555) 000-0000"
              className={inputCls}
            />
            {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
          </div>

          {/* Alt Phone */}
          <div>
            <label className={labelCls}>
              <Phone className="w-3 h-3 shrink-0" />
              Alternative Phone
            </label>
            <input
              {...register('alternativePhone')}
              placeholder="+1 (555) 111-1111"
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label className={labelCls}>
              <Mail className="w-3 h-3 shrink-0" />
              Email Address
            </label>
            <input
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address'
                }
              })}
              placeholder="john.doe@example.com"
              className={inputCls}
            />
            {errors.email && <p className={errorCls}>{errors.email.message}</p>}
          </div>

          {/* Birthday */}
          <div>
            <label className={labelCls}>
              <Calendar className="w-3 h-3 shrink-0" />
              Birthday
            </label>
            <input
              type="date"
              {...register('birthday')}
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>

      {/* ─── Section: Work Info ─── */}
      <SectionCard
        icon={<Briefcase className="w-4 h-4" />}
        title="Work Information"
        subtitle="Company, role, and department"
        expanded={expandedSections.work}
        onToggle={() => toggleSection('work')}
        stagger={3}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              <Building2 className="w-3 h-3 shrink-0" />
              Company
            </label>
            <input
              {...register('company')}
              placeholder="Acme Inc."
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Designation / Title</label>
            <input
              {...register('designation')}
              placeholder="Software Engineer"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <input
              {...register('department')}
              placeholder="Engineering"
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>

      {/* ─── Section: Address ─── */}
      <SectionCard
        icon={<MapPin className="w-4 h-4" />}
        title="Address"
        subtitle="Street, city, state, and country"
        expanded={expandedSections.address}
        onToggle={() => toggleSection('address')}
        stagger={4}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Street Address</label>
            <input
              {...register('address')}
              placeholder="123 Main Street, Apt 4B"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input {...register('city')} placeholder="New York" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>State / Province</label>
            <input {...register('state')} placeholder="NY" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input {...register('country')} placeholder="United States" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ZIP / Postal Code</label>
            <input {...register('zipCode')} placeholder="10001" className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {/* ─── Section: Social & Web ─── */}
      <SectionCard
        icon={<Globe className="w-4 h-4" />}
        title="Social & Web"
        subtitle="Website and LinkedIn profile"
        expanded={expandedSections.social}
        onToggle={() => toggleSection('social')}
        stagger={5}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              <Globe className="w-3 h-3 shrink-0" />
              Website
            </label>
            <input
              {...register('website')}
              placeholder="https://example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              <Link2 className="w-3 h-3 shrink-0" />
              LinkedIn
            </label>
            <input
              {...register('linkedin')}
              placeholder="https://linkedin.com/in/johndoe"
              className={inputCls}
            />
          </div>
        </div>
      </SectionCard>

      {/* ─── Section: Tags & Notes ─── */}
      <SectionCard
        icon={<FileText className="w-4 h-4" />}
        title="Tags & Notes"
        subtitle="Organize with tags and personal notes"
        expanded={expandedSections.notes}
        onToggle={() => toggleSection('notes')}
        stagger={6}
      >
        <div className="space-y-4">
          {/* Tags */}
          <div>
            <label className={labelCls}>
              <Tag className="w-3 h-3 shrink-0" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {watchedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex max-w-full items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-primary-500/10 text-primary-500 border border-primary-500/20"
                >
                  <span className="truncate">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-danger-500 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
                className={cn(inputCls, 'flex-1')}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className={cn(
                  'px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0',
                  'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>
              <FileText className="w-3 h-3 shrink-0" />
              Notes
            </label>
            <textarea
              {...register('notes', {
                maxLength: { value: 500, message: 'Max 500 characters' }
              })}
              rows={4}
              placeholder="Add personal notes about this contact..."
              className={cn(inputCls, 'resize-none')}
            />
            {errors.notes && <p className={errorCls}>{errors.notes.message}</p>}
          </div>
        </div>
      </SectionCard>

      {/* ─── Submit Button ─── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'inline-flex min-w-0 items-center justify-center gap-2.5 px-8 py-3 rounded-xl',
            'text-sm font-bold text-white',
            'gradient-primary hover:opacity-90',
            'shadow-lg shadow-primary-500/25',
            'transition-all duration-200 hover:-translate-y-0.5',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
            'cursor-pointer'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span className="truncate">{mode === 'create' ? 'Creating...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              {mode === 'create' ? (
                <>
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="truncate">Create Contact</span>
                </>
              ) : (
                <span className="truncate">Save Changes</span>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ============================================
   Collapsible Section Card sub-component
   ============================================ */
interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
  stagger: number;
  children: React.ReactNode;
}

function SectionCard({ icon, title, subtitle, expanded, onToggle, stagger, children }: SectionCardProps) {
  return (
    <div className={cn(
      'rounded-2xl overflow-hidden',
      'bg-[var(--card-bg)] border border-[var(--card-border)]',
      'animate-fade-in-up',
      `stagger-${stagger}`
    )}>
      {/* Header (clickable) */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-6 py-4',
          'hover:bg-[var(--bg-tertiary)]/50 transition-colors cursor-pointer',
          'text-left'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{title}</h3>
            <p className="text-[11px] text-[var(--text-tertiary)] truncate">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-[var(--text-tertiary)] transition-transform duration-300',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {/* Body */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-6 pt-2 border-t border-[var(--border-color)]/50">
          {children}
        </div>
      </div>
    </div>
  );
}
