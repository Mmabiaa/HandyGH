import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { z } from 'zod';

const messageSchema = z.object({
  bookingId: z.string().nonempty(),
  content: z.string().min(1).max(1000),
  attachments: z.array(z.string().url()).optional(),
});

const messageUpdateSchema = z.object({
  content: z.string().min(1).max(1000).optional(),
  attachments: z.array(z.string().url()).optional(),
});

// Send a message in a booking conversation - FR-18
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const validatedData = messageSchema.parse(req.body);
    const message = await MessageService.createMessage({
      ...validatedData,
      senderId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: message,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      data: null,
      errors: error.errors || { message: 'Invalid input' },
      meta: null
    });
  }
};

// Get messages for a specific booking - FR-18
export const getMessages = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  try {
    const result = await MessageService.getMessagesByBookingId(id, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      userId: req.user.id // Ensure user can only see messages from their bookings
    });
    
    res.status(200).json({
      success: true,
      data: result.messages,
      meta: {
        total: result.total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(result.total / parseInt(limit as string))
      },
      errors: null
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      data: null,
      errors: { message: 'Failed to retrieve messages' },
      meta: null
    });
  }
};

// Update a message (only sender can update)
export const updateMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  
  try {
    const validatedData = messageUpdateSchema.parse(req.body);
    const message = await MessageService.updateMessage(messageId, req.user.id, validatedData);
    
    res.status(200).json({
      success: true,
      data: message,
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      data: null,
      errors: { message: error.message || 'Failed to update message' },
      meta: null
    });
  }
};

// Delete a message (only sender can delete)
export const deleteMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  
  try {
    await MessageService.deleteMessage(messageId, req.user.id);
    
    res.status(200).json({
      success: true,
      data: { message: 'Message deleted successfully' },
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      data: null,
      errors: { message: error.message || 'Failed to delete message' },
      meta: null
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  
  try {
    await MessageService.markMessagesAsRead(bookingId, req.user.id);
    
    res.status(200).json({
      success: true,
      data: { message: 'Messages marked as read' },
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      data: null,
      errors: { message: error.message || 'Failed to mark messages as read' },
      meta: null
    });
  }
};

// Get unread message count for user
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await MessageService.getUnreadCount(req.user.id);
    
    res.status(200).json({
      success: true,
      data: { unreadCount: count },
      errors: null,
      meta: null
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      data: null,
      errors: { message: 'Failed to get unread count' },
      meta: null
    });
  }
};