import { Server } from "socket.io";


let io;

export const initSocket = (server) => {
	io = new Server(server);
};

export const getIo = () => {
	if (!io) throw new Error('Socket.io not initialized!');
	return io;
};

const initOnConnect = async () => {
	io.on('connection', async (socket) => {
		const userId = socket.handshake.auth.userId;  // should be passed from script
		const meetingSessionId = socket.handshake.auth.meetingSessionId;  // should be passed from script
		const peerId = v4();

		await createUserConnection(userId, meetingSessionId, socket.id, peerId);

	});
};

const initOnDisconnect = async () => {
	io.on('disconnection', async (socket) => {

	});
};