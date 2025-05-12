const { Sequelize, DataTypes, UUIDV4, UUID } = require('sequelize');
const db = require('./index');

const RefreshToken = db.sequelize.define("RefreshToken", {
	id: {
		type: DataTypes.UUID,
		defaultValue: UUIDV4,
		primaryKey: true,
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
	},
);

module.exports = RefreshToken;