const { DataTypes } = require('sequelize');
const db = require('./index');

const User = db.sequelize.define('User', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	role: {
		type: DataTypes.ENUM('admin', 'user'),
		allowNull: false,
		defaultValue: 'user',
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	first_name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	last_name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	is_active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true, 
	},
},
	{
		tableName: 'users', 
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	});

module.exports = User;