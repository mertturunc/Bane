'use strict';

const Discord = require('discord.js');
const fs = require('fs');
var jsonFolder = "./json/";

try {
    require(jsonFolder + 'config.json');
} catch (e) {
    console.log("config.json bulunamadı. config-base.json dosyasından kopyalanıyor...");
    fs.writeFileSync(jsonFolder + 'config.json', fs.readFileSync(jsonFolder + 'config-base.json'));
}

var config = require(jsonFolder + 'config.json');
const trigger = config.trigger;

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
    let msg = message.content;
    if (msg[0] === trigger) {
        let command = msg.toLowerCase().split(" ")[0].substring(1);
        let suffix = msg.substring(command.length + 2);
        if (commands[command]) {
            commands[command].process(bot, message, suffix);
        } else {
            if (aliases[command]) {
                var aliasEd = aliases[command];
                commands[aliasEd].process(bot, message, suffix);
            } else {}
        };
    } else {
    	return;
    }
});

bot.login(config.token);
