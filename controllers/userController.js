import asyncHandler from 'express-async-handler';
import { emailDoesNotExist, usernameDoesNotExist, registerNewUser } from '../services/authService.js';
import { body, validationResult } from 'express-validator';
import { createUserSettings } from '../services/settingsService.js';


export const register_user = [
	body("username")
		.isAlphanumeric()
		.withMessage("Username has non-alphanumeric characters.")
		.custom(value => usernameDoesNotExist(value)),
	body('first-name')
		.trim()
		.notEmpty().withMessage('First name is required')
		.isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
		.matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/).withMessage('First name must only contain letters'),
	body('last-name')
		.trim()
		.notEmpty().withMessage('Last name is required')
		.isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
		.matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/).withMessage('Last name must only contain letters'),
	body('email')
		.trim()
		.notEmpty().withMessage('Email is required')
		.isEmail().withMessage('Invalid email address')
		.normalizeEmail()
		.custom(value => emailDoesNotExist(value)),
	body('password')
		.notEmpty().withMessage('Password is required')
		.isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
		.matches(/\d/).withMessage('Password must contain at least one number')
		.matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
		.matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
	body('confirm-password')
		.notEmpty().withMessage('Confirm password is required')
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Passwords do not match');
			}
			return true;
		}),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('register', {
				title: "Register",
				user: req.body,
				errors: errors.array(),
			});
		} else {
			try {
				const { username, firstName, lastName, email, password } = req.body;

				// Register new user
				const registeredUser = await registerNewUser(username, firstName, lastName, email, password);

				// Create user settings after registration
				await createUserSettings(registeredUser.id);

				// Redirect to login page or home page after successful registration
				res.redirect('/login', {});

			} catch (error) {
				next(error)
			}
		}
	})]; 