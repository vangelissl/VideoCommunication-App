import jwt from 'jsonwebtoken';
import process from 'process';
import { generateAccessToken, saveAccessTokenAsCookie } from '../services/authTokenService.js';

/**
 * Middleware function that checks jwt access token of current user and decides whether the user has permission or no
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export const authenticateToken = (req, res, next) => {
	const accessToken = req.cookies.accessToken;

	if (!accessToken) return res.redirect('/auth/login?error=No+access+token+provided');

	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			// If access token is expired, try using refresh token
			if (err.name === 'TokenExpiredError') {
				return refreshAccessToken(req, res, next);
			}
			return res.redirect('/auth/login?error=Invalid+token');
		}

		req.user = user;
		next();
	});
};

/**
 * Creates 
 * @param {*} role 
 * @returns 
 */
export const requireRole = (role) => {
	return (req, res, next) => {
		if (req.user.role !== role) {
			return res.status(403).json({ message: "Forbidden" });
		}
		next();
	};
};

export const refreshAccessToken = async (req, res, next) => {
	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		return res.redirect('/auth/login?error=No+refresh+token+provided');;
	}

	try {
		// Verify the refresh token
		const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

		// Verify the token exists in the database
		const storedToken = await findRefreshToken(refreshToken);
		if (!storedToken) {
			return res.redirect('/auth/login?error=Refresh+token+revoked+or+invalid');;
		}

		// Create a new access token
		const accessToken = generateAccessToken(user.id, user.email, user.username);

		// Set the new access token in the cookie
		saveAccessTokenAsCookie(accessToken, res);

		// Continue with the authenticated user
		req.user = user;
		next();
	} catch (error) {
		return res.redirect('/auth/login?error=Invalid+refresh+token');;
	}
};

/**
 * Middleware to check if a user is already logged in
 * Redirects them away from login/register pages if they have a valid token
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const redirectIfLoggedIn = (req, res, next) => {
	const accessToken = req.cookies.accessToken;

	// If no token exists, they're not logged in, so continue to login/register page
	if (!accessToken) {
		return next();
	}

	// Try to verify the token
	try {
		const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
		// If token is valid, user is logged in, redirect to home or dashboard
		return res.redirect('/'); // Or redirect to dashboard: '/dashboard'
	} catch (err) {
		// If token is invalid or expired, they're effectively not logged in
		if (err.name === 'TokenExpiredError') {
			// Optionally try to refresh their token before deciding they're not logged in
			const refreshToken = req.cookies.refreshToken;

			if (refreshToken) {
				try {
					const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
					// If refresh token is valid, they're still logged in, redirect
					return res.redirect('/');
				} catch (refreshErr) {
					// If refresh token is also invalid, they can proceed to login
					return next();
				}
			}
		}
		// Continue to login/register page
		return next();
	}
};

/**
 * Middleware to add user if authenticated and renew access token if refresh one is valid
 * Provides otionall authentification, used to alter UI based on auth status 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const getUserIfAuth = (req, res, next) => {
	const accessToken = req.cookies.accessToken;

	// Default to not logged in
	req.user = null;

	if (!accessToken) {
		return next();
	}

	try {
		// Try to verify the access token
		const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
		// If token is valid, set isLoggedIn to true and add user data to locals
		req.user = {
			id: user.id,
			email: user.email,
			role: user.role
		};
		return next();
	} catch (err) {
		// If token is expired, try the refresh token
		if (err.name === 'TokenExpiredError') {
			const refreshToken = req.cookies.refreshToken;

			if (refreshToken) {
				try {
					const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

					// If refresh token is valid, they're still logged in, create a new access token
					const accessToken = generateAccessToken(user.id, user.email, user.username);

					// Set the new access token in the cookie
					saveAccessTokenAsCookie(accessToken, res);

					req.user = user;
					return next();
				} catch (refreshErr) {
					// Invalid refresh token, proceed without user
					return next();
				}
			}
		}
		// Continue without user
		return next();
	}
};