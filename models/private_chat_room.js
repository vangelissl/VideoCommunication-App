import { DataTypes } from 'sequelize'
import db from './db.js'

const PrivateChatRoom = db.sequelize.define("PrivateChatRoom", {
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
	room_key: {
		type: DataTypes.STRING,
		allowNull: false
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
	}
);

export default PrivateChatRoom;