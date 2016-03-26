'use strict';
//fonksiyonlar buraya

function findUser(members, query) {
	var usr = members.find(member=>{ return (member === undefined || member.username == undefined) ? false : member.username.toLowerCase() == query.toLowerCase() });
	if (!usr) { usr = members.find(member=>{ return (member === undefined || member.username == undefined) ? false : member.username.toLowerCase().indexOf(query.toLowerCase()) == 0 }); }
	if (!usr) { usr = members.find(member=>{ return (member === undefined || member.username == undefined) ? false : member.username.toLowerCase().indexOf(query.toLowerCase()) > -1 }); }
	return usr || false;
};

function numcon(str) {
    if(/^[0-9]+$/.test(str)) {
        return true;
    }
    return false;
};

function updateJSON(fnjson, fjson) {
    require("fs").writeFile(jsonFolder + fnjson,JSON.stringify(fjson,null,2), null);
};
function updateEvalPerms() {updateJSON(jsonFolder + "evalwhitelist.json");};
function updateCmdPerms() {updateJSON(jsonFolder + "commandwhitelist.json");};

//var şeyside buraya
var aliases = {
	"h": "yardım", "komutlar": "help",
	"myid": "id",
	"p": "ping",
	"j": "katıl", "joins": "join",
	"i": "info",
	"a": "avatar",
	"g": "google", "lmgtfy": "google",
};

var config = require(jsonFolder + "config.json");
var version = require("./package.json").version; //don't touch this


