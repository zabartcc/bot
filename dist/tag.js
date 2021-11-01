"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default(process.env.REDIS_URI);
exports.default = async (msg, adminMode) => {
    if (adminMode) {
        const msgParts = msg.content.split(' ');
        if (msgParts[1] === 'list') {
            const keys = await redis.keys('TAG:*');
            const tags = await Promise.all(keys.map(async (key) => {
                const tag = await redis.get(key);
                return {
                    tag,
                    key,
                };
            }));
            const embed = new discord_js_1.MessageEmbed();
            embed.setTitle('Tags');
            embed.setAuthor('Albuquerque ARTCC', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png', '');
            embed.setFooter('Tags are a feature of Charles Barkdozer, the Albuquerque ARTCC Discord Bot.', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png');
            embed.setColor('#208951');
            for (const tag of tags) {
                embed.addField(`~${tag.key.split(':')[1]}`, tag.tag);
            }
            msg.channel.send(embed);
        }
        else {
            const cmd = msgParts[2];
            switch (cmd) {
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
    }
    else {
        const tag = await redis.get(`TAG:${msg.content.substr(1)}`);
        if (tag) {
            msg.channel.send(tag);
        }
    }
};
