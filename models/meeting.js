const { Sequelize, DataTypes, UUIDV4, VIRTUAL } = require('sequelize');
const db = require('./index');


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
		type: DataTypes.STRING, 
		allowNull: false,
		unique: true,
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

module.exports = Meeting;