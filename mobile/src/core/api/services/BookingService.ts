import { api } from '../client';
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingStatus,
  TimeSlot,
  AvailabilityQueryParams,
} from '../types';

/**
 * Booking Service
 * Handles booking creation, management, and availability checks
 */
export class BookingService {
  private static readonly BASE_PATH = '/api/v1/bookings';

  /**
   * Create a new booking
   * Requirement 4.11: Create booking with service, date, time, and location
   */
  static async createBooking(data: CreateBookingRequest): Promise<Booking> {
    return api.post<Booking>(`${this.BASE_PATH}/`, data);
  }

  /**
   * Get all bookings for the current user
   */
  static async getBookings(status?: BookingStatus): Promise<Booking[]> {
    const url = status
      ? `${this.BASE_PATH}/?status=${status}`
      : `${this.BASE_PATH}/`;

    return api.get<Booking[]>(url);
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(id: string): Promise<Booking> {
    return api.get<Booking>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    id: string,
    status: BookingStatus,
    cancellationReason?: string
  ): Promise<Booking> {
    const data: UpdateBookingRequest = {
      status,
      ...(cancellationReason && { cancellationReason }),
    };

    return api.patch<Booking>(`${this.BASE_PATH}/${id}/`, data);
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(id: string, reason: string): Promise<Booking> {
    return this.updateBookingStatus(id, BookingStatus.CANCELLED, reason);
  }

  /**
   * Check provider availability for a specific date
   */
  static async checkAvailability(params: AvailabilityQueryParams): Promise<TimeSlot[]> {
    const queryParams = new URLSearchParams({
      provider_id: params.providerId,
      date: params.date,
      ...(params.serviceId && { service_id: params.serviceId }),
    });

    return api.get<TimeSlot[]>(
      `${this.BASE_PATH}/availability/?${queryParams.toString()}`
    );
  }

  /**
   * Get active bookings (pending, confirmed, in-progress)
   */
  static async getActiveBookings(): Promise<Booking[]> {
    return api.get<Booking[]>(`${this.BASE_PATH}/?active=true`);
  }

  /**
   * Get upcoming bookings
   */
  static async getUpcomingBookings(): Promise<Booking[]> {
    return api.get<Booking[]>(
      `${this.BASE_PATH}/?status=${BookingStatus.CONFIRMED}`
    );
  }

  /**
   * Get completed bookings
   */
  static async getCompletedBookings(): Promise<Booking[]> {
    return api.get<Booking[]>(
      `${this.BASE_PATH}/?status=${BookingStatus.COMPLETED}`
    );
  }

  /**
   * Get booking history with pagination
   */
  static async getBookingHistory(page: number = 1, pageSize: number = 10): Promise<Booking[]> {
    return api.get<Booking[]>(
      `${this.BASE_PATH}/?page=${page}&page_size=${pageSize}`
    );
  }

  /**
   * Submit review for a completed booking
   */
  static async submitReview(
    bookingId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    return api.post(`${this.BASE_PATH}/${bookingId}/review/`, {
      rating,
      comment,
    });
  }
}
