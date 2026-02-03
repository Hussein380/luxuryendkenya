/**
 * Car Service
 * 
 * Handles all car-related data operations.
 * Currently uses mocked data, structured for easy backend integration.
 * 
 */

import { type Car } from '@/types';
import { apiRequest } from './apiClient';

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
  page?: number;
  limit?: number;
  sort?: string;
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

  // Surface API errors for debugging
  if (response.error) {
    throw new Error(response.error);
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
  // Use the dedicated /featured endpoint which returns cars with rating >= 4.5
  const response = await apiRequest<any[]>(`/cars/featured?limit=${limit}`);
  if (response.success && response.data) {
    // Handle both direct array and wrapped object responses
    const cars = Array.isArray(response.data) ? response.data :
      (response.data && typeof response.data === 'object' && 'cars' in response.data) ? (response.data as any).cars : [];
    return (cars || []).map(mapCar);
  }
  return [];
}

/**
 * Get available categories (now returns objects with icons from backend)
 */
export async function getCategories(): Promise<{ id: string; name: string; icon: string }[]> {
  const response = await apiRequest<any>('/cars/categories');
  if (response.success && response.data) {
    // Handle both direct array and nested response (in case of cached data)
    let cats = response.data;

    // If it's nested (cached old response format), unwrap it
    if (cats && typeof cats === 'object' && !Array.isArray(cats) && cats.data) {
      cats = cats.data;
    }

    // Ensure we have an array
    if (Array.isArray(cats)) {
      // If it's an array of strings (old format), convert to objects
      if (cats.length > 0 && typeof cats[0] === 'string') {
        const iconMap: Record<string, string> = {
          'economy': '🚗',
          'compact': '🚙',
          'sedan': '🏙️',
          'suv': '🏔️',
          'luxury': '✨',
          'sports': '🏎️'
        };
        return cats.map((cat: string) => ({
          id: cat.toLowerCase(),
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: iconMap[cat.toLowerCase()] || '🚗'
        }));
      }
      // Already in {id, name, icon} format
      return cats;
    }
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
/**
 * Create a new car
 */
export async function createCar(data: FormData): Promise<Car | null> {
  const response = await apiRequest<any>('/cars', {
    method: 'POST',
    body: data,
    // Note: Don't set Content-Type header, browser will set it with boundary
  });

  if (response.success && response.data) {
    return mapCar(response.data);
  }
  return null;
}

/**
 * Update an existing car
 */
export async function updateCar(id: string, data: FormData): Promise<Car | null> {
  const response = await apiRequest<any>(`/cars/${id}`, {
    method: 'PUT',
    body: data,
  });

  if (response.success && response.data) {
    return mapCar(response.data);
  }
  return null;
}

/**
 * Delete a car
 */
export async function deleteCar(id: string): Promise<boolean> {
  const response = await apiRequest<any>(`/cars/${id}`, {
    method: 'DELETE',
  });
  return response.success;
}

/**
 * Get unavailable/booked dates for a specific car
 */
export interface UnavailableDateRange {
  start: string;
  end: string;
  status: 'pending' | 'confirmed' | 'active';
}

export async function getUnavailableDates(carId: string): Promise<UnavailableDateRange[]> {
  const response = await apiRequest<UnavailableDateRange[]>(`/cars/${carId}/unavailable-dates`);
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

/**
 * Check if selected dates overlap with unavailable dates
 */
export function checkDateAvailability(
  pickupDate: string,
  returnDate: string,
  unavailableDates: UnavailableDateRange[]
): { available: boolean; conflictingBooking?: UnavailableDateRange } {
  if (!pickupDate || !returnDate || unavailableDates.length === 0) {
    return { available: true };
  }

  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);

  for (const booking of unavailableDates) {
    const bookedStart = new Date(booking.start);
    const bookedEnd = new Date(booking.end);

    // Check for overlap
    if (pickup <= bookedEnd && returnD >= bookedStart) {
      return { available: false, conflictingBooking: booking };
    }
  }

  return { available: true };
}
