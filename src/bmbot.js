const Discord = require('discord.js');
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('../db/users.db', (err) => {
	if(err){
		console.error(err.message);
	}

	console.log('Connected to user database.');
});

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

var client_secret = require('../client_secret.json');

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
	var user = message.author;

	console.log("Registering " + user.username + ', '+ user.id);
	
	db.run(`DELETE FROM users WHERE user_id=?`,user.id, (err) => {
		if (err) {
			console.error(err.message);
		}
	});

	db.run(`INSERT INTO users(user_id,username,discriminator) VALUES(?,?,?)`, [user.id,user.username,user.discriminator], (err) => {
		if (err) {
			console.error(err.message);
		}
	});

	user.fetchProfile().then((profile) => {
		var connections = profile.connections;
		connections.forEach((value,key,map) => {
			var type = value.type;
			var name = value.name;
			var id = value.id;
			console.log("Found connection " + name + " on " + type);
			db.run(`INSERT INTO connections(type,name,id,user_id) VALUES(?,?,?,?)`,[type,name,id,user.id], (err) => {
				if(err){
					console.log(err.message);
				}
				console.log("Added to db")
			});
		});
	});
}

// log our bot in
bot.login(token);
