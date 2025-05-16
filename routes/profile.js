import express from 'express';
import { authenticateToken } from '../middleware/jwtAuth.js';
import { profile_get } from '../controllers/userController.js';
const router = express.Router();

router.get('/', authenticateToken, profile_get);

export default router;