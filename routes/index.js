import express from 'express';
import * as userController from '../controllers/userController.js';
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});



export default router;