/**
 * Car Service
 * 
 * Handles all car-related data operations.
 * Currently uses mocked data, structured for easy backend integration.
 * 
 * To connect to real backend:
 * 1. Import apiRequest from apiClient
 * 2. Replace mock data returns with API calls
 * 3. Update response handling as needed
 */

import { mockCars, carCategories, locations, type Car } from '@/data/mockCars';
import { apiRequest, simulateDelay } from './apiClient';

export interface CarFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  transmission?: string;
  fuelType?: string;
  location?: string;
  seats?: number;
  available?: boolean;
  search?: string;
}

export interface CarsResponse {
  cars: Car[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Map backend car object to frontend car object (handling _id)
 */
const mapCar = (car: any): Car => ({
  ...car,
  id: car.id || car._id,
});

/**
 * Get all cars with optional filtering
 */
export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== 'all') {
        queryParams.append(key, value.toString());
      }
    });
  }

  const response = await apiRequest<{ cars: any[]; total: number; page: number; pageSize: number }>(
    `/cars?${queryParams.toString()}`
  );

  if (response.success && response.data) {
    return {
      ...response.data,
      cars: response.data.cars.map(mapCar),
    };
  }

  return {
    cars: [],
    total: 0,
    page: 1,
    pageSize: 10,
  };
}

/**
 * Get a single car by ID
 */
export async function getCarById(id: string): Promise<Car | null> {
  const response = await apiRequest<any>(`/cars/${id}`);
  if (response.success && response.data) {
    return mapCar(response.data);
  }
  return null;
}

/**
 * Get featured cars (top rated, available)
 */
export async function getFeaturedCars(limit: number = 4): Promise<Car[]> {
  const response = await apiRequest<any[]>(`/cars?featured=true&limit=${limit}`);
  if (response.success && response.data) {
    // Updated mapping to handle both direct array and wrapped object
    const cars = Array.isArray(response.data) ? response.data :
      (response.data && typeof response.data === 'object' && 'cars' in response.data) ? (response.data as any).cars : [];
    return (cars || []).map(mapCar);
  }
  return [];
}

/**
 * Get available categories
 */
export async function getCategories() {
  const response = await apiRequest<string[]>('/cars/categories');
  if (response.success && response.data) {
    // Map simple strings to the object structure expected by the frontend
    const iconMap: Record<string, string> = {
      'Economy': '🚗',
      'Compact': '🚙',
      'Sedan': '🏙️',
      'SUV': '🏔️',
      'Luxury': '✨',
      'Sports': '🏎️'
    };
    return response.data.map(cat => ({
      id: cat.toLowerCase(),
      name: cat,
      icon: iconMap[cat] || '🚗'
    }));
  }
  return [];
}

/**
 * Get available locations
 */
export async function getLocations() {
  const response = await apiRequest<string[]>('/cars/locations');
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

/**
 * Search cars by query
 */
export async function searchCars(query: string): Promise<Car[]> {
  const response = await apiRequest<{ cars: any[] }>(`/cars?search=${query}`);
  if (response.success && response.data) {
    return (response.data.cars || []).map(mapCar);
  }
  return [];
}
