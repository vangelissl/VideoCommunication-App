const { Sequelize, DataTypes, UUIDV4, VIRTUAL } = require('sequelize');
const db = require('./index');


const Meeting = db.sequelize.define("Meeting", {
	id: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4,
		primaryKey: true
	},
	host_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'User',
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
		type: DataTypes.STRING,
		allowNull: true,
	},
	meeting_link: {
		type: VIRTUAL,
		get() {
			return `/room/${id}`;
		}
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
	is_reccurring: {
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
		defaultValue: 30,
	},
	is_active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
},
	{
		tableName: "Meetings",
		timestamps: true,
		createdAt: "created_at",
		udpatedAt: "updated_at",
	}
);

module.exports = Meeting;