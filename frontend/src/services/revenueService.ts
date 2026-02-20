import { apiRequest } from './apiClient';

export interface RevenueSummary {
  expectedRevenue: number;
  collectedRevenue: number;
  pendingCollection: number;
  lostRevenue: number;
  penaltyRevenue: number;
  totalBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  collectionRate: string;
}

export interface RevenueDataPoint {
  period: string;
  expectedRevenue: number;
  collectedRevenue: number;
  pendingCollection: number;
  lostRevenue: number;
  penaltyRevenue: number;
  bookingCount: number;
  cancelledCount: number;
}

export interface RevenueResponse {
  summary: RevenueSummary;
  data: RevenueDataPoint[];
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface RevenueFilters {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

/**
 * Get revenue data with filters
 */
export async function getRevenue(filters: RevenueFilters = {}): Promise<RevenueResponse | null> {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.groupBy) params.append('groupBy', filters.groupBy);

  const response = await apiRequest<RevenueResponse>(`/admin/revenue?${params.toString()}`);
  
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

/**
 * Export revenue data as CSV
 */
export async function exportRevenueCSV(filters: RevenueFilters = {}): Promise<void> {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  // Get the base URL from the API client
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const downloadUrl = `${baseUrl}/admin/revenue/export/csv?${params.toString()}`;
  
  // Get token from localStorage (using the correct key)
  const token = localStorage.getItem('driveease_token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  // Fetch with authentication
  const response = await fetch(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to download CSV');
  }
  
  // Create blob and download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  // Mobile-friendly download approach
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // For mobile, open in new tab (browser will handle download)
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      // Fallback if popup blocked
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.csv`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    // Delay cleanup to allow download to start
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  } else {
    // Desktop: direct download
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

/**
 * Export revenue report as PDF
 */
export async function exportRevenuePDF(filters: RevenueFilters = {}, includeDetails: boolean = true): Promise<void> {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('includeDetails', includeDetails.toString());

  // Get the base URL from the API client
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const downloadUrl = `${baseUrl}/admin/revenue/export/pdf?${params.toString()}`;
  
  // Get token from localStorage (using the correct key)
  const token = localStorage.getItem('driveease_token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  // Fetch with authentication
  const response = await fetch(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to download PDF');
  }
  
  // Create blob and download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const suffix = includeDetails ? 'full' : 'summary';
  const filename = `revenue-report-${suffix}-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.pdf`;
  
  // Mobile-friendly download approach
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // For mobile, open in new tab (browser will handle download)
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      // Fallback if popup blocked
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    // Delay cleanup to allow download to start
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  } else {
    // Desktop: direct download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

/**
 * Get date range for quick filters
 */
export function getQuickDateRange(range: 'today' | 'week' | 'month' | 'year'): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate: string;

  switch (range) {
    case 'today':
      startDate = endDate;
      break;
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    }
    case 'year': {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      startDate = yearAgo.toISOString().split('T')[0];
      break;
    }
    default:
      startDate = endDate;
  }

  return { startDate, endDate };
}
