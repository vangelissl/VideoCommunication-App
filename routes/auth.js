import express from 'express';
import * as userController from '../controllers/userController.js';
import { redirectIfLoggedIn, getUserIfAuth } from '../middleware/jwtAuth.js';
const router = express.Router();

/* GET register page. */
router.get('/login', redirectIfLoggedIn, userController.login_user_get);

/* POST user register info from register page. */
router.post('/login', redirectIfLoggedIn, userController.login_user_post);

/* GET login page. */
router.get('/register', redirectIfLoggedIn, userController.register_user_get);

/* POST user login data from login page. */
router.post('/register', redirectIfLoggedIn, userController.register_user_post);

/* GET for logout. */
router.get('/logout', getUserIfAuth, userController.logout);

export default router;