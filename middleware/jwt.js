import jwt from 'jsonwebtoken';
import process from 'process';
import { generateAccessToken, saveAccessTokenAsCookie } from '../services/authTokenService.js';


export const authenticateToken = (req, res, next) => {
	const accessToken = req.cookies.accessToken;

	if (!accessToken) return res.redirect('/login?error=No+access+token+provided');

	jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			// If access token is expired, try using refresh token
			if (err.name === 'TokenExpiredError') {
				return refreshAccessToken(req, res, next);
			}
			return res.redirect('/login?error=Invalid+token');
		}

		req.user = user;
		next();
	});
};

export const refreshAccessToken = async (req, res, next) => {
	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		return res.redirect('/login?error=No+refresh+token+provided');;
	}

	try {
		// Verify the refresh token
		const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

		// Verify the token exists in the database
		const storedToken = await findRefreshToken(refreshToken);
		if (!storedToken) {
			return res.redirect('/login?error=Refresh+token+revoked+or+invalid');;
		}

		// Create a new access token
		const accessToken = generateAccessToken(user.id, user.email, user.username);

		// Set the new access token in the cookie
		saveAccessTokenAsCookie(accessToken, res);

		// Continue with the authenticated user
		req.user = user;
		next();
	} catch (error) {
		return res.redirect('/login?error=Invalid+refresh+token');;
	}
};