exports.commands = {
//bırakta senin için gogıllasın -AYAKLI GOOGIL
	"g": {
		process: function(bot, msg, suffix) {
			if (!suffix) { bot.sendMessage(msg, " ``*google`` dedikten sonra arayacağın şeyi yaz. "); return; }
			suffix = suffix.split(" ");
			for (var i = 0; i < suffix.length; i++) { suffix[i] = encodeURIComponent(suffix[i]); }
			bot.sendMessage(msg, "Your search result: http://www.google.com/search?q=" + suffix.join("+") + "&btnI=" );
		}
	},
//botun adı değişir
	"isim-değiş": {
		process: function(bot,msg,suffix) {
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
			if (commandWhitelist.indexOf(msg.sender.id) > -1) {
				if(suffix) {
					console.log("msg.sender.id botun adını " + suffix + " ile değiştirdi.");
					bot.setUsername(suffix, function(error) {
						bot.sendMessage(msg.channel, error);
					});
						bot.deleteMessage(msg);
				}
			}
		}
	},
//çorçik kapkeyk
	"mesajsil": {
		process: function(bot,msg,suffix) {
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
	        try {
	            if (commandWhitelist.indexOf(msg.sender.id) > -1) {
	                if(suffix) {
	                    var args = suffix.split(" ");
	                    var amount = args.shift();
	                    var all = false;
	                    var error = false;
	                    if(amount.startsWith("<")) {
	                        var userid = amount.substring(2, amount.length-1);
	                    } else if(args.length > 0) {
	                        var userid = args.shift();
	                        if(userid.startsWith("<")) {
	                           	userid = userid.replace("<@", "");
	                           	userid = userid.replace(">", "");
	                        } else {
	                            bot.sendMessage(msg.channel, "**Lütfen geçerli bir kişi giriniz.** Kullanım : \"*mesajsil <sayı> <kişi>\"");
	                            error = true;
	                        }
	                    } else {
	                        var userid = false;
	                    }
	                    if(amount == "hepsi") {
	                       	all = true;
	                    } else if(!numcon(amount)) {
	                        bot.sendMessage(msg.channel, "**Lütfen geçerli bir sayı giriniz.** Kullanım : \"*mesajsil <sayı> <kişi>\"");
	                        error = true;
	                    }
	                    if(!error) {
	                        bot.deleteMessage(msg);
	        	            var msjlar = msg.channel.messages;
	                        var count = 0;
	                        amount++
	        	            for(var i = msjlar.length - 1; i > -1; i--) {
	                            if(count >= amount) {
	                               	break;
	                            }
	                            if(userid) {
	                                if(msjlar[i].sender.id == userid) {
	            	                   	bot.deleteMessage(msjlar[i]);
	                                   	if(!all) {
	                                   		count++;
	                                   	}
	            	                }
	                            } else {
	                                bot.deleteMessage(msjlar[i]);
	                                if(!all) {
	                                    count++;
	                                }
	                            }
	        	            }
	                    }
	                } else {
	                    bot.sendMessage(msg.channel, "**\"*mesajsil\" komutunun kullanımında bir hata olmuşa benziyor, lütfen girdiğiniz komutu tekrar gözden geçiriniz.** Kullanım : \"*mesajsil <sayı> <kişi>\" ya da \"*mesajsil <kişi>\"");
	                }
		        }
		    } catch(e) {
		        console.log("Error *mesajsil at " + msg.channel + " : " + e);
		    }
		}
	},
	//kim ulan bu bot
	"hakkında": {
		process: function(bot, msg) {
			var toSend = [], count = 0;
	    toSend.push( "**İsim:**" + " Bane Elemental");
			toSend.push( "**Versiyon:**" + " v0.0.2");
			toSend.push( "**GitHub:** " + " https://github.com/mertturunc/Bane" );
			toSend.push( "**Yapımcılar:** " + "<@107111069952012288> ve <@120267401672523776> 'dir." );
	    toSend.push( "**Komutlar:**" + " ``*yardım`` yazarak komutları öğrenebilirsin.");
				bot.sendMessage(msg, toSend);
		}
	},
//çorçik info kodu, kullanıcının kim olduğunu öğren.
		"bilgi": {
			process: function(bot, msg, suffix) {
				if (!msg.channel.isPrivate) {
					if (suffix) {
						if (msg.mentions.length > 0) {
							if (msg.everyoneMentioned) { bot.sendMessage(msg, msg.author.username.replace(/@/g, '@\u200b') + "lütfen bu komutu kullanma tamam mı?", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 24000}); }); return; }
							if (msg.mentions.length > 4) { bot.sendMessage(msg, "Komutun kullanımı 4 kişi ile limitlidir.", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 24000}); }); return; }
							msg.mentions.map(function(usr) {
								var toSend = [], count = 0;
								toSend.push(usr.username  + " #" + usr.discriminator + " " + "Hakkındaki bilgiler:" );
								toSend.push("**ID:** " + usr.id);
								if (usr.game && usr.game.name !== undefined && usr.game.name !== null && usr.game.name !== "null") toSend.push("**Durumu:** " + usr.status + " **En son oynadığı oyun:** " + usr.game.name);
								else toSend.push("**Durumu:** " + usr.status);
								var detailsOf = msg.channel.server.detailsOfUser(usr);
								if (detailsOf) toSend.push("**Sunucuya katılma zamanı:** " + new Date(msg.channel.server.detailsOfUser(usr).joinedAt).toUTCString());
								else toSend.push("**Sunucuya katılım zamanı:** ``Katılmadı``");
								if (msg.channel.server.rolesOfUser(usr.id) != undefined) {
									var roles = msg.channel.server.rolesOfUser(usr.id).map(role=>role.name);
									if (roles) {
										roles = roles.join(", ").replace(/@/g, '@\u200b');
										if (roles && roles !== "")
											if (roles.length <= 1500) { toSend.push("**Rolleri:** `" + roles + "`"); } else { toSend.push("**Rolleri:** `" + roles.split(", ").length + "`"); }
										else
											toSend.push("**Rolleri:** `yok`");
									} else toSend.push("**Rolleri:** Errör");
								} else toSend.push("**Rolleri:** Errör");
								bot.servers.map(server=>{ if (server.members.indexOf(usr) > -1) { count += 1; }});
								if (count > 1) { toSend.push("**Ortak sunucular:** " + count); }
								if (usr.avatarURL != null) { toSend.push("**Avatar URL:** `" + usr.avatarURL + "`"); }
								if (msg.mentions.length >= 1) { bot.deleteMessage(msg); }
								bot.sendMessage(msg, toSend);
							});
						} else {
							if (msg.everyoneMentioned) { bot.sendMessage(msg, "Pist, " + msg.author.username.replace(/@/g, '@\u200b') + ", bunu bir daha yapma tamam mı?", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 24000}); }); return; }
							var users = suffix.split(/, ?/);
							if (users.length > 4) { bot.sendMessage(msg, "Komutun kullanımı 4 kişi ile limitlidir.", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 24000}); }); return; }
							users.map(function(user) {
								var usr = findUser(msg.channel.server.members, user);
								if (usr) {
									var toSend = [], count = 0;
									toSend.push( usr.username + "#" + usr.discriminator + "Hakkındaki bilgiler:" );
									toSend.push("**ID:** " + usr.id);
									if (usr.game && usr.game.name !== undefined && usr.game.name !== null && usr.game.name !== "null") toSend.push("**Status:** " + usr.status + " **last playing** " + usr.game.name);
									else toSend.push("**Durumu:** " + usr.status);
									var detailsOf = msg.channel.server.detailsOfUser(usr);
									if (detailsOf) toSend.push("**Şuraya katıldım:** " + new Date(msg.channel.server.detailsOfUser(usr).joinedAt).toUTCString());
									else toSend.push("**Şuraya katıldım:** Errör");
									if (msg.channel.server.rolesOfUser(usr.id) != undefined) {
										var roles = msg.channel.server.rolesOfUser(usr.id).map(role=>role.name);
										if (roles) {
											roles = roles.join(", ").replace(/@/g, '@\u200b');
											if (roles && roles !== "")
												if (roles.length <= 1500) { toSend.push("**Rolleri:** `" + roles + "`"); } else { toSend.push("**Rolleri:** `" + roles.split(", ").length + "`"); }
											else
												toSend.push("**Rolleri:** `yok`");
										} else toSend.push("**Rolleri:** Errör");
									} else toSend.push("**Rolleri:** Errör");
									bot.servers.map(server=>{ if (server.members.indexOf(usr) > -1) { count += 1; }});
									if (count > 1) { toSend.push("**Ortak sunucular:** " + count); }
									if (usr.avatarURL != null) { toSend.push("**Avatar URL:** `" + usr.avatarURL + "`"); }
									if (msg.mentions.length >= 1) { bot.deleteMessage(msg); }
									bot.sendMessage(msg, toSend);
								} else bot.sendMessage(msg, " \"" + user + "\" isimli kullanıcıyı bulamadım. Eğer birden fazla kullanıcıyı aramak istiyorsan isimlerin arasına virgül koy.", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 24000}); });
							});
						}
					} else {
						var toSend = [];
						if (msg.mentions.length > -1) { bot.deleteMessage(msg); }
						toSend.push( msg.channel.server.name + " isimli sunucu hakkındaki bilgiler:");
						toSend.push("**Server ID:** " + msg.channel.server.id);
						toSend.push("**Sunucu Sahibi:** " + msg.channel.server.owner.username + " (**ID:** " + msg.channel.server.owner.id + ")");
						toSend.push("**Sunucunun Yeri:** " + msg.channel.server.region);
						toSend.push("**Üye Sayısı:** " + msg.channel.server.members.length + " **Kanallar:** " + msg.channel.server.channels.length);
						var roles = msg.channel.server.roles.map(role=>role.name);
						roles = roles.join(", ").replace(/@/g, '@\u200b');
						if (roles.length <= 1500) toSend.push("**Roller:** `" + roles + "`");
						else toSend.push("**Roller:** `" + roles.split(", ").length + "`");
						toSend.push("**Varsayılan kanal:** " + msg.channel.server.defaultChannel );
						toSend.push("**Bu kanalın ID'si:** " + "``" +  msg.channel.id + "``" );
						if (msg.mentions.length > -1) { bot.deleteMessage(msg); }
						bot.sendMessage(msg, toSend, function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 24000}); });
					}
				} else bot.sendMessage(msg, "Bunu ÖM ile yapamazsın.", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 36000}); });
			}
		},
