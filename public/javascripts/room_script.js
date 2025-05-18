const { user, meetingSession, meetingId } = window.appData;

const socket = io({
	auth: {
		userId: user.id,
		meetingSessionId: meetingSession.id,
	}
});

socket.on('connect', () => {
	console.log('Connected to Socket.IO server with userId:', user.id);
	// Join the room on connection
	socket.emit('joinRoom', { roomId: meetingId });
});

// Add message to chat
function addMessage(container, message, isSelf, recipient = null, sender, timestamp) {
	const div = document.createElement('div');
	div.classList.add('chat-message', 'p-2', 'rounded-lg', isSelf ? 'self' : 'other', isSelf ? 'ml-auto' : 'mr-auto');
	const senderText = isSelf ? 'You' : sender;
	div.innerHTML = `
        <div class="flex justify-between text-xs mb-1">
          <span>${senderText}${recipient ? ` to ${recipient}` : ''}</span>
          <span>${timestamp}</span>
        </div>
        <div>${message}</div>
      `;
	container.appendChild(div);
	container.scrollTop = container.scrollHeight;
}

// Notify others in the room about new user
socket.on('userJoined', (socketId, fullname) => {
	const message = `${fullname} has joined the room`;
	// Send public message to the server
	socket.emit('publicMessage', {
		message,
		recipient: null,
		sender: currentUser,
		timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
	});
});

socket.on('publicMessage', ({ message, recipient, sender, timestamp }) => {
	const isSelf = sender == currentUser;
	addMessage(publicMessages, message, isSelf, recipient, sender, timestamp);
});

const publicTab = document.getElementById('publicTab');
const privateTab = document.getElementById('privateTab');
const publicChat = document.getElementById('publicChat');
const privateChat = document.getElementById('privateChat');
const publicMessages = document.getElementById('publicMessages');
const privateMessages = document.getElementById('privateMessages');
const privateUserSelect = document.getElementById('privateUserSelect');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const endCall = document.getElementById('endCall');
const muteButton = document.getElementById('muteButton');
const videoButton = document.getElementById('videoButton');
const shareScreen = document.getElementById('shareScreen');
const reactions = document.getElementById('reactions');
const participantsList = document.getElementById('participantsList');
const videoGrid = document.getElementById('videoGrid');

// Mock participants
const participants = Array.from({ length: 30 }, (_, i) => `User ${i + 1}`);
participants.forEach(user => {
	const option = document.createElement('option');
	option.value = user;
	option.textContent = user;
	privateUserSelect.appendChild(option);

	// Add mock video elements
	const div = document.createElement('div');
	div.classList.add('relative', 'bg-black', 'rounded-lg', 'overflow-hidden');
	div.innerHTML = `
        <video autoplay playsinline muted class="w-full h-48 object-cover"></video>
        <p class="absolute bottom-2 left-2 text-white">${user}</p>
      `;
	videoGrid.appendChild(div);
});

// Current user (for demo purposes)
const currentUser = user.fullname;

// Tab switching
publicTab.addEventListener('click', () => {
	publicTab.classList.add('bg-blue-700', 'text-white');
	publicTab.classList.remove('bg-gray-600');
	privateTab.classList.add('bg-gray-600');
	privateTab.classList.remove('bg-blue-700', 'text-white');
	publicChat.classList.remove('hidden');
	privateChat.classList.add('hidden');
});

privateTab.addEventListener('click', () => {
	privateTab.classList.add('bg-blue-700', 'text-white');
	privateTab.classList.remove('bg-gray-600');
	publicTab.classList.add('bg-gray-600');
	publicTab.classList.remove('bg-blue-700', 'text-white');
	privateChat.classList.remove('hidden');
	publicChat.classList.add('hidden');
});

// Send message
sendMessage.addEventListener('click', () => {
	const message = chatInput.value.trim();
	if (!message) return;

	const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	if (!privateChat.classList.contains('hidden')) {
		const recipient = privateUserSelect.value;
		if (!recipient) {
			alert('Please select a user to send a private message.');
			return;
		}
		addMessage(privateMessages, message, true, recipient, currentUser, timestamp);
	} else {
		addMessage(publicMessages, message, true, null, currentUser, timestamp);
	}

	chatInput.value = '';
});

// // Mock incoming messages
// setInterval(() => {
//   if (!publicChat.classList.contains('hidden')) {
//     const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     addMessage(publicMessages, 'Hey, how’s it going?', false, null, 'Alice', timestamp);
//   }
// }, 5000);

// Button actions (placeholders for real functionality)
let isMuted = false;
muteButton.addEventListener('click', () => {
	isMuted = !isMuted;
	muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
	// Add mute/unmute logic here
});

let isVideoOn = true;
videoButton.addEventListener('click', () => {
	isVideoOn = !isVideoOn;
	videoButton.textContent = isVideoOn ? 'Video Off' : 'Video On';
	// Add video on/off logic here
});

shareScreen.addEventListener('click', () => {
	alert('Screen sharing started.');
	// Add screen sharing logic here
});

reactions.addEventListener('click', () => {
	alert('Reactions menu opened.');
	// Add reactions logic here
});

participantsList.addEventListener('click', () => {
	alert('Participants list opened.');
	// Add participants list logic here
});

endCall.addEventListener('click', () => {
	alert('Call ended.');
	// Add your end call logic here (e.g., stop WebRTC streams)
});