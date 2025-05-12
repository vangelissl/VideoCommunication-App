const { DataTypes } = require('sequelize');
const db = require('./index');

const PrivateChatRoomParticipant = require('./private_chat_room_participant');
const PrivateChatMessage = require("./private_chat_message");
const User = require("./user");

const PrivateChatRoom = db.sequelize.define("PrivateChatRoom", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4, 
		primaryKey: true,
	},
	creator_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "users", 
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
	});

PrivateChatRoom.hasMany(PrivateChatMessage, {foreignKey: "room_id", as: "messages"});
PrivateChatRoom.hasMany(PrivateChatRoomParticipant, {foreignKey: "room_id", as: "participants"});
PrivateChatRoom.belongsTo(User, {foreignKey: "creator_id", as: "creator"});

module.exports = PrivateChatRoom;