//botun yaşayıp yaşamadığını öğren
	"ping": {
		process: function (bot, msg) {
			var messages = ["**PONG**", "Pong! diyeceğimi sandın değil mi?", "Hala buradayım..", "**...**", "ping"];
			var random = messages[Math.floor(Math.random() * messages.length)];
			bot.sendMessage(msg, random, (e, sentMsg) => { bot.updateMessage(sentMsg, random + "\t|\t Şu kadar sürdü: " + (sentMsg.timestamp - msg.timestamp) + "ms") }) }


	},
//bane git sayfası
	"git": {
	    	process: function(bot,msg,suffix) {
    	    bot.sendMessage(msg.channel, msg.author + ", https://github.com/mertturunc/Bane");
    	  }
  	},
//github güncellemesi yapar (YAPAMADI)
//	"güncelle": {
//		process: function(bot, message) {
//			let commandWhiteList = require('./commandwhitelist.json');
//			if (commandWhiteList.indexOf(message.sender.id) > -1) {
//				child_process.exec("git stash && git pull && pm2 restart all", puts);
//				console.log("Update time!");
//			}
//		}
//	},
//restart (EDEMEDİ)
//	"restart": {
//		process: function(bot, message) {
//			let commandWhiteList = require('./commandwhitelist.json');
//			try {
//				if (commandWhiteList.indexOf(message.sender.id) > -1) {
//					bot.sendMessage(message.channel, "**Kahve molası **", false, function() {  child_process.exec("pm2 restart all", puts); process.exit(0); });
//					console.log("  Restart time!");
//				} else {
//					bot.sendMessage(message, " ``Yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮`` ");
//				}
//			} catch (exp) {
//			}
//		}
//	},
//videoyuna ait twitch kanalı için abone olma linki yollar
	"abone-ol": {
		process: function(bot, message) {
			bot.sendMessage(message.channel, " :postbox: ", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 1200}); });
			bot.sendMessage(message.author, " Vermiş olduğum linkten abone olabilirsiniz: " + "/n https://www.twitch.tv/products/videoyun/ticket?ref=below_video_subscribe_button ");
			if (message.mentions.length > -1) { bot.deleteMessage(message); }
			}
	},
