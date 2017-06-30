'use strict';

//var şeysi buraya
let upvote = 0;
let downvote = 0;
let voter = [];
let votebool = false;
let topicstring = "";
let votecreator = "";
let votecreatorFull = "";
let voteserver = "";
let votechannel = "";
const _ = require("underscore");
var jsonFolder = "./json/";
var picFolder = "./photos/";
var libFolder = "./lib/";
var voiceFolder = "./voices/";
var TwitchClient = require("node-twitchtv");
var ttvc = new TwitchClient("");
var getinfo = require("./package.json"); //don't touch this
var google = require('googleapis');
var urlshortener = google.urlshortener('v1');

//fonksiyonlar da buraya
function numcon(str) {
    if (/^[0-9]+$/.test(str)) {
        return true;
    }
    return false;
};

function updateJSON(fnjson, fjson) {
    require("fs").writeFile(jsonFolder + fnjson, JSON.stringify(fjson, null, 2), null);
};

function updateEvalPerms() {
    updateJSON(jsonFolder + "evalwhitelist.json");
};

function updateCmdPerms() {
    updateJSON(jsonFolder + "commandwhitelist.json");
};

function get_random(list) {
  return list[Math.floor((Math.random()*list.length))];
};

function isset(arg) {
    return (typeof arg == 'undefined' ? false : true);
};

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
};

