var config = {};

config.reddit = {};
config.discord = {};

config.reddit.userAgent = '';
config.reddit.clientId = '';
config.reddit.clientSecret = '';
config.reddit.username = '';
config.reddit.password = '';

config.discord.help =
"help message here !!!";

/*
EXAMPLE TEXT


config.twitter = {};
config.redis = {};
config.web = {};

config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
config.twitter.user_name = process.env.TWITTER_USER || 'username';
config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';
config.redis.uri = process.env.DUOSTACK_DB_REDIS;
config.redis.host = 'hostname';
config.redis.port = 6379;
config.web.port = process.env.WEB_PORT || 9980;*/

module.exports = config;
