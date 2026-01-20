/**
 * API Client Configuration
 * 
 * This file contains the API client setup.
 */

const BASE_URL = 'http://localhost:5000/api';

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
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
