
const { Kayn, REGIONS } = require('kayn')
var accountID = "";
const client_secret = require('../client_secret.json');
const messages = require('./messages.json');
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


async function getSummonerIfo(summonerId) {
    return kayn.Summoner.by.id(summonerId);
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

async function isUserInGame(summonerId){
	try{
        var currentGame  = await getUserGameStatus(summonerId);
    }catch(error) {
        console.log("404 - No Current Match Found");
        return false;
    }
	return true;
}

async function parseGameStats(gameStats, accountId){
    var desiredUser = {};
    for (var i = 0; i < gameStats.participantIdentities.length; i++){
        if (gameStats.participantIdentities[i].player.accountId == accountId) {
            desiredUser.desiredUserId = gameStats.participantIdentities[i].participantId
            desiredUser.desiredUserIndex = i;
            break;
        }
    }
    var minKDA = 100;
    var minGold = 10000;
    var minCS = 1000;

    if (desiredUser.desiredUserId < 4){
        for (var i = 0; i < 4; i++){
            var tmpStatsLocation = gameStats.participants[i].stats;
            minGold = Math.min(minGold, tmpStatsLocation.goldEarned);
            minKDA = Math.min(minKDA,(tmpStatsLocation.kills + tmpStatsLocation.assists) / tmpStatsLocation.deaths);
            minCS = Math.min(minCS, tmpStatsLocation.totalMinionsKilled);
        }
    }
    else {
        for (var i = 4; i < 8; i++){
            var tmpStatsLocation = gameStats.participants[i].stats;
            minGold = Math.min(minGold, tmpStatsLocation.goldEarned);
            minKDA = Math.min(minKDA,(tmpStatsLocation.kills + tmpStatsLocation.assists) / tmpStatsLocation.deaths);
            minCS = Math.min(minCS, tmpStatsLocation.totalMinionsKilled);
        }
    }

    var statsLocation = gameStats.participants[desiredUser.desiredUserIndex].stats
    desiredUser.win = statsLocation.win;
    desiredUser.kills = statsLocation.kills;
    desiredUser.assists = statsLocation.assists;
    desiredUser.deaths = statsLocation.deaths;
    desiredUser.wardsKilled = statsLocation.wardsKilled;
    desiredUser.visionScore = statsLocation.visionScore;
    desiredUser.goldEarned = statsLocation.goldEarned;
    desiredUser.goldSpent = statsLocation.goldSpent;
    desiredUser.largestKillingSpree = statsLocation.largestKillingSpree;
    desiredUser.largestCriticalStrike = desiredUser.largestCriticalStrike;
    desiredUser.kda = (desiredUser.kills + desiredUser.assists) / desiredUser.deaths;
    desiredUser.worstKDA = statsLocation.wardsKilled <= minKDA;
    desiredUser.leastGold = desiredUser.goldEarned <= minGold;
    desiredUser.worstCS = statsLocation.totalMinionsKilled <= minCS;
    return desiredUser;
    
}

async function decideBM(userInfo,bm){
    var potentialReasons = [userInfo.win, userInfo.worstKDA, userInfo.leastGold, userInfo.worstCS];
    if (potentialReasons[0] == potentialReasons[1] == potentialReasons[2] == potentialReasons[3] == false) return ["Good job!", "Keep it up!", "Way to go champ!"];
    randomReason = Math.floor(Math.random() * Math.floor(4));
    while (!potentialReasons[randomReason]){
        randomReason++;
        randomReason %= potentialReasons.length;
    }

    var BMs;
	if(bm){
		switch(randomReason){
			case 0 : 
				BMs = pickMessages(messages.loss_bm);
				break;
			case 1 :
				BMs = pickMessages(messages.kda_bm);
				break;
			case 2 :
				BMs = pickMessages(messages.gold_bm);
				break;
			case 3 : 
				BMs = pickMessages(messages.cs_bm);
				break;
			default : break;
		}
	} else {
		switch(randomReason){
			case 0 : 
				BMs = pickMessages(messages.loss_gm);
				break;
			case 1 :
				BMs = pickMessages(messages.kda_gm);
				break;
			case 2 :
				BMs = pickMessages(messages.gold_gm);
				break;
			case 3 : 
				BMs = pickMessages(messages.cs_gm);
				break;
			default : break;
		}
	}

    return BMs;
}

async function pickMessages(chosenMessages){
    var randomIndex = Math.floor(Math.random() * Math.floor(chosenMessages.length));
    var finalMessages = [chosenMessages[randomIndex % chosenMessages.length], 
                        chosenMessages[(randomIndex + 1) % chosenMessages.length], 
                        chosenMessages[(randomIndex + 2) % chosenMessages.length]];
    
    return finalMessages;
}



async function gatherInformation(userData) {
	var summonerId = userData.summoner_id.split('_')[1];
	var isBM = userData.isBM;
    const summonerInfo = await getSummonerIfo(summonerId);
    const matchList = await getMatchHistory(summonerInfo.accountId);
    const mostRecentMatch = matchList.matches[0];
    const matchInfo = await getMatchStats(mostRecentMatch.gameId);
    const userInfo = await parseGameStats(matchInfo, summonerInfo.accountId);
    const bmMessage = await decideBM(userInfo,isBM);
    return bmMessage;
}

module.exports.gatherInformation = gatherInformation;
module.exports.isUserInGame = isUserInGame
