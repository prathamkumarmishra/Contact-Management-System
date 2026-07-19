export interface Contact {
  id: string;
  userId: string;
  profilePhoto?: string;
  firstName: string;
  lastName: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  company?: string;
  designation?: string;
  department?: string;
  category: 'personal' | 'work' | 'family' | 'friend' | 'other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  linkedin?: string;
  birthday?: string;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  lastContacted?: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  profilePhoto?: File;
  firstName: string;
  lastName: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  company?: string;
  designation?: string;
  department?: string;
  category: Contact['category'];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  linkedin?: string;
  birthday?: string;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  isLoading: boolean;
  totalContacts: number;
  currentPage: number;
  totalPages: number;
}

export interface ContactFilters {
  q?: string;
  category?: string;
  company?: string;
  city?: string;
  isFavorite?: boolean;
  isBlocked?: boolean;
  tags?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
