import { Request, Response } from 'express';
import { ProviderService } from '../services/provider.service';
import { z } from 'zod';

const providerService = new ProviderService();

// Schema for provider creation - aligned with FR-2
const createProviderSchema = z.object({
  userId: z.string(),
  businessName: z.string().optional(),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  profilePhoto: z.string().url().optional(),
  verificationDocument: z.string().url().optional(),
  services: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    priceType: z.enum(['HOURLY', 'FIXED']),
    priceAmount: z.number().positive(),
    durationMinutes: z.number().positive().optional()
  })).min(1, 'At least one service is required')
});

// Schema for updating provider profile
const updateProviderSchema = z.object({
  businessName: z.string().optional(),
  categories: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  profilePhoto: z.string().url().optional(),
  verificationDocument: z.string().url().optional(),
  services: z.array(z.object({
    id: z.string().optional(), // For updating existing services
    title: z.string(),
    description: z.string().optional(),
    priceType: z.enum(['HOURLY', 'FIXED']),
    priceAmount: z.number().positive(),
    durationMinutes: z.number().positive().optional(),
    isActive: z.boolean().optional()
  })).optional()
});

// Controller to create a provider profile
export const createProvider = async (req: Request, res: Response) => {
  try {
    const validatedData = createProviderSchema.parse(req.body);
    const provider = await providerService.createProvider(validatedData);
    res.status(201).json(provider);
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

// Controller to get all providers with filters - aligned with FR-5
export const getProviders = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      lat, 
      lon, 
      radius = 5, 
      priceMin, 
      priceMax, 
      rating, 
      verified, 
      available,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      category: category as string,
      latitude: lat ? parseFloat(lat as string) : undefined,
      longitude: lon ? parseFloat(lon as string) : undefined,
      radius: parseFloat(radius as string),
      priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
      priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
      rating: rating ? parseFloat(rating as string) : undefined,
      verified: verified === 'true',
      available: available === 'true',
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await providerService.searchProviders(filters);
    
    res.status(200).json({
      success: true,
      data: result.providers,
      meta: {
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(result.total / filters.limit)
      },
      errors: null
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      data: null,
      errors: { message: 'Internal Server Error' },
      meta: null
    });
  }
};

// Controller to get provider details
export const getProviderById = async (req: Request, res: Response) => {
  try {
    const providerId = req.params.id;
    const provider = await providerService.getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller to update provider profile
export const updateProvider = async (req: Request, res: Response) => {
  try {
    const providerId = req.params.id;
    const validatedData = updateProviderSchema.parse(req.body);
    const updatedProvider = await providerService.updateProvider(providerId, validatedData);
    res.status(200).json(updatedProvider);
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

// Controller to add a service to a provider
export const addServiceToProvider = async (req: Request, res: Response) => {
  try {
    const providerId = req.params.id;
    const serviceData = req.body; // Assume service data is validated elsewhere
    const service = await providerService.addService(providerId, serviceData);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller to update a service
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id, serviceId } = req.params;
    const serviceData = req.body; // Assume service data is validated elsewhere
    const updatedService = await providerService.updateService(id, serviceId, serviceData);
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};