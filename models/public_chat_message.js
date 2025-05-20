import { DataTypes } from 'sequelize'
import db from './db.js'


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
	file_url: {
		type: DataTypes.STRING,
		allowNull: true,
		validate: {
			isUrl: true,
		},
	},
},
	{
		tableName: "public_chat_messages",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	}
);

export default PublicChatMessage;