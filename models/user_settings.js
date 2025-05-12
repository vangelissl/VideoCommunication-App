const { DataTypes, UUIDV4 } = require('sequelize');
const db = require('./index');

const UserSettings = db.sequelize.define("UserSettings", {
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
	default_audio_enabled: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
	default_video_enabled: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
	notification_preferences: {
		type: DataTypes.JSONB,
		allowNull: false,
		defaultValue: {}, 
	},
	time_zone: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'UTC',
	},
},
	{
		tableName: "user_settings",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	});

module.exports = UserSettings;