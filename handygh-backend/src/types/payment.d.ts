// src/types/payment.d.ts

export interface Payment {
  id: string;
  bookingId: string;
  txnProvider?: string; // MTN MoMo transaction ID
  payerId?: string;
  payeeId?: string;
  amount: number; // Amount in GHS
  currency?: string; // Default is "GHS"
  status: TransactionStatus;
  metadata?: Record<string, any>; // Store provider-specific data
  createdAt: Date;
}

export enum TransactionStatus {
  INITIATED = "INITIATED",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}