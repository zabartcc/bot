import { Message, MessageEmbed } from 'discord.js';
import Redis from 'ioredis';
import axios from 'axios';
import mp from 'metar-parser';
import dotenv from 'dotenv-flow';

dotenv.config();

const redis = new Redis(process.env.REDIS_URI);

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

const sendMetarMessage = async (metar: string, msg: Message) => {
	const embed = new MessageEmbed()
		.setColor('#208951')
		.setAuthor('Albuquerque ARTCC', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png', '')
		.setFooter('For flight simulation use only. The METAR fetcher is a feature of Charles Barkdozer, the Albuquerque ARTCC Discord Bot.', 'https://zabartcc.sfo3.digitaloceanspaces.com/images/zab_logo.png');

	if(!metar) {
		embed.setTitle('METAR not found.')
			.setDescription('The METAR for that airport was not found. This could be an issue with the VATSIM METAR service, or that no METAR exists for this airport.');
	} else {
		const m = mp(metar);
		embed.setTitle(`METAR for ${m.station}`);
		embed.setDescription(metar);
		embed.addField('Observation Time :timer:', m.time.date);
		embed.addField('Wind :wind_blowing_face:', `${m.wind.direction}@${m.wind.speedKt}${m.wind.gust ? ` Gust ${m.wind.gust}` : ''}`);
		embed.addField('Visibility :eyes:', `${m.visibility?.miles || 10}SM`);
		if(m.weather.length) {
			const sigweather = m.weather.map((w: any) => `${w.intensity !== 'moderate' ? w.intensity.capitalize() : ''} ${(w.precipitation || w.obscuration).capitalize()}`);
			embed.addField('Weather :white_sun_small_cloud:', sigweather.join(', '));
		}
		if(m.clouds.length) {
			const clouds = m.clouds.map((c: any) => `${c.meaning.capitalize()} clouds at ${c.altitude}`);
			embed.addField('Clouds :cloud:', `${clouds.join(', ')} - AGL`);
		}
		embed.addField('Temperature :thermometer:', `${m.temperature.celsius}°C (${m.temperature.farenheit || Math.round(m.temperature.celsius * 9 / 5)}°F)`);
		embed.addField('Dewpoint :droplet:', `${m.dewpoint.celsius}°C (${m.dewpoint.farenheit || Math.round(m.dewpoint.celsius * 9 / 5)}°F)`);
		embed.addField('Altimeter :chart_with_upwards_trend:', `${m.altimeter.inches} inHg (QNH ${m.altimeter.millibars})`);
	}

	await msg.channel.send(embed);
};

export default async (msg: Message) => {
	const msgParts = msg.content.split(' ');
	const airport = msgParts[1].toUpperCase();
	if (!airport) {
		msg.reply('Please specify an airport code.');
		return;
	}
	let metar = await redis.get(`METAR:${airport}`) || '';
	if (!metar) {
		const { data } = await axios.get(`https://metar.vatsim.net/${airport}`, {
			headers: {
				'User-Agent': 'Charles Barkdozer/Albuquerque ARTCC',
			},
		});
		await redis.set(`METAR:${airport}`, data);
		await redis.expire(`METAR:${airport}`, 1200);
		metar = `${data}`;
	}
	await sendMetarMessage(metar, msg);
};
