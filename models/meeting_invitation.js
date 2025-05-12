const { Sequelize, DataTypes, UUIDV4, DatabaseError } = require('sequelize');
const db = require('./index');

const MeetingInvitation = db.sequelize.define("MeetingInvitation", {
	id: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4,
		primaryKey: true,
	},
	meeting_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "Meeting",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	sender_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "User",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	recipient_email: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	invitation_status: {
		type: DataTypes.ENUM('pending', 'accepted', 'declined'),
		allowNull: false,
		defaultValue: 'pending',
	},
	sent_at: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	responded_at: {
		type: DataTypes.DATE,
		allowNull: true,
	},
},
	{
		tableName: "meeging_invitations",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	},
);

module.exports = MeetingInvitation;