//botu kapatıyorsun ama ayıp değil mi?
	"kapa": {
		process: function(bot, message) {
			let commandWhiteList = require(jsonFolder + 'commandwhitelist.json');
			try {
				if (commandWhiteList.indexOf(message.sender.id) > -1) {
					bot.sendMessage(message.channel, "**Biraz dinlenmem gerek.**")
					setTimeout(function(){process.exit(0);}, 1500);
					console.log("  ByeBye!");
				} else {
					bot.sendMessage(message, " ``Yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮`` ");
				}
			} catch (exp) {

			}
		}
	},
//botun ne oynadığını ayarlar
	"ayarla": {
		process: function(bot, message, suffix) {
			let commandWhiteList = require(jsonFolder + 'commandwhitelist.json');
			try {
				if (commandWhiteList.indexOf(message.sender.id) > -1) {
				if (message.mentions.length > -1) { bot.deleteMessage(message); };
					bot.setStatus('online', suffix);
					bot.sendMessage(message.channel, "Tamamdır! Şu an oynanan oyun: " + suffix, function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 1200}); });
					console.log(message.author.username + "  *ayarla komutunu kullandı.");
				} else {
					bot.sendMessage(message, " ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ");
				}
			} catch (exp) {
				console.log("you dun goofed: ", exp);
			}
		}
	},
//botun bir sunucuya katılmasını sağlar
	"katıl": {
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
  	},
//en gereksiz kod
	"helö": {
		process: function(bot, message) {
			bot.sendMessage(message.channel, "**Helö?**", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 600}); });
			if (message.mentions.length > -1) { bot.deleteMessage(message); };
		}
	},
