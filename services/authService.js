import db from '../models/db';
import { comparePasswords } from './securityService.js';

export async function registerNewUser(username, firstName, lastName, email, plainPassword) {
	if (emailDoesNotExist(email) && usernameDoesNotExist(username)) {
		return await db.User.create({
			username: username,
			email: email,
			password_hash: plainPassword,
			first_name: firstName,
			last_name: lastName,
		});
	}
	throw new Error("Cannot register new user, invalid email or username");
}

export const emailDoesNotExist = async (email) => {
	// Check if email is unique
	let existingUser = await findUserByEmail(email);

	if (existingUser !== null) {
		throw new Error("User with this email already exists");
	}

	return true;
};

export const usernameDoesNotExist = async (username) => {
	// Check if username is unique
	let existingUser = await findUserByUsername(username);

	if (existingUser !== null) {
		throw new Error("User with this username already exists");
	}

	return true;
};

export async function loginUser(email, plainPassword) {
	// Check if user with this email exists 
	let existingUser = await findUserByEmail(email);

	if (existingUser === null) {
		throw new Error("User with this email does not exist");
	}

	// Check if password is correct
	let hashedPassword = existingUser.password_hash;

	if (!comparePasswords(plainPassword, hashedPassword)) {
		throw new Error("Password is incorrect");
	}

	return existingUser;
}

export async function findUserByEmail(email) {
	return await db.User.findOne({ where: { username: email } });
}

export async function findUserByUsername(username) {
	return await db.User.findOne({ where: { username: username } });
}