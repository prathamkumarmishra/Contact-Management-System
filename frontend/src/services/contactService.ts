import axiosInstance from '@/api/axiosInstance';
import { ENDPOINTS } from '@/api/endpoints';
import type { Contact, ContactFilters, ContactFormData } from '@/types/contact';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export const contactService = {
  /**
   * Get filtered list of active contacts
   */
  async getContacts(filters: ContactFilters = {}): Promise<ApiResponse<PaginatedResponse<Contact>>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Contact>>>(
      ENDPOINTS.CONTACTS.BASE,
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get single contact details
   */
  async getContact(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    const response = await axiosInstance.get<ApiResponse<{ contact: Contact }>>(
      ENDPOINTS.CONTACTS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Create new contact
   */
  async createContact(data: ContactFormData): Promise<ApiResponse<{ contact: Contact }>> {
    const formData = new FormData();
    
    // Append fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'profilePhoto') {
          formData.append(key, value as File);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await axiosInstance.post<ApiResponse<{ contact: Contact }>>(
      ENDPOINTS.CONTACTS.BASE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Update existing contact details
   */
  async updateContact(id: string, data: Partial<ContactFormData>): Promise<ApiResponse<{ contact: Contact }>> {
    const formData = new FormData();
    
    // Append fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'profilePhoto') {
          formData.append(key, value as File);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await axiosInstance.put<ApiResponse<{ contact: Contact }>>(
      ENDPOINTS.CONTACTS.DETAIL(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Soft delete contact
   */
  async deleteContact(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    const response = await axiosInstance.delete<ApiResponse<{ contact: Contact }>>(
      ENDPOINTS.CONTACTS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Restore contact from trash
   */
  async restoreContact(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    const response = await axiosInstance.post<ApiResponse<{ contact: Contact }>>(
      ENDPOINTS.CONTACTS.RESTORE(id)
    );
    return response.data;
  },

  /**
   * Bulk soft delete
   */
  async bulkDelete(contactIds: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await axiosInstance.delete<ApiResponse<{ deletedCount: number }>>(
      ENDPOINTS.CONTACTS.BULK_DELETE,
      { data: { contactIds } }
    );
    return response.data;
  },

  /**
   * Toggle favorite flag
   */
  async toggleFavorite(id: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    const response = await axiosInstance.put<ApiResponse<{ isFavorite: boolean }>>(
      ENDPOINTS.CONTACTS.FAVORITE(id)
    );
    return response.data;
  },

  /**
   * Toggle block flag
   */
  async toggleBlock(id: string): Promise<ApiResponse<{ isBlocked: boolean }>> {
    const response = await axiosInstance.put<ApiResponse<{ isBlocked: boolean }>>(
      ENDPOINTS.CONTACTS.BLOCK(id)
    );
    return response.data;
  },

  /**
   * Get list of trash / deleted contacts
   */
  async getTrash(): Promise<ApiResponse<{ contacts: Contact[]; total: number }>> {
    const response = await axiosInstance.get<ApiResponse<{ contacts: Contact[]; total: number }>>(
      ENDPOINTS.CONTACTS.TRASH
    );
    return response.data;
  },

  /**
   * Undo last contact soft deletion (C++ Stack Pop)
   */
  async undoDelete(): Promise<ApiResponse<{ contact: Contact }>> {
    const response = await axiosInstance.post<ApiResponse<{ contact: Contact }>>(
      '/contacts/undo'
    );
    return response.data;
  },

  /**
   * Get recently contacted list prioritised by interactions (C++ PriorityQueue heap)
   */
  async getRecentInteractions(limit: number = 5): Promise<ApiResponse<{ contacts: Contact[] }>> {
    const response = await axiosInstance.get<ApiResponse<{ contacts: Contact[] }>>(
      '/contacts/recent',
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Clear all contacts permanently
   */
  async clearAll(): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await axiosInstance.delete<ApiResponse<{ deletedCount: number }>>(
      ENDPOINTS.CONTACTS.CLEAR_ALL
    );
    return response.data;
  },

  /**
   * Clear trash - permanently delete all trashed contacts
   */
  async clearTrash(): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await axiosInstance.delete<ApiResponse<{ deletedCount: number }>>(
      ENDPOINTS.CONTACTS.CLEAR_TRASH
    );
    return response.data;
  }
};
export default contactService;
