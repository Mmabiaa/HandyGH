interface User {
  id: string;
  role: Role;
  name?: string;
  email?: string;
  phone: string;
  passwordHash?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  provider?: Provider;
  bookingsAsCustomer: Booking[];
  reviews: Review[];
  refreshTokens: RefreshToken[];
}

enum Role {
  CUSTOMER = "CUSTOMER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

interface Provider {
  id: string;
  userId: string;
  businessName?: string;
  categories: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
  verified: boolean;
  verificationDocUrl?: string;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
}

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
  transactions: Transaction[];
  messages: Message[];
  review?: Review;
  dispute?: Dispute;
}

interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  attachments: string[];
  createdAt: Date;
}

interface Dispute {
  id: string;
  bookingId: string;
  reason: string;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  resolution?: string;
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

enum DisputeStatus {
  OPEN = "OPEN",
  INVESTIGATING = "INVESTIGATING",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}