import db from '../models/db.js';

export const createPrivateMessage = async (roomId, senderId, messageContent) => {
	return await db.PrivateChatMessage.create({
		room_id: roomId,
		sender_id: senderId,
		message_content: messageContent,
	});
};

export const createPrivateChatRoom = async (meetingId, senderId, recipientId, isActive) => {
	const roomKey = generateRoomKey(senderId, recipientId);
	console.log('meeting id in private chat room is ', meetingId);
	return await db.PrivateChatRoom.create({
		meeting_id: meetingId,
		room_key: roomKey,
		is_active: isActive,
	});
}

export const createPublicChatMessage = async (meetingId, senderId, messageContent) => {
	return await db.PublicChatMessage.create({
		meeting_id: meetingId,
		sender_id: senderId,
		message_content: messageContent,
		file_url: null,
	});
};

export const createPrivateChatRoomParticipant = async (roomId, userId) => {
	return await db.PrivateChatRoomParticipant.create({
		room_id: roomId,
		user_id: userId,
	});
};

export const findPrivateChatRoomByMeetingId = async (meetingId) => {
	return await db.PrivateChatRoom.findOne({
		where: {
			room_id: meetingId,
		},
	});
};

export const findPrivateChatRoomByRoomKey = async (senderId, recipientId) => {
	const roomKey = generateRoomKey(senderId, recipientId);

	return await db.PrivateChatRoom.findOne({
		where: {
			room_key: roomKey,
		},
	});
};

export const findPrivateChatRoomMessages = async (privateChatRoomId) => {
	const privateChatRoom = await db.findOne({
		where: {
			id: privateChatRoomId,
		},
	});

	return await privateChatRoom.getMessages();
}

const generateRoomKey = (userId1, userId2) => {
  const [a, b] = [userId1, userId2].sort();
  return `${a}_${b}`;
};

const decodeRoomKey = (roomKey) => {
	return roomKey.split('_');
};
