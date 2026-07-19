export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  contacts: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface DashboardStats {
  totalContacts: number;
  favorites: number;
  blocked: number;
  addedThisMonth: number;
  addedThisWeek: number;
  trashCount: number;
  categoryCounts: Record<string, number>;
  recentContacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    profilePhoto?: string;
  }>;
}

export interface ChartData {
  categoryDistribution: {
    labels: string[];
    values: number[];
  };
  monthlyGrowth: {
    labels: string[];
    values: number[];
  };
  topCompanies: {
    labels: string[];
    values: number[];
  };
}
