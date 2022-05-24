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
		var da = calcDA(m.station,m.temperature.celsius,m.altimeter.inches);
		if(da != null) {
			embed.addField('Density Altitude :high_brightness:', `${da} ft`);
		}
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

function calcDA(icao_id:string,temp:number,alt_set:number) { // Calculate density altitude for ZAB airfields
    icao_id = icao_id.toUpperCase();
    var elevation: {[key:string]:number} = {KAMA:3649,KCVS:4295,KROW:3671,KELP:3962,KBIF:3947,KHMN:4093,KABQ:5355,KAEG:5837,KSAF:6349,KSKX:7095,KFHU:4719,KTUS:2643,KDMA:2704,KRYN:2419,KPHX:1135,KIWA:1384,KFFZ:1394,KGYR:969,KLUF:1085,KGEU:1071,KDVT:1478,KSDL:1510,KGXF:883,KPRC:5045,KSEZ:4831,KFLG:7015,KINW:4941,KGUP:6472};
    if(elevation.hasOwnProperty(icao_id)) {
        var press_alt = ((29.92 - alt_set) * 1000) + elevation[icao_id];
        var std_temp = 15 + ((elevation[icao_id] / 1000) * -2);
        var density_alt = press_alt + (120 * (temp - std_temp));
        return density_alt;
    }
    return null;
}
