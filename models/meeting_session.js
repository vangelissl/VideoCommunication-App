import { DataTypes } from 'sequelize'
import db from './db.js'


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
		validate: {
			max: 100,
		}
	},
	recording_url: {
		type: DataTypes.STRING,
		allowNull: true,
		validate: {
			isUrl: true,
		},
	},
},
	{
		tableName: "meeting_sessions",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	}
);

export default MeetingSession;