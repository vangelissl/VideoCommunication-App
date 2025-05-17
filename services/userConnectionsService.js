import db from '../models/db.js';

export const createUserConnection = async (userId, meetingSessionId, peerId, socketId) => {
	return await db.UserConnection.create({
		user_id: userId,
		meeting_session_id: meetingSessionId,
		peer_id: peerId,
		socket_id: socketId,
	});
};