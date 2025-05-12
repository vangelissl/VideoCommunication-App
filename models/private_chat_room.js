const { Sequelize, DataTypes, UUIDV4, VIRTUAL, UUID } = require('sequelize');
const db = require('./index');
const { defaultValueSchemable } = require('sequelize/lib/utils');
const PrivateChatMessage = require('./private_chat_message');

const PrivateChatRoom = db.sequelize.define("PrivateChatRoom", {
	id: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4,
		primaryKey: true,
	},
	creator_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "User",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	is_active: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
},
	{
		tableName: "private_chat_rooms",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	},
);

module.exports = PrivateChatRoom;