import { Server } from "socket.io";
import { createUserConnection } from '../services/userConnectionsService.js';
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
			const meetingSessionId = socket.handshake.auth.meetingSessionId;  // should be passed from script
			const fullname = socket.handshake.auth.fullname; // or from your user store
			const peerId = v4();

			// Get full user object
			const user = await findUserById(userId);

			// Create user connection for this particular meeting session
			const userConnection = await createUserConnection(
				{
					userId: userId,
					meetingSessionId: meetingSessionId,
					socketId: socket.id,
					peerId: peerId
				});

			socket.currentRoomId = null;

			// Handle user joining room where roomId is the meeting's id
			socket.on('joinRoom', async ({ roomId }) => {
				socket.join(roomId);

				socket.currentRoomId = roomId;

				// Fetch all sockets in the room
				const socketsInRoom = await io.in(roomId).fetchSockets();
				const participants = socketsInRoom.map(s => ({
					socketId: s.id,
					fullname: s.handshake.auth.fullname
				}));

				// Notify all users in the room with the current list of participants
				io.to(roomId).emit('participantsUpdate', participants);

				// Broadcast to others in room that a user joined
				socket.to(roomId).emit('userJoined', { socketId: socket.id, fullname });
				socket.to(roomId).emit('joinMessage', {
					message: `${fullname} has joined the room`,
					recipient: null,
					sender: 'System',
					timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
				});
			});

			socket.on('sendPublicMessage', ({ message, recipient, sender, timestamp }) => {
				io.to(socket.currentRoomId).emit('publicMessage', {
					message: message,
					sender: sender,
					recipient: recipient,
					timestamp: timestamp,
				});
			});

			socket.on('disconnect', async (socket) => {

			});
		} catch (error) {
			console.error('Error during socket connection: ', error);
		}
	});
};