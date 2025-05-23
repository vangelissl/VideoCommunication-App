import bcrypt from "bcryptjs"

export async function hashPassword(password) {
	// Generate salt
	const salt = await bcrypt.genSalt(10);  

	// Hash password with salt
	const hashedPassword = await bcrypt.hash(password, salt);  

	return hashedPassword;
}

export async function comparePasswords(password, hashedPassword) {
	// Compare provided password with hashed one
	return await bcrypt.compare(password, hashedPassword);
}