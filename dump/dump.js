//botun adı değişir, (discord'un kendi apisi desteklemeyecektir)
	"isim-değiş": {
		process: function(bot,msg,suffix) {
			let commandWhitelist = require(jsonFolder + 'commandwhitelist.json');
			if (commandWhitelist.indexOf(msg.sender.id) > -1) {
				if(suffix) {
					console.log("msg.sender.username botun adını " + suffix + " ile değiştirdi.");
					bot.setUsername(suffix, function(error) {
						bot.send(msg.channel, error);
					});
						bot.deleteMessage(msg);
				}
			}
		}
	},
//
