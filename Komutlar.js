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
function findUser(members, query) { //NEED HALP
    var usr = members.find(member => {
        return (member === undefined || member.username == undefined) ? false : member.username.toLowerCase() == query.toLowerCase()
    });
    if (!usr) {
        usr = members.find(member => {
            return (member === undefined || member.username == undefined) ? false : member.username.toLowerCase().indexOf(query.toLowerCase()) == 0
        });
    }
    if (!usr) {
        usr = members.find(member => {
            return (member === undefined || member.username == undefined) ? false : member.username.toLowerCase().indexOf(query.toLowerCase()) > -1
        });
    }
    return usr || false;
};

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
    //çorçik kapkeyk (NEEDS MORE WORK)
    "mesajsil": {
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage("Komut bakım nedeniyle devre dışı.");
            /*
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            try {
                if (commandWhitelist.indexOf(msg.sender.id) > -1) {
                    if (suffix) {
                        var args = suffix.split(" ");
                        var amount = args.shift();
                        var all = false;
                        var error = false;
                        if (amount.startsWith("<")) {
                            var userid = amount.substring(2, amount.length - 1);
                        } else if (args.length > 0) {
                            var userid = args.shift();
                            if (userid.startsWith("<")) {
                                userid = userid.replace("<@", "");
                                userid = userid.replace(">", "");
                            } else {
                                msg.channel.sendMessage("**Lütfen geçerli bir kişi giriniz.** Kullanım : \"*mesajsil <sayı> <kişi>\"");
                                error = true;
                            }
                        } else {
                            var userid = false;
                        }
                        if (amount == "hepsi") {
                            all = true;
                        } else if (!numcon(amount)) {
                            msg.channel.sendMessage("**Lütfen geçerli bir sayı giriniz.** Kullanım : \"*mesajsil <sayı> <kişi>\"");
                            error = true;
                        }
                        if (!error) {
                            bot.deleteMessage(msg);
                            var msjlar = msg.channel.messages;
                            var count = 0;
                            amount++
                            for (var i = msjlar.length - 1; i > -1; i--) {
                                if (count >= amount) {
                                    break;
                                }
                                if (userid) {
                                    if (msjlar[i].sender.id == userid) {
                                        bot.deleteMessage(msjlar[i]);
                                        if (!all) {
                                            count++;
                                        }
                                    }
                                } else {
                                    bot.deleteMessage(msjlar[i]);
                                    if (!all) {
                                        count++;
                                    }
                                }
                            }
                        }
                    } else {
                        msg.channel.sendMessage("**\"*mesajsil\" komutunun kullanımında bir hata olmuşa benziyor, lütfen girdiğiniz komutu tekrar gözden geçiriniz.** Kullanım : \"*mesajsil <sayı> <kişi>\" ya da \"*mesajsil <kişi>\"");
                    }
                }
            } catch (e) {
                console.log("Error *mesajsil at " + msg.channel + " : " + e);
            }
        }
    },
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
		*/
        }
    },
    //çorçik info kodu, kullanıcının kim olduğunu öğren. (NEEDS MORE WORK)
    "bilgi": {
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage("Komut bakım nedeniyle devre dışı.");
            /*
            if (!msg.channel.isPrivate) {
                if (suffix) {
                    if (msg.mentions.users.length > 0) {
                        if (msg.everyoneMentioned) {
                            bot.sendMessage(msg, msg.author + ", lütfen bu komutu kullanma tamam mı?", function(error, wMessage) {
                                bot.deleteMessage(wMessage, {
                                    "wait": 24000
                                });
                            });
                            return;
                        }
                        if (msg.mentions.users.length > 4) {
                            bot.sendMessage(msg, "Komutun kullanımı 4 kişi ile limitlidir.", function(error, wMessage) {
                                bot.deleteMessage(wMessage, {
                                    "wait": 24000
                                });
                            });
                            return;
                        }
                        msg.mentions.map(function(usr) {
                            var toSend = [],
                                count = 0;
                            toSend.push(usr.username + " #" + usr.discriminator + " hakkındaki bilgiler:");
                            if (usr.bot === true) {
                                var isUserABot = "Evet";
                            } else {
                                if (usr.bot === false) {
                                    var isUserABot = "Hayır";
                                } else {
                                    var isUserABot = "Tanımlanamadı.";
                                };
                            };
                            toSend.push("**Kullanıcı Bot mu?:** " + isUserABot);
                            toSend.push("**ID:** " + usr.id);
                            if (usr.status === "online") {
                                var userStatus = "Çevrimiçi";
                            } else {
                                if (usr.status === "idle") {
                                    var userStatus = "Uzakta";
                                } else {
                                    var userStatus = "Çevrimdışı";
                                }
                            };
                            if (usr.game && usr.game.name !== undefined && usr.game.name !== null && usr.game.name !== "null") {
								toSend.push("**Durumu:** " + userStatus + "\n**Oynadığı oyun:** " + usr.game.name);
							} else {
								toSend.push("**Durumu:** " + userStatus);
							}
                            var detailsOf = msg.channel.server.detailsOfUser(usr);
                            if (detailsOf) toSend.push("**Sunucuya katılma zamanı:** " + new Date(msg.channel.server.detailsOfUser(usr).joinedAt).toUTCString());
                            else toSend.push("**Sunucuya katılma zamanı:** ``Katılmadı``");
                            if (msg.channel.server.rolesOfUser(usr.id) != undefined) {
                                var roles = msg.channel.server.rolesOfUser(usr.id).map(role => role.name);
                                if (roles) {
                                    roles = roles.join(", ").replace(/@/g, '@\u200b');
                                    if (roles && roles !== "")
                                        if (roles.length <= 1500) {
                                            toSend.push("**Rolleri:** `" + roles + "`");
                                        } else {
                                            toSend.push("**Rolleri:** `" + roles.split(", ").length + "`");
                                        }
                                    else
                                        toSend.push("**Rolleri:** `yok`");
                                } else toSend.push("**Rolleri:** Errör");
                            } else toSend.push("**Rolleri:** Errör");
                            if (usr.avatarURL != null) {
                                toSend.push("**Avatar URL:** `" + usr.avatarURL + "`");
                            }
                            if (msg.mentions.users.length >= 1) {
                                bot.deleteMessage(msg);
                            }
                            bot.sendMessage(msg, toSend);
                        });
                    } else {
                        if (msg.everyoneMentioned) {
                            bot.sendMessage(msg, "Pist, " + msg.author + ", bunu bir daha yapma tamam mı?", function(error, wMessage) {
                                bot.deleteMessage(wMessage, {
                                    "wait": 24000
                                });
                            });
                            return;
                        }
                        var users = suffix.split(/, ?/);
                        if (users.length > 4) {
                            bot.sendMessage(msg, "Komutun kullanımı 4 kişi ile limitlidir.", function(error, wMessage) {
                                bot.deleteMessage(wMessage, {
                                    "wait": 24000
                                });
                            });
                            return;
                        }
                        users.map(function(user) {
                            var usr = findUser(msg.channel.server.members, user);
                            if (usr) {
                                var toSend = [],
                                    count = 0;
                                toSend.push(usr.username + " #" + usr.discriminator + " hakkındaki bilgiler:");
                                if (usr.bot === true) {
                                    var isUserABot = "Evet";
                                } else {
                                    if (usr.bot === false) {
                                        var isUserABot = "Hayır";
                                    } else {
                                        var isUserABot = "Tanımlanamadı.";
                                    };
                                };
                                toSend.push("**Kullanıcı \"Bot\" mu?:** " + isUserABot);
                                toSend.push("**ID:** " + usr.id);
                                if (usr.status === "online") {
                                    var userStatus = "Çevrimiçi";
                                } else {
                                    if (usr.status === "idle") {
                                        var userStatus = "Uzakta";
                                    } else {
                                        var userStatus = "Çevrimdışı";
                                    }
                                };
                                if (usr.game && usr.game.name !== undefined && usr.game.name !== null && usr.game.name !== "null") toSend.push("**Durumu:** " + userStatus + "\n**Oynadığı oyun:** " + usr.game.name);
                                else toSend.push("**Durumu:** " + userStatus);
                                var detailsOf = msg.channel.server.detailsOfUser(usr);
                                if (detailsOf) toSend.push("**Sunucuya katılma zamanı:** " + new Date(msg.channel.server.detailsOfUser(usr).joinedAt).toUTCString());
                                else toSend.push("**Sunucuya katılma zamanı:** ``Katılmadı``");
                                if (msg.channel.server.rolesOfUser(usr.id) != undefined) {
                                    var roles = msg.channel.server.rolesOfUser(usr.id).map(role => role.name);
                                    if (roles) {
                                        roles = roles.join(", ").replace(/@/g, '@\u200b');
                                        if (roles && roles !== "")
                                            if (roles.length <= 1500) {
                                                toSend.push("**Rolleri:** `" + roles + "`");
                                            } else {
                                                toSend.push("**Rolleri:** `" + roles.split(", ").length + "`");
                                            }
                                        else
                                            toSend.push("**Rolleri:** `yok`");
                                    } else toSend.push("**Rolleri:** Errör");
                                } else toSend.push("**Rolleri:** Errör");
                                if (usr.avatarURL != null) {
                                    toSend.push("**Avatar URL:** `" + usr.avatarURL + "`");
                                }
                                if (msg.mentions.users.length >= 1) {
                                    bot.deleteMessage(msg);
                                }
                                bot.sendMessage(msg, toSend);
                            } else bot.sendMessage(msg, " \"" + user + "\" isimli kullanıcıyı bulamadım. Eğer birden fazla kullanıcıyı aramak istiyorsan isimlerin arasına virgül koy.", function(error, wMessage) {
                                bot.deleteMessage(wMessage, {
                                    "wait": 24000
                                });
                            });
                        });
                    }
                } else {
                    var toSend = [];
                    if (msg.mentions.users.length > -1) {
                        bot.deleteMessage(msg);
                    }
                    toSend.push(msg.channel.server.name + " isimli sunucu hakkındaki bilgiler:");
                    toSend.push("**Server ID:** " + msg.channel.server.id);
                    toSend.push("**Sunucu Sahibi:** " + msg.channel.server.owner.username + " (**ID:** " + msg.channel.server.owner.id + ")");
                    toSend.push("**Sunucunun Yeri:** " + msg.channel.server.region);
                    toSend.push("**Üye Sayısı:** " + msg.channel.server.members.length + " **Kanallar:** " + msg.channel.server.channels.length);
                    var roles = msg.channel.server.roles.map(role => role.name);
                    roles = roles.join(", ").replace(/@/g, '@\u200b');
                    if (roles.length <= 1500) toSend.push("**Roller:** `" + roles + "`");
                    else toSend.push("**Roller:** `" + roles.split(", ").length + "`");
                    toSend.push("**Varsayılan kanal:** " + msg.channel.server.defaultChannel);
                    toSend.push("**Bu kanalın ID'si:** " + "``" + msg.channel.id + "``");
                    if (msg.mentions.users.length > -1) {
                        bot.deleteMessage(msg);
                    }
                    bot.sendMessage(msg, toSend, function(error, wMessage) {
                        bot.deleteMessage(wMessage, {
                            "wait": 24000
                        });
                    });
                }
            } else {
				bot.sendMessage(msg, "Bunu ÖM ile yapamazsın.", function(error, wMessage) {
					bot.deleteMessage(wMessage, {
						"wait": 36000
					});
				});
			}
		*/
        }
    },
    //botun yaşayıp yaşamadığını öğren (NEED SUPPORT FROM API GUILD)
    "ping": {
        process: function(bot, msg) {
            var messages = ["**PONG**", "Pong! diyeceğimi sandın değil mi?", "Hala buradayım..", "**...**", "ping"];
            var random = messages[Math.floor(Math.random() * messages.length)];
            msg.channel.sendMessage(random).then(sentMsg => {
                sentMsg.edit(random + "\t|\t Şu kadar sürdü: " + (sentMsg.timestamp - msg.timestamp) + "ms")
            });
        }
    },
    //bane git sayfası (API REDONE)
    "git": {
        process: function(bot, msg, suffix) {
            msg.channel.sendMessage(msg.author + ", https://github.com/mertturunc/Bane");
        }
    },
    /* REMOVED COMMAND
	//github güncellemesi yapar (YAPAMADI)
    "güncelle": {
    	process: function(bot, message) {
    		let commandWhiteList = require('./commandwhitelist.json');
    		if (commandWhiteList.indexOf(message.sender.id) > -1) {
    			child_process.exec("git stash && git pull && pm2 restart all", puts);
    			console.log("Update time!");
    		}
    	}
    },
    //restart (EDEMEDİ)
    "restart": {
    	process: function(bot, message) {
    		let commandWhiteList = require('./commandwhitelist.json');
    		try {
    			if (commandWhiteList.indexOf(message.sender.id) > -1) {
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
            let commandWhiteList = require(jsonFolder + 'commandwhitelist.json');
            try {
                if (commandWhiteList.indexOf(message.author.id) > -1) {
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
            let commandWhiteList = require(jsonFolder + 'commandwhitelist.json');
            try {
                if (commandWhiteList.indexOf(message.author.id) > -1) {
                    if (message.mentions.users.length > -1) {
                        message.delete(1200);
                    };
                    bot.user.setStatus('online', suffix);
                    message.channel.sendMessage("Tamamdır! Şu an oynanan oyun: " + suffix).then(wMessage => {
                        wMessage.delete(1200);
                    });
                    console.log(message.author.username + " \"*ayarla " + suffix + "\" " + "komutunu kullandı.");
                } else {
                    message.channel.sendMessage(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ");
                }
            } catch (exp) {
                console.log("you dun goofed: ", exp);
            }
        }
    },
    //botun bir sunucuya katılmasını sağlar (ingiliççem yetmedi çevir bunu :C ) (API REDONE)
    "katıl": {
        process: function(bot, message) {
                var config = require(jsonFolder + "config.json");
                message.channel.sendMessage(" :postbox: ").then(wMessage => {
                    wMessage.delete(1200);
                });
                message.author.sendMessage("Since we changed to the Official API, We have to sacrifice the \"Join by Invite\" method. \nBut, you can use the link below to add me on any server. (You have to have \"Manage Server\" role on the Server where you want to add me.)\nhttps://discordapp.com/oauth2/authorize?&client_id=" + config.api_client_id + "&scope=bot&permissions=40960");
                var config = undefined;
            }
            /*
        process: function(bot, message, suffix) {
            let query = suffix;
            let sender = message.author.username;
            if (!query) {
            	bot.sendMessage(message.channel, "Lütfen davet linkini belirt.");
            	return;
            }
            let invite = message.content.split(" ")[1];
            bot.joinServer(invite, function(error, server) {
            	if (error) {
            		bot.sendMessage(message.channel, "Sanırım birşeyler ters gitti: " + error);
            	} else {
            		bot.sendMessage(message.channel, "Tamamdır, birazdan buradayım: " + server);
            		// messageArray çalışmıyor, halp //
            		let messageArray = [];
            		messageArray.push(bot.user.username + "burada, bu sunucuya " + message.author + "tarafından alındım.");
            		messageArray.push("İstersen `" + trigger + "``*yardım`` yaz ve neler yapabileceğimi gör.");
            		messageArray.push("Beni burada istemiyorsan lütfen " + AuthDetails.discordjs_trigger + "komutunu kullan.");
            		bot.sendMessage(server.defaultChannel, messageArray);
            		console.log("Sunucuya katılma zamanı: " + server)
            				}
            			});
            		}
		*/
    },
    //en gereksiz kod (API REDONE)
    "helö": {
        process: function(bot, message) {
            message.channel.sendMessage("**Helö?**").then(wMessage => {
                wMessage.delete(600);
            });
            if (message.mentions.users.length > -1) {
                message.delete();
            };
        }
    },
    //ocd mania linux (API REDONE)
    "linuxpls": {
        process: function(bot, message) {
            message.channel.sendFile(picFolder + "linuxgemini.png", "linuxgemini.png", "linux pls");
            if (message.mentions.users.length > -1) {
                message.delete();
            };
            console.log("linux pls, Komutu kullanan: " + message.author.username);
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
    //avatar filan veriyo (NEEDS MORE WORK)
    "avatar": {
        process: function(bot, msg, suffix) {
			msg.channel.sendMessage("Komut bakım nedeniyle devre dışı.");
			/*
            if (msg.channel.isPrivate) {
                if (msg.author.avatarURL != null) {
                    bot.sendMessage(msg, "PM ile sadece senin avatarını yollayabilirim. Al bakalım: " + msg.author.avatarURL);
                    return;
                }
                if (msg.author.avatarURL == null) {
                    bot.sendMessage(msg, "PM ile sadece senin avatarını yollayabilirim, ancak avatarın yok gibi gözüküyor.");
                    return;
                }
            }
            if (msg.mentions.users.length == 0 && !suffix) {
                (msg.author.avatarURL != null) ? bot.sendMessage(msg, "**" + msg.author.username + "** isimli kullanıcının avatarı: " + msg.author.avatarURL): bot.sendMessage(msg, msg.author.username + " isimli kullanıcının avatarı yok gibi gözüküyor.", function(error, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 8000
                    });
                });
            } else if (msg.mentions.users.length > 0) {
                if (msg.everyoneMentioned) {
                    bot.sendMessage(msg, "Pist, " + msg.author.username.replace(/@/g, '@\u200b') + ", bunu bir daha yapma lütfen.", function(error, wMessage) {
                        bot.deleteMessage(wMessage, {
                            "wait": 8000
                        });
                    });
                    return;
                }
                if (msg.mentions.users.length > 6) {
                    bot.sendMessage(msg, "Komut 6 kişi ile limitlidir", function(error, wMessage) {
                        bot.deleteMessage(wMessage, {
                            "wait": 8000
                        });
                    });
                    return;
                }
                msg.mentions.map(function(usr) {
                    (usr.avatarURL != null) ? bot.sendMessage(msg, "**" + usr.username.replace(/@/g, '@\u200b') + "** isimli kullanıcının avatarı: " + usr.avatarURL + ""): bot.sendMessage(msg, "**" + usr.username + "**isimli kullanıcının avatarı yok gibi gözüküyor.'", function(error, wMessage) {
                        bot.deleteMessage(wMessage, {
                            "wait": 8000
                        });
                    });
                });
            } else {
                if (msg.everyoneMentioned) {
                    bot.sendMessage(msg, "Pist, " + msg.author.username.replace(/@/g, '@\u200b') + ", bunu bir daha yapma lütfen.", function(error, wMessage) {
                        bot.deleteMessage(wMessage, {
                            "wait": 8000
                        });
                    });
                    return;
                }
                var users = suffix.split(/, ?/);
                if (users.length > 6) {
                    bot.sendMessage(msg, "Komut 6 kişi ile limitlidir", function(error, wMessage) {
                        bot.deleteMessage(wMessage, {
                            "wait": 8000
                        });
                    });
                    return;
                }
                users.map(function(user) {
                    var usr = findUser(msg.channel.server.members, user);
                    if (usr) {
                        (usr.avatarURL != null) ? bot.sendMessage(msg, "**" + usr.username.replace(/@/g, '@\u200b') + "** isimli kullanıcının avatarı: " + usr.avatarURL + ""): bot.sendMessage(msg, "**" + usr.username + "** has no avatar", function(error, wMessage) {
                            bot.deleteMessage(wMessage, {
                                "wait": 8000
                            });
                        });
                    } else {
                        bot.sendMessage(msg, "**" + "\"" + user + "\"  ** isimli kullanıcı bulunamadı.  Eğer birden fazla kişinin avatarını istiyorsan kullanıcıları virgül ile ayır.", function(error, wMessage) {
                            bot.deleteMessage(wMessage, {
                                "wait": 20000
                            });
                        });
                    }
                });
            }
		*/
        }
    },
    //kullanıcıya ait ID bilgisi ve yazı kanalının ID bilgisini verir (API REDONE)
    "id": {
        process: function(bot, msg, suffix) {
            if (suffix && suffix.trim().replace("\"", "") === "kanal") msg.channel.sendMessage("Kanal ID'si: " + "``" + msg.channel.id + "``");
            else msg.channel.sendMessage("<@" + msg.author.id + ">" + " isimli kullanıcıya ait ID: " + "``" + msg.author.id + "``");
            if (msg.mentions.users.length > -1) {
                msg.delete();
            }
        }
    },
    //düzgün çalışan bir eval (API REDONE)
    "eval": {
        process: function(bot, message, suffix) {
            let blockedEval = require(jsonFolder + 'blockedeval.json');
            let evalWhitelist = require(jsonFolder + 'evalwhitelist.json');
            if (evalWhitelist.indexOf(message.author.id) > -1) {
                if (blockedEval.indexOf(suffix) > -1) {
                    var bricxs = ["what are you doing", "staph", "don't kill me pls", "**...**"];
                    var cRandom = bricxs[Math.floor(Math.random() * bricxs.length)];
                    message.channel.sendMessage(message.author + " " + cRandom);
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
            if (message.mentions.users.length > -1) {
                message.delete();
            };
            console.log("It's too salty.")
        }
    },
    //kappa? (API REDONE)
    "kappa": {
        process: function(bot, message) {
            message.channel.sendFile(picFolder + "kappa.png")
            if (message.mentions.users.length > -1) {
                message.delete();
            };
            console.log("Raise your Kappa")
        }
    },
    //24.03.16 tarihli bir söz (API REDONE)
    "yayın": {
        process: function(bot, message) {
            message.channel.sendFile(picFolder + "yayin.png");
            if (message.mentions.users.length > -1) {
                message.delete();
            };
        }
    },
    //kanal hakkında bilgi verir (API REDONE)
    "kanal": {
        process: function(bot, msg) {
            var toSend = [],
                count = 0;
            toSend.push("<#" + msg.channel.id + ">" + " hakkında bilgiler.")
            toSend.push("**Topic:** " + "``" + msg.channel.topic + "``");
            toSend.push("**ID:** " + "``" + msg.channel.id + "``");
            msg.channel.sendMessage(toSend);
        }
    },
    //yeni komut eklendikçe burayı güncelle (API REDONE)
    "yardım": {
        process: function(bot, message) {
            message.channel.sendMessage(":postbox:").then(wMessage => {
                wMessage.delete(1200);
            });
            message.author.sendMessage("Şu anlık yapım aşamasındayım. Kullanabileceğin komutlar: ``g`` , ``bilgi`` , ``ping`` , ``abone-videoyun`` , ``ayarla`` , ``katıl`` , ``linuxpls`` , ``abone-dozkan`` , ``avatar`` , ``id`` , ``eval`` , ``kappa`` , ``hakkında`` , ``git`` , ``kanal`` .")
            if (message.mentions.users.length > -1) {
                message.delete();
            }
        }
    },
    //unshorts goo.gl links (API REDONE)
    "unshort": {
        process: function(bot, message, suffix) {
            var config = require(jsonFolder + "config.json");
            var params = {
                auth: config.google_api_key,
                shortUrl: suffix
            };
            var suffix1 = suffix.replace("http://" + "https://", "");
            var suffix2 = suffix1.split("/");
            if (!suffix) {
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
            var config = require(jsonFolder + "config.json");
            var params = {
                auth: config.google_api_key,
                resource: {
                    "longUrl": suffix
                }
            };
            if (!suffix) {
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
            if (commandWhitelist.indexOf(msg.author.id) > -1) {
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
            } else {
                bot.sendMessage(msg, " ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ");
            }
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
                msg.channel.sendMessage("Şu anda aktif bir oylama var.\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`")
            } else {
                msg.channel.sendMessage("Şu anda bir oylama aktif değil.")
            }
        }
    },
    "oylamayasonver": {
        process: function(bot, msg, suffix) {
            let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
            if (msg.author.id === votecreatorFull) {
                msg.channel.sendMessage("`Oylama sonlandırıldı.`\n**Oylamanın sonuçları:**\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`");
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
                    msg.channel.sendMessage("`Oylama sonlandırıldı.`\n**Oylamanın sonuçları:**\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`");
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
                    msg.channel.sendMessage(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ");
                }
            }
        }
    },
    "sunucudan-ayrıl": {
        process: function(bot, message) {
            let commandWhitelist = require(jsonFolder + "commandwhitelist.json");
            if (commandWhitelist.indexOf(message.author.id) > -1) {
                message.channel.sendMessage("**Burada dükkanı kapatıyoruz, peki.**");
                setTimeout(function() {
                    message.guild.leave();
                }, 1500);
            } else {
                if (message.author === message.channel.server.owner) {
                    message.channel.sendMessage("**Burada dükkanı kapatıyoruz, peki.**");
                    setTimeout(function() {
                        message.guild.leave();
                    }, 1500);
                } else {
                    message.channel.sendMessage(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ");
                }
            }
        }
    },
    "moduletest": {
        process: function(bot, message) {
            var kahve = require(libFolder + "ModuleTest.js").kahve;
            kahve.test.run(bot, message);
        }
    },
    //airhorn functionality is here. ayy (API REDONE)
    "oynat": {
        process: function(bot, message, suffix) {
            var voices = require(voiceFolder + "voices.json");
            var vChannel = message.guild.member(message.author).voiceChannel;
            var checkConnectionOnGuild = bot.voiceConnections.get(message.guild.id, 'VoiceConnection');
            if (!checkConnectionOnGuild) {
                console.log("channel check returned null");
				var checkConnectionOnGuild = "no";
            } else {
                console.log("channel check returned yes");
                var checkConnectionOnGuild = "yes";
            };
            if (!suffix) {
                message.channel.sendMessage(message.author + ", herhangi bir şey belirtmedin. ÖM olarak sana neler olduğunu gönderdim. \nKomut kullanımı (herhangi bir ses kanalında iken): `*oynat <klip adı>`");
                message.author.sendMessage("Tamam, işte kullanabileceğin klipler: \n```" + voices.liste + "```\nKomut kullanımı: `*oynat <klip adı>`");
            } else {
                if (suffix === "liste") {
                    message.channel.sendMessage(":postbox:").then(wMessage => {
                        wMessage.delete(1453);
                    });
                    message.author.sendMessage("Tamam, işte kullanabileceğin klipler: \n```" + voices.liste + "```\nKomut kullanımı (herhangi bir ses kanalında iken): `*oynat <klip adı>`");
                } else {
                    if (voices[suffix] === undefined) {
                        message.channel.sendMessage(message.author + ", belirttiğin klip adı geçerli değil. ÖM olarak sana neler olduğunu gönderdim. \nKomut kullanımı (herhangi bir ses kanalında iken): `*oynat <klip adı>`");
                        message.author.sendMessage("Tamam, işte kullanabileceğin klipler: \n```" + voices.liste + "```\nKomut kullanımı: `*oynat <klip adı>`");
                    } else {
                        if (!vChannel) {
                            message.channel.sendMessage(message.author + ", herhangi bir ses kanalına bağlı değilsin.");
                        } else {
                            if (checkConnectionOnGuild === "no") {
                                vChannel.join().then(connection => {
                                    const dispatcher = connection.playFile(voiceFolder + voices[suffix]);
                                    dispatcher.once("end", () => {
                                        vChannel.leave();
                                        console.log("playing stopped");
                                    });
                                });
                            } else {
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
};
