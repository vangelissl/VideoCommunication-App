import { Server } from "socket.io";
import { createUserConnection } from '../services/userConnectionsService.js';
import { createPrivateChatRoom, createPrivateMessage, createPublicChatMessage, findPrivateChatRoomByRoomKey, findPrivateChatRoomByRoomKeyAndMeetingId } from '../services/chatService.js';
import { findUserById } from "../services/userService.js";
import { v4 } from "uuid";


let io;

export const initSocket = (server) => {
	io = new Server(server,
		{
			cors: {
				origin: "http://localhost:3000",
				methods: ["GET", "POST"]
			}
		}
	);

	console.log('Server has been initialized');

	initOnConnect();
};

export const getIo = () => {
	if (!io) throw new Error('Socket.io not initialized!');
	return io;
};

const initOnConnect = async () => {
	io.on('connection', async (socket) => {
		try {
			const userId = socket.handshake.auth.userId;  // should be passed from script
			const meetingId = socket.handshake.auth.meetingId;  // should be passed from script
			const meetingSessionId = socket.handshake.auth.meetingSessionId;
			const fullname = socket.handshake.auth.fullname; // or from your user store

			socket.on('peerId', async id => {
				// Create user connection for this particular meeting session
				const userConnection = await createUserConnection(
					{
						userId: userId,
						meetingSessionId: meetingSessionId,
						socketId: socket.id,
						peerId: id
					});
				
				// Save peer id to socket object
				socket.peerId = id;

				console.log('socket correctly received id of peer js: ', id);
			})

			socket.currentRoomId = meetingId;

			console.log('meeting id in socket: ', meetingId);

			// Get full user object
			const user = await findUserById(userId);



			// Handle user joining room where roomId is the meeting's id
			socket.on('joinRoom', async () => {
				socket.join(socket.currentRoomId);

				// Fetch all sockets in the room
				const participants = await fetchParticipantsInRoom(socket.currentRoomId);

				// Notify all users in the room with the current list of participants
				io.to(socket.currentRoomId).emit('participantsUpdate', participants);

				// Broadcast to others in room that a user joined
				socket.to(socket.currentRoomId).emit('userJoined', { socketId: socket.id, fullname });

				sendMessage(
					socket,
					'joinMessage',
					`${fullname} has joined the room`,
					null,
					'System',
					new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					true,
				);

			});

			// Handle public message sent
			socket.on('sendPublicMessage', async ({ message, recipient, sender, timestamp }) => {
				// Send message back to clients
				sendMessage(socket, 'publicMessage', message, recipient, sender, timestamp);
				console.log(socket.currentRoomId);
				// Save message to db
				await createPublicChatMessage(socket.currentRoomId, userId, message);
			});

			// Handle private message sent
			socket.on('sendPrivateMessage', async ({ message, recipient, sender, timestamp }) => {
				console.log('The recepient of the private message is: ', recipient);
				console.log('the recipient socket id: ', recipient.socketId);

				// Get private chat room if exists or create new
				let privateChatRoom = await findPrivateChatRoomByRoomKeyAndMeetingId(socket.currentRoomId, sender.id, recipient.id);
				if (!privateChatRoom) {
					console.log('meeting id on socket send private message is: ', socket.currentRoomId);
					privateChatRoom = await createPrivateChatRoom(socket.currentRoomId, sender.id, recipient.id);
				}

				// Create private message
				const privateMessage = await createPrivateMessage(privateChatRoom.id, sender.id, message);

				// Send private message back to clients
				sendPrivateMessage(socket, message, recipient, sender, timestamp);
				// await createPrivateChatMessage()
			});

			// Handle change of private recipient 
			socket.on('privateRecipientChanged', async ({ recipient, sender }) => {
				console.log(sender);
				// Find private room if exists or return
				const privateChatRoom = await findPrivateChatRoomByRoomKeyAndMeetingId(socket.currentRoomId, sender.id, recipient.id);

				if (!privateChatRoom)
					return;
				// Get all messages of private chat room from db
				const messages = await privateChatRoom.getMessages();

				// Send all messages back to client that emitted change of recipient
				for (const message of messages) {
					console.log('Message was fetched, message content: ', message.message_content);
					sendPrivateMessage(socket, message.message_content, recipient, sender,
						new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
						message.sender_id);
				}
			});

			socket.on('disconnect', async () => {
				console.log('User disconnected');
				if (socket.currentRoomId) {
					const participants = await fetchParticipantsInRoom(socket.currentRoomId)
					io.to(socket.currentRoomId).emit('participantsUpdate', participants);
				}

				sendMessage(
					socket,
					'joinMessage',
					`${fullname} has left the room`,
					null,
					'System',
					new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					true,
				);
			});
		} catch (error) {
			console.error('Error during socket connection: ', error);
		}
	});
};

async function fetchParticipantsInRoom(roomId) {
	const socketsInRoom = await io.in(roomId).fetchSockets();
	const participants = socketsInRoom.map(s => ({
		socketId: s.id,
		fullname: s.handshake.auth.fullname,
		id: s.handshake.auth.userId,
	}));

	return participants
}

async function findSocketByUserId(roomId, userId) {
	const socketsInRoom = await io.in(roomId).fetchSockets();
	return socketsInRoom.find(socket => socket.handshake.auth.userId === userId);
}

function sendMessage(socket, event, message, recipient, sender, timestamp, self = false) {
	const serverSender = self ? socket : io;

	serverSender.to(socket.currentRoomId).emit(event, {
		message: message,
		sender: sender,
		recipient: recipient,
		timestamp: timestamp,
	});
}

function sendPrivateMessage(socket, message, recipient, sender, timestamp, realSenderId = null, self = false) {
	const messageData = {
		message: message,
		recipient: recipient,
		sender: sender,
		timestamp: timestamp,
		self: self,
		realSenderId: realSenderId,
	};

	socket.emit('privateMessage', messageData); // to sender

	if (!realSenderId) {
		socket.to(recipient.socketId).emit('privateMessage', messageData);  // to recipient socket
	}
}