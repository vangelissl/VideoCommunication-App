import express from 'express';
import { authenticateToken } from '../middleware/jwtAuth.js';
import * as roomController from '../controllers/roomController.js';
const router = express.Router();

/* GET meeting room preferences page */
router.get('/', authenticateToken, roomController.get_room_preferences);

/* POST meeting room preferences */
router.post('/', authenticateToken, roomController.post_room_preferences);

/* GET meeting room */ 
router.get('/:roomId', authenticateToken, roomController.get_room);

export default router;