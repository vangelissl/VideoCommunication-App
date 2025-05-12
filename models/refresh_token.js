const { DataTypes } = require('sequelize');
const db = require('./index');

const User = require("./user");


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
	});

RefreshToken.belongsTo(User, {foreignKey: "user_id", as: "user"});

module.exports = RefreshToken;