import asyncHandler from "express-async-handler";
import { createMeeting, createMeetingSettings, createMeetingSession, createMeetingParticipant } from "../services/roomService.js";
import { findMeetingById, findMeetingSessionByMeetingId } from '../services/roomService.js';
import dayjs from "dayjs";

export const get_room_preferences = (req, res, next) => {
	res.render('room_preferences', { user: req.user });
};

export const post_room_preferences = asyncHandler(async (req, res, next) => {
	const user = req.user;

	const isScheduled = req.body.timing_option === 'schedule';
	const isRecurring = req.body.is_recurring;

	const starting_time = (() => {
		if (isScheduled) {
			const rawDateInput = req.body.start_time;
			const parsedDate = dayjs(rawDateInput);
			return parsedDate.toDate();
		}

		return new Date();
	})();

	const expected_end_time = (() => {
		const time = new Date(starting_time.getTime());
		time.setMinutes(time.getMinutes() + req.body.duration);
		return time; 
	})();

	const meeting = await createMeeting({
		hostId: user.id,
		title: req.body.title,
		description: req.body.description ? req.body.description : null,
		meetingPassword: req.body.meeting_password ? req.body.meeting_password : null,
		startTime: starting_time,
		expectedEndTime: expected_end_time,
		isRecurring: isRecurring,
		recurrencePattern: isRecurring ? req.body.recurrence_pattern : null,
		maxParticipants: req.body.max_participants,
		isActive: false,
	});

	const meetingSettings = await createMeetingSettings({
		meetingId: meeting.id,
		waitingRoomEnabled: req.body.waiting_room_enabled,
		recordingEnabled: req.body.recording_enabled,
		chatEnabled: req.body.chat_enabled,
		screenSharingEnabled: req.body.screen_sharing_enabled,
		participantAudioDefault: req.body.participant_audio_default,
		participantVideoDefault: req.body.participant_video_default,
	});

	if (isScheduled) {
		// will implement it later, more complicated process
	} else {
		const meetingSession = await createMeetingSession({
			meetingId: meeting.id,
			startTime: meeting.start_time,
			numParticipants: 1,
		});

		const host = await createMeetingParticipant({
			meetingId: meeting.id,
			userId: user.id,
			joinTime: meeting.start_time,
			isHost: true,
		});

		res.redirect(`/room/${meeting.id}`);
	}
});

export const get_room = asyncHandler(async (req, res, next) => {
	const meetingId = req.params.roomId;
	const user = req.user;

	const meetingSession = await findMeetingSessionByMeetingId(meetingId);

	res.render('room', {
		meetingId: meetingId,
		meetingSession: meetingSession,
		user: user,
	});
});