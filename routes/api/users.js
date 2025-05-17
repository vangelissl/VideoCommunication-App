import express from 'express';
import * as userController from '../../controllers/userController.js';
import asyncHandler from 'express-async-handler';
import { authenticateToken, requireRole } from '../../middleware/jwtAuth.js';
const router = express.Router();


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

export default router;
