import { DataTypes } from 'sequelize'
import db from './db.js'


const MeetingSettings = db.sequelize.define("MeetingSettings", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	meeting_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "meetings",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	waiting_room_enabled: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	recording_enabled: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	chat_enabled: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
	screen_sharing_enabled: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
	participant_audio_default: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
	participant_video_default: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
},
	{
		tableName: "meeting_settings",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	}
);

export default MeetingSettings;