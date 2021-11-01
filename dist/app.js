"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importStar(require("discord.js"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
const withYou_1 = __importDefault(require("./withYou"));
const metar_1 = __importDefault(require("./metar"));
const tag_1 = __importDefault(require("./tag"));
dotenv_flow_1.default.config();
const APP_MODE = process.env.NODE_ENV;
const c = new discord_js_1.default.Client();
const channels = {
    botAdmin: '546532863026397194',
    withYou: '877824455064301588',
};
const COMMAND_PREFIX = '~';
const COMMANDS = {
    withYou: `${COMMAND_PREFIX}wy`,
    metar: `${COMMAND_PREFIX}metar`,
    help: `${COMMAND_PREFIX}help`,
    tag: `${COMMAND_PREFIX}tag`,
};
const HELP_TEXT = [
    [`${COMMANDS.withYou} <command>`, `WITH YOU:tm: - For more information, please use **${COMMANDS.withYou} help** in <#877824455064301588>`],
    [`${COMMANDS.metar} <icao>`, 'Get weather for airport.'],
    [COMMANDS.help, 'Show this message'],
];
c.on('ready', async () => {
    if (c.user) {
        console.log('Logged in.');
        await c.user.setActivity(APP_MODE === 'development' ? "I'm being updated :D" : 'X-P3D 2020:SE. (~help)');
    }
    else {
        throw new Error('Unable to log into Discord.');
    }
});
c.on('message', async (msg) => {
    if (msg.content.startsWith(COMMAND_PREFIX)) {
        if (msg.content.startsWith(COMMANDS.help)) {
            const embed = new discord_js_1.MessageEmbed()
                .setColor('#208951')
                .setAuthor('Albuquerque ARTCC', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png', '')
                .setFooter('Charles Barkdozer is the Albuquerque ARTCC Discord Bot.', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png');
            for (const [cmd, desc] of HELP_TEXT) {
                embed.addField(cmd, desc);
            }
            msg.channel.send({ embed });
        }
        else if (msg.content.startsWith(COMMANDS.withYou) && msg.channel.id === channels.withYou) {
            (0, withYou_1.default)(msg);
        }
        else if (msg.content.startsWith(COMMANDS.metar)) {
            (0, metar_1.default)(msg);
        }
        else if (msg.content.startsWith(COMMANDS.tag) && msg.channel.id === channels.botAdmin) {
            (0, tag_1.default)(msg, true);
        }
        else {
            await (0, tag_1.default)(msg, false);
        }
    }
});
c.login(process.env.DISCORD_TOKEN);