//ocd mania linux
	"linuxpls": {
		process: function(bot, message) {
			bot.sendFile(message.channel, picFolder + "linuxgemini.png");
			if (message.mentions.length > -1) { bot.deleteMessage(message); };
			console.log("linux pls, Komutu kullanan: " + message.sender.username);
		}
	},
//message delete için oluşturduğum test komutu
	"explode": {
		process: function(bot, message) {
			bot.sendMessage(message, "BOOM!", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 100}); });
		}
	},
//avatar filan veriyo
	"avatar": {
		process: function(bot, msg, suffix) {
			if (msg.channel.isPrivate) {
				if (msg.author.avatarURL != null) { bot.sendMessage(msg, "PM ile sadece senin avatarını yollayabilirim. Al bakalım: " + msg.author.avatarURL); return; }
				if (msg.author.avatarURL == null) { bot.sendMessage(msg, "PM ile sadece senin avatarını yollayabilirim, ancak avatarın yok gibi gözüküyor."); return; }
			}
			if (msg.mentions.length == 0 && !suffix) { (msg.author.avatarURL != null) ? bot.sendMessage(msg, "**" + msg.author.username +  "** isimli kullanıcının avatarı: " + msg.author.avatarURL) : bot.sendMessage(msg, msg.author.username + " isimli kullanıcının avatarı yok gibi gözüküyor.", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); });
			} else if (msg.mentions.length > 0) {
				if (msg.everyoneMentioned) { bot.sendMessage(msg, "Pist, " + msg.author.username.replace(/@/g, '@\u200b') + ", bunu bir daha yapma lütfen.", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				if (msg.mentions.length > 6) { bot.sendMessage(msg, "Komut 6 kişi ile limitlidir", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				msg.mentions.map(function(usr) {
					(usr.avatarURL != null) ? bot.sendMessage(msg, "**" + usr.username.replace(/@/g, '@\u200b') + "** isimli kullanıcının avatarı: " + usr.avatarURL + "") : bot.sendMessage(msg, "**" + usr.username + "**isimli kullanıcının avatarı yok gibi gözüküyor.'", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); });
				});
			} else {
				if (msg.everyoneMentioned) { bot.sendMessage(msg, "Pist, " + msg.author.username.replace(/@/g, '@\u200b') + ", bunu bir daha yapma lütfen.", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				var users = suffix.split(/, ?/);
				if (users.length > 6) { bot.sendMessage(msg, "Komut 6 kişi ile limitlidir", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); }); return; }
				users.map(function(user) {
					var usr = findUser(msg.channel.server.members, user);
					if (usr) { (usr.avatarURL != null) ? bot.sendMessage(msg, "**" + usr.username.replace(/@/g, '@\u200b') + "** isimli kullanıcının avatarı: " + usr.avatarURL + "") : bot.sendMessage(msg, "**" + usr.username + "** has no avatar", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 8000}); });
				} else { bot.sendMessage(msg,"**" + "\"" + user + "\"  ** isimli kullanıcı bulunamadı.  Eğer birden fazla kişinin avatarını istiyorsan kullanıcıları virgül ile ayır.", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 20000}); }); }
				});
			}
		}
	},
//kullanıcıya ait ID bilgisi ve yazı kanalının ID bilgisini verir
	"id": {
		process: function(bot, msg, suffix) {
			if (suffix && suffix.trim().replace("\"", "") === "kanal") bot.sendMessage(msg, "Kanal ID'si: " + "``" + msg.channel.id + "``");
			else bot.sendMessage(msg, "<@" + msg.author.id + ">" + " isimli kullanıcıya ait ID: " + "``" + msg.author.id + "``");
					if (msg.mentions.length > -1) { bot.deleteMessage(msg); }
		}
	},
