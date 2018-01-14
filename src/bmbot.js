const Discord = require('discord.js');

const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('../db/users.db', (err) => {
	if(err){
		console.error(err.message);
	}

	db.run("PRAGMA foreign_keys = ON",[], (err) => {
		if (err) {
			console.error(err.message);
		}
	});

	console.log('Connected to user database.');
});

// User bot stays local to bmbot server
const user_bot = new Discord.Client();
// External bot blasts BMs and redirects users to bmbot server
const extern_bot = new Discord.Client();

var client_secret = require('../client_secret.json');

// the token of your bot - https://discordapp.com/developers/applications/me
const user_token = client_secret.user_token;
const bot_token = client_secret.bot_token;

const hub_server_id = client_secret.hub_server;
const hub_channel_id = client_secret.hub_channel;

var hub_channel_invite;

// from Discord _after_ ready is emitted.
user_bot.on('ready', () => {
    console.log('User bot ready!');
});

extern_bot.on('ready', () => {
	var channels = extern_bot.channels;
	var channel = channels.find('id', hub_channel_id);

	channel.createInvite({
		maxAge: 0,
	}).then((inv) => { 
		hub_channel_invite = inv.url;
	});

	console.log('External bot ready!');
});

user_bot.on('message', message => {
	if(message.content.startsWith("$")){
		console.log("USER:Handling command");
		var command = message.content.substr(1);
		var args = command.split(" ");

		switch(args[0].toLowerCase()){
			case "register":
				registerUser(message);
				break;
			case "unregister":
				unregisterUser(message);
				break;
			case "help":
				showHelp(message);
				break;
			default:
				break;
		}
	}
});

extern_bot.on('message', message => {
	if(message.content.startsWith("$")){
		console.log("BOT:Handling command");
		var command = message.content.substr(1);
		var args = command.split(" ");

		switch(args[0].toLowerCase()){
			case "register":
				redirectUser(message);
				break;
			case "unregister":
				unregisterUser(message);
				break;
			case "help":
				showHelp(message);
				break;
			case "bm":
				bmUser("go34n","reddit","lmao");
				break;
			default:
				break;
		}
	}
});

function discordBM(user_id,msg){

}


function bmUser(id,type,msg){
	//Grab discord user from id
	let query = `SELECT user_id user_id FROM connections WHERE id=? AND type=?`;
	db.get(query,[id,type], (err, row) => {
		if (err) {
			return console.error(err.message);
		}

		console.log("BM'ing " + row.user_id);

	});

}


function redirectUser(message){
	message.reply("please go here to register, " + hub_channel_invite);
}

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
	message.reply("Registered!");

}

function showHelp(message){
	message.reply("help message here !!!");
}

function unregisterUser(message){
	var user = message.author;
	db.run(`DELETE FROM users WHERE user_id=?`,user.id, (err) => {
		if (err) {
			console.error(err.message);
		}
	});
	message.reply("Unregistered!");
}
  
// log our bot in
user_bot.login(user_token);
extern_bot.login(bot_token);
