const Discord = require('discord.js');

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

var client_secret = require('../client_secret.json');
// weeewww
var usersArray = [];

// the token of your bot - https://discordapp.com/developers/applications/me
const token = client_secret.discord_token;

// from Discord _after_ ready is emitted.
bot.on('ready', () => {
    console.log('I am ready!');
});

bot.on('message', message => {
	// Idk if this is a good way of doing it but yolo
	if(message.content.startsWith("$")){
		console.log("Handling command");
		var command = message.content.substr(1);
		var args = command.split(" ");
		console.log(command);

		switch(args[0].toLowerCase()){
			case "register":
				registerUser(message);
				break;
			default:
				break;
		}
	}
});

function registerUser(message){
	function updateArray(userid,connectionsArray){
		console.log(connectionsArray);
		// Check to see if user already exists
		var index = usersArray.findIndex((element) => {
			return element.id == userid;
		});

		if(index != -1){
			//user exists, modify it
			console.log("User exists, modifying");
			usersArray[index].connections = connectionsArray;
		} else {
			console.log("Adding new user");
			var newUser = new Object();
			newUser.id = userid;
			newUser.connections = connectionsArray;
			usersArray.push(newUser);
		}

		console.log(usersArray);
	}
	var user = message.author;

	console.log("Registering " + user.username + ', '+ user.id);


	user.fetchProfile().then((profile) => {
		var connections = profile.connections;
		var connectionsArray = [];
		connections.forEach((value,key,map) => {
			var type = value.type;
			var name = value.name;
			console.log("Found connection " + name + " on " + type);
			var acc = new Object();
			acc.name = name;
			acc.type = type;
			connectionsArray.push(acc);
		});
		updateArray(user.id,connectionsArray);
	});


}



// log our bot in
bot.login(token);
