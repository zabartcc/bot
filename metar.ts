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

// Calculate density altitude for ZAB airfields
function calcDA(icaoId:string, temp:number, altSet:number) {
  const elevation: {[key:string]:number} = {
    KAMA: 3649,
    KCVS: 4295,
    KROW: 3671,
    KELP: 3962,
    KBIF: 3947,
    KHMN: 4093,
    KABQ: 5355,
    KAEG: 5837,
    KSAF: 6349,
    KSKX: 7095,
    KFHU: 4719,
    KTUS: 2643,
    KDMA: 2704,
    KRYN: 2419,
    KPHX: 1135,
    KIWA: 1384,
    KFFZ: 1394,
    KGYR: 969,
    KLUF: 1085,
    KGEU: 1071,
    KDVT: 1478,
    KSDL: 1510,
    KGXF: 883,
    KPRC: 5045,
    KSEZ: 4831,
    KFLG: 7015,
    KINW: 4941,
    KGUP: 6472,
    KAXX: 8380,
    KLVS: 6877,
    KLAM: 7171,
    KRTN: 6352,
    KCAO: 4970,
    KDHT: 3991,
    KDUX: 3706,
    KE42: 3090,
    KBGD: 3055,
    KPPA: 3245,
    KHHF: 2396,
    KHRX: 3788,
    KCVN: 4216,
    KTCC: 4065,
    KSXU: 4791,
    K0E0: 6204,
    KSRR: 6814,
    KALM: 4200,
    KATS: 3545,
    KCNM: 3295,
    KPEQ: 2613,
    KFST: 3011,
    KVHN: 3957,
    KE38: 4514,
    KMRF: 4849,
    KPRS: 2938,
    KDNA: 4113,
    KLRU: 4457,
    KDMN: 4314,
    KSVC: 5446,
    K0A0: 4595,
    KTCS: 4862,
    KONM: 4875,
    KBRG: 5200,
    KGNT: 6537,
    KRQE: 6742,
    KSJN: 5737,
    KJTC: 7055,
    KOLS: 3955,
    KAVQ: 2032,
    KMZJ: 1893,
    KSAD: 3178,
    KP08: 1576,
    KCGZ: 1464,
    KA39: 1307,
    KCHD: 1243,
    KSOW: 6416,
    KTYL: 5823,
    KPAN: 5157,
    KCMR: 6691,
    KBXK: 1033,
  };
  if (elevation[icaoId.toUpperCase()]) {
    const pressAlt = ((29.92 - altSet) * 1000) + elevation[icaoId.toUpperCase()];
    const stdTemp = 15 + ((elevation[icaoId.toUpperCase()] / 1000) * -2);
    const densityAlt = pressAlt + (120 * (temp - stdTemp));
    return Math.round(densityAlt);
  }
  return null;
}

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
		const da = calcDA(m.station, m.temperature.celsius, m.altimeter.inches);
		if (da != null) {
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
