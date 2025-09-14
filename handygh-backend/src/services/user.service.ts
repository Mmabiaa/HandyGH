import { PrismaClient } from '@prisma/client';
import { User } from '../types/user.d';
import { hashPassword } from '../utils/crypto';
import { NotFoundError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

class UserService {
  async createUser(data: User): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash: hashedPassword,
      },
    });
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.getUserById(id);
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    return await prisma.user.delete({
      where: { id: user.id },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany();
  }
}

export const userService = new UserService();