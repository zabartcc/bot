import Discord, { MessageEmbed } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';
// import redis from 'ioredis';

dotenv.config();

const zabApi = axios.create({
	baseURL: process.env.ZAB_API_URL,
	headers: {
		'Authorization': `Bearer ${process.env.ZAB_API_KEY}`
	}
});


const c = new Discord.Client();

const channels = {
	botAdmin: '546532863026397194',
	withYou: '877824455064301588',
};

const wyPrefix = '~wy';

// const roles = {
// 	member: '519727760923426816',
// 	visitor: '519727811838214164',
// 	guest: '739592732737142786',
// 	verified: '806720140095520768'
// };

// const ratingRoles = [
// 	'',
// 	'506655521999159306', //obs
// 	'506655507591725057', //s1
// 	'506655484359475200', //s2
// 	'506655421692641291', //s3
// 	'506655416697094145', //c1
// 	'',
// 	'809905284277207050', //c3
// 	'506655375349776398', //i1
// ];

// let server;

// const syncRoles = async () => {
// 	const {data} = await zabApi.get('/discord/users');

// 	for(const user of data.data) {
// 		await syncController(user);
// 	}
// };

// const syncController = async controller => {
// 	const member = await server.members.fetch(controller.discordInfo.clientId).catch(() => false);

// 	if(member && !controller.isSenior) {
// 		console.log(`Syncing roles for ${controller.fname} ${controller.lname}`);
// 		console.log('Removing permission roles.');
// 		for(const role of Object.values(roles)) {
// 			if(member.roles.cache.has(role)) {
// 				await member.roles.remove(role);
// 			}
// 		}
// 		console.log('Removing rating roles.');
// 		for(const role of ratingRoles) {
// 			if(role && member.roles.cache.has(role)) {
// 				await member.roles.remove(role);
// 			}
// 		}
// 		console.log('Adding verified role.');
// 		member.roles.add(roles.verified);
// 		console.log('Adding permission/rating roles.');
// 		if(controller.member) {
// 			if(controller.vis) {
// 				member.roles.add(roles.visitor);
// 			} else {
// 				member.roles.add(roles.member);
// 				if(controller.rating <= 8) {
// 					member.roles.add(ratingRoles[controller.rating]);
// 				}
// 			}
// 		} else {
// 			member.roles.add(roles.guest);
// 		}
// 		let extraText = '';
// 		if(controller.oi) {
// 			extraText = ` | ${controller.oi}`;
// 		}
// 		if(controller.isStaff) {
// 			extraText = ` | ${controller.roleCodes[0].toUpperCase()}`;
// 		}
// 		console.log(`Setting nickname: ${controller.fname} ${controller.lname}${extraText}.`);
// 		await member.setNickname(`${controller.fname} ${controller.lname}${extraText}`).catch(console.log);
// 		console.log('Done!\n---');
// 	}
// };

c.on('ready', async () => {
	console.log('Logged in.');
	await c.user.setActivity(`X-P3D 2020:SE.`);
	// server = await c.guilds.fetch('506652179743113236');
	// await syncRoles();
});

c.on('message', async msg => {
	if(msg.channel.id === channels.withYou && msg.content.startsWith(wyPrefix)) {
		handleWithYou(msg);
	}
});

const handleWithYou = async msg => {
	const embed = new MessageEmbed()
		.setColor('#208951')
		.setAuthor('Albuquerque ARTCC', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png', '')
		.setFooter('The "With You" counter is a feature of Charles Barkdozer, the Albuquerque ARTCC Discord Bot.', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png');
	const args = msg.content.split(' ')[1];
	const {data} = await zabApi.get('/discord/withyou');
	switch(args) {
		case "help":
			embed.setTitle('With You Counter Help')
				.setDescription('The "With You" counter is easy to use:')
				.addField('~wy add', 'Increment the With You:tm: counter by one.')
				.addField('~wy rm (~wy remove, ~wy delete)', 'Decrement the With You:tm: counter by one.')
				.addField('~wy (~wy show, ~wy count)', 'Show the number of With Yous:tm:.');
			break;
		case "add":
			await zabApi.post(`/discord/withyou`);
			embed.setTitle('With You Added!')
				.setDescription(`Your With You:tm: has been successfully added. The counter is currently at ${data.data.withYou + 1}`);
			break;
		case "rm":
		case "remove":
		case "delete":
			await zabApi.delete(`/discord/withyou`);
			embed.setTitle('With You Removed!')
				.setDescription(`Your With You:tm: has been successfully removed. The counter is currently at ${data.data.withYou - 1}`);
			break;
		case "show":
		case "count":
		case undefined:
			embed.setTitle('With You Counter')
				.setDescription(`The "With You" counter is currently at ${data.data.withYou}.`)
				.addField('What is the With You counter?', 'The With You counter keeps track of how many times pilots check in on frequency "with you". Feel free to use it during your next controlling session!');
			break;
		default:
			embed.setTitle('With You Counter')
				.setDescription(`Sorry, that command was not recognized.`);
			break;
	}

	embed.addField('~wy help', 'Show the With You:tm: help.');

	await msg.channel.send({ embed });
};


c.login(process.env.DISCORD_TOKEN);