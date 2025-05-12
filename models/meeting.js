const { Sequelize, DataTypes } = require('sequelize');
const db = require('./index');

const User = require('./user');
const MeetingParticipant = require('./meeting_participant');
const PublicChatMessage = require('./public_chat_message');
const MeetingSession = require('./meeting_session');
const MeetingSettings = require('./meeting_settings');
const MeetingInvitation = require('./meeting_invitation');


const Meeting = db.sequelize.define("Meeting", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	host_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'users',
			key: 'id',
		},
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	},
	title: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
	meeting_link: {
		type: DataTypes.VIRTUAL,
		get() {
			return `/room/${this.id}`; 
		},
	},
	meeting_password: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	start_time: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: Sequelize.NOW
	},
	expected_end_time: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	actual_end_time: {
		type: DataTypes.DATE,
		allowNull: true,
	},
	is_recurring: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	recurrence_pattern: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	max_participants: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 100,
	},
	is_active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
},
	{
		tableName: "meetings",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	});

Meeting.belongsTo(User, { foreignKey: 'host_id', as: 'host' });
Meeting.hasMany(MeetingParticipant, { foreignKey: 'meeting_id', as: 'participants' });
Meeting.hasMany(PublicChatMessage, { foreignKey: 'meeting_id', as: 'chatMessages' });
Meeting.hasMany(MeetingSession, { foreignKey: 'meeting_id', as: 'sessions' });
Meeting.hasOne(MeetingSettings, { foreignKey: 'meeting_id', as: 'settings' });
Meeting.hasMany(MeetingInvitation, { foreignKey: 'meeting_id', as: 'invitations' });

module.exports = Meeting;