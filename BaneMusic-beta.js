//Azıcık sıkıntılı bir müzik botu hala fixleyemedim lel.//
//160536882277646337 - music room//
//129022124844253184 - server id//
//160894083173318666 - bot command text channel id//

//Logon {
process.stdout.write('\033c');
//}

// <Variables> {
var jsonFolder      = './json/MusicBot/',
    Permissions     = {},
    alias           = {},
    musicFree       = true,
    nowPlaying      = {},
    pTimeout        = null,
    songBanned      = {},
    discoChannel    = false,
    voteSkipCount   = 0,
    discoChannelMembers = [],
    songList        = {},
    playLists       = {},
    playList        = null,
    playListName    = null,
    playListIndex   = null,
    playListLength  = null,
    stream          = null,
    calanKontrol    = false,
    listeKontrol    = false;
//}
// <Requires> {
try {
	var Discord = require("discord.js");
} catch (e) {
	console.log("Please run 'npm install' and ensure it passes with no errors!");
	process.exit(1);
}
try {
	var AuthDetails = require(jsonFolder + "auth.json");
} catch (e) {
	console.log("Please create an auth.json like auth.json.example with at least an email and password.");
	process.exit(1);
}

var Config = {};
try{
	Config = require(jsonFolder + "config.json");
} catch(e){ //no config file, use defaults
    Config.debug = false;
	Config.respondToInvalid = false;
	Config.freeMusic = true;
	updateConfig();
}

var fs              = require('fs'),
    path            = require('path'),
    ytdl            = require('ytdl-core');
//}
// <JSON> {
try {
    alias = require(jsonFolder + 'alias.json');
} catch(e) {}
try {
    Permissions = require(jsonFolder + "permissions.json");
} catch(e) {}
try {
    songBanned = require(jsonFolder + 'songBanned.json');
} catch(e) {}
try {
    songList = require(jsonFolder + 'songList.json');
} catch(e) {}
try {
    nowPlaying = require(jsonFolder + "nowPlaying.json");
} catch(e) {}
try {
    playLists = require(jsonFolder + "playLists.json");
} catch(e) {}
//}
// <Required Variables> {
var bot             = new Discord.Client();
//}
// <UpdateFile> {
function updateJSON(fnjson, fjson) {
    require("fs").writeFile(jsonFolder + fnjson,JSON.stringify(fjson,null,2), null);
}
function updatePermissions() {updateJSON("permissions.json",Permissions);}
function updateSongList(){updateJSON("songList.json", songList);}
function updateNowPlaying(){updateJSON("nowPlaying.json",nowPlaying);}
function updateSongBanned(){updateJSON("songBanned.json",songBanned);}
function updateAuth(){updateJSON("auth.json",AuthDetails);}
function updateAlias(){updateJSON("alias.json",alias);}
function updatePlayLists(){updateJSON("playLists.json",playLists);}
function updateConfig(){updateJSON("config.json", Config);}
//}
// <Functions> {
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}
function timeFormatString(hour, minute, second) {
    var reply = "";
    if(hour) {
    	reply += " " + hour + " saat";
    }
    if(minute) {
    	reply+= " " + minute + " dakika";
    }
    if(second) {
    	reply+= " " + second + " saniye";
    }
    return reply;
}
Date.prototype.addHours = function(h) {
   this.setTime(this.getTime() + (h*60*60*1000));
   return this;
};
Date.prototype.addMinutes = function(m) {
   this.setTime(this.getTime() + (m*60*1000));
   return this;
};
function timediff(date1, date2) {
	var pDate1 = new Date(date1.toString());
	var pDate2 = new Date(date2.toString());

	/*if (pDate2 < pDate1) {
		pDate2.setDate(pDate2.getDate() + 1);
	}*/

	var diff = pDate2 - pDate1;

	var msec = diff;

	var as = msec / 1000;

	var hh = Math.floor(msec / 1000 / 60 / 60);
	msec -= hh * 1000 * 60 * 60;
	var mm = Math.floor(msec / 1000 / 60);
	msec -= mm * 1000 * 60;
	var ss = Math.floor(msec / 1000);
	msec -= ss * 1000;

	var TimeDiff = {
		"hours": hh,
		"minutes": mm,
		"seconds": ss,
		"mseconds": msec,

		"aseconds": as
	};

	return TimeDiff;
}
function checkPermission(id,permission) {
	try {

		var allowed = false;
		try{
			if(Permissions.global.hasOwnProperty(permission)){
				allowed = Permissions.global[permission] == true;
			}
		} catch(e){}
		try{

			if(Permissions.users[id].hasOwnProperty(permission)){
				allowed = Permissions.users[id][permission] == true;
			}
		} catch(e){}
		return allowed;
	} catch(e){}
	return false;
}
function isset(arg) {
    return (typeof arg == 'undefined' ? false : true);
}

