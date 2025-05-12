const { DataTypes } = require('sequelize');
const db = require('./index');

const PublicChatMessage = db.sequelize.define("PublicChatMessage", {
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
		updatedAt: "updated_at",
	});

module.exports = PublicChatMessage;