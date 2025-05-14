import jwt from 'jsonwebtoken';
import process from 'process';
import db from '../models/db.js';

export const generateRefreshToken = async (id, email, username) => {
	// Generate refresh token for user
	const refreshToken = jwt.sign({
		id: id,
		email: email,
		username: username,
	},
		process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: '10d',
	});

	// Set valid expiration time in miliseconds 
	const expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	// Check if old refresh tokens are still in db and delete them
	revokeRefreshToken(id);

	// Create new token object in db
	return await db.RefreshToken.create({
		user_id: id,
		token: refreshToken,
		expires_at: expirationTime,
	});
};

export const generateAccessToken = (id, email, username) => {
	return jwt.sign(
		{
			id: id,
			email: email,
			username: username,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '1h' }
	);
}

export const saveAccessTokenAsCookie = (token, res) => {
	res.cookie('accessToken', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 3600000, // 1 hour
	});
}

export const saveRefreshTokenAsCookie = (token, res) => {
	res.cookie('refreshToken', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 3600000, // 1 hour
	});
}




export const findRefreshToken = async (token) => {
	return await db.RefreshToken.findOne({
		where: {
			token: token,
		}
	});
};

export const revokeRefreshToken = async (userId) => {
	await db.RefreshToken.destroy({
		where: {
			user_id: userId,
		}
	});
}

