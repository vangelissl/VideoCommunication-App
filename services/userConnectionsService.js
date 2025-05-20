import db from '../models/db.js';

export const createUserConnection = async ({
	userId,
	meetingSessionId,
	peerId,
	socketId }) => {
	return await db.UserConnection.create({
		user_id: userId,
		meeting_session_id: meetingSessionId,
		peer_id: peerId,
		socket_id: socketId,
		connection_status: 'connected',
		join_time: new Date(),
	});
};

export const findUserByConnectionId = async (connectionId) => {
	const user = await db.UserConnection.findOne({
		where: {
			id: connectionId
		}
	});

	return {
		username: user.username,
		fullname: user.fullname,
	};
};