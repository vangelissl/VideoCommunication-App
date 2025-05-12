const { DataTypes } = require('sequelize');
const db = require('./index');

const Meeting = require('./meeting');
const UserConnection = require('./user_connection');


const MeetingSession = db.sequelize.define("MeetingSession", {
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
	start_time: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	end_time: {
		type: DataTypes.DATE,
		allowNull: true,
	},
	num_participants: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
	recording_url: {
		type: DataTypes.STRING,
		allowNull: true,
	},
},
	{
		tableName: "meeting_sessions",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	});

MeetingSession.belongsTo(Meeting, { foreignKey: 'meeting_id', as: 'meeting' });
MeetingSession.hasMany(UserConnection, { foreignKey: 'meeting_session_id', as: 'connections' });

module.exports = MeetingSession;