import db from '../models/db.js';

export const createMeeting = async ({
	hostId,
	title,
	description,
	meetingPassword,
	startTime,
	expectedEndTime,
	isRecurring,
	recurrencePattern,
	maxParticipants,
	isActive }) => {
	return await db.Meeting.create({
		host_id: hostId,
		title: title,
		description: description,
		meeting_password: meetingPassword,
		start_time: startTime,
		expected_end_time: expectedEndTime,
		is_recurring: isRecurring,
		recurrence_pattern: recurrencePattern,
		max_participants: maxParticipants,
		is_active: isActive,
	});
};

export const createMeetingSettings = async ({
	meetingId,
	waitingRoomEnabled,
	recordingEnabled,
	chatEnabled,
	screenSharingEnabled,
	participantAudioDefault,
	participantVideoDefault }) => {
	return await db.MeetingSettings.create({
		meeting_id: meetingId,
		waiting_room_enabled: waitingRoomEnabled,
		recording_enabled: recordingEnabled,
		chat_enabled: chatEnabled,
		screen_sharing_enabled: screenSharingEnabled,
		participant_audio_default: participantAudioDefault,
		participant_video_enabled: participantVideoDefault,
	});
};

export const createMeetingSession = async ({
	meetingId,
	startTime,
	numParticipants }) => {
	return await db.MeetingSession.create({
		meeting_id: meetingId,
		start_time: startTime,
		num_participants: numParticipants,
	});
};

export const createMeetingParticipant = async ({
	meetingId,
	userId,
	joinTime,
	isHost }) => {
	return await db.MeetingParticipant.create({
		meeting_id: meetingId,
		user_id: userId,
		join_time: joinTime,
		is_host: isHost,
	});
};

export const findMeetingById = async (meetingId) => {
	return await db.Meeting.findOne({
		where: {
			id: meetingId,
		},
	});
};

export const findMeetingSessionByMeetingId = async (meetingId) => {
	return await db.MeetingSession.findOne({
		where: {
			meeting_id: meetingId,
		},
	});
};