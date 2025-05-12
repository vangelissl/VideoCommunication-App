const { Sequelize, DataTypes, UUIDV4 } = require('sequelize');
const db = require('./index');

const PrivateChatMessage = db.sequelize.define("PrivateChatMessage", {
	id: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4,
		primaryKey: true,
	},
	room_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'Room',
			key: 'id',
		},
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	},
	sender_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'User',
			key: 'id',
		},
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	},
	message_content: {
		type: DataTypes.TEXT,
		allowNull: false,
		is_read: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		is_deleted: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	}
},
	{
		tableName: "private_chat_messages",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	},
);

module.exports = PrivateChatMessage;