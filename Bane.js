'use strict';

const Discord = require('discord.js');
const fs = require('fs');
var jsonFolder = "./json/";
const crypter = require("./lib/Crypter.js");

try {
    require(jsonFolder + 'config.json');
} catch (e) {
    console.log("config.json bulunamadı. config-base.json dosyasından kopyalanıyor...");
    fs.writeFileSync(jsonFolder + 'config.json', fs.readFileSync(jsonFolder + 'config-base.json'));
}

const timeouts = require(jsonFolder + 'timeouts.json').timeout;
const config = require(jsonFolder + 'config.json');

let commands = require('./Komutlar.js').commands;
let aliases = require(jsonFolder + "Aliases.json");
let bot = new Discord.Client({
    fetch_all_members: true
});

bot.on("ready", () => {
    console.log("Başladı! Şu an " + bot.guilds.size + " adet sunucuya (ve " + bot.channels.size + " kanala) hizmet veriyorum.");
    setTimeout(function() {
        bot.user.setStatus("online");
		setTimeout(function(){bot.user.setGame(config.startupGame);}, 833);
    }, 2000)
});

bot.on("error", (error) => {
    console.log("Bu hata ile karşılaştım:  `` " + error + " `` ");
});

bot.on("message", message => {
	if (message.author.bot === true) {
		return;
	};

	if (!message.content.startsWith(config.trigger)) {
		return;
	};

	let command = message.content.split(" ")[0];
	command = command.slice(config.trigger.length);

	let suffix = message.content.substring(command.length + (config.trigger.length + 1));

	let args = message.content.split(" ").slice(1);

	const bmessagetime = (message.channel.fetchMessages({
		limit: 1
	}))
	.filter(m => m.author.id === bot.user.id)
	.map(m => m.createdTimestamp);


	if (commands[command]) {
		if (!timeouts[command]) {
			commands[command].process(bot, message, suffix, args);
		} else {
			var mathemagicx = (message.createdTimestamp - bmessagetime);
			if (mathemagicx >= timeouts[command]) {
				commands[command].process(bot, message, suffix, args);
			} else {
				message.reply("Wait " + (mathemagicx / 1000) + " seconds to use this command.");
			}
		}
	} else {
		if (aliases[command]) {
			var aliasEd = aliases[command];
			if (!timeouts[aliasEd]) {
				commands[aliasEd].process(bot, message, suffix, args);
			} else {
				var mathemagicx2 = (message.createdTimestamp - bmessagetime);
				if (mathemagicx >= timeouts[aliasEd]) {
					commands[aliasEd].process(bot, message, suffix, args);
				} else {
					message.reply("Wait " + (mathemagicx2 / 1000) + " seconds to use this command.");
				}
			}
		} else {
			return;
		};
	};
});

bot.on("guildCreate", guild => {
	console.log("Yeni bir sunucuya katıldım: adı " + guild.name + ", sahibi " + guild.owner.user.username + " ve ID'si " + guild.id);
});

bot.on("guildDelete", guild => {
	console.log("Bir sunucudan ayrıldım: adı " + guild.name + ", sahibi " + guild.owner.user.username + " ve ID'si " + guild.id);
});

bot.login(crypter.dec.run(config.token));
