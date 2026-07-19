import axiosInstance from '@/api/axiosInstance';
import type { ApiResponse } from '@/types/api';

export const ioService = {
  /**
   * Import contacts via CSV upload
   */
  async importCSV(file: File): Promise<ApiResponse<{ importedCount: number; skippedCount: number }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ApiResponse<{ importedCount: number; skippedCount: number }>>(
      '/io/import',
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
   * Export contacts as a downloadable CSV file
   */
  async exportCSV(): Promise<void> {
    const response = await axiosInstance.get('/io/export', {
      responseType: 'blob', // Download file stream
    });

    // Create browser download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts-export.csv');
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
export default ioService;
