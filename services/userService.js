import db from '../models/db.js';

export const findUserById = async (userId) => {
	return await db.User.findOne({
		where: {
			id: userId,
		},
	});
};