import { PrismaClient } from '@prisma/client';
import { Provider, ProviderService } from '../models/prisma/schema.prisma';
import { CreateProviderDto, UpdateProviderDto } from '../types/provider.d';
import { NotFoundError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

class ProviderService {
  async createProvider(data: CreateProviderDto): Promise<Provider> {
    return await prisma.provider.create({
      data,
    });
  }

  async getProviderById(id: string): Promise<Provider | null> {
    return await prisma.provider.findUnique({
      where: { id },
      include: { services: true },
    });
  }

  async updateProvider(id: string, data: UpdateProviderDto): Promise<Provider> {
    const provider = await prisma.provider.findUnique({ where: { id } });
    if (!provider) {
      throw new NotFoundError('Provider not found');
    }
    return await prisma.provider.update({
      where: { id },
      data,
    });
  }

  async getProviders(filters: any): Promise<Provider[]> {
    const { category, latitude, longitude, radius, rating, priceRange } = filters;

    // Implement geospatial search and filtering logic here

    return await prisma.provider.findMany({
      where: {
        ...(category && { categories: { hasSome: category } }),
        ...(rating && { ratingAvg: { gte: rating } }),
        // Add more filters as needed
      },
    });
  }

  async addServiceToProvider(providerId: string, serviceData: ProviderService): Promise<ProviderService> {
    return await prisma.providerService.create({
      data: {
        ...serviceData,
        provider: { connect: { id: providerId } },
      },
    });
  }

  async updateService(providerId: string, serviceId: string, serviceData: ProviderService): Promise<ProviderService> {
    return await prisma.providerService.update({
      where: { id: serviceId },
      data: serviceData,
    });
  }
}

export default new ProviderService();