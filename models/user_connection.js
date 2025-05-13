import { DataTypes } from 'sequelize'
import db from './db.js'


const UserConnection = db.sequelize.define("UserConnection", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	user_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "users",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	meeting_session_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "meeting_sessions",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	peer_id: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	socket_id: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	status: {
		type: DataTypes.ENUM('connected', 'disconnected'),
		allowNull: false,
		defaultValue: 'connected',
	},
	audio_enabled: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
	video_enabled: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
	screen_sharing: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	join_time: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	leave_time: {
		type: DataTypes.DATE,
		allowNull: true,
	},
},
	{
		tableName: "user_connections",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	}
);

export default UserConnection;