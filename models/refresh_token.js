import { DataTypes } from 'sequelize'
import db from './db.js'


const RefreshToken = db.sequelize.define("RefreshToken", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4, 
		primaryKey: true,
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
	token: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	expires_at: {
		type: DataTypes.DATE,
		allowNull: false,
	},
},
	{
		tableName: "refresh_tokens",
		timestamps: true,
		createdAt: "created_at",
		updatedAt: "updated_at",
	}
);

export default RefreshToken;