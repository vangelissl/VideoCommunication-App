import asyncHandler from 'express-async-handler';
import { emailDoesExist, findUserByEmail, usernameDoesExist, registerNewUser, passwordIsValid } from '../services/authService.js';
import { body, validationResult } from 'express-validator';
import { createUserSettings } from '../services/settingsService.js';
import { generateAccessToken, generateRefreshToken, saveAccessTokenAsCookie, saveRefreshTokenAsCookie } from '../services/authTokenService.js';


export const register_user_get = asyncHandler(async (req, res, next) => {
	res.render('register', {
		title: 'Register',
		user: null,
		errors: null
	});
});

export const register_user_post = [
	body("username")
		.isAlphanumeric()
		.withMessage("Username has non-alphanumeric characters.")
		.custom(async value => await usernameDoesExist(value, false)),
	body('firstName')
		.trim()
		.notEmpty().withMessage('First name is required')
		.isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
		.matches(/^[A-Za-zÀ-ÖØ-öø-ÿА-Яа-яІіЇїЄєҐґ'-]+$/u)
		.withMessage('First name must only contain letters'),
	body('lastName')
		.trim()
		.notEmpty().withMessage('Last name is required')
		.isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
		.matches(/^[A-Za-zÀ-ÖØ-öø-ÿА-Яа-яІіЇїЄєҐґ'-]+$/u)
		.withMessage('Last name must only contain letters'),
	body('email')
		.trim()
		.notEmpty().withMessage('Email is required')
		.isEmail().withMessage('Invalid email address')
		.normalizeEmail()
		.custom(async value => await emailDoesExist(value, false)),
	body('password')
		.notEmpty().withMessage('Password is required')
		.isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
		.matches(/\d/).withMessage('Password must contain at least one number')
		.matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
		.matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
	body('confirmedPassword')
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
				const registeredUser = await registerNewUser(username, firstName, lastName, email, password);
				await createUserSettings(registeredUser.id);

				// Redirect to login page or home page after successful registration
				res.redirect('/login');
			} catch (error) {
				next(error)
			}
		}
	})];

export const login_user_get = asyncHandler(async (req, res, next) => {
	res.render('login', {
		title: 'Login',
		user: null,
		errors: null,
	});
});

export const login_user_post = [
	body('email')
		.trim()
		.notEmpty().withMessage('Email is required')
		.isEmail().withMessage('Invalid email address')
		.normalizeEmail()
		.custom(async value => await emailDoesExist(value)),
	body('password')
		.notEmpty().withMessage('Password is required')
		.custom(async (value, { req }) => {
			const user = await findUserByEmail(req.body.email);

			return await passwordIsValid(value, user.password_hash);
		})
		.withMessage('Incorrect password'),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.render('login', {
				title: 'Login',
				user: {
					email: req.body.email,
					password: req.body.password,
				},
				errors: errors.array(),
			});
		} else {
			// Get authenticated user
			const user = await findUserByEmail(req.body.email);

			// Generate refresh token and save it to db
			const refreshToken = await generateRefreshToken(user.id, user.email, user.role);

			// Generate access token 
			const accessToken = generateAccessToken(user.id, user.email, user.role);

			// Store both tokens in httpOnly cookies
			saveAccessTokenAsCookie(accessToken, res);
			saveRefreshTokenAsCookie(refreshToken, res);

			res.redirect('/');
		}
	}),
];

export const logout = async (req, res) => {
	// Clear cookies
	res.clearCookie('accessToken');
	res.clearCookie('refreshToken');

	// Revoke the refresh token in the database if user is authenticated
	if (req.user && req.user.id) {
		await revokeRefreshToken(req.user.id);
	}

	res.redirect('/login?success=Logged+out+successfully');
};