import axiosInstance from '@/api/axiosInstance';
import { ENDPOINTS } from '@/api/endpoints';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

export const authService = {
  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<ApiResponse<{ user: User }>> {
    const response = await axiosInstance.post<ApiResponse<{ user: User }>>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Log in user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Save access token to localStorage on success
    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
      ENDPOINTS.AUTH.ME
    );
    return response.data;
  },

  /**
   * Log out user
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>(
        ENDPOINTS.AUTH.LOGOUT
      );
      return response.data;
    } finally {
      // Always clear token and reload
      localStorage.removeItem('accessToken');
    }
  },

  /**
   * Request password reset OTP
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data;
  },

  /**
   * Verify password reset OTP
   */
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<{ resetToken: string }>> {
    const response = await axiosInstance.post<ApiResponse<{ resetToken: string }>>(
      ENDPOINTS.AUTH.VERIFY_OTP,
      { email, otp }
    );
    return response.data;
  },

  /**
   * Reset password with valid session token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.post<ApiResponse<void>>(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      { resetToken, newPassword }
    );
    return response.data;
  },

  /**
   * Update user profile (firstName, lastName)
   */
  async updateProfile(data: { firstName?: string; lastName?: string }): Promise<ApiResponse<{ user: User }>> {
    const response = await axiosInstance.put<ApiResponse<{ user: User }>>(
      ENDPOINTS.AUTH.UPDATE_PROFILE,
      data
    );
    return response.data;
  },

  /**
   * Change password (requires current password)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.put<ApiResponse<void>>(
      ENDPOINTS.AUTH.CHANGE_PASSWORD,
      { currentPassword, newPassword }
    );
    return response.data;
  },

  /**
   * Delete user account permanently
   */
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      ENDPOINTS.AUTH.DELETE_ACCOUNT,
      { data: { password } }
    );
    return response.data;
  }
};
export default authService;
