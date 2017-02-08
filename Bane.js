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

    if (commands[command]) {
        commands[command].process(bot, message, suffix, args);
    } else {
        if (aliases[command]) {
            var aliasEd = aliases[command];
            commands[aliasEd].process(bot, message, suffix, args);
        } else {
            return;
        };
    };
});

bot.on("guildCreate", guild => {
    console.log(`Yeni bir sunucuya katıldım, adı $(guild) ve sahibi $(guild.owner.user.username)`)
});

bot.login(config.token);
