import axiosInstance from '@/api/axiosInstance';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type { PaginatedNotifications, Notification } from '@/types/notification';

export const notificationService = {
  /**
   * Get paginated notifications
   */
  async getNotifications(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedNotifications>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedNotifications>>(
      ENDPOINTS.NOTIFICATIONS.BASE,
      { params: { page, limit } }
    );
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
      ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return response.data;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<ApiResponse<{ notification: Notification }>> {
    const response = await axiosInstance.put<ApiResponse<{ notification: Notification }>>(
      ENDPOINTS.NOTIFICATIONS.READ(id)
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<{ modifiedCount: number }>> {
    const response = await axiosInstance.put<ApiResponse<{ modifiedCount: number }>>(
      ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
    return response.data;
  },

  /**
   * Delete a single notification
   */
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      ENDPOINTS.NOTIFICATIONS.DELETE(id)
    );
    return response.data;
  }
};

export default notificationService;
