var Discordie = require("discordie");
var fs = require("fs");
var client = new Discordie();

var CUSTOM_GAMES_CHANNEL = '321291281886347264';

var channel = client.Channels.get(CUSTOM_GAMES_CHANNEL);

client.connect({
  token: "MzIxMjkxMTA3MjU2MzY5MTUy.DBcD7A.PAETs7zZQsNDdGmHEmjp_kPaQMA"
});

client.Dispatcher.on("GATEWAY_READY", e => {
  console.log("Connected as: " + client.User.username);
});

/* creates role map from list of roles and passes it to function that will check specific roles */

function authenticateUser(currentRoles){
	const roleNames = currentRoles.roles.map(role => role.name);
	return isModOrAdmin(roleNames);
}

/* returns true if user is a moderator or admin, false otherwise */

function isModOrAdmin(roleNames){
	return roleNames.indexOf('Admin') != -1 || roleNames.indexOf('Moderators') != -1 || 
	roleNames.indexOf('Subreddit Mods') != -1 || roleNames.indexOf('Full Mods') != -1 
	|| roleNames.indexOf('Content Mods') != -1;
}

/* Grab the custom modes from a file and parse it line by line
   Choose 3 at random and post them to the custom-games channel */

function customGameModes(e){
	var filePath = "./custommodes.txt";		
	//read in array of custom game modes
	var rand;
	var textByLine;
	fs.exists(filePath, function(exists){
	if(exists){ 
		fs.readFile(filePath, {encoding: "utf8"}, function(err, data){
			if(err){
				console.log(err);
			}              
			console.log(data);
			var textByLine = data.split("\n")
			var arr = [];
			while(arr.length < 4){
				var randomnumber = Math.ceil(Math.random()*textByLine.length-1);
				if(arr.indexOf(randomnumber) > -1) continue;
				arr[arr.length] = randomnumber;
			}
			channel = client.Channels.get(CUSTOM_GAMES_CHANNEL);
			channel.sendMessage("<:LUL:292346710070525952> " + textByLine[arr[1]]+ "\n"+ "<:Wowee:298846015014961153> " + textByLine[arr[2]] + "\n" + "<:Kreygasm:294170282950787082> " +textByLine[arr[3]]).then(function (message) {
			  message.addReaction(":LUL:292346710070525952");
			  message.addReaction(":Wowee:298846015014961153");
			  message.addReaction(":Kreygasm:294170282950787082");
            }).catch(function() {
              console.log("sending message failed");
             });
		})
	}
	   });
			
}

/* poll for team sizes, currently polls for 1,2,4,6,8 */

function customTeamSize(e){
	channel = client.Channels.get(CUSTOM_GAMES_CHANNEL);
	channel.sendMessage("Vote for squad sizes below").then(function (message) {
		message.addReaction("\u0031\u20E3");
		message.addReaction("\u0032\u20E3");
		message.addReaction("\u0034\u20E3");
		message.addReaction("\u0036\u20E3");
		message.addReaction("\u0038\u20E3");
    }).catch(function() {
        console.log("sending message failed");
    });
}

/* polls for custom vehicles (uses custom YES and NO emotes) */

function customVehicles(e){
	channel = client.Channels.get(CUSTOM_GAMES_CHANNEL);
	channel.sendMessage("Should there be vehicles?").then(function (message) {
		message.addReaction(":YES:318081582579712000");
		message.addReaction(":NO:318081582344830979");
	}).catch(function() {
		console.log("sending message failed");
    });
}

/* alerts in the current channel that the user is not a moderator */

function alertNotAMod(e){
	e.message.channel.sendMessage("You are not a moderator.");
}
	

/* read messages and take the appropriate action*/

client.Dispatcher.on("MESSAGE_CREATE", e => {
	if (e.message.content == "!nextcustom"){		
	  //authenticate - only allows admins and mods to execute commands
		if(authenticateUser(e.message.member)){
			customGameModes(e);			
		}else{
			alertNotAMod(e);			
		}
	  }else if(e.message.content == "!teamsize"){
		if(authenticateUser(e.message.member)){
			customTeamSize(e);
	  	}else{
			alertNotAMod(e);
		}
	  }
	  else if(e.message.content == "!vehicles"){
		if(authenticateUser(e.message.member)){
			customVehicles(e);
	  	}else{
			alertNotAMod(e);
		}
	  }else if(e.message.content == "!fullcustom"){
		if(authenticateUser(e.message.member)){
			customGameModes(e);	
			customTeamSize(e);
			customVehicles(e);
	  	}else{
			alertNotAMod(e);
		}
	  }
	  
});