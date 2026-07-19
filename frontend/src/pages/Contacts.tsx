import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import {
  Users,
  Plus,
  Search,
  Grid3X3,
  List,
  Star,
  Phone,
  Mail,
  Building2,
  Trash2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import contactService from '@/services/contactService';
import type { Contact } from '@/types/contact';
import { toast } from 'sonner';

const categoryColors: Record<string, string> = {
  work: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  friend: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  family: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  personal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | undefined>(undefined);
  const [blockedFilter, setBlockedFilter] = useState<boolean | undefined>(undefined);
  const [sortField, setSortField] = useState<string>('firstName');
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters = {
        page,
        limit: 12,
        sort: sortField,
        q: searchQuery || undefined,
        category: categoryFilter || undefined,
        isFavorite: favoriteFilter,
        isBlocked: blockedFilter
      };
      
      const response = await contactService.getContacts(filters);
      setContacts(response.data.contacts || []);
      setTotalContacts(response.data.pagination.total || 0);
      setTotalPages(response.data.pagination.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve contacts from C++ sorted index');
    } finally {
      setIsLoading(false);
    }
  }, [blockedFilter, categoryFilter, favoriteFilter, page, searchQuery, sortField]);

  useEffect(() => {
    // Reset page to 1 when filters change
    setPage(1);
  }, [searchQuery, categoryFilter, favoriteFilter, blockedFilter, sortField]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await contactService.deleteContact(id);
      
      // Trigger undo deletion toast linking to LIFO Stack pops!
      toast.success(`${name} moved to trash`, {
        action: {
          label: 'Undo Delete (C++ Stack)',
          onClick: async () => {
            try {
              const undoResponse = await contactService.undoDelete();
              toast.success(`Restored ${undoResponse.data.contact.firstName} successfully`);
              fetchContacts();
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Failed to restore deleted contact');
            }
          }
        },
        duration: 5000
      });
      fetchContacts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to move contact to trash');
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await contactService.toggleFavorite(id);
      toast.success(`${name} ${response.data.isFavorite ? 'added to' : 'removed from'} favorites`);
      fetchContacts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleBlockToggle = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await contactService.toggleBlock(id);
      toast.success(`${name} ${response.data.isBlocked ? 'blocked' : 'unblocked'}`);
      fetchContacts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update block status');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Contacts</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {totalContacts} contacts retrieved from BST alphabetical inorder traverser
          </p>
        </div>
        <Link to={ROUTES.ADD_CONTACT} className={cn(
          'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer shrink-0 whitespace-nowrap',
          'text-sm font-bold text-white',
          'gradient-primary hover:opacity-90',
          'shadow-lg shadow-primary-500/25',
          'transition-all duration-200 hover:-translate-y-0.5'
        )}>
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add Contact</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className={cn(
        'flex flex-col gap-4 mb-6 p-4 rounded-2xl',
        'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm'
      )}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 min-w-0">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search by name, company, email, phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={cn(
                'w-full h-11 pl-11 pr-4 rounded-xl text-sm',
                'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
                'placeholder:text-[var(--text-tertiary)]',
                'border border-transparent focus:border-primary-500/50',
                'focus:outline-none transition-all duration-200'
              )}
            />
          </div>
          
          {/* Sorting and Views */}
          <div className="flex items-center flex-wrap gap-2 min-w-0">
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className={cn(
                'h-11 min-w-0 max-w-full px-4 rounded-xl text-xs font-semibold',
                'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-transparent',
                'focus:outline-none'
              )}
            >
              <option value="firstName">Sort: Alphabetical (BST)</option>
              <option value="contactCount">Sort: Calls Count (Heap)</option>
              <option value="createdAt">Sort: Date Added (QuickSort)</option>
              <option value="company">Sort: Company Name (MergeSort)</option>
            </select>

            <button 
              onClick={() => setShowFiltersMenu(!showFiltersMenu)}
              className={cn(
                'flex items-center gap-2 h-11 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                showFiltersMenu 
                  ? 'bg-primary-500/10 text-primary-500' 
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Filters</span>
            </button>

            <div className="flex items-center rounded-xl bg-[var(--bg-tertiary)] p-1">
              <button onClick={() => setViewMode('grid')} className={cn(
                'p-2 rounded-lg transition-colors cursor-pointer',
                viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={cn(
                'p-2 rounded-lg transition-colors cursor-pointer',
                viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Filters Options Menu */}
        {showFiltersMenu && (
          <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            {/* Category */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] focus:outline-none border border-transparent"
              >
                <option value="">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="family">Family</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Favorite Status */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Starred</label>
              <select
                value={favoriteFilter === undefined ? '' : String(favoriteFilter)}
                onChange={e => setFavoriteFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] focus:outline-none border border-transparent"
              >
                <option value="">All Contacts</option>
                <option value="true">Favorites Only</option>
                <option value="false">Regular Only</option>
              </select>
            </div>

            {/* Blocked Status */}
            <div>
              <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">Privacy Filter</label>
              <select
                value={blockedFilter === undefined ? '' : String(blockedFilter)}
                onChange={e => setBlockedFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] focus:outline-none border border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="false">Active Only</option>
                <option value="true">Blocked Only</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className={cn(
          viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'
        )}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      ) : contacts.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className={cn(
                    'group rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-48 border',
                    'bg-[var(--card-bg)] border-[var(--border-color)]',
                    'hover:border-primary-500/30 hover:shadow-lg transition-all duration-300',
                    'animate-fade-in-up',
                    `stagger-${index + 1}`
                  )}
                >
                  <Link to={`/contacts/${contact.id}`} className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Profile Photo */}
                      <div className="w-12 h-12 rounded-xl border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-tertiary)] shrink-0 overflow-hidden">
                        {contact.profilePhoto ? (
                          <img src={contact.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary-500">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </span>
                        )}
                      </div>
                      
                      {/* Contact metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-primary-500 transition-colors">
                            {contact.firstName} {contact.lastName}
                          </h3>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] min-w-0">
                            <Phone className="w-3.5 h-3.5 shrink-0 text-[var(--text-tertiary)]" />
                            <span className="truncate">{contact.phone}</span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                              <Mail className="w-3.5 h-3.5 shrink-0 text-[var(--text-tertiary)]" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] min-w-0">
                              <Building2 className="w-3.5 h-3.5 shrink-0 text-[var(--text-tertiary)]" />
                              <span className="truncate">{contact.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Actions & Category Pill */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)]/30 flex items-center justify-between">
                    <span className={cn(
                      'text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border',
                      categoryColors[contact.category] || categoryColors.other
                    )}>
                      {contact.category}
                    </span>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleFavoriteToggle(e, contact.id, contact.firstName)}
                        className={cn(
                          'p-1.5 rounded-lg hover:bg-warning-500/10 hover:text-warning-500 transition-all cursor-pointer',
                          contact.isFavorite ? 'text-warning-500' : 'text-[var(--text-tertiary)]'
                        )}
                        title={contact.isFavorite ? 'Starred' : 'Star Contact'}
                      >
                        <Star className={cn('w-4 h-4', contact.isFavorite && 'fill-warning-500')} />
                      </button>
                      <button
                        onClick={(e) => handleBlockToggle(e, contact.id, contact.firstName)}
                        className={cn(
                          'p-1.5 rounded-lg hover:bg-danger-500/10 hover:text-danger-500 transition-all cursor-pointer',
                          contact.isBlocked ? 'text-danger-500' : 'text-[var(--text-tertiary)]'
                        )}
                        title={contact.isBlocked ? 'Blocked' : 'Block Contact'}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(contact.id, `${contact.firstName} ${contact.lastName}`); }}
                        className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-danger-500/10 hover:text-danger-500 transition-all cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2.5">
              {contacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className={cn(
                    'group rounded-xl p-3 flex items-center justify-between gap-3 border',
                    'bg-[var(--card-bg)] border-[var(--border-color)]',
                    'hover:border-primary-500/30 hover:shadow-sm transition-all duration-200',
                    'animate-fade-in-up',
                    `stagger-${index + 1}`
                  )}
                >
                  <Link to={`/contacts/${contact.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-tertiary)] text-xs font-bold text-primary-500 shrink-0 overflow-hidden">
                      {contact.profilePhoto ? (
                        <img src={contact.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        `${contact.firstName[0]}${contact.lastName[0]}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0 sm:flex sm:items-center sm:gap-4">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate sm:w-1/4">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate sm:w-1/4 flex items-center gap-1 min-w-0">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span className="truncate">{contact.phone}</span>
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate sm:w-1/4 flex items-center gap-1 min-w-0">
                        {contact.email && (
                          <>
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate sm:w-1/4 flex items-center gap-1 min-w-0">
                        {contact.company && (
                          <>
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{contact.company}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border hidden sm:inline-block',
                      categoryColors[contact.category] || categoryColors.other
                    )}>
                      {contact.category}
                    </span>
                    <button
                      onClick={(e) => handleFavoriteToggle(e, contact.id, contact.firstName)}
                      className={cn(
                        'p-1.5 rounded-lg hover:bg-warning-500/10 hover:text-warning-500 transition-all cursor-pointer',
                        contact.isFavorite ? 'text-warning-500' : 'text-[var(--text-tertiary)]'
                      )}
                    >
                      <Star className={cn('w-4 h-4', contact.isFavorite && 'fill-warning-500')} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(contact.id, `${contact.firstName} ${contact.lastName}`); }}
                      className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-danger-500/10 hover:text-danger-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Simple Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--card-bg)] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--card-bg)] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed border border-[var(--border-color)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-[var(--border-color)] rounded-3xl p-8 text-center bg-[var(--card-bg)]/20">
          <Users className="w-10 h-10 text-[var(--text-tertiary)] mb-3" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">No contacts found</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-sm">
            Try adjusting your search query, sorting parameters, or filter categories to find what you need.
          </p>
        </div>
      )}
    </div>
  );
}
