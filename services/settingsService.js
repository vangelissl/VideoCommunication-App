import db from '../models/db.js';

export async function createUserSettings(userId) {
	return await db.UserSettings.create({ user_id: userId });
}