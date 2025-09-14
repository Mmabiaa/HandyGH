import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { User } from '../models/prisma/schema.prisma';

const adminService = new AdminService();

// List all users with optional filters
export const listUsers = async (req: Request, res: Response) => {
    try {
        const filters = req.query;
        const users: User[] = await adminService.listUsers(filters);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};

// Verify a provider
export const verifyProvider = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await adminService.verifyProvider(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error verifying provider', error });
    }
};

// Resolve a dispute
export const resolveDispute = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { resolution } = req.body;
    try {
        const result = await adminService.resolveDispute(id, resolution);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error resolving dispute', error });
    }
};

// Get disputes
export const listDisputes = async (req: Request, res: Response) => {
    try {
        const disputes = await adminService.listDisputes();
        res.status(200).json(disputes);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving disputes', error });
    }
};