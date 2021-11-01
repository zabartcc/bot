"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
exports.default = async (msg) => {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#208951')
        .setAuthor('Albuquerque ARTCC', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png', '')
        .setFooter('The "With You" counter is a feature of Charles Barkdozer, the Albuquerque ARTCC Discord Bot.', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png');
    const args = msg.content.split(' ')[1];
    const { data } = await config_1.zabApi.get('/discord/withyou');
    switch (args) {
        case 'help':
            embed.setTitle('With You Counter Help')
                .setDescription('The "With You" counter is easy to use:')
                .addField('~wy add', 'Increment the With You:tm: counter by one.')
                .addField('~wy rm (~wy remove, ~wy delete)', 'Decrement the With You:tm: counter by one.')
                .addField('~wy (~wy show, ~wy count)', 'Show the number of With Yous:tm:.');
            break;
        case 'add':
            await config_1.zabApi.post('/discord/withyou');
            embed.setTitle('With You Added!')
                .setDescription(`Your With You:tm: has been successfully added. The counter is currently at ${data.data.withYou + 1}`);
            break;
        case 'rm':
        case 'remove':
        case 'delete':
            await config_1.zabApi.delete('/discord/withyou');
            embed.setTitle('With You Removed!')
                .setDescription(`Your With You:tm: has been successfully removed. The counter is currently at ${data.data.withYou - 1}`);
            break;
        case 'show':
        case 'count':
        case undefined:
            embed.setTitle('With You Counter')
                .setDescription(`The "With You" counter is currently at ${data.data.withYou}.`)
                .addField('What is the With You counter?', 'The With You counter keeps track of how many times pilots check in on frequency "with you". Feel free to use it during your next controlling session!');
            break;
        default:
            embed.setTitle('With You Counter')
                .setDescription('Sorry, that command was not recognized.');
            break;
    }
    embed.addField('~wy help', 'Show the With You:tm: help.');
    await msg.channel.send({ embed });
};
