document.addEventListener('DOMContentLoaded', () => {
	// Get data passed be controller
	const rawData = document.getElementById('app-data').textContent;
	const appData = JSON.parse(rawData);

	// Init cruacial data to handle communication properly
	const { user, meetingSession, meetingId } = appData;
	let localStream = null;
	let screenStream = null;
	let isScreenSharing = false;
	let screenSharingPeerId = null;

	// Store connected peers here
	const connectedPeers = {};
	const peerVideoElements = {};

	// Current user 
	const currentUser = user;

	// DOM Elements
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
	const stopScreenShare = document.getElementById('stopScreenShare');
	const reactions = document.getElementById('reactions');
	const participantsList = document.getElementById('participantsList');
	const videoGrid = document.getElementById('videoGrid');
	const localVideo = document.getElementById('localVideo');
	const videoSection = document.getElementById('videoSection');
	const screenShareContainer = document.getElementById('screenShareContainer');
	const screenShareVideo = document.getElementById('screenShareVideo');
	const screenShareUser = document.getElementById('screenShareUser');

	// Create socket for communication
	const socket = io('http://localhost:3000', {
		auth: {
			userId: user.id,
			meetingId: meetingId,
			meetingSessionId: meetingSession.id,
			fullname: user.fullname,
		}
	});

	// Create peer for media communication
	const peer = new Peer(undefined, {
		host: 'localhost',
		port: 3001,
		path: '/'
	});

	// Initialize local video stream
	function initLocalStream() {
		// Get current user's audio and video
		navigator.mediaDevices.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				localStream = stream;

				// Set the local video stream
				if (localVideo) {
					localVideo.srcObject = stream;

					// Make sure the video plays
					localVideo.onloadedmetadata = (e) => {
						localVideo.play().catch(err => {
							console.error('Error playing local video:', err);
						});
					};
				}

				// Setup audio/video stream control
				setupStreamControls(stream);
			})
			.catch((err) => {
				console.error('Failed to get local stream:', err);
				// Show error message in video container
				const localVideoContainer = document.getElementById('localVideoContainer');
				if (localVideoContainer) {
					localVideoContainer.innerHTML = `
							<div class="flex items-center justify-center h-48 bg-gray-900">
								<p class="text-red-500">Camera/Mic access denied</p>
							</div>
							<p class="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">You (No Video)</p>
						`;
				}
			});
	}

	// Setup stream controls (mute/unmute, video on/off)
	function setupStreamControls(stream) {
		// Mute button functionality
		muteButton.addEventListener('click', () => {
			const audioTracks = stream.getAudioTracks();
			if (audioTracks.length === 0) return;

			const isEnabled = audioTracks[0].enabled;
			audioTracks[0].enabled = !isEnabled;
			muteButton.textContent = isEnabled ? 'Unmute' : 'Mute';
		});

		// Video button functionality
		videoButton.addEventListener('click', () => {
			const videoTracks = stream.getVideoTracks();
			if (videoTracks.length === 0) return;

			const isEnabled = videoTracks[0].enabled;
			videoTracks[0].enabled = !isEnabled;
			videoButton.textContent = isEnabled ? 'Video On' : 'Video Off';
		});
	}

	// Initialize peer connection
	peer.on('open', function (id) {
		console.log('Peer has ID of: ', id);
		socket.emit('peerId', id);
	});

	// Handle incoming calls
	peer.on('call', (call) => {
		const streamToShare = isScreenSharing ? screenStream : localStream;
		// Answer the call with current user's stream
		call.answer(streamToShare);

		// Listen for their stream
		call.on('stream', (remoteStream) => {
			const userName = call.metadata?.userName || 'Unknown User';
			const userId = call.metadata?.userId || 'unknown';
			const isScreenShare = call.metadata?.isScreenShare || false;

			if (call.peer === screenSharingPeerId || isScreenShare) {
				// This is a screen-sharing stream
				screenShareVideo.srcObject = remoteStream;
				screenShareVideo.onloadedmetadata = (e) => {
					screenShareVideo.play().
						catch(err => console.error(`Error playing screen share: `, err));
				};
			} else {
				// This is a regular video stream
				addVideoStream(call.peer, remoteStream, userId, userName);
			}
		});

		call.on('error', (err) => {
			console.error(`Error in incoming call from peer ${call.peer}:`, err);
		});

		// Handle call close
		call.on('close', () => {
			console.log(`Call closed from peer ${call.peer}`);
			removeVideoStream(call.peer);
			if (call.peer === screenSharingPeerId) {
				screenShareVideo.srcObject = null;
			}
		});
	});

	// Add message to chat on user join
	socket.on('joinMessage', ({ message, recipient, sender, timestamp }) => {
		console.log('Message was sent to chat');
		addMessage(publicMessages, message, false, recipient, sender, timestamp);
	});

	// Add message to public chat on public message sent
	socket.on('publicMessage', ({ message, recipient, sender, timestamp }) => {
		const isSelf = sender.id === currentUser.id;
		addMessage(publicMessages, message, isSelf, recipient, sender, timestamp);
	});

	// Add message to private chat on private message sent
	socket.on('privateMessage', ({ message, recipient, sender, timestamp, realSenderId }) => {
		if (realSenderId) {
			if (realSenderId !== currentUser.id) {
				addMessage(privateMessages, message, false, sender, recipient, timestamp);
			} else {
				addMessage(privateMessages, message, true, recipient, sender, timestamp);
			}
		} else {
			const isSelf = sender.id === currentUser.id;
			addMessage(privateMessages, message, isSelf, recipient, sender, timestamp);
		}
	});

	// Notify server about user join
	socket.on('connect', async () => {
		console.log('Connected to Socket.IO server with userId:', user.fullname);
		console.log('Current room is ', meetingId);

		// Handle socket connection errors
		socket.on('connect_error', (error) => {
			console.error('Socket connection error:', error);
			alert('Connection error. Please refresh the page and try again.');
		});

		try {
			await initLocalStream();
		} catch (err) {
			console.error('Failed to initialize local stream: ', err);
		}

		// Join the room on connection
		setTimeout(() => {
			console.log('Joining room...');
			socket.emit('joinRoom');
		}, 500);
	});

	// Handle screen sharing from other users
	socket.on('screenShareStarted', ({ userId, userName, peerId }) => {
		screenSharingPeerId = peerId;
		videoSection.classList.add('screen-sharing-active');
		screenShareUser.textContent = `${userName} is sharing screen`;
		if (!connectedPeers[peerId]) {
			callPeer(peerId, userId, userName);
			connectedPeers[peerId] = userId;
		}
	});

	socket.on('screenShareStopped', () => {
		videoSection.classList.remove('screen-sharing-active');
		screenSharingPeerId = null;
		screenShareVideo.srcObject = null;
	});

	// Update video grid to add only those users' videos that are in the room
	socket.on('participantsUpdate', (participants) => {
		console.log('Participants updated:', participants);

		// Update the participant select dropdown
		updateParticipantsDropdown(participants);

		// Connect to new peers
		participants.forEach(participant => {
			if (participant.id !== currentUser.id && participant.peerId) {
				if (!connectedPeers[participant.peerId]) {
					console.log(`New participant detected: ${participant.fullname} with peerId: ${participant.peerId}`);
					callPeer(participant.peerId, participant.id, participant.fullname);
					connectedPeers[participant.peerId] = participant.id;
				}
			}
		});

		// Remove disconnected peers
		Object.keys(connectedPeers).forEach(peerId => {
			const peerStillConnected = participants.some(p => p.peerId === peerId);
			if (!peerStillConnected) {
				// Remove the video of disconnected peer
				removeVideoStream(peerId);
				delete connectedPeers[peerId];
			}
		});
	});

	function updateParticipantsDropdown(participants) {
		// Clear the participant select dropdown
		privateUserSelect.innerHTML = '<option value="">Select a user</option>';

		// Add participants to private message dropdown
		participants.forEach(participant => {
			if (participant.id !== currentUser.id) {
				const option = document.createElement('option');
				option.value = JSON.stringify(participant);
				option.textContent = participant.fullname;
				privateUserSelect.appendChild(option);
			}
		});
	}

	function callPeer(peerId, userId, userName) {
		if (!localStream) {
			console.error(`Cannot call peer ${peerId}: local stream not ready`);
			return;
		}

		if (!peerId) {
			console.error(`Cannot call peer: missing peerId for user ${userName}`);
			return;
		}

		// Call peer and send current user's stream with metadata
		const streamToShare = isScreenSharing ? screenStream : localStream;
		const call = peer.call(peerId, streamToShare, {
			metadata: { userId: currentUser.id, userName: currentUser.fullname, isScreenShare: isScreenSharing }
		});

		// Add user's stream to grid 
		call.on('stream', (remoteStream) => {
			if (peerId === screenSharingPeerId || call.metadate?.isScreenShare) {
				screenShareVideo.scrObject = remoteStream;
				screenShareVideo.onloadedmetadata = (e) => {
					screenShareVideo.play().catch(err => console.error(`Error playing screen share: `, err));
				};
			} else {
				addVideoStream(peerId, remoteStream, userId, userName);
			}
		});

		// Call again after error
		call.on('error', (err) => {
			console.error(`Error in call with peer ${peerId}:`, err);
			setTimeout(() => callPeer(peerId, userId, userName), 3000);
		});

		// Remove the stream object from the grid once connection to this peer is closed
		call.on('close', () => {
			removeVideoStream(peerId);
			if (peerId === screenSharingPeerId) {
				screenShareVideo.srcObject = null;
			}
		});
	}

	function addVideoStream(peerId, stream, userId, userName = 'Participant') {
		if (peerId === screenSharingPeerId) {
			return;
		}

		// Check if we already have a video element for this peer
		let videoContainer = document.querySelector(`[data-peer-id="${peerId}"]`);

		if (!videoContainer) {
			// Create new video container
			videoContainer = document.createElement('div');
			videoContainer.setAttribute('data-peer-id', peerId);
			videoContainer.setAttribute('data-user-id', userId || 'unknown');
			videoContainer.classList.add('relative', 'bg-black', 'rounded-lg', 'overflow-hidden');

			const video = document.createElement('video');
			video.autoplay = true;
			video.playsInline = true;
			video.classList.add('w-full', 'h-48', 'object-cover');

			const nameLabel = document.createElement('p');
			nameLabel.textContent = userName;
			nameLabel.classList.add('absolute', 'bottom-2', 'left-2', 'text-white', 'bg-black', 'bg-opacity-50', 'px-2', 'py-1', 'rounded');

			videoContainer.appendChild(video);
			videoContainer.appendChild(nameLabel);
			videoGrid.appendChild(videoContainer);

			// Store the video element reference
			peerVideoElements[peerId] = video;
		}
		peerVideoElements[peerId].srcObject = stream;
		peerVideoElements[peerId].onloadedmetadata = (e) => {
			peerVideoElements[peerId].play()
				.catch(err => console.error(`Error playing video for ${peerId}: `, err));
		}
	}

	function removeVideoStream(peerId) {
		console.log(`Removing video stream for peer ${peerId}`);

		const videoContainer = document.querySelector(`[data-peer-id="${peerId}"]`);
		if (videoContainer) {
			videoContainer.remove();
		}
		delete peerVideoElements[peerId];
	}

	// Handle private recipient change
	privateUserSelect.addEventListener('change', () => {
		privateMessages.innerHTML = '';

		const selectedValue = privateUserSelect.value;
		if (!selectedValue) return;

		const recipient = JSON.parse(selectedValue);

		console.log(`Private chat target changed to: ${recipient.fullname} (Socket ID: ${recipient.socketId})`);

		socket.emit('privateRecipientChanged', {
			recipient,
			sender: currentUser,
		});
	});

	// Send message
	sendMessage.addEventListener('click', sendChatMessage);
	chatInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			sendChatMessage();
		}
	});

	function sendChatMessage() {
		const message = chatInput.value.trim();
		if (!message) return;

		const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		if (!privateChat.classList.contains('hidden')) {
			const recipientValue = privateUserSelect.value;
			if (!recipientValue) {
				alert('Please select a user to send a private message.');
				return;
			}
			const recipient = JSON.parse(recipientValue);

			console.log('Private message is about to be sent to ', recipient.fullname);
			// Emit sending private message to server
			socket.emit('sendPrivateMessage', {
				message,
				recipient,
				sender: currentUser,
				timestamp,
			});
		} else {
			// Emit sending public message to server
			socket.emit('sendPublicMessage', {
				message,
				recipient: null,
				sender: currentUser,
				timestamp,
			});
		}

		chatInput.value = '';
	}

	// Add message to chat
	function addMessage(container, message, isSelf, recipient = null, sender, timestamp) {
		if (container === privateMessages) {
			// Only show messages for the selected private recipient
			const privateRecipientValue = privateUserSelect.value;
			if (!privateRecipientValue) return;

			const privateRecipient = JSON.parse(privateRecipientValue);
			if (
				privateRecipient.id !== recipient?.id &&
				privateRecipient.id !== sender?.id
			) return;
		}

		const div = document.createElement('div');
		div.classList.add('chat-message', 'p-2', 'rounded-lg', isSelf ? 'self' : 'other', isSelf ? 'ml-auto' : 'mr-auto');
		const senderText = isSelf ? 'You' : typeof sender !== 'string' ? sender.fullname : sender;
		div.innerHTML = `
			<div class="flex justify-between text-xs mb-1">
				<span>${senderText}${recipient ? (recipient.id !== currentUser.id ? ` to ${recipient.fullname}` : ' to You') : ''}</span>
				<span>${timestamp}</span>
			</div>
			<div>${message}</div>
			`;
		container.appendChild(div);
		container.scrollTop = container.scrollHeight;
	}

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

	// Screen sharing functionality
	shareScreen.addEventListener('click', async () => {
		try {
			screenStream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
				audio: true
			});

			// Show the screen in the large container
			videoSection.classList.add('screen-sharing-active');
			screenShareVideo.srcObject = screenStream;
			screenShareUser.textContent = 'You are sharing your screen';

			// Hide share screen button, show stop sharing button
			shareScreen.classList.add('hidden');
			stopScreenShare.classList.remove('hidden');
			isScreenSharing = true;

			// Notify other participants
			socket.emit('startScreenShare', {
				userId: currentUser.id,
				userName: currentUser.fullname
			});

			// Call all existing peers with the screen share stream
			Object.keys(connectedPeers).forEach(peerId => {
				const call = peer.call(peerId, screenStream, {
					metadata: {
						userId: currentUser.id,
						userName: currentUser.fullname,
						isScreenShare: true
					}
				});
			});

			// Handle when user stops screen sharing
			screenStream.getVideoTracks()[0].onended = () => {
				stopScreenSharing();
			};
		} catch (err) {
			console.error('Error sharing screen:', err);
			alert('Failed to start screen sharing.');
		}
	});

	// Stop screen sharing
	stopScreenShare.addEventListener('click', stopScreenSharing);

	function stopScreenSharing() {
		if (screenStream) {
			screenStream.getTracks().forEach(track => track.stop());
			screenStream = null;
		}

		// Hide the screen share container
		videoSection.classList.remove('screen-sharing-active');

		// Show share screen button, hide stop sharing button
		shareScreen.classList.remove('hidden');
		stopScreenShare.classList.add('hidden');
		isScreenSharing = false;

		// Notify other participants
		socket.emit('stopScreenShare');

		// Call all peers again with the camera stream to replace screen share
		Object.keys(connectedPeers).forEach(peerId => {
			const call = peer.call(peerId, localStream, {
				metadata: {
					userId: currentUser.id,
					userName: currentUser.fullname,
					isScreenShare: false
				}
			});
		});
	}

	// Mock functionality for now
	reactions.addEventListener('click', () => {
		alert('Reactions menu opened.');
		// Add reactions logic here
	});

	participantsList.addEventListener('click', () => {
		alert('Participants list opened.');
		// Add participants list logic here
	});

	endCall.addEventListener('click', () => {
		if (confirm('Are you sure you want to leave this meeting?')) {
			// Stop all media tracks
			if (localStream) {
				localStream.getTracks().forEach(track => track.stop());
			}
			if (screenStream) {
				screenStream.getTracks().forEach(track => track.stop());
			}

			// Disconnect from socket and peer
			socket.disconnect();
			peer.destroy();

			// Redirect to home or meeting ended page
			window.location.href = '/';
		}
	});
});
