import { Router } from 'express';
import { 
  getMessages, 
  sendMessage, 
  uploadAttachment 
} from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { messageSchema } from '../utils/validation';

const router = Router();

// Get chat history for a booking
router.get('/:id/messages', authMiddleware, getMessages);

// Send a message in a booking
router.post('/:id/messages', authMiddleware, validationMiddleware(messageSchema), sendMessage);

// Upload an attachment for a message
router.post('/:id/messages/upload', authMiddleware, uploadAttachment);

export default router;