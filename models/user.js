'use strict';

import { hashPassword } from "../services/securityService.js"

import { DataTypes } from 'sequelize'
import db from './db.js'


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
		validate: {
			isEmail: true,
		}
	},
	password_hash: {
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
	fullname: {
		type: DataTypes.VIRTUAL,
		get() {
			return `${this.first_name} ${this.last_name}`;
		},
	}
},
	{
		hooks: {
			beforeCreate: async (user) => {
				user.password_hash = await hashPassword(user.password_hash);
			},
			beforeUpdate: async (user) => {
				if (user.changed('password_hash')) {
					user.password_hash = await hashPassword(user.password_hash);
				}
			}
		},
		tableName: 'users',
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
);

export default User;