//hülooooooğ
exports.commands = {
    //videoyun yayın açmış mı lirik yaşıyo mu filan bunları bu kodla öğrenebilirsin (REDONE API)
    "twitch": {
        process: function(bot, msg, suffix) {
            try {
                suffix = suffix.replace(' ', '');
                ttvc.streams({
                    channel: suffix
                }, function(err, response) {
                    if (err) throw new Error(err);
                    if (response.stream == null) {
                        msg.channel.sendMessage("**Yayın durumu:**" + " Kapalı");
                    } else {
                        var rt = "**Yayın durumu:** " + "Açık" + "\n";
                        rt += "**Başlık:** " + response.stream.channel.status + "\n";
                        rt += "**Oyun:** " + response.stream.game + "\n";
                        rt += "**İzleyici:** " + response.stream.viewers + "\n";
                        rt += "**Link:**" + "`` " + response.stream.channel.url + " ``\n";
                        msg.channel.sendMessage(rt);
                    }
                });
            } catch (e) {
                console.log(msg.channel + "isim kanalda şu hata oluştu:" + e);
            }
        }
    },
    //bırakta senin için gogıllasın -AYAKLI GOOGIL (REDONE API)
    "g": {
        process: function(bot, msg, suffix) {
            if (!suffix) {
                msg.channel.sendMessage(" ``*google`` dedikten sonra arayacağın şeyi yaz. ");
                return;
            }
            suffix = suffix.split(" ");
            for (var i = 0; i < suffix.length; i++) {
                suffix[i] = encodeURIComponent(suffix[i]);
            }
            msg.channel.sendMessage("Your search result: http://www.google.com/search?q=" + suffix.join("+") + "&btnI=");
        }
    },
    /* REMOVED COMMAND
    //botun adı değişir, (discord'un kendi apisi desteklemeyecektir)
    "isim-değiş": {
        process: function(bot,msg,suffix) {
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            if (commandWhitelist.indexOf(msg.sender.id) > -1) {
                if(suffix) {
                    console.log("msg.sender.username botun adını " + suffix + " ile değiştirdi.");
                    bot.setUsername(suffix, function(error) {
                        bot.sendMessage(msg.channel, error);
                    });
                        bot.deleteMessage(msg);
                }
            }
        }
    },
    */
    //çorçik kapkeyk (NEEDS NODE 7 OR ABOVE, WITH --harmony FLAG, USE npm run-script main TO RUN THE BOT WITH THIS COMMAND)
    "mesajsil": {
        process: async function (bot, message) {
            const user = message.mentions.users.first();
            let amount = parseInt(message.content.split(' ').pop());

            if (!message.channel.permissionsFor(message.guild.member(message.author)).hasPermission("MANAGE_MESSAGES")) {
                return message.channel.sendMessage("You don't have the permission (MANAGE_MESSAGES) on this channel to do this operation.");
            };

            if (!message.channel.permissionsFor(message.guild.member(bot.user)).hasPermission("MANAGE_MESSAGES")) {
                return message.channel.sendMessage("I don't have the permission (MANAGE_MESSAGES) on this channel to do this operation.");
            };

            if (message.mentions.everyone) {return;};

            if (!user && !amount) return message.reply('Kullanım: [kişi etiketi veya miktar] [miktar]');
            if (!amount) return message.reply('Bir miktar belirtin.');
            if (amount > 100) return message.reply("Miktar 100'den fazla olmamalı.");

            if (user) {
                const messages = (await message.channel.fetchMessages({
                        limit: amount
                    }))
                    .filter(m => m.author.id === user.id)
                    .filter(m => m.deletable);

                if (!messages.size) return [];

                if (messages.size === 1) {
                    return [await messages.first().delete()];
                }

                return [await message.channel.bulkDelete(messages)];
            } else {
                if (amount === 0 || amount === 1) {
                    return [await message.delete()];
                }

            return [await message.channel.fetchMessages({
                limit: amount
            })
            .then(ma => {
                const messagesss = ma.filter(m => m.deletable);
                message.channel.bulkDelete(messagesss);
            })];
            }
        }
    },
    /*
    //kim ulan bu bot (REDONE API)
    "hakkında": {
        process: function(bot, msg) {
            var gitlinkA = getinfo.repository.url.replace("git+", "");
            var gitlinkB = gitlinkA.replace(".git", "");
            if (getinfo.name === "Bane") {
                var toSend = [],
                    count = 0;
                toSend.push("**İsim:** " + getinfo.name + " Elemental");
                toSend.push("**Versiyon:** " + getinfo.version);
                toSend.push("**GitHub:** " + gitlinkB);
                toSend.push("**Yapımcılar:** " + "<@107111069952012288> ve <@120267401672523776> 'dir.");
                toSend.push("**Komutlar:**" + " ``*yardım`` yazarak komutları öğrenebilirsin.");
                msg.channel.sendMessage(toSend);
            } else {
                var toSend2 = [],
                    count = 0;
                toSend2.push("**İsim:** " + getinfo.name);
                toSend2.push("**Versiyon:** " + getinfo.version);
                toSend2.push("**GitHub:** " + gitlinkB);
                toSend2.push("**Komutlar:**" + " ``*yardım`` yazarak komutları öğrenebilirsin.");
                msg.channel.sendMessage(toSend2);
            }
        }
    },
    */
    //info kodu, kullanıcının kim olduğunu öğren. (NEEDS MORE WORK)
    "bilgi": {
        process: function(bot, message, suffix) {
            if (message.mentions.everyone) {
                return;
            };

            if (message.channel.type === "dm") {
                return;
            };

            if (message.mentions.users.size == 0) {
                var firstment = message.author;
            } else {
                var firstment = message.mentions.users.first();
            };

            if (!bot.users.get(firstment.id, "User") || !message.guild.member(firstment)) {
                return;
            };

            const guildMemberData = message.guild.member(firstment);
            const roleslist = guildMemberData.roles.map(Role => Role.name);
            var roleslist2 = roleslist.join(", ").replace("@everyone, ", "");

            if (!guildMemberData.voiceChannel) {
                var vChannelName = "undefined";
            } else {
                var vChannelName = guildMemberData.voiceChannel.name;
            }

            if (!firstment.presence.game) {
                var gameName = "null";
            } else {
                var gameName = firstment.presence.game.name;
            }

            if (!firstment.avatarURL) {
                var avatarlink = "null";
            } else {
                var avatarlink = firstment.avatarURL.replace("?size=1024", "");
            }

            var toSendDataToUser = [];
                toSendDataToUser.push(message.author);
                toSendDataToUser.push("Listing user information for **" + firstment.username + "**:");
                toSendDataToUser.push("");
                toSendDataToUser.push("```javascript");
                toSendDataToUser.push("             ID: " + firstment.id);
                toSendDataToUser.push("       Username: " + firstment.username);
                toSendDataToUser.push("       Nickname: " + guildMemberData.nickname);
                toSendDataToUser.push("  Discriminator: #" + firstment.discriminator);
                toSendDataToUser.push("         Status: " + firstment.presence.status);
                toSendDataToUser.push("        Playing: " + gameName);
                toSendDataToUser.push("Created Account: " + firstment.createdAt.toUTCString());
                toSendDataToUser.push("         Joined: " + guildMemberData.joinedAt.toUTCString());
                toSendDataToUser.push("  Voice Channel: " + vChannelName);
                toSendDataToUser.push("         Avatar: " + avatarlink);
                toSendDataToUser.push("            Bot: " + firstment.bot);
                toSendDataToUser.push("          Roles: " + (guildMemberData.roles.size - 1) + " total roles");
                if (guildMemberData.roles.size > 1 && roleslist2.length <= 1500) {
                    toSendDataToUser.push("                 " + roleslist2);
                }
                toSendDataToUser.push("```");
            message.channel.sendMessage(toSendDataToUser).catch(e => {
                console.log("Something happened: " + e);
            });
        }
    },
    //botun yaşayıp yaşamadığını öğren (NEED SUPPORT FROM API GUILD)
    "ping": {
        process: function(bot, msg) {
            var messages = ["**PONG**", "Pong! diyeceğimi sandın değil mi?", "Hala buradayım..", "**...**", "ping"];
            var random = get_random(messages);
            msg.channel.sendMessage(random).then(sentMsg => {
                sentMsg.edit(random + "\t|\t Şu kadar sürdü: " + (sentMsg.createdTimestamp - msg.createdTimestamp) + "ms")
            });
        }
    },
    //bane git sayfası (API REDONE)
    "git": {
        process: function(bot, msg, suffix) {
            msg.reply("https://github.com/mertturunc/Bane");
        }
    },
    /* REMOVED COMMAND
    //github güncellemesi yapar (YAPAMADI)
    "güncelle": {
        process: function(bot, message) {
            let commandWhitelist = require('./commandwhitelist.json');
            if (commandWhitelist.indexOf(message.sender.id) > -1) {
                child_process.exec("git stash && git pull && pm2 restart all", puts);
                console.log("Update time!");
            }
        }
    },
    //restart (EDEMEDİ)
    "restart": {
        process: function(bot, message) {
            let commandWhitelist = require('./commandwhitelist.json');
            try {
                if (commandWhitelist.indexOf(message.sender.id) > -1) {
                    bot.sendMessage(message.channel, "**Kahve molası **", false, function() {  child_process.exec("pm2 restart all", puts); process.exit(0); });
                    console.log("  Restart time!");
                } else {
                    bot.sendMessage(message, " ``Yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮`` ");
                }
            } catch (exp) {
            }
        }
    },
    */
    //kanala ait twitch kanalı için abone olma linki yollar (IN DEV *atropos, API UPDATE NECESSARY *lg)
    "abone": {
        process: function(bot, message, suffix) {
            var redoneSuff = suffix && suffix.trim().replace("\"", "");
            message.channel.sendMessage(" :postbox: ").then(wMessage => {
                wMessage.delete(1200);
            });
            if (redoneSuff === "dozkan") {
                message.author.sendMessage("Vermiş olduğum linkten abone olabilirsiniz: " + "\nhttps://www.twitch.tv/products/dozkan/ticket?ref=below_video_subscribe_button");
            } else {
                if (redoneSuff === "videoyun") {
                    message.author.sendMessage("Vermiş olduğum linkten abone olabilirsiniz: " + "\nhttps://www.twitch.tv/products/videoyun/ticket?ref=below_video_subscribe_button");
                } else {
                    if (redoneSuff === "grimnax") {
                        message.author.sendMessage("Vermiş olduğum linkten abone olabilirsiniz: " + "\nhttps://www.twitch.tv/products/grimnax/ticket?ref=below_video_subscribe_button");
                    } else {
                        if (redoneSuff === "liste") {
                            message.author.sendMessage("Şu anlık verebildiğim adresler: ``dozkan``,``videoyun`` ve ``grimnax``. Eğer Twitch partneri iseniz bot geliştiricilerine başvurup komuta ekletebilirsiniz.");
                        } else {
                            message.channel.sendMessage("Lütfen listede bulunan kanallardan birini '*abone' yazdıktan sonra boşluk bırakıp belirt. \n Eğer listeyi görmek istersen ``*abone liste`` yazabilirsin.");
                        }
                    }
                }
            }
        }
    },
    //botu kapatıyorsun ama ayıp değil mi? (API REDONE)
    "kapa": {
        process: function(bot, message) {
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            try {
                if (commandWhitelist.indexOf(message.author.id) > -1) {
                    message.channel.sendMessage("**Biraz dinlenmem gerek.**")
                    setTimeout(function() {
                        process.exit(0);
                    }, 1500);
                    console.log("\nByeBye!");
                } else {
                    message.channel.sendMessage(" ``Yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮`` ");
                }
            } catch (exp) {

            }
        }
    },
    //botun ne oynadığını ayarlar (API REDONE)
    "ayarla": {
        process: function(bot, message, suffix) {
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            try {
                if (commandWhitelist.indexOf(message.author.id) > -1) {
                    if (message.mentions.users.size > -1) {
                        message.delete(1200).catch(e => {
                            console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
                        });
                    };
                    bot.user.setPresence('online');
                    bot.user.setGame(suffix);
                    message.channel.sendMessage("Tamamdır! Şu an oynanan oyun: " + suffix).then(wMessage => {
                        wMessage.delete(1200);
                    });
                    console.log(message.author.username + " varsayılan oyunu " + suffix + " olarak değiştirdi.");
                } else {
                    message.channel.sendMessage(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ");
                }
            } catch (exp) {
                console.log("you dun goofed: ", exp);
            }
        }
    },
    //botun bir sunucuya davet edilmesini sağlar (ingiliççem yetmedi çevir bunu :C ) (API REDONE)
    "katıl": {
        process: function(bot, message) {
                var config = require(jsonFolder + "config.json");
                message.channel.sendMessage(" :postbox: ").then(wMessage => {
                    wMessage.delete(1200);
                });
                message.author.sendMessage("Since we changed to the Official API, We have to sacrifice the \"Join by Invite\" method. \nBut, you can use the link below to add me on any server. (You have to have \"Manage Server\" role on the Server where you want to add me.)\nhttps://discordapp.com/oauth2/authorize?&client_id=" + config.api_client_id + "&scope=bot&permissions=8").catch(e => {
                    console.log("Something happened: " + e);
                });
                var config = undefined;
            }
    },
    //en gereksiz kod (API REDONE)
    "helö": {
        process: function(bot, message) {
            message.channel.sendMessage("**Helö?**").then(wMessage => {
                wMessage.delete(600);
            });
            if (message.mentions.users.size > -1) {
                message.delete().catch(e => {
                    console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
                });
            };
        }
    },
    //ocd mania linux (API REDONE)
    "linuxpls": {
        process: function(bot, message) {
            message.channel.sendFile(picFolder + "linuxgemini.png", "linuxgemini.png", "linux pls").catch(e => {
                console.log("Something happened: " + e);
            });
            if (message.mentions.users.size > -1) {
                message.delete().catch(e => {
                    console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
                });
            };
        }
    },
    //message delete için oluşturduğum test komutu (API REDONE)
    "explode": {
        process: function(bot, message) {
            message.channel.sendMessage("BOOM!").then(wMessage => {
                wMessage.delete(100);
            });
        }
    },
    //avatar filan veriyo (API REDONE!!11!!!!!!bir!!!)
    "avatar": {
        process: function(bot, message) {
            const firstment = message.mentions.users.first();

            const guildMemberData = message.guild.member(firstment);

            if (message.channel.type === "dm") {
                if (message.mentions.users.size == 0) {
                    if (!message.author.avatarURL) {
                        message.reply("Kardeş avatarın yok galiba.");
                    } else {
                        message.reply("Al avatarının linki: " + message.author.avatarURL);
                    }
                } else {
                    if (firstment.avatarURL === bot.user.avatarURL) {
                        message.reply("Al benim avatarın linki: " + bot.user.avatarURL);
                    } else {
                        return;
                    }
                }
            } else {
                if (message.mentions.users.size == 0) {
                    if (!message.author.avatarURL) {
                        message.reply("Kardeş avatarın yok galiba.");
                    } else {
                        message.reply("Kendi avatarını istiyorsun ha. Al avatarının linki: " + message.author.avatarURL);
                    }
                } else {
                    if (!firstment.avatarURL) {
                        message.reply("İstediğin kişinin avatarı yok. FeelsBadMan");
                    } else {
                        if (firstment.avatarURL === bot.user.avatarURL) {
                            message.reply("Al benim avatarım: " + bot.user.avatarURL);
                        } else {
                            message.reply("Al bakalım: " + firstment.avatarURL);
                        }
                    }
                }
            }
        }
    },
    //düzgün çalışan bir eval (API REDONE)
    "eval": {
        process: function(bot, message, suffix, args) {
            let blockedEval = require(jsonFolder + 'blockedeval.json');
            let evalWhitelist = require(jsonFolder + 'evalwhitelist.json');
            if (evalWhitelist.indexOf(message.author.id) > -1) {
                if (blockedEval.indexOf(suffix) > -1) {
                    var bricxs = ["what are you doing", "staph", "don't kill me pls", "**...**"];
                    message.channel.sendMessage(message.author + " " + get_random(bricxs));
                } else {
                    try {
                        console.log(message.author.username + " \"eval " + suffix + "\" komutunu kullandı.");
                        var toSend = [],
                            count = 0;
                        toSend.push("Eval başarılı.");
                        toSend.push("```javascript");
                        toSend.push(eval(suffix));
                        toSend.push("```");
                        message.channel.sendMessage(toSend);
                    } catch (err) {
                        console.log(message.author.username + " eval komutunu hatalı kullandı."); // COMPLETELY REMOVED THE ERROR STACK
                        let array = [];
                        array.push("``Eval başarısız oldu.``");
                        array.push('```javascript');
                        array.push(err);
                        array.push('```');
                        message.channel.sendMessage(array);
                    }
                }
            } else {
                message.channel.sendMessage("``Eval yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮``");
                console.log(message.author.username + " eval komutunu kullanmayı denedi, en azından denedi yani.")
            }
        }
    },
    //twitch emote (API REDONE)
    "pjsalt": {
        process: function(bot, message) {
            message.channel.sendFile(picFolder + "pjsalt.png")
            if (message.mentions.users.size > -1) {
                message.delete().catch(e => {
                    console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
                });
            };
            console.log("It's too salty.")
        }
    },
    //kappa? (API REDONE)
    "kappa": {
        process: function(bot, message) {
            message.channel.sendFile(picFolder + "kappa.png")
            if (message.mentions.users.size > -1) {
                message.delete().catch(e => {
                    console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
                });
            };
            console.log("Raise your Kappa");
        }
    },
    //24.03.16 tarihli bir söz (API REDONE)
    "yayın": {
        process: function(bot, message) {
            message.channel.sendFile(picFolder + "yayin.png");
            if (message.mentions.users.size > -1) {
                message.delete().catch(e => {
                    console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
                });
            };
        }
    },
    //yeni komut eklendikçe burayı güncelle (API REDONE)
    "yardım": {
        process: function(bot, message) {
            message.channel.sendMessage(":postbox:").then(wMessage => {
                wMessage.delete(1200);
            });
            message.author.sendMessage("Şu anlık yapım aşamasındayım. Kullanabileceğin komutlar: ``g`` , ``bilgi`` , ``ping`` , ``abone-videoyun`` , ``ayarla`` , ``katıl`` , ``linuxpls`` , ``abone-dozkan`` , ``avatar`` , ``id`` , ``eval`` , ``kappa`` , ``hakkında`` , ``git`` , ``kanal`` .")
            if (message.mentions.users.size > -1) {
                message.delete().catch(e => {
                    console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
                });
            }
        }
    },
    //unshorts goo.gl links (API REDONE)
    "unshort": {
        process: function(bot, message, suffix) {
            var cachedUnshort = suffix;
            message.delete(100).catch(error => {
                message.author.sendMessage("I wasn't able to delete the link you sent to me. Can you delete it for me please?");
            });
            var config = require(jsonFolder + "config.json");
            var params = {
                auth: config.google_api_key,
                shortUrl: cachedUnshort
            };
            var suffix1 = cachedUnshort.replace(/https?\:\/\//, "");
            var suffix2 = suffix1.split("/");
            if (!cachedUnshort) {
                message.channel.sendMessage("Lütfen 'goo.gl' ile kısaltılmış adresi belirtiniz.");
                return;
            } else {
                if (suffix2.indexOf("goo.gl") > -1) {
                    urlshortener.url.get(params, function(err, response) {
                        if (err) {
                            var toSend = [],
                                count = 0;
                            toSend.push("```");
                            toSend.push(err);
                            toSend.push("```");
                            message.channel.sendMessage(toSend);
                        } else {
                            message.author.sendMessage(message.author + ": " + response.longUrl);
                        }
                    });
                } else {
                    message.channel.sendMessage(message.author + ", bu komut sadece 'goo.gl' ile kısaltılmış adresler için geçerlidir.");
                }
            }
            var config = undefined;
        }
    },
    //shorts long links to goo.gl links, currently not fucked up (API REDONE)
    "shorten": {
        process: function(bot, message, suffix) {
            var cachedShort = suffix;
            message.delete(100).catch(error => {
                message.author.sendMessage("I wasn't able to delete the link you sent to me. Can you delete it for me please?");
            });
            var config = require(jsonFolder + "config.json");
            var params = {
                auth: config.google_api_key,
                resource: {
                    "longUrl": cachedShort
                }
            };
            if (!cachedShort) {
                message.channel.sendMessage("Lütfen kısaltmak istediğin adresi belirt :(");
                return;
            } else {
                urlshortener.url.insert(params, function(err, response) {
                    if (err) {
                        var toSend = [],
                            count = 0;
                        toSend.push("```");
                        toSend.push(err);
                        toSend.push("```");
                        message.channel.sendMessage(toSend);
                    } else {
                        message.channel.sendMessage(message.author + ", " + response.id);
                    }
                });
            }
            var config = undefined;
        }
    },
    //OYLAMAĞĞĞ (API REDONE)
    "yenioylama": {
        process: function(bot, msg, suffix) {
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            if (!(commandWhitelist.indexOf(msg.author.id) > -1) && !msg.channel.permissionsFor(msg.guild.member(msg.author)).hasPermission("KICK_MEMBERS")) {return msg.channel.sendMessage(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ");};
            if (!suffix) {
                msg.channel.sendMessage("Lütfen bir bilgi belirtiniz.");
                return;
            }
            if (votebool == true) {
                msg.channel.sendMessage("Hali hazırda bir oylama işlemde.");
                return;
            }
            topicstring = suffix;
            votecreator = msg.author.username;
            votecreatorFull = msg.author.id
            voteserver = msg.channel.guild.name
            votechannel = msg.channel.name
            msg.channel.sendMessage("Yeni oylama başlatıldı: `" + suffix + "`\nOy vermek için `*oyver +/-` komutunu kullanınız.");
            votebool = true;
        }
    },
    "oyver": {
        process: function(bot, msg, suffix) {
            if (!suffix) {
                msg.channel.sendMessage("Bir şeye oy vermen lazım!");
                return;
            }
            if (votebool == false) {
                msg.channel.sendMessage("Şu anda aktif bir oylama yok. `*yenioylama` komutu ile yeni bir oylama başlatabilirsin.");
                return;
            }
            if (voter.indexOf(msg.author) != -1) {
                return;
            }
            voter.push(msg.author);
            var vote = suffix.split(" ")[0]
            if (vote == "+") {
                upvote += 1;
            }
            if (vote == "-") {
                downvote += 1;
            }
        }
    },
    "oydurumu": {
        process: function(bot, msg) {
            var msgArray = [];
            if (votebool == true) {
                msg.channel.sendMessage("Şu anda aktif bir oylama var.\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`").catch(e => {
                    console.log("Something happened: " + e);
                });
            } else {
                msg.channel.sendMessage("Şu anda bir oylama aktif değil.").catch(e => {
                    console.log("Something happened: " + e);
                });
            }
        }
    },
    "oylamayasonver": {
        process: function(bot, msg, suffix) {
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            if (msg.author.id === votecreatorFull) {
                msg.channel.sendMessage("`Oylama sonlandırıldı.`\n**Oylamanın sonuçları:**\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`").catch(e => {
                    console.log("Something happened: " + e);
                });
                upvote = 0;
                downvote = 0;
                voter = [];
                votebool = false;
                topicstring = "";
                votecreator = "";
                votecreatorFull = "";
                votechannel = "";
                voteserver = "";
            } else {
                if (commandWhitelist.indexOf(msg.author.id) > -1) {
                    msg.channel.sendMessage("`Oylama sonlandırıldı.`\n**Oylamanın sonuçları:**\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`").catch(e => {
                        console.log("Something happened: " + e);
                    });
                    upvote = 0;
                    downvote = 0;
                    voter = [];
                    votebool = false;
                    topicstring = "";
                    votecreator = "";
                    votecreatorFull = "";
                    votechannel = "";
                    voteserver = "";
                } else {
                    msg.channel.sendMessage(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ").catch(e => {
                        console.log("Something happened: " + e);
                    });
                }
            }
        }
    },
    "sunucudan-ayrıl": {
        process: function(bot, message) {
            if (message.channel.type === "dm" || message.channel.type === "group") {return;};
            let commandWhitelist = require(jsonFolder + "commandwhitelist.json");
            var gldName = message.channel.guild.name;
            var gldOwner = message.channel.guild.owner.user.username;
            if (commandWhitelist.indexOf(message.author.id) > -1) {
                message.channel.sendMessage("**Burada dükkanı kapatıyoruz, peki.**").catch(e => {
                    console.log("Something happened: " + e);
                });
                setTimeout(function() {
                    message.guild.leave().catch(e => {
                        console.log("Something happened: " + e);
                    });
                }, 1500);
            } else {
                if (message.author === message.channel.guild.owner) {
                    message.channel.sendMessage("**Burada dükkanı kapatıyoruz, peki.**").catch(e => {
                        console.log("Something happened: " + e);
                    });
                    setTimeout(function() {
                        message.guild.leave().catch(e => {
                            console.log("Something happened: " + e);
                        });
                    }, 1500);
                } else {
                    message.channel.sendMessage(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ").catch(e => {
                        console.log("Something happened: " + e);
                    });
                }
            }
        }
    },
    //airhorn functionality is here. ayy (API REDONE)
    "oynat": {
        process: function(bot, message, suffix) {
            if (message.channel.type === "dm" || message.channel.type === "group") {return;};
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            var voices = require(voiceFolder + "voices.json");
            var blacklistedVoices = require(voiceFolder + "blacklist.json");
            var vChannel = message.guild.member(message.author).voiceChannel;
            var checkConnectionOnGuild = bot.voiceConnections.get(message.guild.id, 'VoiceConnection');

            var stringedVoices = JSON.stringify(voices)
                .replace(/:"[\w]*(.ogg)"|,?"[\w]*(-[\s\S]*)?":"blacklist([0-9]*)?",?|"|[{}]/g, "")
                .replace(/,/g, ", ");

            if (suffix === "liste") {
                return message.channel.sendMessage(":postbox:").then(wMessage => {
                        wMessage.edit("```" + stringedVoices + "```\nKomut kullanımı (herhangi bir ses kanalında iken): `*oynat <klip adı>`");
                });
            }

            if (!vChannel) {
                return message.reply("Bir ses kanalına bağlı değilsin.");
            }

            if (checkConnectionOnGuild) {
                return;
            }

            if (voices[suffix] && voices[suffix].indexOf("blacklist") === -1) {
                vChannel.join().then(connection => {
                    const dispatcher = connection.playFile(voiceFolder + voices[suffix]);
                    dispatcher.once("end", () => {
                        vChannel.leave();
                    });
                });
            } else {
                if (voices[suffix] && voices[suffix].indexOf("blacklist") !== -1 && commandWhitelist.indexOf(message.author.id) > -1) {
                    vChannel.join().then(connection => {
                        const dispatcher = connection.playFile(voiceFolder + blacklistedVoices[voices[suffix]]);
                        dispatcher.once("end", () => {
                            vChannel.leave();
                        });
                    });
                } else {
                    return message.reply("Komut kullanımı hatalı.\n\nDoğru kullanım: `*oynat <klip adı>`\nKlip listesi için `*oynat liste`");
                }
            }
        }
    },
    "stealth": {
        process: function (bot, message, suffix) {
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            let cached = suffix;
            var localErrorCount = 0;
            if (!suffix) {
                return;
            } else {
                if (commandWhitelist.indexOf(message.author.id) > -1) {
                    message.delete().catch(e => {
                        localErrorCount += 1;
                        message.channel.sendMessage("I can't delete your message goddamnit").catch(e => {
                            localErrorCount += 1;
                            message.author.sendMessage("I can't delete your message goddamnit").catch(e => {
                                localErrorCount += 1;
                                console.log("I done goofed");
                                return;
                            });
                            return;
                        });
                        return;
                    });
                    if (localErrorCount > 0) {
                        return;
                    } else {
                        message.channel.sendMessage(cached).then(wMessage => {
                            wMessage.delete(11);
                        });
                    }
                } else {
                    return;
                }
            }
        }
    },
    "ttstealth": {
        process: function (bot, message, suffix) {
            if (message.channel.type === "dm" || message.channel.type === "group") {return;};
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            let cached = suffix;
            var localErrorCount = 0;
            if (!suffix) {
                return;
            } else {
                if (commandWhitelist.indexOf(message.author.id) > -1) {
                    message.delete().catch(e => {
                        localErrorCount += 1;
                        message.channel.sendMessage("I can't delete your message goddamnit").catch(e => {
                            localErrorCount += 1;
                            message.author.sendMessage("I can't delete your message goddamnit").catch(e => {
                                localErrorCount += 1;
                                console.log("I done goofed");
                                return;
                            });
                            return;
                        });
                        return;
                    });
                    if (localErrorCount > 0) {
                        return;
                    } else {
                        message.channel.sendMessage(cached, {
                            tts: true
                        }).then(wMessage => {
                            wMessage.delete(11);
                        });
                    }
                } else {
                    return;
                }
            }
        }
    },
    "replik": {
        process: function (bot, message) {
            let replikler = require(jsonFolder + "quotes.json");
            message.channel.sendMessage(get_random(replikler)).catch(e => {
                console.log("Something happened: " + e);
            });
        }
    },
    "serverinfo": {
        process: function (bot, message) {
            if (message.channel.type === "dm" || message.channel.type === "group") {return;};

            const guilddata = message.guild;

            const roleslist = guilddata.roles.map(Role => Role.name);
            var roleslist2 = roleslist.join(", ");

            const emojislist = guilddata.emojis.map(Emoji => Emoji.name);
            var emojislist2 = emojislist.join(", ");

            const memberC3 = guilddata.members.filter(gU => gU.user.bot != false).size;

            const textChannelsList = message.guild.channels.filter(GuildChannel => GuildChannel.type === "text").map(GuildChannel => GuildChannel.name).join(", ");
            const voiceChannelsList = message.guild.channels.filter(GuildChannel => GuildChannel.type === "voice").map(GuildChannel => GuildChannel.name).join(", ");

            if (!guilddata.splashURL) {
                var splashlink = "null";
            } else {
                var splashlink = guilddata.splashURL
            }

            if (!guilddata.iconURL) {
                var iconlink = "null";
            } else {
                var iconlink = guilddata.iconURL
            }

            var toFly = [];
                toFly.push(message.author);
                toFly.push("Listing server information for **" + guilddata.name + "**");
                toFly.push("");
                toFly.push("```javascript");
                toFly.push("           ID: " + guilddata.id);
                toFly.push("         Name: " + guilddata.name);
                toFly.push("        Owner: @" + guilddata.owner.user.username + "#" + guilddata.owner.user.discriminator);
                toFly.push("Creation date: " + guilddata.createdAt.toUTCString());
                toFly.push("      Members: " + guilddata.memberCount);
                if (memberC3 > 1) {
                    toFly.push("               " + memberC3 + " bots are in the count.");
                    if ((guilddata.memberCount - memberC3) > 1) {
                        toFly.push("               Which means " + (guilddata.memberCount - memberC3) + " people are in this server.");
                    } else {
                        toFly.push("               Which means " + (guilddata.memberCount - memberC3) + " person is in this server.");
                    }
                } else {
                    if (memberC3 = 0) {
                        toFly.push("               No bots are in this server.");
                        toFly.push("               Are you running me as a selfbot?");
                    } else {
                        toFly.push("               " + memberC3 + " bot is in the count.");
                        if ((guilddata.memberCount - memberC3) > 1) {
                            toFly.push("               Which means " + (guilddata.memberCount - memberC3) + " people are in this server.");
                        } else {
                            toFly.push("               Which means " + (guilddata.memberCount - memberC3) + " person is in this server.");
                        }
                    }
                }

                toFly.push("     Channels: " + guilddata.channels.size);
                toFly.push("         Text: " + textChannelsList);
                toFly.push("        Voice: " + voiceChannelsList);
                toFly.push("       Region: " + guilddata.region);
                toFly.push("         Icon: " + iconlink);
                toFly.push("       Splash: " + splashlink);
                toFly.push("");
                toFly.push("        Roles: " + guilddata.roles.size + " total roles");
                toFly.push("               " + roleslist2);
                if (guilddata.emojis.size > 0) {
                    toFly.push("");
                    toFly.push("       Emojis: " + guilddata.emojis.size + " total emojis");
                    toFly.push("               " + emojislist2);
                    toFly.push("```");
                } else {
                    toFly.push("```");
                }

            message.channel.sendMessage(toFly).catch(e => {
                console.log("Something happened: " + e);
            });
        }
    },
    "channelinfo": {
        process: function (bot, message) {
            if (message.channel.type === "dm" || message.channel.type === "group") {return;};

            if (message.mentions.channels.size == 0) {
                var reqchannel = message.channel;
                var ifcontrol = "null";
            } else {
                var reqchannel = message.mentions.channels.first();
                var ifcontrol = message.mentions.channels.first();
            }

            var vchanneldata = message.guild.member(message.author).voiceChannel;

            const channeldata = reqchannel;

            var toRun = []
                toRun.push(message.author);
                toRun.push("Listing channel information for " + channeldata);
                toRun.push("");
                toRun.push("```javascript");
                toRun.push("        ID: " + channeldata.id);
                toRun.push("      Type: " + channeldata.type);
                toRun.push("  Position: " + (channeldata.position + 1));

                if (channeldata.type === "voice") {
                    if (channeldata.userLimit == 0) {var ulimit = "unlimited";};

                    var vcmemberlist = channeldata.members.map(GuildMember => GuildMember.user.username);

                    toRun.push("   Bitrate: " + channeldata.bitrate);
                    toRun.push("User Limit: " + ulimit);
                    toRun.push("   Members: " + vcmemberlist);
                } else {
                    toRun.push("     Topic: " + channeldata.topic);
                    toRun.push("Created at: " + channeldata.createdAt.toUTCString());
                }

                if (!vchanneldata || ifcontrol.type === "text" || channeldata.type === "voice") {
                    toRun.push("```");
                } else {
                    if (vchanneldata.userLimit == 0) {var ulimit2 = "unlimited";};

                    var vcmemberlist2 = vchanneldata.members.map(GuildMember => GuildMember.user.username).join(", ");
                    toRun.push("```");
                    toRun.push("");
                    toRun.push("Listing channel information for **" + vchanneldata.name + "**");
                    toRun.push("");
                    toRun.push("```javascript");
                    toRun.push("        ID: " + vchanneldata.id);
                    toRun.push("      Type: " + vchanneldata.type);
                    toRun.push("  Position: " + (vchanneldata.position + 1));
                    toRun.push("   Bitrate: " + vchanneldata.bitrate);
                    toRun.push("User Limit: " + ulimit2);
                    toRun.push("   Members: " + vcmemberlist2);
                    toRun.push("```");
                }

            message.channel.sendMessage(toRun).catch(e => {
                console.log("Something happened: " + e);
            });
        }
    },
    "dlvid": {
        process: function (bot, message, suffix) {
            var cachedSuffix = suffix;
            var argss = cachedSuffix.split(" ");
            var fs = require("fs");
            var ytdl = require("ytdl-core");
            var datuh = Array.from(argss);
            var downTitle = datuh.slice(1).join(" ");

            if (message.author.id === "120267401672523776") {
                if (!argss) {
                    return message.reply("Please put a YouTube link.");
                } else {
                    var dlLink = datuh[0]
                        .replace(/https?\:\/\//, "")
                        .split("/");

                    if (/(www.)?youtu.be/.test(datuh[0]) === true || /(www.)?youtube.com/.test(datuh[0]) === true) {
                        if (!dlLink[1]) {
                            return message.reply("The link you have sent is invalid.");
                        }

                        var downloadLink = "https://" + dlLink.join("/");

                        ytdl.getInfo(downloadLink, null, function(err, videoInfo) {
                            if (message.channel.permissionsFor(message.guild.member(bot.user)).hasPermission("MANAGE_MESSAGES")) {
                                message.delete(50);
                            }
                            
                            if (err) {
                                return message.channel.sendMessage("We can't fetch your video.\n```javascript\n" + err.stack + "\n```");
                            }

                            if(isset(videoInfo)) {
                                if (!downTitle) {
                                    var fileName = videoInfo.title;
                                } else {
                                    var fileName = downTitle;
                                }

                                var isvideohere = fs.existsSync("./" + fileName + ".mp4");

                                if (isvideohere) {
                                    fs.unlink("./" + fileName + ".mp4", (err) => {
                                        if (err) {return console.log("Couldn't delete " + fileName + ".mp4\nProbably it's not here.");}
                                    });
                                }

                                message.channel.sendMessage("Downloading: **" + videoInfo.title + "** ["+ secondsToHms(videoInfo.length_seconds) + "]" + "\nFilename: **" + fileName + ".mp4**");

                                var video = ytdl.downloadFromInfo(videoInfo, {
                                    filter: function(format) {
                                        return format.container === "mp4";
                                    }
                                })
                                video.pipe(fs.createWriteStream('./' + fileName +'.mp4'));
                                video.on('response', function (res) {
                                    res.on('end', function() {
                                        message.channel.sendMessage("Download complete.");
                                    });
                                });
                            }
                        })
                    } else {
                        return message.reply("The link you have sent is invalid.");
                    }
                }
            } else {
                return;
            }
        }
    }
};

exports.tos = {
    globalTo: "1000",
    replik: "3000",
    oynat: "5000",
    mesajsil: "10000",
};
