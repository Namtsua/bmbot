var snoowrap = require('snoowrap');
var config = require('./config');

//connect to api
//message baddie "ur bad lol"
//end

//new config ver
function redditBM(baddie){
    const r = new snoowrap({
        userAgent: config.reddit.userAgent,
        clientId: config.reddit.clientId,
        clientSecret: config.reddit.clientSecret,
        username: config.reddit.username,
        password: config.reddit.password
      });

    r.composeMessage({
        to: baddie,
        subject: "saw u die lmao",
        text: 'Ur bad at video games kek'
    });
}


//redditBM("madi-mon");