const { Sequelize, DataTypes, UUIDV4, UUID } = require('sequelize');
const db = require('./index');


const PrivateChatRoomParticipant = db.sequelize.define("PrivateChatRoomParticipant", {
	id: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4,
		primaryKey: true,
	},
	room_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "PrivateChatRoom",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	user_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "User",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	joined_at: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	left_at: {
		type: DataTypes.DATE,
		allowNull: true,
	},
},
	{
		tableName: "private_chat_room_participants",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "udpated_at",
	},
);

module.exports = PrivateChatRoomParticipant;