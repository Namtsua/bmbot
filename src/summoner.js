const { Kayn, REGIONS } = require('kayn')
var accountID = "";
var client_secret = require('../client_secret.json');
const kayn = Kayn(client_secret.riot_key)({
    region: REGIONS.NORTH_AMERICA,
    debugOptions: {
        isEnabled: true,
        showKey: false,
        loggers: {}, // No need to pass anything here. Read the #Configuration#DebugOptions section.
    },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: false,
    },
    cacheOptions: {
        cache: null,
        ttls: {},
    },
})


function getSummonerID(accountName) {
    kayn.Summoner.by.name(accountName)
        .callback(function(err, summonerInfo) {
            console.log(summonerInfo);
            accountID = summonerInfo.accountId;
        });
}

function getMatchHistory(accountId) {
    kayn.Matchlist.by.accountID(accountId)
        .region(REGIONS.NORTH_AMERICA)
        .query({
            season: 9
        })
        .callback(function(err, matchHistory) {
            console.log(matchHistory);
        })
}


kayn.Matchlist.by.accountID(3440481)
    .region(REGIONS.NORTH_AMERICA)
    .query({
        champion: 67,
        season: 9,
    })
    .callback(function(err, matchlist) {
        console.log(matchlist.matches)
    })