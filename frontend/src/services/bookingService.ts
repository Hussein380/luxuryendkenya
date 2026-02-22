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
  bookingId: b.bookingId,
  carId: b.car?._id || b.car,
  carName: b.car?.name || 'Car Name',
  carImage: b.car?.imageUrl || '',
  firstName: b.firstName,
  lastName: b.lastName,
  customerEmail: b.customerEmail,
  customerPhone: b.customerPhone,
  pickupDate: b.pickupDate,
  returnDate: b.returnDate,
  pickupLocation: b.pickupLocation,
  returnLocation: b.returnLocation,
  totalDays: b.totalDays,
  totalPrice: b.totalPrice,
  status: b.status,
  createdAt: b.createdAt,
  extras: b.extras || [],
  idImageUrl: b.idImageUrl,
  licenseImageUrl: b.licenseImageUrl,
  bookingType: b.bookingType,
  reminderSent: b.reminderSent,
  actualReturnDate: b.actualReturnDate,
  penaltyFee: b.penaltyFee,
  paymentDetails: b.paymentDetails,
});

/**
 * Get all bookings (admin only)
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
 * Get my bookings (current user)
 */
export async function getMyBookings(status?: Booking['status']): Promise<BookingsResponse> {
  const query = status ? `?status=${status}` : '';
  const response = await apiRequest<any[]>(`/bookings/my${query}`);

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
export async function createBooking(data: FormData | CreateBookingData): Promise<any | null> {
  const response = await apiRequest<any>('/bookings', {
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

  if (response.success && response.data) {
    // Return original data too for M-Pesa stkResult
    return response.data;
  }

  throw new Error(response.error || 'Failed to create booking');
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

/**
 * Poll booking payment status (public endpoint, no auth needed)
 */
export async function pollBookingStatus(bookingId: string): Promise<string> {
  const response = await apiRequest<{ status: string; bookingId: string }>(`/bookings/status/${bookingId}`);
  if (response.success && response.data) {
    return response.data.status;
  }
  throw new Error('Could not check payment status');
}

/**
 * Start trip (Admin only)
 */
export async function startTrip(id: string): Promise<Booking | null> {
  const response = await apiRequest<any>(`/bookings/${id}/start-trip`, {
    method: 'POST',
  });
  if (response.success && response.data) {
    return mapBooking(response.data);
  }
  return null;
}

/**
 * Check in car (Admin only)
 */
export async function checkIn(id: string): Promise<Booking | null> {
  const response = await apiRequest<any>(`/bookings/${id}/check-in`, {
    method: 'POST',
  });
  if (response.success && response.data) {
    return mapBooking(response.data);
  }
  return null;
}

/**
 * Update penalty fee (Admin only)
 */
export async function updatePenalty(
  id: string,
  data: { amount?: number; status?: string; reason?: string }
): Promise<Booking | null> {
  const response = await apiRequest<any>(`/bookings/${id}/penalty`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (response.success && response.data) {
    return mapBooking(response.data);
  }
  return null;
}

/**
 * Initiate penalty payment (Admin only)
 */
export async function payPenalty(id: string): Promise<any> {
  const response = await apiRequest<any>(`/bookings/${id}/pay-penalty`, {
    method: 'POST',
  });
  return response.data;
}

/**
 * Manually mark booking as overdue (Admin only)
 */
export async function markAsOverdue(id: string): Promise<Booking | null> {
  const response = await apiRequest<any>(`/bookings/${id}/mark-overdue`, {
    method: 'POST',
  });
  if (response.success && response.data) {
    return mapBooking(response.data);
  }
  return null;
}

/**
 * Mark booking as No-Show (Admin only)
 */
export async function markNoShow(id: string): Promise<Booking | null> {
  const response = await apiRequest<any>(`/bookings/${id}/no-show`, {
    method: 'POST',
  });
  if (response.success && response.data) {
    return mapBooking(response.data);
  }
  return null;
}

/**
 * Extend a trip
 */
export async function extendTrip(id: string, newReturnDate: string): Promise<Booking | null> {
  const response = await apiRequest<any>(`/bookings/${id}/extend`, {
    method: 'POST',
    body: JSON.stringify({ newReturnDate }),
  });
  if (response.success && response.data) {
    return mapBooking(response.data);
  }
  return null;
}
