import { Router } from 'express';
import { 
  getMessages, 
  sendMessage,
  updateMessage,
  deleteMessage,
  markMessagesAsRead,
  getUnreadCount
} from '../controllers/message.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Get chat history for a booking - FR-18
router.get('/bookings/:id/messages', authenticateJWT, getMessages);

// Send a message in a booking - FR-18
router.post('/bookings/:id/messages', authenticateJWT, sendMessage);

// Update a message
router.patch('/messages/:messageId', authenticateJWT, updateMessage);

// Delete a message
router.delete('/messages/:messageId', authenticateJWT, deleteMessage);

// Mark messages as read
router.patch('/bookings/:bookingId/read', authenticateJWT, markMessagesAsRead);

// Get unread message count
router.get('/unread-count', authenticateJWT, getUnreadCount);

export default router;