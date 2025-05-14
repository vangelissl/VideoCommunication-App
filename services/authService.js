import db from '../models/db.js';
import { comparePasswords } from './securityService.js';

export async function registerNewUser(username, firstName, lastName, email, plainPassword) {
	return await db.User.create({
		username: username,
		email: email,
		password_hash: plainPassword,
		first_name: firstName,
		last_name: lastName,
	});
}

export const emailDoesExist = async (email, flag = true) => {
	// Check if email is unique
	let existingUser = await findUserByEmail(email);

	return (existingUser !== null) === flag;
};

export const usernameDoesExist = async (username, flag = true) => {
	// Check if username is unique
	let existingUser = await findUserByUsername(username);

	return (existingUser !== null) === flag;
};

export async function passwordIsValid(password, hashedPassword) {
	if (!comparePasswords(password, hashedPassword)) {
		throw new Error("Password is incorrect");
	}

	return true;
};

export async function findUserByEmail(email) {
	return await db.User.findOne({ where: { email: email } });
};

export async function findUserByUsername(username) {
	return await db.User.findOne({ where: { username: username } });
};