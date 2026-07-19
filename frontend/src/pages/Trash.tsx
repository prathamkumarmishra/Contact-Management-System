import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, ArrowLeft, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import contactService from '@/services/contactService';
import type { Contact } from '@/types/contact';
import { toast } from 'sonner';

export default function Trash() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTrash = async () => {
    try {
      setIsLoading(true);
      const response = await contactService.getTrash();
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load trash list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id: string, name: string) => {
    try {
      await contactService.restoreContact(id);
      toast.success(`Restored ${name} successfully`);
      fetchTrash();
    } catch (error) {
      console.error(error);
      toast.error('Failed to restore contact');
    }
  };

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="flex items-center gap-3">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <Trash2 className="w-6 h-6 text-danger-500 shrink-0" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">Trash / Recycle Bin</h1>
          </div>
          <p className="text-[var(--text-secondary)] mt-1">
            Restore soft-deleted contact profiles back into the active database and C++ store.
          </p>
        </div>
      </div>

      {contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                'relative overflow-hidden rounded-2xl p-5',
                'bg-[var(--card-bg)] border border-[var(--border-color)]',
                'hover:border-[var(--border-color)]/80 hover:shadow-lg',
                'transition-all duration-300'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Photo Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-tertiary)]">
                  {contact.profilePhoto ? (
                    <img src={contact.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary-500">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-[var(--text-primary)] truncate">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">{contact.phone}</p>
                  
                  {contact.deletedAt && (
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-3 flex items-center gap-1 min-w-0">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Deleted: {new Date(contact.deletedAt).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Restore Button */}
              <div className="mt-5 pt-4 border-t border-[var(--border-color)] flex justify-end">
                <button
                  onClick={() => handleRestore(contact.id, `${contact.firstName} ${contact.lastName}`)}
                  className="flex max-w-full items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Restore Contact</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[350px] border border-dashed border-[var(--border-color)] rounded-3xl p-8 text-center bg-[var(--card-bg)]/20">
          <div className="w-14 h-14 rounded-2xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-danger-500" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Trash is empty</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-sm">
            Deleted contacts will be stored here temporarily. You can restore them anytime.
          </p>
        </div>
      )}
    </div>
  );
}
