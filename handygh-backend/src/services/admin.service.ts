import { PrismaClient } from '@prisma/client';
import { User } from '../models/prisma/schema.prisma';
import { Dispute } from '../models/prisma/schema.prisma';

const prisma = new PrismaClient();

class AdminService {
  async listUsers(filters: any) {
    return await prisma.user.findMany({
      where: {
        ...filters,
      },
    });
  }

  async verifyProvider(userId: string) {
    return await prisma.provider.update({
      where: { userId },
      data: { verified: true },
    });
  }

  async getDisputes() {
    return await prisma.dispute.findMany({
      include: {
        booking: true,
      },
    });
  }

  async resolveDispute(disputeId: string, resolution: string) {
    return await prisma.dispute.update({
      where: { id: disputeId },
      data: { resolution, status: 'RESOLVED' },
    });
  }

  async getTransactionReports() {
    // Implement logic to fetch transaction reports
    // This could involve aggregating data from the Transaction model
  }
}

export default new AdminService();