function stopPlaying() {
    if(stream)
        stream.end();
    if(bot.voiceConnection)
        bot.voiceConnection.stopPlaying();
    clearTimeout(pTimeout);
    pTimeout = null;
    nowPlaying = {
        startTime: false,
        songName: false,
        songID: false,
        songLength: false,
        submitterName: false,
        submitterID: false
    };
    updateNowPlaying();
}

function playFromList(msg) {
    if(pTimeout) { // eğer şarkının bitişi için bir timeout atanmışsa
        stopPlaying();
    }
    if(playList) {
        if(playList.length > 0) {
            bot.sendMessage(msg.channel, "**\"" + playListName + "\" çalma listesinden çalınıyor. (" + playListIndex++ + "/" + playListLength + ")\nHerhangi bir şarkı eklendiğinde \"" + playListName + "\" çalma listesinden çalma durdurulacaktır.**");
            var index = Math.floor(Math.random() * playList.length);
            var sid = playList[index];
            playList.splice(index, 1);
            playFromID(msg, sid);
        } else {
            bot.sendMessage(msg.channel, "**\"" + playListName + "\" çalma listesinde çalacak şarkı kalmadı.**");
            playList = null;
            playListIndex = null;
            playListLength = null;
            stopPlaying();
        }
    }
    else if(songList) {
        var songs = Object.keys(songList).map(function(k) {return songList[k];});
        if(songs.length > 0) {
            var next = songs.shift();
            songList = {};
            for(var i = 0; i < songs.length; i++)
                songList[i] = songs[i];
            updateSongList();
            playFromID(msg, next.songID, next);
        } else {
            bot.sendMessage(msg.channel, "**Listede çalınacak şarkı yok.**");
        }
    } else {
        bot.sendMessage(msg.channel, "**Hata: Çalma listesi bulunamadı, lütfen bir admin ile iletişime geçin.**");
    }
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function playFromID(msg, suffix, pInfo) {
    try {
        if(bot.voiceConnection) {
            if(pTimeout) { // eğer şarkının bitişi için bir timeout atanmışsa
                bot.sendMessage(msg.channel, "**\"" + playListName + "\" çalma listesinden çalma durduruldu.**");
                stopPlaying();
            }
            if(!isset(pInfo))
                pInfo = false;
            ytdl.getInfo("http://www.youtube.com/watch?v=" + suffix, null, function(err, videoInfo) {
                if(err) {
                    console.log("Error ytdl.getInfo: " + err);
                }
                if(isset(videoInfo)) {
                    if(pInfo) {
                        bot.sendMessage(msg.channel, "**Çalıyor:** " + videoInfo.title + " **["+ secondsToHms(videoInfo.length_seconds) + "]" + " / Ekleyen : " + pInfo.submitterName + "**");
                    } else {
                        bot.sendMessage(msg.channel, "**Çalıyor:** " + videoInfo.title + " **["+ secondsToHms(videoInfo.length_seconds) + "]" + " / Ekleyen : " + msg.sender.name + "**");
                    }
                    //var yturl = "https://request-kapkeyk.c9users.io:8081/?data=" + suffix;
                    //var stream = request(yturl);
                    //bot.voiceConnection.playRawStream(stream,{Volume : 0.1});
                    var video = "http://www.youtube.com/watch?v=" + suffix;
                    bot.voiceConnection.playRawStream(ytdl(video, {filter: 'audioonly'}), {Volume: 0.1});
                    pTimeout = setTimeout(
                        function() {
                            bot.sendMessage(msg.channel, "**Şarkı bitti.\n\n**");
                            stopPlaying();
                            playFromList(msg);
                        },
                        (parseInt(videoInfo.length_seconds,10) + 2) * 1000
                    );
                    if(pInfo) {
                        nowPlaying = {
                            startTime: Date(),
                            songName: videoInfo.title,
                            songID: suffix,
                            songLength: videoInfo.length_seconds,
                            submitterName: pInfo.submitterName,
                            submitterID: pInfo.submitterID
                        };
                    } else {
                        nowPlaying = {
                            startTime: Date(),
                            songName: videoInfo.title,
                            songID: suffix,
                            songLength: videoInfo.length_seconds,
                            submitterName: msg.sender.name,
                            submitterID: msg.sender.id
                        };
                    }
                    updateNowPlaying();
                } else {
                    bot.sendMessage(msg.channel, msg.sender + "**, şarkı eklenemedi!**");
                }
            });
        } else {
            if(!discoChannel) {
                discoChannel = bot.channels.get("id", "160536882277646337");
                bot.joinVoiceChannel(discoChannel);
            } else {
                bot.joinVoiceChannel(discoChannel);
            }
        }
    } catch(e) {
        console.log("Error at playfromid : " + e);
    }
}

function getYoutubeIDFromLink(link) {
    if(/^http:\/\/(?:www.)?youtube.com\/watch?(?=.*v=\w+)(?:\S+)?$/.test(link) || /^https:\/\/(?:www.)?youtube.com\/watch?(?=.*v=\w+)(?:\S+)?$/.test(link)) {
        return true;
    }
    return false;
}
function checkRole(id, user, role) {
    var server = bot.servers.get("id", id);
    if(!server) {
        console.log("Error at checkRole: no server");
        return false;
    }
    var roles = server.rolesOfUser(user);
    for(var i=0;i<roles.length;i++) {
        if(roles[i].name == role)
            return true;
    }
    return false;
}

//}
// <Commands> {
    var commands = {
    "ping": {
        description: "Bot açık ise \"pong!\" cevabını gönderir.",
        process: function(bot, msg, suffix) {
            try {
                bot.sendMessage(msg.channel, msg.sender+" pong!");
            } catch(e) {
                console.log("Error ping at " + msg.channel.name + " : " + e);
            }
        }
    },
    "sıradakikısıt": {
        hidden:"1",
        description: "ıvır zıvır işler",
        process: function(bot, msg, suffix) {
            try {
                if(checkPermission(msg.sender.id, "admin")) {
                    if(Config.freeMusic) {
                        Config.freeMusic = false;
                        bot.sendMessage(msg.channel, "Şarkı geçmek artık **kısıtlı**.");
                    } else {
                        Config.freeMusic = true;
                        bot.sendMessage(msg.channel, "Şarkı geçmek artık **serbest**.");
                    }
                    updateConfig();
                }
            } catch(e) {
                console.log("Error sıradakikısıt at " + msg.channel.name + " : " + e);
            }
        }
    },
	"çal": {
        usage:"<youtube link ya da id>",
        description: "Verilen şarkıyı çalar/çalma listesine ekler.",
        process: function(bot,msg,suffix) {
            try {
                    if(msg.channel.isPrivate) {
                        bot.sendMessage(msg.sender, "**PM'den şarkı ekleyemezsiniz.**");
                        return;
                    }
                    if (songBanned.hasOwnProperty(msg.sender.id)) {
                        if(songBanned[msg.sender.id].permanent) {
                            bot.sendMessage(msg.channel, "**" + msg.sender + ", çalma listesine şarkı eklemeniz engellenmiştir.**");
                            return;
                        } else {
                            var date1 = new Date(songBanned[msg.sender.id].time);
                            date1.addHours(parseInt(songBanned[msg.sender.id].hours, 10));
                            var banTime = timediff(Date(), date1);
                            if(banTime.aseconds < 0) {
                                delete songBanned[msg.sender.id];
                                updateSongBanned();
                            } else {
                                bot.sendMessage(msg.channel, "**" + msg.sender + ", çalma listesine şarkı eklemeniz " + timeFormatString(banTime.hours, banTime.minutes, banTime.seconds) + " engellenmiştir.**");
                                return;
                            }
                        }z
                    }
                    if(calanKontrol || listeKontrol) {
                        var songs = Object.keys(songList).map(function(k) {return songList[k];});
                        var exists = false;
                        if(calanKontrol && nowPlaying.hasOwnProperty("submitterID")) {
                            if(nowPlaying.submitterID == msg.sender.id) {
                                exists = true;
                            }
                        }
                        if(listeKontrol) {
                            for(var i = 0; i < songs.length; i++) {
                                if(songs[i].submitterID == msg.sender.id) {
                                    exists = true;
                                    break;
                                }
                            }
                        }
                    }
                    if(!exists) {
                        if(playLists.hasOwnProperty(suffix)) {
                            playListName = suffix;
                            playList = playLists[playListName].slice(0);
                            playListIndex = 1;
                            playListLength = playList.length;
                            playFromList(msg);
                        } else if(suffix) {
                            if(playListName && playList || playListIndex || playListLength) {
                                bot.sendMessage(msg.channel, "**\"" + playListName + "\" çalma listesinden çalma durduruldu, çalan şarkı bittikten sonra normal çalma listesine geçilecek.**");
                                playListName = null;
                                playList = null;
                                playListIndex = null;
                                playListLength = null;
                            }
                            if(getYoutubeIDFromLink(suffix)) {
                                   suffix = suffix.substr(suffix.indexOf('v=')+2, 11);
                               }
                           ytdl.getInfo("https://www.youtube.com/watch?v=" + suffix, null, function(err, videoInfo) {
                                if(err) {
                                    console.log("Error ytdl.getInfo");
                                }
                                if(isset(videoInfo)) {
                                    var title = videoInfo.title;
                                    var songs = Object.keys(songList).map(function(k) {return songList[k];});
                                    if(songs.length < 10) {
                                        if(nowPlaying.songID != suffix) {
                                            var exists = false;
                                            for(var i = 0; i < songs.length; i++) {
                                                if(songs[i].songID == suffix) {
                                                    exists = true;
                                                    break;
                                                }
                                            }
                                            if(!exists) {
                                                songs[songs.length] = {
                                                    songName: title,
                                                    songID: suffix,
                                                    songLength: videoInfo.length_seconds,
                                                    submitterName: msg.sender.name,
                                                    submitterID: msg.sender.id
                                                };
                                                songList = {};
                                                for(var i = 0; i < songs.length; i++)
                                                    songList[i] = songs[i];
                                                updateSongList();
                                                if(Object.keys(songList).length == 1 && pTimeout == null) {
                                                    playFromList(msg);
                                                } else {
                                                    bot.sendMessage(msg.channel, "**" + msg.sender.name + " şarkı listesine** \"" + title + "\" ** şarkısını ekledi.**");
                                                }
                                            } else {
                                                bot.sendMessage(msg.channel, "**" + msg.sender + ", eklemeye çalıştığınız şarkı zaten çalma listesinde var.**");
                                            }
                                        }
                                        else {
                                            bot.sendMessage(msg.channel, "**" + msg.sender + ", eklemeye çalıştığınız şarkı şu an zaten çalıyor.**");
                                        }
                                    } else {
                                        bot.sendMessage(msg.channel, "**" + msg.sender + ", çalma listesi şu an dolu, lütfen şarkı bittikten sonra tekrar deneyiniz.**");
                                    }
                                } else {
                                    bot.sendMessage(msg.channel, "**" + msg.sender + ", şarkı eklenemedi!**");
                                }
                            });
                        } else {
                            bot.sendMessage(msg.channel, "**" + msg.sender + ", şarkı bulunamıyor!**");
                        }
                    } else {
                        bot.sendMessage(msg.channel, "**" + msg.sender + ", zaten çalma listesinde bir şarkınız bulunuyor.**");
                    }
            } catch(e) {
                console.log("Error çal at " + msg.channel.name + " : " + e);
            }
        }
    },
	"çalan": {
        description:"Şimdi çalan şarkıyı gösterir.",
	    process: function(bot,msg,suffix) {
            try {
                    if(nowPlaying.hasOwnProperty("songName") && nowPlaying.hasOwnProperty("submitterName") && nowPlaying.songName && nowPlaying.submitterName) {
                        bot.sendMessage(msg.channel, "**Çalan : **" + nowPlaying.songName + "** / Ekleyen : " + nowPlaying.submitterName + "**");
                    } else {
                        bot.sendMessage(msg.channel, "**Şu an çalan bir şarkı yok.**");
                    }
	        } catch(e) {
	            console.log("Error çalan at " + msg.channel.name + " : " + e);
	        }
	    }
	},
	"çalanlink": {
        description:"Şimdi çalan şarkının Youtube linkini gönderir.",
	    process: function(bot,msg,suffix) {
	        try {
                    if(nowPlaying.hasOwnProperty("songID") && nowPlaying.songID) {
                        bot.sendMessage(msg.channel, "*https://www.youtube.com/watch?v=" + nowPlaying.songID + "*");
                    } else {
                        bot.sendMessage(msg.channel, "**Şu an çalan bir şarkı yok.**");
                    }
	        } catch(e) {
	            console.log("Error çalanlink at " + msg.channel.name + " : " + e);
	        }
	    }
	},
	"çalanid": {
	    description:"Şimdi çalan şarkının idsini gönderir.",
	    process: function(bot,msg,suffix) {
	        try {
                    if(nowPlaying.hasOwnProperty("songID") && nowPlaying.songID) {
                        bot.sendMessage(msg.channel, nowPlaying.songID);
                    } else {
                        bot.sendMessage(msg.channel, "**Şu an çalan bir şarkı yok.**");
                    }
	        } catch(e) {
	            console.log("Error çalanid at " + msg.channel.name + " : " + e);
	        }
	    }
	},
	"süre": {
        description:"Şarkının kalan süresini gösterir.",
	    process: function(bot,msg,suffix) {
	        try {
                    if(nowPlaying && nowPlaying.startTime) {
                        var date1 = nowPlaying.startTime;
                        var date2 = nowPlaying.songLength;
                        var playTime = timediff(date1, Date());
                        var remainingSec = Math.abs(parseInt(nowPlaying.songLength, 10) - playTime.aseconds);
                        var remainingMin = parseInt(remainingSec / 60, 10);
                        remainingSec %= 60;
                        var remainingHou = parseInt(remainingMin / 60, 10);
                        remainingMin %= 60;

                        var currentSec = playTime.aseconds;
                        var currentMin = parseInt(currentSec / 60, 10);
                        currentSec %= 60;
                        var currentHou = parseInt(currentMin / 60, 10);
                        currentMin %= 60;

                        var reply1 = timeFormatString(currentHou, currentMin, currentSec);
                        var reply2 = timeFormatString(remainingHou, remainingMin, remainingSec);
                        bot.sendMessage(msg.channel, "**" + secondsToHms(playTime.aseconds) + " / " + secondsToHms(date2) + "**");
                    } else {
                        bot.sendMessage(msg.channel, "**Şu an çalan bir şarkı yok.**");
                    }
	        } catch(e) {
	            console.log("Error kalansüre at " + msg.channel.name + " : " + e);
	        }
	    }
	},
	"liste": {
        description: "Çalma listesini gösterir.",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "admin") && suffix) {
                    var args = suffix.split(" ");
                    var cmd = args.shift();
                    var index = parseInt(args.join(" "), 10) - 1;
                    if(cmd == "sil" && isNumeric(index)) {
                        if(index > -1) {
                            var songs = Object.keys(songList).map(function(k) {return songList[k];});
                            if(songs.length > index) {
                                songs.splice(index, 1);
                                songList = {};
                                for(var i = 0; i < songs.length; i++) {
                                    songList[i] = songs[i];
                                }
                                updateSongList();
                                bot.sendMessage(msg.channel, "Çalma listesindeki **" + (index+1) + "** numaralı şarkı silindi.");
                            } else {
                                bot.sendMessage(msg.channel, "Çalma listesinde **" + (index+1) + "** numaralı şarkı bulunamadı.");
                            }
                        } else {
                            bot.sendMessage(msg.channel, "Çalma listesinde **" + (index+1) + "** numaralı şarkı bulunamadı.");
                        }
                    }
                } else {
                    var songs = Object.keys(songList).map(function(k) {return songList[k];});
                    var length = songs.length;
                    if(length > 10) {
                        length = 10;
                    }
                    var reply = "";
                    for(var i = 0; i < length; i++) {
                        if(i < (length-1))
                            reply += (i+1).toString() + ")** " + songs[i].songName + " ** [" + songs[i].songLength + "]/ Ekleyen : " + songs[i].submitterName + "\r\n";
                        else
                            reply += (i+1).toString() + ")** " + songs[i].songName + " ** [" + songs[i].songLength + "]/ Ekleyen : " + songs[i].submitterName;
                    }
                    if(length == 0) {
                        reply = "Çalma listesinde hiç şarkı yok.";
                    }
                    bot.sendMessage(msg.channel, reply);
                }
            } catch(e) {
                console.log("Error liste at " + msg.channel.name + " : " + e);
            }
        }
    },
	"dur": {
	    description:"(Regular Users ve üzeri) Çalan şarkıyı durdurur.",
	    process: function(bot,msg,suffix) {
	        try {
                if(checkPermission(msg.sender.id,"dev") || checkRole(msg.channel.server.id, msg.sender, "Regular Users")) {
                stopPlaying();
                bot.sendMessage(msg.channel, "**Çalan şarkı durduruldu.**");
                } else {
                    bot.sendMessage(msg.channel, "** " + msg.sender + ", bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
                }
	        } catch(e) {
	            console.log("Error dur at " + msg.channel.name + " : " + e);
	        }
	    }
	},
	"sıradaki": {
        description:"(Regular Users ve üzeri) Sıradaki şarkıya geçer başlatır.",
	    process: function(bot,msg,suffix) {
	        try {
	            if(checkPermission(msg.sender.id,"dev") || checkRole(msg.channel.server.id, msg.sender, "Regular Users")) {
                    if(nowPlaying.hasOwnProperty("songName")) {
                        bot.sendMessage(msg.channel,"**" + msg.sender + " sıradaki şarkıya geçti!**", false, function() {
                            playFromList(msg);
                        });
                    } else {
                    bot.sendMessage(msg.channel, "**Şu an çalan bir şarkı yok.");
                    }
                } else {
                    bot.sendMessage(msg.channel, "**" + msg.sender + ", bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
                }
                /*if(nowPlaying.hasOwnProperty("songName")) {
                    var text = "";
                    if(voteSkipCount == 0) {
                        voteSkipCount++;
                        text = "Sıradaki şarkıya geçmek için oylama başlatıldı. (Oylamayı başlatan: " + msg.sender + ")";
                    }
                    console.log(msg.channel.server.channels.get("id", "150668333010649088").members);
                    console.log(parseInt(msg.channel.server.channels.get("id", "150668333010649088").members.length, 10));
                    var required = Math.ceil(parseInt(msg.channel.server.channels.get("id", "150668333010649088").members.length, 10) / 2);
                    console.log(required);
                    if(voteSkipCount >= required) {
                        text = "Oylama kabul edildi (" + voteSkipCount + "/" + required + "), sıradaki şarkıya geçiliyor.";
                        playFromList(msg);
                        voteSkipCount = 0;
                    } else {
                        text = "Sıradaki şarkıya geçmek için gereken oy: " + voteSkipCount + "/" + required;
                    }
                    bot.sendMessage(msg.channel, "**" + text + "**");
                } else {
                    bot.sendMessage(msg.channel, "**Şu an çalan bir şarkı yok.");
                }*/
	        } catch(e) {
	            console.log("Error sıradaki at " + msg.channel.name + " : " + e);
	        }
	    }
	},
	"temizle": {
        description:"(admin) Çalma listesini temizler.",
	    process: function(bot,msg,suffix) {
	        try {
	                if(checkPermission(msg.sender.id, "trusted")) {
	                    songList = {};
	                    updateSongList();
	                    bot.sendMessage(msg.channel, "**Çalma listesi temizlendi.**");
	                } else {
	                    bot.sendMessage(msg.channel, "** " + msg.sender + ", bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.**");
	                }
	        } catch(e) {
	            console.log("Error temizle at " + msg.channel.name + " : " + e);
	        }
	    }
	},
    /*land of hidden*/
    "r":{
        disabled:"1",
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "trusted")) {
                    if(bot.voiceConnection)
                        bot.voiceConnection.destroy();
                    if(!discoChannel) {
                        discoChannel = bot.channels.get("id", "160536882277646337");
                    }
                    bot.joinVoiceChannel(msg.sender.voiceConnection);
                } else {

                }
            }
            catch (e){
                console.log("Error r at " + msg.channel.name + " : " + e);
            }
        }
    },
    "çl":{
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "trusted")) {
                    var args = suffix.split(' ');
                    var cmd = args.shift();
                    var pl = args.shift();
                    var s =  args.join(' ');
                    if(cmd == "ekle") {
                        playLists[pl].push(s);
                        updatePlayLists();
                        ytdl.getInfo("https://www.youtube.com/watch?v=" + s, function(err, videoInfo) {
                            if(err) {
                                bot.sendMessage(msg.channel, "**\"" + s + "\" şarkısı \"" + pl + "\" çalma listesine eklendi.**");
                            }
                            bot.sendMessage(msg.channel, "**\"" + videoInfo.title + "\" şarkısı \"" + pl + "\" çalma listesine eklendi.**");
                        });
                    } else if(cmd == "sil") {
                        if(playLists.hasOwnProperty(pl)) {
                            if(playLists[pl].indexOf(s) > -1) {
                                playLists[pl].splice(playLists[pl].indexOf(s), 1);
                                ytdl.getInfo("https://www.youtube.com/watch?v=" + s, function(err, videoInfo) {
                                    if(err) {
                                        bot.sendMessage(msg.channel, "**\"" + s + "\" şarkısı \"" + pl + "\" çalma listesinden silindi.**");
                                    }
                                    bot.sendMessage(msg.channel, "**\"" + videoInfo.title + "\" şarkısı \"" + pl + "\" çalma listesinden silindi.**");
                                });
                                updatePlayLists();
                            } else {
                            bot.sendMessage(msg.channel, "**\"" + s + "\" id'si \"" + pl + "\" çalma listesinde bulunamadı.**");
                            }
                        }
                    }
                }
            }
            catch (e){
                console.log("Error çl at " + msg.channel.name + " : " + e);
            }
        }
    },
    "alias":{
        hidden:"1",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "trusted")) {
                    var args = suffix.split(' ');
                    var cmd = args.shift();
                    var alis = args.shift();
                    var org =  args.join(' ');
                    if(cmd == "ekle") {
                        alias[alis] = org;
                        updateAlias();
                        bot.sendMessage(msg.sender, "**alias \"" + alis + " : " + org + "\" eklendi.**");
                    } else if(cmd == "sil") {
                        if(alias.hasOwnProperty(alis)) {
                            delete alias[alis];
                            updateAlias();
                            bot.sendMessage(msg.sender, "**alias \"" + alis + "\" silindi.**");
                        }
                    }
                }
            }
            catch (e){
                console.log("Error alias at " + msg.channel.name + " : " + e);
            }
        }
    },
    "joinserver": {
        hidden:"1",
        usage: "<invite kodu>",
        process: function(bot,msg,suffix) {
            if(checkPermission(msg.sender.id,"trusted")) {
                console.log(bot.joinServer(suffix,function(error,server) {
                    console.log("callback: " + arguments);
                    if(error){
                     bot.sendMessage(msg.channel,"Bağlanılamadı! : " + error);
                    } else {
                        console.log(" * Joined server " + server);
                        bot.sendMessage(msg.channel,"Bağlanıldı! : " + server);
                    }
                }));
            }
        }
    },
    "müzikban":{
        hidden:"1",
        usage:"<@mention> <saat>",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "trusted")) {
                    if(suffix) {
                        var args = suffix.split(' ');
                        var user = args.shift();
                        if(user.startsWith("<@")) {
                            user = user.replace("<@","");
                            user = user.replace(">","");
                        }
                        var h = false;
                        var perm = true;
                        if(args.length > 0) {
                            h = args.join(' ');
                            perm = false;
                        }
                        songBanned[user] = {
                            permanent: perm,
                            time: Date(),
                            hours: h
                        };
                        updateSongBanned();
                        if(h) {
                            bot.sendMessage(msg.channel, "**<@" + user + "> kullanıcısının çalma listesine şarkı eklenmesi " + h + " saat boyunca yasaklandı.**");
                        }
                        else {
                            bot.sendMessage(msg.channel, "**<@" + user + "> kullanıcısının çalma listesine şarkı eklemesi süresiz yasaklandı.**");
                        }
                    }
                }
            }
            catch (e){
                console.log("Error müzikban at " + msg.channel.name + " : " + e);
            }
        }
    },
    "müzikunban":{
        hidden:"1",
        usage:"<@mention>",
        process: function(bot,msg,suffix) {
            try {
                if(checkPermission(msg.sender.id, "trusted")) {
                    if(suffix) {
                        var args = suffix.split(' ');
                        var user = args.shift();
                        if(user.startsWith("<@")) {
                            user = user.replace("<@","");
                            user = user.replace(">","");
                        }
                        delete songBanned[user];
                        updateSongBanned();
                        bot.sendMessage(msg.channel, "**<@" + user + "> artık çalma listesine şarkı ekleyebilir.**");
                    }
                }
            }
            catch (e){
                console.log("Error !müzikunban at " + msg.channel + " : " + e);
            }
        }
    },
	"t": {
	    hidden: "1",
	    description:"Botun chate yazdığı tüm mesajları siler.",
	    process: function(bot,msg,suffix) {
	        try {
	            if(checkPermission(msg.sender.id, "trusted")) {
	                var msjlar = msg.channel.messages;
	                for(var i = 0; i < msjlar.length; i++) {
	                    if(msjlar[i].content.startsWith(".") || msjlar[i].sender == bot.user) {
	                        bot.deleteMessage(msjlar[i]);
	                    }
	                }
	            }
	        } catch(e) {
	            console.log("Error t at " + msg.channel.name + " : " + e);
	        }
	    }
	},
	"logout": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id, "trusted")){
					process.exit(0);
			}
		}
	},
};
//}
// <Events> {
bot.on("ready", function () {
	console.log("Ready to begin! " + bot.channels.length + " channels are active.");
	if(!discoChannel) {
        discoChannel = bot.channels.get("id", "160536882277646337");
        bot.joinVoiceChannel(discoChannel);
    }
	if(nowPlaying) {
	    stopPlaying();
	}
	bot.setPlayingGame("yardım için .help");
});

bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
});

bot.on("message", function (msg) {
    if(msg.author.id != bot.user.id && (msg.content[0] === '.' || msg.content.indexOf(bot.user.mention()) == 0)) {
        console.log(" * treating " + msg.content + " from " + msg.author.name + " as command at " + msg.channel.name);
		var cmdTxt = msg.content.split(" ")[0].substring(1);
		cmdTxt = cmdTxt.toLowerCase();
        var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space
        if(msg.content.indexOf(bot.user.mention()) == 0){
			try {
				cmdTxt = msg.content.split(" ")[1];
				cmdTxt = cmdTxt.toLowerCase();
				suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+2);
			} catch(e){ //no command
				//bot.sendMessage(msg.channel,"Efendim ?");
				return;
			}
        }
        if(alias[cmdTxt])
		    cmdTxt = alias[cmdTxt];
		var cmd = commands[cmdTxt];
        if(cmdTxt === "help") {
            try {
            var texttosend = "";
            if(suffix) {
                if(commands.hasOwnProperty(suffix)) {
                    var c = commands[suffix];
                    var info = "**." + suffix + "**";
                    var usage = commands[suffix].usage;
                    var hidden = commands[suffix].hidden;
                    var disabled = commands[suffix].disabled;
                    if(hidden || disabled) {
                        return;
                    }

                    var description = commands[suffix].description;
                    if(description){
                    	info += " - " + description;
                    }
                    info += "\r\n\r\n**Kullanım:** `." + suffix;
                    if(usage){
                    	 info += " " + usage;
                    }
                    info += "`";
                    texttosend += info + "\r\n";
                } else {
                    texttosend = "**\"" + suffix + "\" diye bir komut bulunamadı.**";
                }
            } else {
			    for(var c in commands) {
			    	var info = "**." + c + "**";
			    	var usage = commands[c].usage;
                    var hidden = commands[c].hidden;
                    var disabled = commands[c].disabled;
                    if(hidden || disabled) {
                        continue;
                    }
			    	var description = commands[c].description;
			    	if(description){
			    		info += " - " + description;
			    	}
			    	texttosend += info + "\r\n";
			    }
			    texttosend += "\r\nTek bir komut hakkında daha çok bilgi için \".help <komut>\"";
			    texttosend += "\r\nBot sadece <#160894083173318666> kanalında çalışmaktadır.";
            }
            bot.sendMessage(msg.channel,texttosend);
            } catch(e) {
                console.log("Error at help: " + e);
            }
        }
		else if(cmd) {
			try{
			    if(!cmd.disabled) {
			        if(msg.channel.server.id == "129022124844253184" && msg.channel.id == "160894083173318666" || cmdTxt == "t" || cmdTxt == "alias") {
				        cmd.process(bot,msg,suffix);
			        } else {
			            bot.sendMessage(msg.channel, "Bot sadece <#160894083173318666> kanalında çalışmaktadır.");
			        }
			    }

			} catch(e){

			}
		}
    } else {
        //message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return;
        }
    }
});
if(isset(AuthDetails.logtoken)) {
    bot.loginWithToken(AuthDetails.logtoken, function(err,token) {if(err) {console.log(err);}});
} else {
    bot.login(AuthDetails.email, AuthDetails.password, function(error,token) {
        try {
            if(isset(token)) {
                AuthDetails["logtoken"] = token;
                updateAuth();
            }
        } catch(e) {

        }
    });
}
//}

process.on('uncaughtException', function(err) {
  // Handle ECONNRESETs caused by `next` or `destroy`
  if (err.code == 'ECONNRESET') {
    // Yes, I'm aware this is really bad node code. However, the uncaught exception
    // that causes this error is buried deep inside either discord.js, ytdl or node
    // itself and after countless hours of trying to debug this issue I have simply
    // given up. The fact that this error only happens *sometimes* while attempting
    // to skip to the next video (at other times, I used to get an EPIPE, which was
    // clearly an error in discord.js and was now fixed) tells me that this problem
    // can actually be safely prevented using uncaughtException. Should this bother
    // you, you can always try to debug the error yourself and make a PR.
    console.log('Got an ECONNRESET! This is *probably* not an error. Stacktrace:');
    console.log(err.stack);
  } else {
    // Normal error handling
    console.log(err);
    console.log(err.stack);
    process.exit(0);
  }
});
