import express from 'express';
import { getAllUsers, searchUsers, getUserById, updateUserProfile } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getAllUsers);
router.get('/search', verifyToken, searchUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUserProfile);

export default router;
