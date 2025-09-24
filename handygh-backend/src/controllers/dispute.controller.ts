import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../models/prismaClient';
import { auditHelpers } from '../utils/audit';
import { notificationService } from '../utils/notification';

const createDisputeSchema = z.object({
  bookingId: z.string().nonempty(),
  reason: z.string().min(10).max(500),
  description: z.string().min(20).max(1000),
  evidence: z.array(z.string().url()).optional()
});

const resolveDisputeSchema = z.object({
  resolution: z.string().min(10).max(500),
  refundAmount: z.number().min(0).optional(),
  providerPenalty: z.boolean().optional()
});

// Create dispute - FR-22
export const createDispute = async (req: Request, res: Response) => {
  try {
    const validatedData = createDisputeSchema.parse(req.body);
    const { bookingId, reason, description, evidence = [] } = validatedData;

    // Check if booking exists and user has access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        provider: { include: { user: true } }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        data: null,
        errors: { message: 'Booking not found' },
        meta: null
      });
    }

    // Check if user is involved in the booking
    if (booking.customer_id !== req.user.id && booking.provider_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        errors: { message: 'You are not authorized to dispute this booking' },
        meta: null
      });
    }

    // Check if dispute already exists
    const existingDispute = await prisma.dispute.findUnique({
      where: { booking_id: bookingId }
    });

    if (existingDispute) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: { message: 'A dispute already exists for this booking' },
        meta: null
      });
    }

    // Check if booking is within dispute window (7 days)
    const disputeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const bookingAge = Date.now() - booking.created_at.getTime();
    
    if (bookingAge > disputeWindow) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: { message: 'Dispute window has expired (7 days)' },
        meta: null
      });
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        booking_id: bookingId,
        reason,
        description,
        evidence,
        status: 'OPEN'
      }
    });

    // Notify admin
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    for (const admin of adminUsers) {
      await notificationService.sendDisputeRaisedNotification(
        bookingId,
        admin.id,
        reason
      );
    }

    // Log dispute creation
    await auditHelpers.logAdminAction(
      req.user.id,
      'DISPUTE_CREATE',
      'DISPUTE',
      dispute.id,
      { bookingId, reason }
    );

    res.status(201).json({
      success: true,
      data: dispute,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to create dispute' },
      meta: null
    });
  }
};

// Get disputes for admin - FR-22, FR-23
export const getDisputes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    
    const whereClause: any = {};
    if (status) whereClause.status = status;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where: whereClause,
        include: {
          booking: {
            include: {
              customer: { select: { name: true, email: true, phone: true } },
              provider: { 
                include: { 
                  user: { select: { name: true, email: true, phone: true } } 
                } 
              }
            }
          }
        },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' }
      }),
      prisma.dispute.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: disputes,
      meta: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      },
      errors: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to fetch disputes' },
      meta: null
    });
  }
};

// Get dispute details
export const getDisputeDetails = async (req: Request, res: Response) => {
  try {
    const { disputeId } = req.params;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: {
          include: {
            customer: true,
            provider: { include: { user: true } },
            transactions: true,
            messages: {
              orderBy: { created_at: 'desc' },
              take: 10
            }
          }
        }
      }
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        data: null,
        errors: { message: 'Dispute not found' },
        meta: null
      });
    }

    res.status(200).json({
      success: true,
      data: dispute,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to fetch dispute details' },
      meta: null
    });
  }
};

// Resolve dispute - FR-23
export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { disputeId } = req.params;
    const validatedData = resolveDisputeSchema.parse(req.body);
    const { resolution, refundAmount, providerPenalty } = validatedData;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        booking: {
          include: {
            customer: true,
            provider: { include: { user: true } }
          }
        }
      }
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        data: null,
        errors: { message: 'Dispute not found' },
        meta: null
      });
    }

    // Update dispute status
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'RESOLVED',
        resolution,
        updated_at: new Date()
      }
    });

    // Handle refund if applicable
    if (refundAmount && refundAmount > 0) {
      // Create refund transaction
      await prisma.transaction.create({
        data: {
          booking_id: dispute.booking_id,
          txn_provider: 'DISPUTE_REFUND',
          amount: refundAmount,
          currency: 'GHS',
          status: 'SUCCESS',
          metadata: {
            type: 'DISPUTE_REFUND',
            disputeId,
            resolvedBy: req.user.id
          }
        }
      });

      // Update booking payment status
      await prisma.booking.update({
        where: { id: dispute.booking_id },
        data: { payment_status: 'REFUNDED' }
      });
    }

    // Handle provider penalty
    if (providerPenalty) {
      // Update provider rating or apply penalty
      await prisma.provider.update({
        where: { id: dispute.booking.provider_id },
        data: {
          rating_avg: Math.max(0, Number(dispute.booking.provider.rating_avg) - 0.5)
        }
      });
    }

    // Notify involved parties
    await notificationService.sendNotification({
      userId: dispute.booking.customer_id,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute Resolved',
      message: `Your dispute has been resolved: ${resolution}`,
      data: { disputeId, refundAmount },
      channels: ['email', 'push']
    });

    await notificationService.sendNotification({
      userId: dispute.booking.provider.user_id,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute Resolved',
      message: `The dispute for booking ${dispute.booking_id} has been resolved.`,
      data: { disputeId },
      channels: ['email', 'push']
    });

    // Log dispute resolution
    await auditHelpers.logAdminAction(
      req.user.id,
      'DISPUTE_RESOLVE',
      'DISPUTE',
      disputeId,
      { resolution, refundAmount, providerPenalty }
    );

    res.status(200).json({
      success: true,
      data: updatedDispute,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to resolve dispute' },
      meta: null
    });
  }
};

// Close dispute
export const closeDispute = async (req: Request, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { reason } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'CLOSED',
        resolution: reason,
        updated_at: new Date()
      }
    });

    // Log dispute closure
    await auditHelpers.logAdminAction(
      req.user.id,
      'DISPUTE_CLOSE',
      'DISPUTE',
      disputeId,
      { reason }
    );

    res.status(200).json({
      success: true,
      data: dispute,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to close dispute' },
      meta: null
    });
  }
};
