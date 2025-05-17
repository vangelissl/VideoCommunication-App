import express from 'express';
import { authenticateToken } from '../middleware/jwtAuth';
import db from '../models/db.js';
const router = express.Router();

/* GET meeting room preferences page */
router.get('/', authenticateToken, (req, res, next) => {
	// render room create page with all available preferences
});

/* POST meeting room preferences */
router.post('/', authenticateToken, (req, res, next) => {
	const user = req.user;

	
});

router.get('/id:roomId', (req, res, next) => {
	// render ongoing meeting call page with all the participants
});

export default router;