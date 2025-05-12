'use strict';

const { DataTypes } = require('sequelize');
const db = require('./index');

const Meeting = require('./meeting');
const UserSettings = require('./user_settings');
const RefreshToken = require('./refresh_token');
const MeetingParticipant = require('./meeting_participant');
const PublicChatMessage = require('./public_chat_message');
const PrivateChatMessage = require('./private_chat_message');
const PrivateChatRoom = require('./private_chat_room');
const PrivateChatRoomParticipant = require('./private_chat_room_participant');
const UserConnection = require('./user_connection');
const MeetingInvitation = require('./meeting_invitation');


const User = db.sequelize.define('User', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	role: {
		type: DataTypes.ENUM('admin', 'user'),
		allowNull: false,
		defaultValue: 'user',
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	first_name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	last_name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	is_active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
},
	{
		tableName: 'users',
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	});

User.hasMany(Meeting, { foreignKey: 'host_id', as: 'hostedMeetings' });
User.hasOne(UserSettings, { foreignKey: 'user_id', as: 'settings' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
User.hasMany(MeetingParticipant, { foreignKey: 'user_id', as: 'meetingParticipations' });
User.hasMany(PublicChatMessage, { foreignKey: 'sender_id', as: 'publicMessages' });
User.hasMany(PrivateChatMessage, { foreignKey: 'sender_id', as: 'privateMessages' });
User.hasMany(PrivateChatRoom, { foreignKey: 'creator_id', as: 'createdChatRooms' });
User.hasMany(PrivateChatRoomParticipant, { foreignKey: 'user_id', as: 'chatRoomParticipations' });
User.hasMany(UserConnection, { foreignKey: 'user_id', as: 'connections' });
User.hasMany(MeetingInvitation, { foreignKey: 'sender_id', as: 'sentInvitations' });

module.exports = User;