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
var voiceFolder = "./voices/";
var TwitchClient = require("node-twitchtv");
var ttvc = new TwitchClient("");
var getinfoo = require("./package.json"); //don't touch this
var google = require('googleapis');
var urlshortener = google.urlshortener('v1');

//fonksiyonlar da buraya
function clean(text) {
	if (typeof(text) === "string") {
		return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
	} else {
		return text;
	}
}

function clearToken(text) {
	var config = require(jsonFolder + "config.json");
	if (text.match(config.token)) {
		var regExp = new RegExp("\\b" + config.token + "\\b", "g"); 
		return text.replace(regExp, "REDACTED");
	} else {
		return text;
	}
}

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
	return list[Math.floor((Math.random() * list.length))];
};

function get_random_hex_color() {
	return '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
};

function get_random_decimal_color() {
	return parseInt(get_random_hex_color().replace("#", ""), 16);
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

Number.prototype.toTime = function(isSec) {
	var ms = isSec ? this * 1e3 : this,
		lm = ~(4 * !!isSec),  /* limit fraction */
		fmt = new Date(ms).toISOString().slice(11, lm);

	if (ms >= 8.64e7) {  /* >= 24 hours */
		var parts = fmt.split(/:(?=\d{2}:)/);
		parts[0] -= -24 * (ms / 8.64e7 | 0);
		return parts.join(':');
	}

	return fmt;
};

function sendToHastebin(data) {
	return new Promise((resolve, reject) => {
		try {
			var request = require("request");
		} catch (e) {
			reject(e);
		}

		if (!data || data && data === "") {
			reject("No data is specified.");
		}

		if (typeof(data) === "string") {
			var contType = 'text/plain';
			var isJson = false;
		} else {
			var contType = 'application/json';
			var isJson = true;
		}

		var hastebinOptions = {
			method: 'POST',
			url: 'https://hastebin.com/documents',
			headers: {
				'cache-control': 'no-cache',
				'content-type': contType,
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
			},
			body: data,
			json: isJson
		};

		request(hastebinOptions, function(error, response, body) {
			if (error) reject(error);

			if (typeof(body) === "string") {
				var result = JSON.parse(body);
			} else {
				var result = body;
			}

			if (result.key) {
				resolve(`https://hastebin.com/${result.key}`);
			} else if (result.message) {
				reject(`${result.message}`);
			} else {
				reject("Unknown error");
			}
		});
	});
};

//hülooooooğ
exports.commands = {
	//bırakta senin için gogıllasın -AYAKLI GOOGIL (REDONE API)
	"g": {
		process: function(bot, message, suffix) {
			if (!suffix) { // check if there is a suffix present
				return message.channel.send(" ``*google`` dedikten sonra arayacağın şeyi yaz. ");
			}
			suffix = suffix.split(" ");
			for (var i = 0; i < suffix.length; i++) {
				suffix[i] = encodeURIComponent(suffix[i]); // encode the suffix as a valid URI
			}
			message.channel.send("Your search result: http://www.google.com/search?q=" + suffix.join("+") + "&btnI="); // send the final result
		}
	},
	//çorçik kapkeyk (NEEDS NODE 7 OR ABOVE, WITH --harmony FLAG, USE npm run-script main TO RUN THE BOT WITH THIS COMMAND)
	"mesajsil": {
		process: async function(bot, message) {
			if (message.channel.type === "dm" || message.channel.type === "group") { // discard any messages from dm or group chats
				return;
			}
			const user = message.mentions.users.first(); // picks the first user mention as target
			let amount = parseInt(message.content.split(' ').pop()); // gets the amount by getting the last arg

			if (!message.channel.permissionsFor(message.guild.member(message.author)).has("MANAGE_MESSAGES")) { // checks for author perms
				return message.channel.send("You don't have the permission (MANAGE_MESSAGES) on this channel to do this operation.").catch(e => {
					console.error("Err in command: " + e);
				});
			};

			if (!message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES")) { // checks for bot perms
				return message.channel.send("I don't have the permission (MANAGE_MESSAGES) on this channel to do this operation.").catch(e => {
					console.error("Err in command: " + e);
				});
			};

			if (message.mentions.everyone) {
				return;
			}; // discards the message if it has @everyone

			if (!user && !amount) return message.reply('Kullanım: [kişi etiketi veya miktar] [miktar]').catch(e => {
				console.error("Err in command: " + e);
			}); // checks the variables
			if (!amount) return message.reply('Bir miktar belirtin.').catch(e => {
				console.error("Err in command: " + e);
			}); // checks only the amount
			if (amount > 100) return message.reply("Miktar 100'den fazla olmamalı.").catch(e => {
				console.error("Err in command: " + e);
			}); // checks the amount is over limit

			if (user) { // if userdata is present
				const messages = (await message.channel.fetchMessages({ // gathers the messages wanted
						limit: 100
					}))
					.filter(m => m.author.id === user.id) // filters the messages "target only"
					.filter(m => m.deletable); // filters the messages as deletable
					
				const messagesSec = messages
					.array() // makes the collection to an array
					.slice((messages.length - amount)); // removes the unwanted messages

				if (!messagesSec.length || messagesSec.length <= 0) return []; // if there are no messages to delete, make an empty array

				if (messagesSec.length === 1) { // if there is only one message
					return [await messages.last().delete().catch(e => {
						console.error("Err in command: " + e);
					})]; // only delete that
				}

				return [await message.channel.bulkDelete(messagesSec).catch(e => {
					console.error("Err in command: " + e);
				})]; // if everything is normal delete the messages filtered to targetonly and deletable
			} else {
				if (amount === 0 || amount === 1) { // if there is only one message (requesting message)
					return [await message.delete().catch(e => {
						console.error("Err in command: " + e);
					})]; //only delete the requesting message
				}

				return [await message.channel.fetchMessages({ // gathers the messages wanted
						limit: amount
					})
					.then(ma => {
						const messagesss = ma.filter(m => m.deletable); // filters the messages as deletable in a second variable
						message.channel.bulkDelete(messagesss).catch(e => { // deletes the messages gathered and filtered as deletable
							console.error("Err in command: " + e);
						});
					}).catch(e => {
						console.error("Err in command: " + e);
					})
				];
			}
		}
	},
	//kim ulan bu bot (REDONE API)
	"hakkında": {
		process: function(bot, message) {
			var path = require('path'); // use the internal path api
			var scriptName = path.basename(__filename); // get the filename this command has been in
			var commandsS = require("./" + scriptName).commands; // import this file again
			var config = require(jsonFolder + "config.json"); // import config
			var fs = require("fs"); // use the internal filesystem api
			if (!fs.existsSync("./package.json")) { // if package file can't be found return a reply
				return message.reply("`Package file not found, please report to developer.`").catch(e => {
					console.error("Err in command: " + e);
				});
			}

			var commandsText = JSON.stringify(commandsS) // stringify this module on this file (very shit way to list commands)
				.replace(/[{}]/g, "") // remove {}
				.replace(/":,/g, ", ") // replace ' ":, ' with ', '
				.replace(/":?/g, ""); // remove ' " ' or ' ": '

			var gitLink = getinfoo.repository.url.replace(/git[+]|[.]git/g, ""); // remove the git format on the link
			var toSend = [], // create an array
				count = 0;
			toSend.push("**İsim:** " + getinfoo.name); // push the requested variables to the array
			toSend.push("**Versiyon:** " + getinfoo.version);
			toSend.push("**Yapımcılar:** " + getinfoo.author)
			toSend.push("**GitHub:** " + gitLink);
			toSend.push("**Komut kullanım şekli:** `" + config.trigger + "<komut>`");
			toSend.push("**Komutlar:**\n```\n" + commandsText + "```\n");
			message.channel.send(toSend).catch(e => {
				console.error("Err in command: " + e);
			}); // send the array
		}
	},
	//info kodu, kullanıcının kim olduğunu öğren. (NEEDS MORE WORK)
	"bilgi": {
		process: function(bot, message, suffix) {
			if (message.mentions.everyone || message.channel.type === "dm" || message.channel.type === "group") { // discard the message if the mention is @everyone or the message is in dm or groupchat
				return;
			};

			if (message.mentions.users.size == 0) { // if there are no mentions on the messages
				var firstment = message.author; // use the author as target
			} else {
				var firstment = message.mentions.users.first(); // else, use the first mention as target
			};

			if (!bot.users.get(firstment.id, "User") || !message.guild.member(firstment)) { // if the guild doesn't have that member (or if the bot doesn't have that user cached)
				return; // ignore.
			};

			const guildMemberData = message.guild.member(firstment); // gather the data from target 
			const roleslist = guildMemberData.roles.map(Role => Role.name); // list the roles of the target
			var roleslist2 = roleslist.join(", ").replace("@everyone, ", ""); // remove the @everyone role

			if (!guildMemberData.voiceChannel) { // if the target is not in a voicechannel
				var vChannelName = "undefined"; // make the voicechannel name variable the string "undefined"
			} else {
				var vChannelName = guildMemberData.voiceChannel.name; // else, make it the string as the voicechannel name
			}

			if (!firstment.presence.game) { // if the target is not playing any games
				var gameName = "null"; // make game name variable the string "null"
			} else {
				var gameName = firstment.presence.game.name; // else, make it the game name
			}

			if (!firstment.avatarURL) { // if the target doesn't have have any avatar
				var avatarlink = "null"; // make the avatar link variable the string "null"
			} else {
				var avatarlink = firstment.avatarURL.replace(/[?](size=\d*)/g, ""); // else, make it the link (with replaced end) itself
			}

			var toSendDataToUser = []; // creates an array of messages
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
			toSendDataToUser.push("          Roles: " + (guildMemberData.roles.size - 1) + " total roles"); // remove @everyone
			if (guildMemberData.roles.size > 1 && roleslist2.length <= 1500) { // if the target doesn't have too many roles
				toSendDataToUser.push("                 " + roleslist2); // post it
			}
			toSendDataToUser.push("```");
			message.channel.send(toSendDataToUser).catch(e => { // send the array
				console.log("Something happened: " + e);
			});
		}
	},
	//botun yaşayıp yaşamadığını öğren (NEED SUPPORT FROM API GUILD)
	"ping": {
		process: function(bot, message) {
			var messages = ["**PONG**", "Pong! diyeceğimi sandın değil mi?", "Hala buradayım..", "**...**", "ping"]; // define the responses
			var random = get_random(messages); // pick one response by random
			message.channel.send(`${random}\n\n**RTT Total**:\n**Bot to Discord**:`).then(async sentMsg => { // send the random response first
				await sentMsg.edit(`${random}\n\n**RTT Total**: ${(sentMsg.createdTimestamp - message.createdTimestamp)} ms\n**Bot to Discord**: ${Math.floor(bot.ping)} ms`); // get the requesting message timestamp and the response timestamp, then calculate
			}).catch(e => {
				console.error("Err in command: " + e);
			});
		}
	},
	//bane git sayfası (API REDONE)
	"git": {
		process: function(bot, message, suffix) {
			var fs = require("fs"); // use the internal filesystem api
			if (!fs.existsSync("./package.json")) { // if package file is not found, send a message
				return message.reply("`Package file not found, please report to developer.`").catch(e => {
					console.error("Err in command: " + e);
				});
			}
			message.reply(getinfoo.repository.url.replace(/git[+]|[.]git/g, "")).catch(e => {
				console.error("Err in command: " + e);
			}); // replies the github link with git format removed
		}
	},
	//botu kapatıyorsun ama ayıp değil mi? (API REDONE)
	"kapa": {
		process: function(bot, message) {
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
			try {
				if (commandWhitelist.indexOf(message.author.id) > -1) {
					message.channel.send("**Biraz dinlenmem gerek.**").catch(e => {
						console.error("Err in command: " + e);
					});
					setTimeout(function() {
						process.exit(0);
					}, 1500);
					console.log("\nByeBye!");
				} else {
					message.channel.send(" ``Yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮`` ").catch(e => {
						console.error("Err in command: " + e);
					});
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
					if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES") && message.mentions.users.size > -1) {
						message.delete(1200).catch(e => {
							console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
						});
					};
					bot.user.setPresence('online');
					bot.user.setGame(suffix);
					message.channel.send("Tamamdır! Şu an oynanan oyun: " + suffix).then(wMessage => {
						wMessage.delete(1200).catch(e => {
							console.error("Err in command: " + e);
						});;
					});
					console.log(message.author.username + " varsayılan oyunu " + suffix + " olarak değiştirdi.");
				} else {
					message.channel.send(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ");
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
			message.channel.send(" :postbox: ").then(wMessage => {
				wMessage.delete(1200).catch(e => {
					console.error("Err in command: " + e);
				});;
			}).catch(e => {
				console.error("Err in command: " + e);
			});
			message.author.send("Since we changed to the Official API, We have to sacrifice the \"Join by Invite\" method. \nBut, you can use the link below to add me on any server. (You have to have \"Manage Server\" role on the Server where you want to add me.)\nhttps://discordapp.com/oauth2/authorize?&client_id=" + config.api_client_id + "&scope=bot&permissions=8").catch(e => {
				console.log("Something happened: " + e);
			});
			var config = undefined;
		}
	},
	//en gereksiz kod (API REDONE)
	"helö": {
		process: function(bot, message) {
			message.channel.send("**Helö?**").then(wMessage => {
				wMessage.delete(600).catch(e => {
					console.error("Err in command: " + e);
				});
			});
			if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES") && message.mentions.users.size > -1) {
				message.delete().catch(e => {
					console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
				});
			};
		}
	},
	//ocd mania linux (API REDONE)
	"linuxpls": {
		process: function(bot, message) {
			message.channel.send("linux pls", {
				files: [picFolder + "linuxgemini.png"]
			}).catch(e => {
				console.log("Something happened: " + e);
			});
			if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES") && message.mentions.users.size > -1) {
				message.delete().catch(e => {
					console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
				});
			};
		}
	},
	//message delete için oluşturduğum test komutu (API REDONE)
	"explode": {
		process: function(bot, message) {
			message.channel.send("BOOM!").then(wMessage => {
				wMessage.delete(100).catch(e => {
					console.error("Err in command: " + e);
				});;
			}).catch(e => {
				console.error("Err in command: " + e);
			});;
		}
	},
	//avatar filan veriyo (API REDONE!!11!!!!!!bir!!!)
	"avatar": {
		process: function(bot, message) {
			const firstment = message.mentions.users.first();

			const guildMemberData = message.guild.member(firstment);

			if (message.channel.type === "dm" || message.channel.type === "group") {
				if (message.mentions.users.size == 0) {
					if (!message.author.avatarURL) {
						message.reply("Kardeş avatarın yok galiba.").catch(e => {
							console.error("Err in command: " + e);
						});
					} else {
						message.reply("Al avatarının linki: " + message.author.avatarURL).catch(e => {
							console.error("Err in command: " + e);
						});
					}
				} else {
					if (firstment.avatarURL === bot.user.avatarURL) {
						message.reply("Al benim avatarın linki: " + bot.user.avatarURL).catch(e => {
							console.error("Err in command: " + e);
						});
					} else {
						return;
					}
				}
			} else {
				if (message.mentions.users.size == 0) {
					if (!message.author.avatarURL) {
						message.reply("Kardeş avatarın yok galiba.").catch(e => {
							console.error("Err in command: " + e);
						});
					} else {
						message.reply("Kendi avatarını istiyorsun ha. Al avatarının linki: " + message.author.avatarURL).catch(e => {
							console.error("Err in command: " + e);
						});
					}
				} else {
					if (!firstment.avatarURL) {
						message.reply("İstediğin kişinin avatarı yok. FeelsBadMan").catch(e => {
							console.error("Err in command: " + e);
						});
					} else {
						if (firstment.avatarURL === bot.user.avatarURL) {
							message.reply("Al benim avatarım: " + bot.user.avatarURL).catch(e => {
								console.error("Err in command: " + e);
							});
						} else {
							message.reply("Al bakalım: " + firstment.avatarURL).catch(e => {
								console.error("Err in command: " + e);
							});
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
					return message.reply(get_random(bricxs)).catch(e => {
						console.error("Err in command: " + e);
					});
				} else {
					try {
						var evaled = eval(suffix);
						if (typeof(evaled) !== "string") {
							evaled = require("util").inspect(evaled);
						}

						var newData = clearToken(clean(evaled));

						if (newData.toString().length > 1350) {
							sendToHastebin(newData).then(link => {
								var outputEval = `Due to the output being over 1350 characters, I've uploaded the output to hastebin: ${link}`;
									message.channel.send({
										embed: {
											color: 5308160,
											fields: [{
												name: "OUTPUT",
												value: `\`\`\`js\n${outputEval}\n\`\`\``
											}
											],
											timestamp: new Date(),
											footer: {
												icon_url: message.author.avatarURL,
												text: `Eval executed by ${message.author.tag}.`
											}
										}
									}).catch(e => {
										console.error("Err in command: " + e);
									});
							}).catch(e => {
								var outputEval = `Due to the output being over 1350 characters, I've tried to upload the output to hastebin but an error happened:\n${e}`;
								message.channel.send({
									embed: {
										color: 14680064,
										fields: [{
											name: "OUTPUT",
											value: `\`\`\`js\n${outputEval}\n\`\`\``
										}
										],
										timestamp: new Date(),
										footer: {
											icon_url: message.author.avatarURL,
											text: `Eval executed by ${message.author.tag}.`
										}
									}
								}).catch(e => {
									console.error("Err in command: " + e);
								});
							});
						} else {
							message.channel.send({
								embed: {
									color: 5308160,
									fields: [{
										name: "OUTPUT",
										value: `\`\`\`js\n${newData}\n\`\`\``
									}
									],
									timestamp: new Date(),
									footer: {
										icon_url: message.author.avatarURL,
										text: `Eval executed by ${message.author.tag}.`
									}
								}
							}).catch(e => {
								console.error("Err in command: " + e);
							});
						}

						console.log(message.author.username + " \"" + suffix + "\" kodunu kullandı.");

					} catch (err) {
						console.log(message.author.username + " eval komutunu hatalı kullandı."); // COMPLETELY REMOVED THE ERROR STACK
						message.channel.send({
							embed: {
								color: 14680064,
								fields: [{
									name: "OUTPUT",
									value: `\`\`\`js\n${err}\n\`\`\``
								}
								],
								timestamp: new Date(),
								footer: {
									icon_url: message.author.avatarURL,
									text: `Eval executed by ${message.author.tag}.`
								}
							}
						}).catch(e => {
							console.error("Err in command: " + e);
						});
					}
				}
			} else {
				message.channel.send("``Eval yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮``").catch(e => {
					console.error("Err in command: " + e);
				});
				console.log(message.author.username + " eval komutunu kullanmayı denedi, en azından denedi yani.");
			}
		}
	},
	//twitch emote (API REDONE)
	"pjsalt": {
		process: function(bot, message) {
			message.channel.send("", {
				files: [picFolder + "pjsalt.png"]
			}).catch(e => {
				console.log("Something happened: " + e);
			});
			if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES") && message.mentions.users.size > -1) {
				message.delete().catch(e => {
					console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
				});
			};
		}
	},
	//kappa? (API REDONE)
	"kappa": {
		process: function(bot, message) {
			message.channel.send("", {
				files: [picFolder + "kappa.png"]
			}).catch(e => {
				console.log("Something happened: " + e);
			});
			if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES") && message.mentions.users.size > -1) {
				message.delete().catch(e => {
					console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
				});
			};
		}
	},
	//24.03.16 tarihli bir söz (API REDONE)
	"yayın": {
		process: function(bot, message) {
			message.channel.send("24.03.16 tarihli bir söz", {
				files: [picFolder + "yayin.png"]
			}).catch(e => {
				console.log("Something happened: " + e);
			});
			if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES") && message.mentions.users.size > -1) {
				message.delete().catch(e => {
					console.log("Mesaj silme yetkim yok! Guild adı: " + message.guild.name + " Guild ID: " + message.guild.id);
				});
			};
		}
	},
	//yeni komut eklendikçe burayı güncelle (API REDONE)
	"yardım": {
		process: function(bot, message) {
			var path = require('path');
			var scriptName = path.basename(__filename);
			var config = require(jsonFolder + "config.json")
			var commandsS = require("./" + scriptName).commands;
			var commandsText = JSON.stringify(commandsS)
				.replace(/[{}]/g, "")
				.replace(/":,/g, ", ")
				.replace(/":?/g, "");
			message.channel.send(":postbox:").then(wMessage => {
				wMessage.delete(1200).catch(e => {
					console.error("Err in command: " + e);
				});;
			}).catch(e => {
				console.error("Err in command: " + e);
			});
			message.author.send("Şu anlık yapım aşamasındayım.\n\n**Komut kullanım şekli:** `" + config.trigger + "<komut>`\n**Kullanabileceğin komutlar:**\n```\n" + commandsText + "```").catch(e => {
				console.error("Err in command: " + e);
			});
			if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES") && message.mentions.users.size > -1) {
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
			if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES")) {
				message.delete(100).catch(error => {
					message.author.send("I wasn't able to delete the link you sent to me. Can you delete it for me please?").catch(e => {
						console.error("Err in command: " + e);
					});
				});
			}
			var config = require(jsonFolder + "config.json");
			if (!config.google_api_key) {
				return bot.fetchApplication().then(app => {
					bot.users.get(app.owner.id).send("Google API Key is Missing!").catch(e => {
						console.error("Err in command: " + e);
					});
				}).catch(e => {
					console.error("Err in command: " + e);
				});
			}
			var params = {
				auth: config.google_api_key,
				shortUrl: cachedUnshort
			};
			var suffix1 = cachedUnshort.replace(/https?\:\/\//, "");
			var suffix2 = suffix1.split("/");
			if (!cachedUnshort) {
				message.channel.send("Lütfen 'goo.gl' ile kısaltılmış adresi belirtiniz.").catch(e => {
					console.error("Err in command: " + e);
				});
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
							message.channel.send(toSend).catch(e => {
								console.error("Err in command: " + e);
							});
						} else {
							message.author.send(message.author + ": " + response.longUrl).catch(e => {
								console.error("Err in command: " + e);
							});
						}
					});
				} else {
					message.channel.send(message.author + ", bu komut sadece 'goo.gl' ile kısaltılmış adresler için geçerlidir.").catch(e => {
						console.error("Err in command: " + e);
					});
				}
			}
			var config = undefined;
		}
	},
	//shorts long links to goo.gl links, currently not fucked up (API REDONE)
	"shorten": {
		process: function(bot, message, suffix) {
			var cachedShort = suffix;
			if (message.channel.type !== "dm" && message.channel.type !== "group" && message.channel.permissionsFor(message.guild.member(bot.user)).has("MANAGE_MESSAGES")) {
				message.delete(100).catch(error => {
					message.author.send("I wasn't able to delete the link you sent to me. Can you delete it for me please?").catch(e => {
						console.error("Err in command: " + e);
					});
				});
			}
			var config = require(jsonFolder + "config.json");
			if (!config.google_api_key) {
				return bot.fetchApplication().then(app => {
					bot.users.get(app.owner.id).send("Google API Key is Missing!").catch(e => {
						console.error("Err in command: " + e);
					});
				}).catch(e => {
					console.error("Err in command: " + e);
				});
			}
			var params = {
				auth: config.google_api_key,
				resource: {
					"longUrl": cachedShort
				}
			};
			if (!cachedShort) {
				message.channel.send("Lütfen kısaltmak istediğin adresi belirt :(").catch(e => {
					console.error("Err in command: " + e);
				});
				return;
			} else {
				urlshortener.url.insert(params, function(err, response) {
					if (err) {
						var toSend = [],
							count = 0;
							toSend.push("```");
							toSend.push(err);
							toSend.push("```");
						message.channel.send(toSend).catch(e => {
							console.error("Err in command: " + e);
						});
					} else {
						message.channel.send(message.author + ", " + response.id).catch(e => {
							console.error("Err in command: " + e);
						});
					}
				});
			}
			var config = undefined;
		}
	},
	//OYLAMAĞĞĞ (API REDONE)
	"yenioylama": {
		process: function(bot, message, suffix) {
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
			if (!(commandWhitelist.indexOf(message.author.id) > -1) && !message.channel.permissionsFor(message.guild.member(message.author)).has("KICK_MEMBERS")) {
				return message.channel.send(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ").catch(e => {
					console.error("Err in command: " + e);
				});
			};
			if (!suffix) {
				message.channel.send("Lütfen bir bilgi belirtiniz.").catch(e => {
					console.error("Err in command: " + e);
				});
				return;
			}
			if (votebool == true) {
				message.channel.send("Hali hazırda bir oylama işlemde.").catch(e => {
					console.error("Err in command: " + e);
				});
				return;
			}
			topicstring = suffix;
			votecreator = message.author.username;
			votecreatorFull = message.author.id
			voteserver = message.channel.guild.name
			votechannel = message.channel.name
			message.channel.send("Yeni oylama başlatıldı: `" + suffix + "`\nOy vermek için `*oyver +/-` komutunu kullanınız.").catch(e => {
				console.error("Err in command: " + e);
			});
			votebool = true;
		}
	},
	"oyver": {
		process: function(bot, message, suffix) {
			if (!suffix) {
				message.channel.send("Bir şeye oy vermen lazım!").catch(e => {
					console.error("Err in command: " + e);
				});
				return;
			}
			if (votebool == false) {
				message.channel.send("Şu anda aktif bir oylama yok. `*yenioylama` komutu ile yeni bir oylama başlatabilirsin.").catch(e => {
					console.error("Err in command: " + e);
				});
				return;
			}
			if (voter.indexOf(message.author) != -1) {
				return;
			}
			voter.push(message.author);
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
		process: function(bot, message) {
			var msgArray = [];
			if (votebool == true) {
				message.channel.send("Şu anda aktif bir oylama var.\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`").catch(e => {
					console.log("Something happened: " + e);
				});
			} else {
				message.channel.send("Şu anda bir oylama aktif değil.").catch(e => {
					console.log("Something happened: " + e);
				});
			}
		}
	},
	"oylamayasonver": {
		process: function(bot, message, suffix) {
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
			if (message.author.id === votecreatorFull) {
				message.channel.send("`Oylama sonlandırıldı.`\n**Oylamanın sonuçları:**\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`").catch(e => {
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
				if (commandWhitelist.indexOf(message.author.id) > -1) {
					message.channel.send("`Oylama sonlandırıldı.`\n**Oylamanın sonuçları:**\nKonu: `" + topicstring + "`\nOylama hakkında bilgiler: ```Oluşturan: " + votecreator + "\nSunucu: " + voteserver + "\nKanal: " + votechannel + "```\nEvet oylayan: `" + upvote + "`\nHayır oylayan: `" + downvote + "`").catch(e => {
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
					message.channel.send(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ").catch(e => {
						console.log("Something happened: " + e);
					});
				}
			}
		}
	},
	"sunucudan-ayrıl": {
		process: function(bot, message) {
			if (message.channel.type === "dm" || message.channel.type === "group") {
				return;
			}; // discard any messages from dm or group chats
			let commandWhitelist = require(jsonFolder + "commandwhitelist.json");
			if (commandWhitelist.indexOf(message.author.id) > -1) {
				message.channel.send("**Burada dükkanı kapatıyoruz, peki.**").then(m => {
					m.guild.leave().catch(e => {
						console.log("Something happened: " + e);
					});
				}).catch(e => {
					console.log("Something happened: " + e);
				});

			} else {
				if (message.author === message.channel.guild.owner) {
					message.channel.send("**Burada dükkanı kapatıyoruz, peki.**").then(m => {
						m.guild.leave().catch(e => {
							console.log("Something happened: " + e);
						});
					}).catch(e => {
						console.log("Something happened: " + e);
					});
				} else {
					message.channel.send(" ``Yetkin yok. ( ° ͜ʖ͡°)╭∩╮`` ").catch(e => {
						console.log("Something happened: " + e);
					});
				}
			}
		}
	},
	//airhorn functionality is here. ayy (API REDONE)
	"oynat": {
		process: function(bot, message, suffix) {
			if (message.channel.type === "dm" || message.channel.type === "group") {
				return;
			}; // discard any messages from dm or group chats
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
			var voices = require(voiceFolder + "voices.json");
			var blacklistedVoices = require(voiceFolder + "blacklist.json");
			var vChannel = message.guild.member(message.author).voiceChannel;
			var checkConnectionOnGuild = bot.voiceConnections.get(message.guild.id, 'VoiceConnection');

			var stringedVoices = JSON.stringify(voices)
				.replace(/:"[\w]*(.ogg)"|,?"[\w]*(-[\s\S]*)?":"blacklist([0-9]*)?",?|"|[{}]/g, "")
				.replace(/,/g, ", ");

			if (suffix === "liste") {
				return message.channel.send(":postbox:").then(wMessage => {
					wMessage.edit("```" + stringedVoices + "```\nKomut kullanımı (herhangi bir ses kanalında iken): `*oynat <klip adı>`").catch(e => {
						console.error("Err in command: " + e);
					});
				}).catch(e => {
					console.error("Err in command: " + e);
				});
			}

			if (!vChannel) {
				return message.reply("Bir ses kanalına bağlı değilsin.").catch(e => {
					console.error("Err in command: " + e);
				});
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
					return message.reply("Komut kullanımı hatalı.\n\nDoğru kullanım: `*oynat <klip adı>`\nKlip listesi için `*oynat liste`").catch(e => {
						console.error("Err in command: " + e);
					});
				}
			}
		}
	},
	"stealth": {
		process: function(bot, message, suffix) {
			if (message.channel.type === "dm" || message.channel.type === "group") {
				return;
			}; // discard any messages from dm or group chats
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
			let cached = suffix;
			var localErrorCount = 0;
			if (!suffix) {
				return;
			} else {
				if (commandWhitelist.indexOf(message.author.id) > -1) {
					message.delete().catch(e => {
						localErrorCount += 1;
						message.channel.send("I can't delete your message goddamnit").catch(e => {
							localErrorCount += 1;
							message.author.send("I can't delete your message goddamnit").catch(e => {
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
						message.channel.send(cached).then(wMessage => {
							wMessage.delete(11).catch(e => {
								console.error("Err in command: " + e);
							});
						}).catch(e => {
							console.error("Err in command: " + e);
						});
					}
				} else {
					return;
				}
			}
		}
	},
	"ttstealth": {
		process: function(bot, message, suffix) {
			if (message.channel.type === "dm" || message.channel.type === "group") {
				return;
			}; // discard any messages from dm or group chats
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
			let cached = suffix;
			var localErrorCount = 0;
			if (!suffix) {
				return;
			} else {
				if (commandWhitelist.indexOf(message.author.id) > -1) {
					message.delete().catch(e => {
						localErrorCount += 1;
						message.channel.send("I can't delete your message goddamnit").catch(e => {
							localErrorCount += 1;
							message.author.send("I can't delete your message goddamnit").catch(e => {
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
						message.channel.send(cached, {
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
		process: function(bot, message) {
			let replikler = require(jsonFolder + "quotes.json");
			message.channel.send(get_random(replikler)).catch(e => {
				console.log("Something happened: " + e);
			});
		}
	},
	"channelinfo": {
		process: function(bot, message) {
			if (message.channel.type === "dm" || message.channel.type === "group") {
				return;
			}; // discard any messages from dm or group chats

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
				if (channeldata.userLimit == 0) {
					var ulimit = "unlimited";
				};

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
				if (vchanneldata.userLimit == 0) {
					var ulimit2 = "unlimited";
				};

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

			message.channel.send(toRun).catch(e => {
				console.log("Something happened: " + e);
			});
		}
	},
	"status": {
		process: function (bot, message) {
			const opsys = require("os");
			const Discord = require("discord.js");
			var timezone = new Date();
				timezone = timezone.toString().match(/GMT\+?\-?\d*/)[0];
			var guildMembersCounts = bot.guilds.map(g => g.members.size).reduce((a, b) => a + b, 0);
			message.channel.send({
				embed: {
					color: get_random_decimal_color(),
					author: {
						name: `${bot.user.username} System Status`,
						icon_url: bot.user.avatarURL
					},
					fields: [{
							name: 'Uptime (HH:MM:SS.mmm)',
							value: `** **   **Operating System**: ${(opsys.uptime() * 1000).toTime()}\n    **Process**: ${(process.uptime() * 1000).toTime()}\n    **User**: ${bot.uptime.toTime()}`
						},
						{
							name: 'System Info',
							value: `** **   **Node Version**: ${process.versions.node}\n    **Discord.js version**: v${Discord.version}\n    **Memory usage**: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n\n    Running on a ${opsys.cpus().length} core server with ${opsys.platform()} and ${Math.floor(opsys.totalmem() / 1024 / 1024)} MB RAM on board.\n`
						},
						{
							name: 'Bot\'s State',
							value: `** **   **Guild(s)**: ${bot.guilds.size}\n    **Cached Members**: ${bot.users.size}\n    **Total Member Count**: ${guildMembersCounts}`
						}
					],
					timestamp: new Date(),
					footer: {
						icon_url: bot.users.get("120267401672523776").displayAvatarURL,
						text: `Developed by linuxgemini#3568.`
					}
				}
			}).catch(e => {
				console.error("Err in command: " + e);
			});
		}
	},
	"serverinfo": {
		process: function(bot, message) {
			var Discord = require("discord.js");

			if (message.channel.type === "dm" || message.channel.type === "group") {
				return;
			}; // discard any messages from dm or group chats

			const guildData = message.guild;

			const rolesList = guildData.roles.map(Role => Role.name);
			var rolesListAsText = rolesList.join(", ");

			const memberCountWithBots = guildData.members.filter(guildMembers => guildMembers.user.bot != false).size;

			const textChannels = message.guild.channels.filter(GuildChannel => GuildChannel.type === "text");
			const textChannelsList = textChannels.map(GuildChannel => GuildChannel.name).join(", ");

			const voiceChannels = message.guild.channels.filter(GuildChannel => GuildChannel.type === "voice");
			const voiceChannelsList = voiceChannels.filter(GuildChannel => GuildChannel.type === "voice").map(GuildChannel => GuildChannel.name).join(", ");

			if (!guildData.splashURL) {
				var splashLink = "Not Found";
			} else {
				var splashLink = guildData.splashURL;
			}

			if (!guildData.iconURL) {
				var iconLink = "https://discordapp.com/assets/2c21aeda16de354ba5334551a883b481.png";
			} else {
				var iconLink = guildData.iconURL;
			}

			if (!guildData.afkChannelID) {
				var afkChannel = "Not defined";
			} else {
				var afkChannel = `${guildData.channels.get(guildData.afkChannelID).name} (${guildData.afkChannelID})`;
			}

			if (guildData.emojis.size > 0) {
				const emojisList = guildData.emojis.map(Emoji => `${Emoji.name}\t\t\t${Emoji.url}`);
				var emojisListAsText = emojisList.join("\n");
			} else {
				var emojisListAsText = "No emojis have been found.";
			}

			if (emojisListAsText !== "No emojis have been found.") {
				sendToHastebin(emojisListAsText).then(ling => {
					const returningEmbed = new Discord.RichEmbed()
						.setAuthor(`${guildData.name} (${guildData.id})`, "", "")
						.setColor(7506394)
						.setThumbnail(iconLink)
						.addField("Owned by", `\`\`\`\n${guildData.owner.user.tag} (${guildData.owner.user.id})\n\`\`\``)
						.addField("Current Region", `\`\`\`\n${guildData.region}\n\`\`\``)
						.addField("Members", `\`\`\`\n${guildData.members.size}, including ${memberCountWithBots} bots\n\`\`\``, true)
						.addField("Users", `\`\`\`\n${(guildData.members.size - memberCountWithBots)}\n\`\`\``, true)
						.addField("Text Channels", `\`\`\`\n${textChannels.size}\n\`\`\``, true)
						.addField("Voice Channels", `\`\`\`\n${voiceChannels.size}\n\`\`\``, true)
						.addField("Total Roles", `\`\`\`\n${guildData.roles.size}\n\`\`\``)
						.addField("Emojis", `\`\`\`\n${ling}\n\`\`\``)
						.addField("AFK Channel", `\`\`\`\n${afkChannel}\n\`\`\``)
						.setTimestamp(new Date())
						.setFooter(`Information requested by ${message.author.tag}`, message.author.displayAvatarURL);
					message.channel.send({embed: returningEmbed}).catch(e => {
						console.error("Err in command: " + e);
					});
				}).catch(e => {
					console.error("Err in command: " + e);
				});
			} else {
				const returningEmbed = new Discord.RichEmbed()
					.setAuthor(`${guildData.name} (${guildData.id})`, "", "")
					.setColor(7506394)
					.setThumbnail(iconLink)
					.addField("Owned by", `\`\`\`\n${guildData.owner.user.tag} (${guildData.owner.user.id})\n\`\`\``)
					.addField("Current Region", `\`\`\`\n${guildData.region}\n\`\`\``)
					.addField("Members", `\`\`\`\n${guildData.members.size}, including ${memberCountWithBots} bots\n\`\`\``, true)
					.addField("Users", `\`\`\`\n${(guildData.members.size - memberCountWithBots)}\n\`\`\``, true)
					.addField("Text Channels", `\`\`\`\n${textChannels.size}\n\`\`\``, true)
					.addField("Voice Channels", `\`\`\`\n${voiceChannels.size}\n\`\`\``, true)
					.addField("Total Roles", `\`\`\`\n${guildData.roles.size}\n\`\`\``)
					.addField("Emojis", `\`\`\`\n${emojisListAsText}\n\`\`\``)
					.addField("AFK Channel", `\`\`\`\n${afkChannel}\n\`\`\``)
					.setTimestamp(new Date())
					.setFooter(`Information requested by ${message.author.tag}`, message.author.displayAvatarURL);
				message.channel.send({embed: returningEmbed}).catch(e => {
					console.error("Err in command: " + e);
				});
			}
		}
	}
};

exports.tos = {
	globalTo: "1000",
	replik: "3000",
	oynat: "5000",
	mesajsil: "10000",
	randomcolor: "15000"
};
