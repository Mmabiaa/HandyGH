import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '../utils/validation';

const userService = new UserService();

// Create a new user profile
export const createUser = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await userService.createUser(validatedData);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user profile by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const validatedData = updateUserSchema.parse(req.body);
    const updatedUser = await userService.updateUser(userId, validatedData);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user profile
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    await userService.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};