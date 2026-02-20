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
  const filename = `revenue-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.csv`;
  
  // Check if it's iOS (which has strict download restrictions)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (isIOS || isSafari) {
    // For iOS/Safari, read as text and offer data URL
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        // Create a temporary link with data URL
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        
        // Use click with slight delay for iOS
        setTimeout(() => {
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
          }, 100);
        }, 0);
      }
    };
    reader.readAsDataURL(blob);
  } else {
    // Standard approach for Android/Chrome
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
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
  const suffix = includeDetails ? 'full' : 'summary';
  const filename = `revenue-report-${suffix}-${filters.startDate || 'all'}-to-${filters.endDate || 'all'}.pdf`;
  
  // Check if it's iOS (which has strict download restrictions)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (isIOS || isSafari) {
    // For iOS/Safari, read as data URL
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        
        setTimeout(() => {
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
          }, 100);
        }, 0);
      }
    };
    reader.readAsDataURL(blob);
  } else {
    // Standard approach for Android/Chrome
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
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
      // Current calendar week (Monday to Sunday)
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { 
        startDate: monday.toISOString().split('T')[0], 
        endDate: sunday.toISOString().split('T')[0] 
      };
    }
    case 'month': {
      // Current calendar month (1st to last day)
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = firstDayOfMonth.toISOString().split('T')[0];
      return { 
        startDate, 
        endDate: lastDayOfMonth.toISOString().split('T')[0] 
      };
    }
    case 'year': {
      // Current calendar year (Jan 1 to Dec 31)
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
      return { 
        startDate: firstDayOfYear.toISOString().split('T')[0], 
        endDate: lastDayOfYear.toISOString().split('T')[0] 
      };
    }
    default:
      startDate = endDate;
  }

  return { startDate, endDate };
}
