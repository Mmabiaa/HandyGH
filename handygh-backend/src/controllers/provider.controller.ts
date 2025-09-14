import { Request, Response } from 'express';
import { ProviderService } from '../services/provider.service';
import { z } from 'zod';

const providerService = new ProviderService();

// Schema for provider creation
const createProviderSchema = z.object({
  userId: z.string(),
  businessName: z.string().optional(),
  categories: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

// Schema for updating provider profile
const updateProviderSchema = z.object({
  businessName: z.string().optional(),
  categories: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
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

// Controller to get all providers with filters
export const getProviders = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const providers = await providerService.getProviders(filters);
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
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