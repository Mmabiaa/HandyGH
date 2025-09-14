import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { z } from 'zod';

const messageSchema = z.object({
  bookingId: z.string().uuid(),
  content: z.string().min(1).max(500),
  attachments: z.array(z.string().url()).optional(),
});

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const validatedData = messageSchema.parse(req.body);
    const message = await MessageService.createMessage(validatedData);
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.errors || 'Invalid input' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const messages = await MessageService.getMessagesByBookingId(id);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};