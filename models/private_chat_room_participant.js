const { DataTypes } = require('sequelize');
const db = require('./index');

const User = require('./user');
const PrivateChatRoomParticipant = require('./private_chat_room_participant');


const PrivateChatRoomParticipant = db.sequelize.define("PrivateChatRoomParticipant", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	room_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "private_chat_rooms",
			key: "id",
		},
		onDelete: "CASCADE",
		onUpdate: "CASCADE",
	},
	user_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: "users",
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
		updatedAt: "updated_at",
	});

PrivateChatRoom.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });
PrivateChatRoom.hasMany(PrivateChatRoomParticipant, { foreignKey: 'room_id', as: 'participants' });
PrivateChatRoom.hasMany(PrivateChatMessage, { foreignKey: 'room_id', as: 'messages' });

module.exports = PrivateChatRoomParticipant;