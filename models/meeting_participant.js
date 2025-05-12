const { DataTypes } = require('sequelize');
const db = require('./index');

const MeetingParticipant = db.sequelize.define("MeetingParticipant", {
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
	join_time: {
		type: DataTypes.DATE,
		allowNull: true,
	},
	leave_time: {
		type: DataTypes.DATE,
		allowNull: true,
	},
	is_host: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	is_moderator: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	is_presenter: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	}
},
	{
		tableName: "meeting_participants",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	});

module.exports = MeetingParticipant;