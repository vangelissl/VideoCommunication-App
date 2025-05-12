const { Sequelize, DataTypes, UUIDV4 } = require('sequelize');
const db = require('./index');
const { defaultValueSchemable } = require('sequelize/lib/utils');

const PublicChatMessage = db.sequelize.define("PublicChatMessage", {
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
	message_content: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	is_pinned: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	is_deleted: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
},
	{
		tableName: "public_chat_messages",
		timestamps: true,
		createdAt: "created_at",
		updated_At: "udpated_at",
	},
); 

module.exports = PublicChatMessage;