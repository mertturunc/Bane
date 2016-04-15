'use strict';

const Discord = require('discord.js');
const fs = require('fs');
const trigger = "*";
var jsonFolder = "./json/";

try {
	require(jsonFolder + 'config.json');
} catch (e) {
	console.log("config.json bulunamadı. config-base.json dosyasından kopyalanıyor...");
	fs.writeFileSync(jsonFolder + 'config.json', fs.readFileSync(jsonFolder + 'config-base.json'));
}
const config = require(jsonFolder + 'config.json');

let commands = require('./Komutlar.js').commands;
let bot = new Discord.Client();

bot.on("ready", function () {
	console.log("Başladı! Şu an " + bot.channels.length + " adet yazı kanalına hizmet veriyorum.");
});

bot.on("disconnected", function () {
	console.log("Bağlantı kesildi. Kapanıyor..");
	process.exit(0);
});

bot.on("error", function (error) {
	console.log("Bu hata ile karşılaştım:  `` " + error + " `` "
        );
});

bot.on("message", function (message) {
	let msg = message.content;
	if (msg[0] === trigger) {
		let command = msg.toLowerCase().split(" ")[0].substring(1);
		let suffix = msg.substring(command.length + 2);
		if (commands[command]) commands[command].process(bot, message, suffix);
	}
});

bot.loginWithToken(config.token);
setTimeout(function(){bot.setStatus("online", "*yardım");}, 2000);