import axiosInstance from '@/api/axiosInstance';
import { ENDPOINTS } from '@/api/endpoints';
import type { Contact } from '@/types/contact';
import type { ApiResponse } from '@/types/api';

export const searchService = {
  /**
   * Search contacts via C++ Trie Autocomplete
   */
  async autocomplete(query: string): Promise<ApiResponse<Contact[]>> {
    const response = await axiosInstance.get<ApiResponse<Contact[]>>(
      ENDPOINTS.SEARCH.GLOBAL,
      { params: { q: query } }
    );
    return response.data;
  },

  /**
   * Get recent search queries cache (C++ FIFO Queue)
   */
  async getRecentHistory(): Promise<ApiResponse<string[]>> {
    const response = await axiosInstance.get<ApiResponse<string[]>>(
      ENDPOINTS.SEARCH.HISTORY
    );
    return response.data;
  }
};
export default searchService;
