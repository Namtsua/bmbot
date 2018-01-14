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


 async function getSummonerID(accountName) {
    return kayn.Summoner.by.name(accountName)
}

async function getMatchHistory(accountId) {
    return kayn.Matchlist.by.accountID(accountId)
        .region(REGIONS.NORTH_AMERICA)
        .query({
            season: 9
        })
}

async function getMatchStats(matchId) {
    return kayn.Match.get(matchId);
}


async function getUserGameStatus(summonerId){
    return kayn.CurrentGame.by.summonerID(summonerId);
}

async function parseGameStats(gameStats, accountId){
    
    console.log(accountId + " AND " + gameStats)
    console.log(JSON.stringify(gameStats.participantIdentities));
    var desiredUser = {};
    for (var i = 0; i < gameStats.participantIdentities.length; i++){
        if (gameStats.participantIdentities[i].player.accountId == accountId) {
            desiredUser.desiredUserId = gameStats.participantIdentities[i].participantId
            desiredUser.desiredUserIndex = i;
            break;
        }
    }
    var statsLocation = gameStats.participants[desiredUser.desiredUserIndex].stats
    desiredUser.win = statsLocation.win;
    desiredUser.kills = statsLocation.kills;
    desiredUser.assists = statsLocation.assist;
    desiredUser.deaths = statsLocation.deaths;
    desiredUser.wardsKilled = statsLocation.wardsKilled;
    desiredUser.visionScore = statsLocation.visionScore;
    desiredUser.goldEarned = statsLocation.goldEarned;
    desiredUser.goldSpent = statsLocation.goldSpent;
    desiredUser.largestKillingSpree = statsLocation.largestKillingSpree;
    desiredUser.largestCriticalStrike = desiredUser.largestCriticalStrike;

    // Special condition for support/carry
    return desiredUser;
    
}



async function gatherInformation() {
    
    const summonerInfo = await getSummonerID("Namtsua")
    const matchList = await getMatchHistory(summonerInfo.accountId)
    const mostRecentMatch = matchList.matches[0];
    const matchInfo = await getMatchStats(mostRecentMatch.gameId)
    const userInfo = await parseGameStats(matchInfo, summonerInfo.accountId);
    //const message = await analyze(userInfo);
    try{
            const asdf  = await getUserGameStatus(ctz.id)

    }catch(error) {
        console.log("qqqqqqq");
    }
    return userInfo;
}

module.exports.gatherInformation = gatherInformation;