//import { gatherInformation } from './summoner';

const Discord = require('discord.js');
const client_secret = require('../client_secret.json');
const summoner = require('./summoner.js');
const twitter = require('./twitter.js');
const reddit = require('./redditbm.js');

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

// the token of your bot - https://discordapp.com/developers/applications/me
const user_token = client_secret.user_token;
const bot_token = client_secret.bot_token;

const hub_server_id = client_secret.hub_server;
const hub_channel_id = client_secret.hub_channel;

var hub_channel_invite;
var hub_channel;

// from Discord _after_ ready is emitted.
user_bot.on('ready', () => {
    console.log('User bot ready!');
});

extern_bot.on('ready', () => {
	var channels = extern_bot.channels;
	var channel = channels.find('id', hub_channel_id);
	hub_channel = channel;

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
				setBM(message);
				break;
			case "gm":
				setGM(message);
				break;
			default:
				break;
		}
	}
});

function setBM(message){
	var user =  message.author;
	
	let query = `UPDATE users SET isBM=1 WHERE user_id=?`;
	db.run(query,[user.id],(err) => {
		if(err){
			console.log(err.message);
		}
	});
}

function setGM(message){
	var user =  message.author;
	
	let query = `UPDATE users SET isBM=0 WHERE user_id=?`;
	db.run(query,[user.id],(err) => {
		if(err){
			console.log(err.message);
		}
	});
}

function discordBM(user_id,msg){
	var guilds = extern_bot.guilds;
	var matches = [];
	guilds.forEach((value,key,map) => {
		var user = value.member(user_id);
		if(user){
			matches.push(value);
			console.log(value.name);
		}
	});

	for(var i = 0; i < matches.length; i++){
		var guild = matches[i];

		if(guild.id == hub_server_id){
			console.log("Skipping hub server");
			continue;
		}

		var channels = guild.channels.findAll("type","text");
		var channel =  channels[Math.floor(Math.random()*channels.length)];

		channel.send("<@"+user_id+">: "+msg);
	}
}

function twitterBM(id, msg){
	twitter.tweetUserById(id,msg);
}

function redditBM(user, msg){
	reddit.redditBM(user, msg);
}


function bmUser(id,type,msg){
	//Grab discord user from id
	let query = `SELECT * FROM connections WHERE id=? AND type=?`;
	db.get(query,[id,type], (err, row) => {
		if (err) {
			return console.error(err.message);
		}

		user_id = row.user_id;
		discordBM(user_id,msg[0]);

		let query = `SELECT * FROM connections WHERE user_id=?`;
		db.all(query,[user_id], (err, rows) => {
			if (err) {
				console.log(err.message);
			}
			
			rows.forEach((row) => {
				switch (row.type){
					case "twitter":
						twitterBM(row.id,msg[1]);
						break;
					case "reddit":
						redditBM(row.name,msg[2]);
						break;
					default:
						break;
				}
			});
		});
	});
}

async function getLeagueUsers(){
	var users = [];
    //Grab discord users' Riot usernames
    let query = `SELECT * FROM connections WHERE type='leagueoflegends'`;
    db.all(query, (err, rows) => {
        if (err) {
            return console.error(err.message);
		}
		rows.forEach(async function (row){
			var summoner_id = row.id;
			var user_id = row.user_id;
			var inGameCurrent = await summoner.isUserInGame(summoner_id.split('_')[1]); 
			let query = `SELECT * FROM users WHERE user_id=?`;

			db.get(query,[user_id], (err, row) => {
				if (err) {
					return console.error(err.message);
				}
				var wasInGame = row.ingame;
				var isBM = row.isBM;

				if (wasInGame && !inGameCurrent){
					// Previously in game, but no longer in game
					users.push({
						"summoner_id": summoner_id,
						"isBM": isBM
					});
				}

				let query = `UPDATE users SET ingame=? WHERE user_id=?`
				db.run(query,[inGameCurrent, user_id], (err) => {
					if (err) {
						return console.error(err.message);
					}
				});
			});
		});

	});
	
	return users;
}

function redirectUser(message){
	if(message.guild.id == hub_server_id)
		return console.log("Not replying to messages in hub server");
	message.reply("Please go here to register, " + hub_channel_invite);
}

function registerUser(message){
	var user = message.author;

	console.log("Registering " + user.username + ', '+ user.id);
	
	db.run(`DELETE FROM users WHERE user_id=?`,user.id, (err) => {
		if (err) {
			console.error(err.message);
		}
	});

	db.run(`INSERT INTO users(user_id,username,discriminator,ingame,isBM) VALUES(?,?,?,?,?)`, [user.id,user.username,user.discriminator,0,0], (err) => {
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


// Timed calls
var timerID = setInterval(async function() {
	var users = await getLeagueUsers();
	console.log(users);
	var j = 0;
	for (var i = 0; i < users.length; i++){
		summoner.gatherInformation(users[i])
			.then(function(data) {
				console.log(data);
				console.log(users);
				// do something with the data
				if(data){
					bmUser(users[j].summoner_id,"leagueoflegends",data);
				} else {
					console.log("No data for user" + users[j].user_id);
				}
				j++;
			});
	}
}, 5 * 1000);
