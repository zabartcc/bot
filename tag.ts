import { Message, MessageEmbed } from 'discord.js';
import Redis from 'ioredis';
import dotenv from 'dotenv-flow';

dotenv.config();

const redis = new Redis(process.env.REDIS_URI);

export default async (msg: Message, adminMode: boolean) => {
	if(adminMode) {
		const msgParts = msg.content.split(' ');
		if(msgParts[1] === 'list') {
			const keys = await redis.keys('TAG:*');
			const tags = await Promise.all(keys.map(async (key) => {
				const tag = await redis.get(key);
				return {
					tag,
					key,
				};
			}));

			const embed = new MessageEmbed();
			embed.setTitle('Tags');
			embed.setAuthor('Albuquerque ARTCC', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png', '');
			embed.setFooter('Tags are a feature of Charles Barkdozer, the Albuquerque ARTCC Discord Bot.', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png');
			embed.setColor('#208951');
			for(const tag of tags) {
				embed.addField(`~${tag.key.split(':')[1]}`, tag.tag);
			}
			msg.channel.send(embed);
		} else {
			const cmd = msgParts[2];
			switch(cmd) {
				case 'rm':
				case 'remove':
				case 'delete':
					await redis.del(`TAG:${msgParts[1]}`);
					msg.channel.send(`~${msgParts[1]} deleted.`);
					break;
				default:
					await redis.set(`TAG:${msgParts[1]}`, msgParts.slice(2).join(' '));
					msg.channel.send(`~${msgParts[1]} set to "${msgParts.slice(2).join(' ')}"`);
					break;
			}
		}
	} else {
		const tag = await redis.get(`TAG:${msg.content.substr(1)}`);
		if(tag) {
			msg.channel.send(tag);
		}
	}
};
