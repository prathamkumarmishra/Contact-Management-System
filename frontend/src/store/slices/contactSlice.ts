import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Contact, ContactFilters } from '@/types/contact';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ContactState {
  contacts: Contact[];
  trashContacts: Contact[];
  selectedContact: Contact | null;
  filters: ContactFilters;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  undoAvailable: boolean;
}

const initialState: ContactState = {
  contacts: [],
  trashContacts: [],
  selectedContact: null,
  filters: {
    page: 1,
    limit: 20,
    sort: 'firstName',
    q: '',
    category: undefined,
    isFavorite: undefined,
    isBlocked: undefined
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  isLoading: false,
  error: null,
  undoAvailable: false
};

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    contactsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getContactsSuccess: (
      state,
      action: PayloadAction<{ contacts: Contact[]; pagination: PaginationInfo }>
    ) => {
      state.contacts = action.payload.contacts;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    getTrashSuccess: (state, action: PayloadAction<Contact[]>) => {
      state.trashContacts = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    getContactSuccess: (state, action: PayloadAction<Contact>) => {
      state.selectedContact = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    contactActionSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    contactsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ContactFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setUndoAvailable: (state, action: PayloadAction<boolean>) => {
      state.undoAvailable = action.payload;
    },
    clearSelectedContact: (state) => {
      state.selectedContact = null;
    }
  }
});

export const {
  contactsStart,
  getContactsSuccess,
  getTrashSuccess,
  getContactSuccess,
  contactActionSuccess,
  contactsFailure,
  setFilters,
  resetFilters,
  setUndoAvailable,
  clearSelectedContact
} = contactSlice.actions;

export default contactSlice.reducer;
