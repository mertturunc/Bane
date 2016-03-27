//exports.perm = {
//	usage: "[user]",
//	description: "Kişinin kanaldaki perm derecesini verir.",
//	process: function(bot,msg,suffix) {
//		var user = resolveUser(msg,suffix);
//		if(!user){
//			user = msg.author;
//		}
//		bot.sendMessage(msg.channel,"permissions of " + user + ':\n' + JSON.stringify(msg.channel.permissionsOf(user).serialize(),null,2));
//	}
//}
//IN DEV PROGRESS
