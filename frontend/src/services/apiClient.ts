/**
 * API Client Configuration
 *
 * - Dev: localhost:5000/api
 * - Vercel (full-stack): /api (same origin)
 * - Separate backend: set VITE_API_URL to your backend URL
 */
export const getBaseUrl = (): string => {
  // Explicit env var takes priority
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Check if running in browser and on localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }

  // Production: use relative path (same origin on Vercel)
  return '/api';
};

const BASE_URL = getBaseUrl();

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Simulated network delay for realistic UX (optional if calling real API)
const simulateDelay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generic API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('driveease_token') : null;
    const isFormData = options?.body instanceof FormData;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null as T,
        success: false,
        error: result.error || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      data: result.data as T,
      success: true,
      message: result.message
    };
  } catch (error) {
    return {
      data: null as T,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export { simulateDelay };
