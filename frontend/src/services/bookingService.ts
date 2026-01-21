/**
 * Booking Service
 * 
 * Handles all booking-related data operations.
 * Connected to real backend API.
 */

import { type Booking } from '@/types';
import { apiRequest } from './apiClient';

export interface CreateBookingData {
  carId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  extras: string[];
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
}

/**
 * Map backend booking object to frontend booking object
 */
const mapBooking = (b: any): Booking => ({
  id: b._id || b.id,
  carId: b.car?._id || b.car,
  carName: b.car?.name || 'Car Name',
  carImage: b.car?.imageUrl || '',
  customerName: b.customerName,
  customerEmail: b.customerEmail,
  customerPhone: b.customerPhone,
  pickupDate: b.pickupDate,
  returnDate: b.returnDate,
  pickupLocation: b.pickupLocation,
  returnLocation: b.returnLocation,
  totalDays: b.totalDays,
  pricePerDay: b.totalPrice / b.totalDays, // Derived if not in backend
  totalPrice: b.totalPrice,
  status: b.status,
  createdAt: b.createdAt,
  extras: b.extras || [],
});

/**
 * Get all bookings
 */
export async function getBookings(status?: Booking['status']): Promise<BookingsResponse> {
  const query = status ? `?status=${status}` : '';
  const response = await apiRequest<any[]>(`/bookings${query}`);

  if (response.success && response.data) {
    const bookings = response.data.map(mapBooking);
    return {
      bookings,
      total: bookings.length,
    };
  }

  return {
    bookings: [],
    total: 0,
  };
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const response = await apiRequest<any>(`/bookings/${id}`);
  if (response.success && response.data) {
    return mapBooking(response.data);
  }
  return null;
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingData): Promise<Booking | null> {
  const response = await apiRequest<any>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success && response.data) {
    return mapBooking(response.data);
  }

  return null;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking | null> {
  const response = await apiRequest<any>(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  if (response.success && response.data) {
    return mapBooking(response.data);
  }
  return null;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<boolean> {
  const response = await apiRequest<any>(`/bookings/${id}`, {
    method: 'DELETE',
  });
  return response.success;
}

/**
 * Get available extras
 */
export async function getBookingExtras() {
  const response = await apiRequest<any[]>('/bookings/extras');
  if (response.success && response.data) {
    return response.data;
  }
  return [];
}

/**
 * Calculate booking price
 */
export function calculateBookingPrice(
  pricePerDay: number,
  days: number,
  extras: { id: string; pricePerDay: number }[]
): { subtotal: number; extrasTotal: number; total: number } {
  const subtotal = pricePerDay * days;
  const extrasTotal = extras.reduce((sum, extra) => sum + extra.pricePerDay * days, 0);
  return {
    subtotal,
    extrasTotal,
    total: subtotal + extrasTotal,
  };
}
