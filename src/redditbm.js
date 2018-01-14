const snoowrap = require('snoowrap');
const client_secret = require('../client_secret.json');

const client = new snoowrap({
	userAgent: client_secret.reddit_userAgent,
	clientId: client_secret.reddit_clientId,
	clientSecret: client_secret.reddit_clientSecret,
	username: client_secret.reddit_username,
	password: client_secret.reddit_password
});

function redditBM(name, msg){
    client.composeMessage({
        to: name,
        subject: "Re: your latest game",
        text: msg
    });
}


module.exports.redditBM = redditBM;
