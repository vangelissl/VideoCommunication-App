'use strict';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import process from 'process';
import configFile from '../config/config.js';

const basename = path.basename(new URL(import.meta.url).pathname);
const env = process.env.NODE_ENV || 'development';
const config = configFile[env];
const db = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;
if (config.use_env_variable) {
	sequelize = new Sequelize(config.use_env_variable, {
		dialect: 'postgres',
		dialectOptions: {
			ssl: {
				require: true, // Ensures SSL is enabled
				rejectUnauthorized: false // Accepts self-signed certificates 
			}
		}
	}
	);
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Initialize the database
const initDb = async () => {
	const files = await fs.readdir(__dirname);

	const modelFiles = files.filter(file =>
		file.indexOf('.') !== 0 &&
		file !== basename &&
		file.slice(-3) === '.js' &&
		file.indexOf('.test.js') === -1
	);

	let i = 1;
	// Load all models
	for (const file of modelFiles) {
		const fileUrl = pathToFileURL(path.join(__dirname, file));
		console.log('Importing file:', fileUrl.href)
		const modelModule = await import(fileUrl);
		const model = modelModule.default;
		db[model.name] = model;
	}

	// Run associations
	Object.keys(db).forEach(modelName => {
		if (db[modelName].associate) {
			db[modelName].associate(db);
		}
	});

	// Set custom associations after models are loaded
	await setAssociations();

	// // Create ENUM type for users.role before syncing
	// await sequelize.query(`
	// 	DO $$ 
	// 	BEGIN 
	// 	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN 
	// 		CREATE TYPE "enum_users_role" AS ENUM ('user', 'admin'); 
	// 	END IF; 
	// 	END $$;
  	// `);

	// await sequelize.query(`
	// 	DO $$
	// 	BEGIN
	// 	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_meeting_invitations_status') THEN
	// 		CREATE TYPE "enum_meeting_invitations_status" AS ENUM ('pending', 'accepted', 'declined');
	// 	END IF;
	// 	END $$;
	// `);

	// await sequelize.query(`
	// 	DO $$
	// 	BEGIN
	// 	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_user_connections_status') THEN
	// 		CREATE TYPE "enum_user_connections_status" AS ENUM ('connected', 'disconnected');
	// 	END IF;
	// 	END $$;
	// `);

	// // Sync tables in dependency order
	// const modelsInOrder = [
	// 	'User', 'UserSettings', 'RefreshToken', 'PrivateChatRoom', 'PrivateChatRoomParticipant',
	// 	'PrivateChatMessage', 'Meeting', 'MeetingSettings', 'MeetingSession', 'MeetingParticipant',
	// 	'MeetingInvitation', 'PublicChatMessage', 'UserConnection'
	// ];

	// for (const modelName of modelsInOrder) {
	// 	if (db[modelName]) {
	// 		await db[modelName].sync({ force: process.env.NODE_ENV === 'development' });
	// 		console.log(`${modelName} synced`);
	// 	}
	// }

	return db;
};

// Associations function
async function setAssociations() {
	const {
		User, Meeting, UserSettings, RefreshToken, MeetingParticipant,
		PublicChatMessage, PrivateChatMessage, PrivateChatRoom,
		PrivateChatRoomParticipant, UserConnection, MeetingInvitation,
		MeetingSettings, MeetingSession
	} = db;

	User.hasMany(Meeting, { foreignKey: 'host_id', as: 'hostedMeetings' });
	User.hasOne(UserSettings, { foreignKey: 'user_id', as: 'settings' });
	User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
	User.hasMany(MeetingParticipant, { foreignKey: 'user_id', as: 'meetingParticipations' });
	User.hasMany(PublicChatMessage, { foreignKey: 'sender_id', as: 'publicMessages' });
	User.hasMany(PrivateChatMessage, { foreignKey: 'sender_id', as: 'privateMessages' });
	User.hasMany(PrivateChatRoom, { foreignKey: 'creator_id', as: 'createdChatRooms' });
	User.hasMany(PrivateChatRoomParticipant, { foreignKey: 'user_id', as: 'chatRoomParticipations' });
	User.hasMany(UserConnection, { foreignKey: 'user_id', as: 'connections' });
	User.hasMany(MeetingInvitation, { foreignKey: 'sender_id', as: 'sentInvitations' });

	UserSettings.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
	UserConnection.belongsTo(User, { foreignKey: "user_id", as: "user" });
	UserConnection.belongsTo(MeetingSession, { foreignKey: "meeting_session_id", as: "meetingSession" });
	RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

	PublicChatMessage.belongsTo(Meeting, { foreignKey: "meeting_id", as: "currentMeeting" });
	PublicChatMessage.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

	PrivateChatRoom.hasMany(PrivateChatMessage, { foreignKey: "room_id", as: "messages" });
	PrivateChatRoom.hasMany(PrivateChatRoomParticipant, { foreignKey: "room_id", as: "participants" });
	PrivateChatRoom.belongsTo(User, { foreignKey: "creator_id", as: "creator" });

	PrivateChatRoomParticipant.belongsTo(User, { foreignKey: "user_id", as: "user" });
	PrivateChatRoomParticipant.belongsTo(PrivateChatRoom, { foreignKey: "room_id", as: "chatRoom" });

	PrivateChatMessage.belongsTo(PrivateChatRoom, { foreignKey: "room_id", as: "chatRoom" });
	PrivateChatMessage.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

	Meeting.belongsTo(User, { foreignKey: 'host_id', as: 'host' });
	Meeting.hasMany(MeetingParticipant, { foreignKey: 'meeting_id', as: 'participants' });
	Meeting.hasMany(PublicChatMessage, { foreignKey: 'meeting_id', as: 'chatMessages' });
	Meeting.hasMany(MeetingSession, { foreignKey: 'meeting_id', as: 'sessions' });
	Meeting.hasOne(MeetingSettings, { foreignKey: 'meeting_id', as: 'settings' });
	Meeting.hasMany(MeetingInvitation, { foreignKey: 'meeting_id', as: 'invitations' });

	MeetingSettings.belongsTo(Meeting, { foreignKey: "meeting_id", as: "meeting" });
	MeetingSession.belongsTo(Meeting, { foreignKey: 'meeting_id', as: 'meeting' });
	MeetingSession.hasMany(UserConnection, { foreignKey: 'meeting_session_id', as: 'connections' });

	MeetingParticipant.belongsTo(Meeting, { foreignKey: "meeting_id", as: "meeting" });
	MeetingParticipant.belongsTo(User, { foreignKey: "user_id", as: "user" });

	MeetingInvitation.belongsTo(Meeting, { foreignKey: 'meeting_id', as: 'meeting' });
	MeetingInvitation.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.initialize = initDb;

export default db;