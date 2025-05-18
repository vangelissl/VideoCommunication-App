import db from '../models/db.js';

export const findUserById = async (userId) => {
	console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
	console.log(userId);
	return await db.User.findOne({
		where: {
			id: userId,
		},
	});
};