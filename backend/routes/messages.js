import express from 'express';
import {
  sendMessage,
  getConversationMessages,
  deleteMessage,
  markMessageAsRead
} from '../controllers/messageController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, sendMessage);
router.get('/conversation/:conversationId', verifyToken, getConversationMessages);
router.delete('/:id', verifyToken, deleteMessage);
router.put('/:messageId/read', verifyToken, markMessageAsRead);

export default router;
