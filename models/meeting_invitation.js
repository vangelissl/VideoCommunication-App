import { DataTypes } from 'sequelize'
import db from './db.js'

const MeetingInvitation = db.sequelize.define("MeetingInvitation", {
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
	sender_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "users", 
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	recipient_email: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			isEmail: true,
		},
	},
	status: {
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
		tableName: "meeting_invitations", 
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	}
);

export default MeetingInvitation;