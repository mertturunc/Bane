'use strict';

const Discord = require('discord.js'); // define base
const fs = require('fs'); // define filesystem
var jsonFolder = "./json/"; // define json folders
var guildTime = {}; // temporary list of command cooldowns [<command><guild id>] returns timestamp
const unhandledRejections = new Map(); // define map for the rejections
var connectionCount = 0;
var connectionTimes = {};
let intValue = 0
var aDayLater = Date.now() + 86400000;

intValue = setInterval(function () {
	var connectionCount = 1;
	var connectionTimes = {};
	connectionTimes[connectionCount] = Date.now();
	var aDayLater = Date.now() + 86400000;
	console.log(`\nGün içindeki bağlanma sayısı ${connectionCount} olarak güncellendi.\n`);
}, 86400000);

try {
	require(jsonFolder + 'config.json'); // try gathering config
} catch (e) { // if error
	console.log("config.json bulunamadı. config-base.json dosyasından kopyalanıyor..."); // print the copying process
	fs.writeFileSync(jsonFolder + 'config.json', fs.readFileSync(jsonFolder + 'config-base.json')); // copy base as config
}

const config = require(jsonFolder + 'config.json'); // define config

let commands = require('./Komutlar.js').commands; // define commands
let tos = require('./Komutlar.js').tos; // define timeouts
let aliases = require(jsonFolder + "Aliases.json"); // define aliases
let bot = new Discord.Client({ // define bot from base
	fetch_all_members: true
});

if (!config.startupGame) { // if there isn't any startup game specified
	var startGame = (config.trigger + "yardım"); // define it as <trigger>yardım
} else {
	var startGame = config.startupGame;
}

bot.on("ready", () => { // when bot is ready
	connectionCount++;
	connectionTimes[connectionCount] = Date.now();
	if (connectionTimes.length % 900 == 0 && connectionTimes[connectionCount] < aDayLater) {
		console.log("BIG ISSUE IN THE CODE! CLOSING THE BOT...\n");
		clearInterval(intValue);
		setTimeout(function() {
			process.exit(1);
		}, 1000);
	} else {
		setTimeout(function() { // in a 2,5 second timeout
			console.log(`Başladı! Şu an ${bot.guilds.size} adet sunucuya (ve ${bot.channels.filter(c => c.type === "text").size} yazı kanalına) hizmet veriyorum.\nGün içindeki bağlanma sayısı: ${connectionCount}`); // print that the bot is ready with total stats
			bot.user.setStatus("online").then(async u => {
				await u.setGame(`${startGame} | ${bot.guilds.size} guild(s)`);
			}).catch(e => {
				console.error(`Err in setStatus, ${e}`);
			}); // set status as online, with the game
		}, 2500);
	}
});

bot.on("error", error => { // on error
	console.error("Bir hata ile karşılaştım:\n" + require("util").inspect(error)); // print error
});

bot.on("message", message => { // on message

	if (message.author.bot === true) { // if author is a bot
		return; // ignore
	};

	if (!message.content.startsWith(config.trigger)) { // if message doesn't start with a trigger
		return; // ignore
	};

	if (message.channel.type === "dm" || message.channel.type === "group") { // if the channel is not in a guild
		var datacall = message.channel.id; // set the timeout "guild" as the channel id
	} else {
		var datacall = message.guild.id; // if not, set "guild" id as the guild id
	}

	let command = message.content
		.split(" ")[0]
		.slice(config.trigger.length); // gather the command

	let suffix = message.content.substring(command.length + (config.trigger.length + 1)); // gather the suffix

	let args = message.content.split(" ").slice(1); // gather the args (not a good practice)

	let whitelist = require(jsonFolder + "evalwhitelist.json"); // define critical whitelist

	if (commands[command]) { // if command exists
		if (!tos[command]) { // if the command doesn't have a timeout defined
			var tempToData = tos.globalTo; // set the temporary timeout data as the global timeout
			var tempComData = "globalTo" + datacall; // set the temporary command data as globalTo<"guild" id>
		} else { // if not
			var tempToData = tos[command]; // set the temporary timeout data as the timeout specified on the list
			var tempComData = command + datacall; // set the temporary command data as "<command><"guild" id>"
		}

		if (!guildTime[tempComData] || (Date.now() - guildTime[tempComData]) > tempToData /* || whitelist.indexOf(message.author.id) > -1*/ ) { // if there isn't any cooldowns listed, or the cooldown time is done, OR the person is in whitelist
			commands[command].process(bot, message, suffix, args); // run the command
			guildTime[tempComData] = Date.now(); // set the temporary command data in the cooldowns list as the current time
		} else {
			return;
		}
	} else { // if not
		if (aliases[command]) { // if alias exists
			var aliasEd = aliases[command]; // define the command from the alias

			if (!tos[aliasEd]) { // if the command doesn't have a timeout defined
				var tempToData2 = tos.globalTo; // set the (second) temporary timeout data as the global timeout
				var tempComData2 = "globalTo" + datacall; // set the (second) temporary command data as globalTo<"guild" id>
			} else { // if not
				var tempToData2 = tos[aliasEd]; // set the (second) temporary timeout data as the timeout specified on the list
				var tempComData2 = aliasEd + datacall; // set the (second) temporary command data as "<command><"guild" id>"
			}

			if (!guildTime[tempComData2] || (Date.now() - guildTime[tempComData2]) > tempToData2 /* || whitelist.indexOf(message.author.id) > -1*/ ) { // if there isn't any cooldowns listed, or the cooldown time is done, OR the person is in whitelist
				commands[aliasEd].process(bot, message, suffix, args); // run the command
				guildTime[tempComData2] = Date.now(); // set the (second) temporary command data in the cooldowns list as the current time
			} else { // if not
				return; // ignore
			}
		} else { // if not
			return; // ignore
		};
	};
});

bot.on("guildCreate", guild => { // when bot joins to a guild
	console.log(`Yeni bir sunucuya katıldım!\n  Ad: ${guild.name}\n  ID: ${guild.id}\n\n  Sahibi:\n    Tag: ${guild.owner.user.tag}\n    ID: ${guild.owner.user.id}\n`); // print what the guild is and who owns it
	bot.user.setStatus("online").then(async u => {
		await u.setGame(`${startGame} | ${bot.guilds.size} guild(s)`);
	}).catch(e => {
		console.error(`Err in setStatus, ${e}`);
	}); // set status as online, with the game
});

bot.on("guildDelete", guild => { // when bot leaves or deletes a guild
	console.log(`Bir sunucudan ayrıldım!\n  Ad: ${guild.name}\n  ID: ${guild.id}\n\n  Sahibi:\n    Tag: ${guild.owner.user.tag}\n    ID: ${guild.owner.user.id}\n`); // print what the guild was and who owned it
	bot.user.setStatus("online").then(async u => {
		await u.setGame(`${startGame} | ${bot.guilds.size} guild(s)`);
	}).catch(e => {
		console.error(`Err in setStatus, ${e}`);
	}); // set status as online, with the game
});

process.on("unhandledRejection", (reason, p) => { // on an unhandled error
	unhandledRejections.set(p, reason); // set the map with the reason and such
	console.error('Unhandled Rejection from core:', p, '\n\nreason:', reason);
});

process.on('rejectionHandled', (p) => { // if the rejection is handled
	unhandledRejections.delete(p); // delete the rejection from the map
});

process.on("uncaughtException", (err) => { // if there is an uncaught exception
	console.error("Exception from core: " + err); // report that error
});

bot.login(config.token); // login to discord