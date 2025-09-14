interface Booking {
  id: string;
  bookingRef: string;
  customerId: string;
  providerId: string;
  providerServiceId: string;
  status: BookingStatus;
  scheduledStart: Date;
  scheduledEnd?: Date;
  address: string;
  totalAmount: number;
  commissionAmount?: number;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

enum BookingStatus {
  REQUESTED = "REQUESTED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DISPUTED = "DISPUTED",
}

enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}