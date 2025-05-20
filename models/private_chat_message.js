import { DataTypes } from 'sequelize'
import db from './db.js'


const PrivateChatMessage = db.sequelize.define("PrivateChatMessage", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	room_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'private_chat_rooms',
			key: 'id',
		},
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	},
	sender_id: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'users',
			key: 'id',
		},
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	},
	message_content: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
},
	{
		tableName: "private_chat_messages",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	}
);

export default PrivateChatMessage;