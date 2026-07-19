import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import ContactForm from '@/components/forms/ContactForm';
import contactService from '@/services/contactService';
import type { ContactFormData } from '@/types/contact';
import { toast } from 'sonner';
import { ChevronRight, UserPlus, Sparkles } from 'lucide-react';

export default function AddContact() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      const response = await contactService.createContact(data);
      const contact = response.data.contact;

      toast.success(`${contact.firstName} ${contact.lastName} created successfully`, {
        action: {
          label: 'View Contact',
          onClick: () => navigate(`/contacts/${contact.id || (contact as any)._id}`),
        },
        duration: 4000,
      });

      navigate(ROUTES.CONTACTS);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create contact';

      // Highlight C++ HashMap duplicate detection
      if (error.response?.status === 409) {
        toast.error(`Duplicate detected by C++ HashMap: ${message}`);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-6 animate-fade-in">
        <Link
          to={ROUTES.CONTACTS}
          className="hover:text-primary-500 transition-colors"
        >
          Contacts
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[var(--text-primary)] font-medium">Add New</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/25">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Add New Contact</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            Duplicates are checked in O(1) via C++ HashMap engine
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <ContactForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
