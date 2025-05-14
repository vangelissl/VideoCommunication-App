import express from 'express';
import * as userController from '../controllers/userController.js';
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/login', userController.login_user_get);

router.post('/login', userController.login_user_post);

router.get('/register', userController.register_user_get);

router.post('/register', userController.register_user_post);

export default router;