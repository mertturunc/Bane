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
					bot.send(message.channel, "**Kahve molası **", false, function() {  child_process.exec("pm2 restart all", puts); process.exit(0); });
					console.log("  Restart time!");
				} else {
					bot.send(message, " ``Yetkiniz bulunmamakta.( ° ͜ʖ͡°)╭∩╮`` ");
				}
			} catch (exp) {
			}
		}
	},
// oylama info
"oylama": {
	process: function(bot,msg) {
			bot.send(msg, "buraya kullanım şeysi gelecek ayrıca mesaj olarak atsın bence xd");
	}
}