//düzgün çalışan bir eval
	"eval": {
		process: function(bot, message, suffix) {
			let blockedEval = require(jsonFolder + 'blockedeval.json');
			let evalWhitelist = require(jsonFolder + 'evalwhitelist.json');
			if (evalWhitelist.indexOf(message.sender.id) > -1) {
				if (blockedEval.indexOf(suffix) > -1) {
					var bricxs = ["what are you doing", "staph", "don't kill me pls", "**...**"];
					var cRandom = bricxs[Math.floor(Math.random() * bricxs.length)];
					bot.sendMessage(message, message.author + " " + cRandom);
				} else {
					try {
						console.log(message.sender.username + " \"eval " + suffix + "\" komutunu kullandı.");
							var toSend = [], count = 0;
							toSend.push( "```python");
						toSend.push(eval(suffix));
							toSend.push( "```" );
							bot.sendMessage(message, toSend);
					} catch (err) {
						console.log(message.sender.username + " eval komutunu hatalı kullandı."); // COMPLETELY REMOVED THE ERROR STACK
								let array = [];
						array.push("``Eval başarısız oldu.``");
								array.push('```javascript');
								array.push(err);
								array.push('```');
								bot.sendMessage(message, array);
					}
				}
			} else {
				bot.sendMessage(message, "``Eval yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮``");
				console.log(message.sender.username + " eval komutunu kullanmayı denedi, en azından denedi yani.")
			}
		}
	},
//twitch emote
	"pjsalt": {
		process: function(bot, message) {
			bot.sendFile(message.channel, picFolder + "pjsalt.png")
			if (message.mentions.length > -1) { bot.deleteMessage(message); };
			console.log("It's too salty.")
		}
	},
//kappa?
	"kappa": {
		process: function(bot, message) {
			bot.sendFile(message.channel, picFolder + "kappa.png")
			if (message.mentions.length > -1) { bot.deleteMessage(message); };
			console.log("Raise your Kappa")
		}
	},
//24.03.16 tarihli bir söz
	"yayın": {
		process: function(bot, message) {
			bot.sendFile(message.channel, picFolder + "yayin.png");
			if (message.mentions.length > -1) { bot.deleteMessage(message); };
		}
	},
//kanal hakkında bilgi verir
	"kanal": {
		process: function(bot, msg) {
			var toSend = [], count = 0;
			toSend.push( "<#" + msg.channel.id + ">" + " hakkında bilgiler.")
			toSend.push( "**Topic:** " + "``" + msg.channel.topic + "``" );
			toSend.push( "**ID:** " + "``" +  msg.channel.id + "``" );
				bot.sendMessage(msg, toSend);
		}
	},
//yeni komut eklendikçe burayı güncelle
	"yardım": {
		process: function(bot, message) {
			bot.sendMessage(message.channel, ":postbox:", function(error, wMessage) { bot.deleteMessage(wMessage, {"wait": 1200}); });
			bot.sendMessage(message.author, "Şu anlık yapım aşamasındayım. Kullanabileceğin komutlar: ``g`` , ``bilgi`` , ``ping`` , ``abone-ol`` , ``ayarla`` , ``katıl`` , ``linuxpls`` , ``abone-ol`` , ``avatar`` , ``id`` , ``eval`` , ``kappa``  .")
			if (message.mentions.length > -1) { bot.deleteMessage(message); }
		}
	}
};



exports.aliases = aliases;







////////////todo list//////////
///////////////////////////////
//c.c botundaki gibi bir emote sistemi
//görselle birlikte yazı gönderme
//	---daha mantıklı bir eval, öküz gibi hata sıçıyo---, +++linux halletti+++
//	---avatarları direk görsel olarak atma---, +++embeded iş yapıyo gerek kalmadı+++
//komutlar için varyasyon örn: *g yerine *google *search *lmgtfy kullanılabilsin
//twitch.tv canlı yayın istatistiği komutu
//komut ile yetki listesini düzenleme // ez, yapılabilir ~lg
//bot için çalıştırma dosyası // pek de ez değil, en azından linux kullananlar için ~lg
//
//
//
//
//
//
///////////////////////////////
