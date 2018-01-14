var client_secret = require('../client_secret.json');

var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: client_secret.consumer_key_api,
    consumer_secret: client_secret.consumer_secret_api,
    access_token_key: client_secret.access_token_key_api,
    access_token_secret: client_secret.access_token_secret_api
});

var stream = client.stream('user');

stream.on('follow', follow_back);
stream.on('unfollow', unfollow);

function tweet(screen_name, the_tweet){
    client.post('statuses/update', {status: "@" + screen_name + " " + the_tweet}, function(error, tweet, response) {
        if (!error) {
          console.log(tweet);
        }
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

// tweet("TryHardChimp", "should stop playing with his fidget spinner and get to work.")

// unfollow("TryHardChimp");

//direct_message("TryHardChimp", "Sup ya weeb.");

//follow("TryHardChimp");

//direct_message("Namtsua", "Git gud you shit.");

//tweet("@TryHardChimp", "should work out.");

// tweet("My creator doesn't know how to use me yet.");

/*
console.log(client_secret.consumer_key_api);
console.log(client_secret.consumer_secret_api);
console.log(client_secret.access_token_key_api);
console.log(client_secret.access_token_secret_api);
*/