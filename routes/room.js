import express from 'express';
import { authenticateToken } from '../middleware/jwtAuth.js';
import * as roomController from '../controllers/roomController.js';
import db from '../models/db.js';
const router = express.Router();

/* GET meeting room preferences page */
router.get('/', authenticateToken, roomController.get_room_preferences);

/* POST meeting room preferences */
router.post('/', authenticateToken, roomController.post_room_preferences);

router.get('/id:roomId', (req, res, next) => {
	// render ongoing meeting call page with all the participants
});

export default router;