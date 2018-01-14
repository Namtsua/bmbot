const client_secret = require('../client_secret.json');

const Twitter = require('twitter');

var consumer_key = client_secret.consumer_key_api;
var consumer_secret = client_secret.consumer_secret_api;
var access_token_key = client_secret.access_token_key_api;
var access_token_secret = client_secret.access_token_secret_api;

const client = new Twitter({
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    access_token_key: access_token_key,
    access_token_secret: access_token_secret
});

//var stream = client.stream('user');

//stream.on('follow', follow_back);
//stream.on('unfollow', unfollow);

function tweetUserById(id, the_tweet){
	client.get('users/lookup', {user_id: id}, function(error, users, response){
		if(error){
			console.log(error.message);
		}
		screen_name = users[0].screen_name;
		client.post('statuses/update', {status: "@" + screen_name + " " + the_tweet}, function(error, tweet, response) {
			if(error){
				console.log(error.message);
			}
		});
	});
}

function direct_message(screen_name_input, message_input){
    client.post('direct_messages/new', {screen_name: screen_name_input, text: message_input}, function(error, message, response){
        if(!error){
            console.log(message);
        }
    });
}

function follow(screen_name){
    client.post('friendships/create', {screen_name}, function(error, message, response){
        if(!error){
            console.log(message);
        }
    });
}

function follow_back(eventMessage){
    var name = eventMessage.source.name;
    var screen_name = eventMessage.source.screen_name;

    follow(screen_name);
}

function unfollow(screen_name) {

    client.post('friendships/destroy', {screen_name}, function(error, message, response){
        if(!error){
            console.log(message);
        }
    });
}

module.exports.tweetUserById = tweetUserById;
