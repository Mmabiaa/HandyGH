import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../models/prismaClient';
import { commissionService } from '../services/commission.service';
import { auditHelpers } from '../utils/audit';

// Admin dashboard statistics - FR-20
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {
      created_at: {
        gte: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        lte: endDate ? new Date(endDate as string) : new Date()
      }
    };

    // Get comprehensive statistics
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      totalRevenue,
      pendingDisputes,
      activeBookings,
      completedBookings,
      commissionStats
    ] = await Promise.all([
      prisma.user.count({ where: dateFilter }),
      prisma.provider.count({ where: { created_at: dateFilter.created_at } }),
      prisma.booking.count({ where: dateFilter }),
      prisma.transaction.aggregate({
        where: { 
          ...dateFilter,
          txn_provider: 'PLATFORM_COMMISSION',
          status: 'SUCCESS'
        },
        _sum: { amount: true }
      }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      commissionService.getCommissionSummary(
        dateFilter.created_at.gte!,
        dateFilter.created_at.lte!
      )
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          providers: totalProviders,
          customers: totalUsers - totalProviders
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
          pending: totalBookings - activeBookings - completedBookings
        },
        revenue: {
          total: Number(commissionStats.totalCommissions),
          payouts: Number(commissionStats.totalPayouts),
          net: Number(commissionStats.netRevenue),
          transactions: commissionStats.transactionCount
        },
        disputes: {
          pending: pendingDisputes
        }
      },
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to fetch dashboard statistics' },
      meta: null
    });
  }
};

// User management - FR-20
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    
    const whereClause: any = {};
    
    if (role) whereClause.role = role;
    if (status) whereClause.is_active = status === 'active';
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          provider: true,
          bookingsAsCustomer: {
            select: { id: true, status: true, total_amount: true }
          }
        },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: users,
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
      errors: { message: 'Failed to fetch users' },
      meta: null
    });
  }
};

// Suspend/ban users - FR-21
export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        is_active: false,
        updated_at: new Date()
      }
    });

    // Log admin action
    await auditHelpers.logAdminAction(
      req.user.id,
      'ADMIN_USER_SUSPEND',
      'USER',
      userId,
      { reason, duration, suspendedBy: req.user.id }
    );

    res.status(200).json({
      success: true,
      data: user,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to suspend user' },
      meta: null
    });
  }
};

// Transaction management - FR-20
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, type, startDate, endDate } = req.query;
    
    const whereClause: any = {};
    
    if (status) whereClause.status = status;
    if (type) whereClause.txn_provider = type;
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at.gte = new Date(startDate as string);
      if (endDate) whereClause.created_at.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          booking: {
            include: {
              customer: { select: { name: true, email: true } },
              provider: { 
                include: { 
                  user: { select: { name: true, email: true } } 
                } 
              }
            }
          }
        },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' }
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
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
      errors: { message: 'Failed to fetch transactions' },
      meta: null
    });
  }
};

// Manual transaction adjustment - FR-21
export const adjustTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { adjustment, reason } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        data: null,
        errors: { message: 'Transaction not found' },
        meta: null
      });
    }

    // Create adjustment transaction
    const adjustmentTransaction = await prisma.transaction.create({
      data: {
        booking_id: transaction.booking_id,
        txn_provider: 'ADMIN_ADJUSTMENT',
        amount: adjustment,
        currency: transaction.currency,
        status: 'SUCCESS',
        metadata: {
          type: 'ADMIN_ADJUSTMENT',
          originalTransactionId: transactionId,
          reason,
          adjustedBy: req.user.id
        }
      }
    });

    // Log admin action
    await auditHelpers.logAdminAction(
      req.user.id,
      'ADMIN_TRANSACTION_ADJUST',
      'TRANSACTION',
      transactionId,
      { adjustment, reason, newTransactionId: adjustmentTransaction.id }
    );

    res.status(200).json({
      success: true,
      data: adjustmentTransaction,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to adjust transaction' },
      meta: null
    });
  }
};

// Commission configuration - FR-20
export const updateCommissionConfig = async (req: Request, res: Response) => {
  try {
    const { percentage, minimumFee, maximumFee } = req.body;

    await commissionService.updateCommissionConfig({
      percentage,
      minimumFee,
      maximumFee
    });

    // Log admin action
    await auditHelpers.logAdminAction(
      req.user.id,
      'ADMIN_COMMISSION_UPDATE',
      'SYSTEM',
      'COMMISSION_CONFIG',
      { percentage, minimumFee, maximumFee }
    );

    res.status(200).json({
      success: true,
      data: { message: 'Commission configuration updated successfully' },
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to update commission configuration' },
      meta: null
    });
  }
};

// Export reports - FR-26
export const exportReports = async (req: Request, res: Response) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    const dateFilter = {
      created_at: {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      }
    };

    let data: any[] = [];

    switch (type) {
      case 'transactions':
        data = await prisma.transaction.findMany({
          where: dateFilter,
          include: {
            booking: {
              include: {
                customer: { select: { name: true, email: true } },
                provider: { 
                  include: { 
                    user: { select: { name: true, email: true } } 
                  } 
                }
              }
            }
          }
        });
        break;
      case 'bookings':
        data = await prisma.booking.findMany({
          where: dateFilter,
          include: {
            customer: { select: { name: true, email: true } },
            provider: { 
              include: { 
                user: { select: { name: true, email: true } } 
              } 
            }
          }
        });
        break;
      case 'users':
        data = await prisma.user.findMany({
          where: dateFilter,
          include: { provider: true }
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          data: null,
          errors: { message: 'Invalid report type' },
          meta: null
        });
    }

    // In a real implementation, you would generate CSV/Excel files
    res.status(200).json({
      success: true,
      data: { 
        type,
        count: data.length,
        data: data.slice(0, 100) // Limit for demo
      },
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      errors: { message: 'Failed to export reports' },
      meta: null
    });
  }
};