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

export const emailDoesExist = async (email, shouldExist = true) => {
  // Check if email exists in database
  const existingUser = await findUserByEmail(email);
  const doesExist = existingUser !== null;
  
  if (shouldExist === doesExist) {
    return true; // Validation passes
  } else {
    // This makes the validation fail with a custom error
    return Promise.reject(
      shouldExist 
        ? 'Email address not found' 
        : 'Email address already in use'
    );
  }
};

export const usernameDoesExist = async (username, shouldExist = true) => {
  // Check if username exists in database
  const existingUser = await findUserByUsername(username);
  const doesExist = existingUser !== null;
  
  if (shouldExist === doesExist) {
    return true; // Validation passes
  } else {
    return Promise.reject(
      shouldExist 
        ? 'Username not found' 
        : 'Username already in use'
    );
  }
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