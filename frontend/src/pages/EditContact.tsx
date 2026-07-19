import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';
import ContactForm from '@/components/forms/ContactForm';
import contactService from '@/services/contactService';
import type { Contact, ContactFormData } from '@/types/contact';
import { toast } from 'sonner';
import { ChevronRight, Pencil, AlertTriangle } from 'lucide-react';

export default function EditContact() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing contact data
  useEffect(() => {
    const fetchContact = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await contactService.getContact(id);
        // Handle both direct and nested response shapes
        const data = response.data;
        const c = (data as any).contact || data;
        setContact(c);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Contact not found';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleSubmit = async (data: ContactFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      const response = await contactService.updateContact(id, data);
      const updated = (response.data as any).contact || response.data;

      toast.success(`${updated.firstName} ${updated.lastName} updated successfully`);
      navigate(`/contacts/${id}`);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update contact';

      if (err.response?.status === 409) {
        toast.error(`Duplicate detected by C++ HashMap: ${message}`);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-4 w-48 mb-6 rounded-lg" />
        <div className="flex items-center gap-4 mb-8">
          <div className="skeleton w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <div className="skeleton h-7 w-56 rounded-lg" />
            <div className="skeleton h-4 w-72 rounded-lg" />
          </div>
        </div>
        <div className="max-w-3xl space-y-5">
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-56 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error / Not Found
  if (error || !contact) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-danger-500" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Contact Not Found</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm">
            {error || 'The contact you are trying to edit does not exist or has been deleted.'}
          </p>
          <Link
            to={ROUTES.CONTACTS}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl',
              'text-sm font-bold text-white',
              'gradient-primary hover:opacity-90',
              'transition-all duration-200 cursor-pointer'
            )}
          >
            Back to Contacts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-6 animate-fade-in">
        <Link to={ROUTES.CONTACTS} className="hover:text-primary-500 transition-colors">
          Contacts
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/contacts/${id}`} className="hover:text-primary-500 transition-colors">
          {contact.firstName} {contact.lastName}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[var(--text-primary)] font-medium">Edit</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Pencil className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Edit {contact.firstName} {contact.lastName}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Update contact details — synced to C++ engine in real-time
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <ContactForm
          mode="edit"
          initialData={contact}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
