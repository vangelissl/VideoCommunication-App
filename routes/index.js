import express from 'express';
import { getUserIfAuth } from '../middleware/jwtAuth.js';
var router = express.Router();

/* GET home page. */
router.get('/', getUserIfAuth, function(req, res, next) {
  res.render('index', {
	title: 'Home',
	user: req.user,
  });
});

export default router;