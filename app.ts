import Discord, { MessageEmbed } from 'discord.js';
import dotenv from 'dotenv-flow';
import handleMetar from './metar';
import handleTag from './tag';

dotenv.config();

const APP_MODE = process.env.NODE_ENV;

const c = new Discord.Client();

const channels = {
	botAdmin: '546532863026397194'
};

const COMMAND_PREFIX = '~';

const COMMANDS = {
	metar: `${COMMAND_PREFIX}metar`,
	help: `${COMMAND_PREFIX}help`,
	tag: `${COMMAND_PREFIX}tag`,
};

const HELP_TEXT = [
	[`${COMMANDS.metar} <icao>`, 'Get weather for airport.'],
	[COMMANDS.help, 'Show this message'],
];

c.on('ready', async () => {
	if(c.user) {
		console.log('Logged in.');
		await c.user.setActivity(APP_MODE === 'development' ? "I'm being updated :D" : 'X-P3D 2020:SE. (~help)');
	} else {
		throw new Error('Unable to log into Discord.');
	}
});

c.on('message', async (msg) => {
	if(msg.content.startsWith(COMMAND_PREFIX)) {
		if(msg.content.startsWith(COMMANDS.help)) {
			const embed = new MessageEmbed()
				.setColor('#208951')
				.setAuthor('Albuquerque ARTCC', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png', '')
				.setFooter('Charles Barkdozer is the Albuquerque ARTCC Discord Bot.', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png');

			for(const [cmd, desc] of HELP_TEXT) {
				embed.addField(cmd, desc);
			}

			msg.channel.send({ embed });
		} else if(msg.content.startsWith(COMMANDS.metar)) {
			handleMetar(msg);
		} else if(msg.content.startsWith(COMMANDS.tag) && msg.channel.id === channels.botAdmin) {
			handleTag(msg, true);
		} else {
			await handleTag(msg, false);
		}
	}
});

c.login(process.env.DISCORD_TOKEN);
