import Discord from 'discord.js';
import mongoose from 'mongoose';
import User from './User.js';
const c = new Discord.Client();

const channels = {
	botAdmin: '546532863026397194'
};

const roles = {
	verified: '806720140095520768'
};

let db;
let server;

const syncRoles = async () => {
	const users = await User.find()
		.populate({
			path: 'roles',
			options: {
				sort: {order: 'asc'}
			}
		}).lean({virtuals: true});

	for(const user of users) {
		if(user.discordInfo && user.discordInfo.clientId) {
			const member = await server.members.fetch(user.discordInfo.clientId);
			member.roles.add(await server.roles.fetch(roles.verified));
			let extraText = '';
			if(user.isStaff) {
				extraText = ` | ${user.roles[0].code.toUpperCase()}`;
			}
			await member.setNickname(`${user.fname} ${user.lname}${extraText}`).catch(console.log);
		}
	}
};

c.on('ready', async () => {
	console.log('Logged in.');
	await c.user.setActivity(`X-P3D 2020:SE.`);
	mongoose.connect('mongodb://localhost:27017/zab', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
	db = mongoose.connection;
	await new Promise(resolve => {
		db.once('open', resolve);
	});
	console.log('Connected to MongoDB.');
	server = await c.guilds.fetch('506652179743113236');
	await syncRoles();

});

c.login('NTQ2NTMxMjgwODQyNjUzNjk2.XGjS6w.219UuySmKWdaUYPhzpXtxlHG7iw');