import express from 'express';
import {
  createConversation,
  getUserConversations,
  getConversationById,
  deleteConversation
} from '../controllers/conversationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createConversation);
router.get('/', verifyToken, getUserConversations);
router.get('/:id', verifyToken, getConversationById);
router.delete('/:id', verifyToken, deleteConversation);

export default router;
