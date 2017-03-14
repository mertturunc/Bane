'use strict';

const Discord = require('discord.js');
const fs = require('fs');
var jsonFolder = "./json/";
var guildTime = {};
const unhandledRejections = new Map();
const errors = new Map();

try {
    require(jsonFolder + 'config.json');
} catch (e) {
    console.log("config.json bulunamadı. config-base.json dosyasından kopyalanıyor...");
    fs.writeFileSync(jsonFolder + 'config.json', fs.readFileSync(jsonFolder + 'config-base.json'));
}

const config = require(jsonFolder + 'config.json');

let commands = require('./Komutlar.js').commands;
let tos = require('./Komutlar.js').tos;
let aliases = require(jsonFolder + "Aliases.json");
let bot = new Discord.Client({
    fetch_all_members: true
});

bot.on("ready", () => {
    console.log("Başladı! Şu an " + bot.guilds.size + " adet sunucuya (ve " + bot.channels.filter(c => c.type === "text").size + " yazı kanalına) hizmet veriyorum.");
    setTimeout(function() {
        bot.user.setStatus("online");
        setTimeout(function(){bot.user.setGame(config.startupGame);}, 833);
    }, 2000)
});

bot.on("error", error => {
    console.error("Bir hata ile karşılaştım:  `` " + error + " `` ");
});

bot.on("message", message => {
    if (message.author.bot === true) {
        return;
    };

    if (!message.content.startsWith(config.trigger)) {
        return;
    };

    if (message.channel.type === "dm" || message.channel.type === "group") {
        var datacall = message.channel.id;
    } else {
        var datacall = message.guild.id;
    }

    let command = message.content.split(" ")[0];
    command = command.slice(config.trigger.length);

    let suffix = message.content.substring(command.length + (config.trigger.length + 1));

    let args = message.content.split(" ").slice(1);

    let whitelist = require(jsonFolder + "evalwhitelist.json");

    if (commands[command]) {
        if (!tos[command]) {
            var tempToData = tos.globalTo;
            var tempComData = "globalTo" + datacall;
        } else {
            var tempToData = tos[command];
            var tempComData = command + datacall;
        }

        if (!guildTime[tempComData] || (Date.now() - guildTime[tempComData]) > tempToData/* || whitelist.indexOf(message.author.id) > -1*/) {
            commands[command].process(bot, message, suffix, args);
            guildTime[tempComData] = Date.now();
        } else {
            return;
        }
    } else {
        if (aliases[command]) {
            var aliasEd = aliases[command];

            if (!tos[aliasEd]) {
                var tempToData2 = tos[globalTo];
                var tempComData2 = "globalTo" + datacall;
            } else {
                var tempToData2 = tos[aliasEd];
                var tempComData2 = aliasEd + datacall;
            }

            if (!guildTime[tempComData2] || (Date.now() - guildTime[tempComData2]) > tempToData2/* || whitelist.indexOf(message.author.id) > -1*/) {
                commands[aliasEd].process(bot, message, suffix, args);
                guildTime[tempComData2] = Date.now();
            } else {
                return;
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

process.on("unhandledRejection", (reason, p, err) => {
    unhandledRejections.set(p, reason);
    if (!err) {
        console.error("\nI catched a promise rejection, which is not defined as an error.\nProbably an error in my code.\n");
        console.error("Trying to show the error: " + err + "\n");
        console.error("For the Battery, here is the map: \n");
        console.error(unhandledRejections);
    } else {
        console.error("Uncaught Promise Error: \n" + err.stack);
    }
});

process.on('rejectionHandled', (p) => {
  unhandledRejections.delete(p);
});

process.on("uncaughtException", (err) => {
    console.error("Caught an uncaught exception, send halp: " + err)
});

bot.login(config.token);
