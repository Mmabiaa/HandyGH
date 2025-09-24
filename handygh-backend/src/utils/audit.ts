import { prisma } from '../models/prismaClient';
import crypto from 'crypto';

export interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
}

export class AuditLogger {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.AUDIT_SECRET_KEY || 'default-audit-secret';
  }

  /**
   * Log a critical action for audit purposes - FR-24
   */
  async logAction(auditData: AuditLogData): Promise<void> {
    const {
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      timestamp = new Date()
    } = auditData;

    // Create tamper-evident hash
    const hash = this.createHash({
      userId,
      action,
      resource,
      resourceId,
      details,
      timestamp: timestamp.toISOString()
    });

    // Store audit log
    await this.storeAuditLog({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      timestamp,
      hash
    });
  }

  /**
   * Create tamper-evident hash for audit log
   */
  private createHash(data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(dataString)
      .digest('hex');
  }

  /**
   * Store audit log in database
   */
  private async storeAuditLog(logData: any): Promise<void> {
    // Note: This would require an audit_logs table in the database
    // For now, we'll log it with the hash for tamper-evidence
    console.log(`[AUDIT] ${JSON.stringify(logData)}`);
    
    // In production, store in database:
    // await prisma.auditLog.create({ data: logData });
  }

  /**
   * Verify audit log integrity
   */
  async verifyAuditLog(auditLogId: string): Promise<boolean> {
    // In production, retrieve from database and verify hash
    // const auditLog = await prisma.auditLog.findUnique({ where: { id: auditLogId } });
    // if (!auditLog) return false;
    
    // const expectedHash = this.createHash({
    //   userId: auditLog.userId,
    //   action: auditLog.action,
    //   resource: auditLog.resource,
    //   resourceId: auditLog.resourceId,
    //   details: auditLog.details,
    //   timestamp: auditLog.timestamp.toISOString()
    // });
    
    // return auditLog.hash === expectedHash;
    return true; // Placeholder
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, limit = 100): Promise<any[]> {
    // In production, retrieve from database
    // return await prisma.auditLog.findMany({
    //   where: { userId },
    //   orderBy: { timestamp: 'desc' },
    //   take: limit
    // });
    return []; // Placeholder
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceAuditLogs(resource: string, resourceId: string): Promise<any[]> {
    // In production, retrieve from database
    // return await prisma.auditLog.findMany({
    //   where: { resource, resourceId },
    //   orderBy: { timestamp: 'desc' }
    // });
    return []; // Placeholder
  }
}

export const auditLogger = new AuditLogger();

// Predefined audit actions for common operations
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  OTP_REQUEST: 'OTP_REQUEST',
  OTP_VERIFY: 'OTP_VERIFY',
  
  // User Management
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_SUSPEND: 'USER_SUSPEND',
  
  // Provider Management
  PROVIDER_CREATE: 'PROVIDER_CREATE',
  PROVIDER_UPDATE: 'PROVIDER_UPDATE',
  PROVIDER_VERIFY: 'PROVIDER_VERIFY',
  
  // Booking Management
  BOOKING_CREATE: 'BOOKING_CREATE',
  BOOKING_ACCEPT: 'BOOKING_ACCEPT',
  BOOKING_DECLINE: 'BOOKING_DECLINE',
  BOOKING_CANCEL: 'BOOKING_CANCEL',
  BOOKING_COMPLETE: 'BOOKING_COMPLETE',
  
  // Payment Management
  PAYMENT_INITIATE: 'PAYMENT_INITIATE',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUND: 'PAYMENT_REFUND',
  
  // Dispute Management
  DISPUTE_CREATE: 'DISPUTE_CREATE',
  DISPUTE_RESOLVE: 'DISPUTE_RESOLVE',
  
  // Admin Actions
  ADMIN_USER_SUSPEND: 'ADMIN_USER_SUSPEND',
  ADMIN_TRANSACTION_ADJUST: 'ADMIN_TRANSACTION_ADJUST',
  ADMIN_COMMISSION_UPDATE: 'ADMIN_COMMISSION_UPDATE'
} as const;

// Helper functions for common audit scenarios
export const auditHelpers = {
  /**
   * Log user authentication
   */
  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await auditLogger.logAction({
      userId,
      action: AUDIT_ACTIONS.LOGIN,
      resource: 'USER',
      resourceId: userId,
      details: { timestamp: new Date() },
      ipAddress,
      userAgent
    });
  },

  /**
   * Log booking creation
   */
  async logBookingCreation(bookingId: string, customerId: string, providerId: string, amount: number): Promise<void> {
    await auditLogger.logAction({
      userId: customerId,
      action: AUDIT_ACTIONS.BOOKING_CREATE,
      resource: 'BOOKING',
      resourceId: bookingId,
      details: { providerId, amount, currency: 'GHS' }
    });
  },

  /**
   * Log payment transaction
   */
  async logPaymentTransaction(transactionId: string, userId: string, amount: number, status: string): Promise<void> {
    await auditLogger.logAction({
      userId,
      action: status === 'SUCCESS' ? AUDIT_ACTIONS.PAYMENT_SUCCESS : AUDIT_ACTIONS.PAYMENT_FAILED,
      resource: 'TRANSACTION',
      resourceId: transactionId,
      details: { amount, currency: 'GHS', status }
    });
  },

  /**
   * Log admin actions
   */
  async logAdminAction(adminId: string, action: string, resource: string, resourceId: string, details: any): Promise<void> {
    await auditLogger.logAction({
      userId: adminId,
      action,
      resource,
      resourceId,
      details: { ...details, adminAction: true }
    });
  }
};
