function getAuthData(state) {
  return state.authData
}

function getErrorMessage(state) {
  return state.errorMessage
}

function getBids(state) {
  return state.bids
}

function getPlayers(state) {
  return state.players
}

function getLiveData(state) {
  return state.liveData
}

function getUsers(state) {
  return state.users
}

function getTeams(state) {
  return state.teams
}

function getBearerToken(state) {
  return state.bearerToken
}

function getSelf(state) {
  return state.self
}

function getSelfData(state) {
  return state.selfData
}

function getLeague(state) {
  return state.league
}

function getSelectedLeague(state) {
  let league = null
  if (state.leagues && state.leagues.length && state.league) {
    const sLeague = state.leagues.filter((l) => l.id === state.league)
    if (sLeague.length === 1) {
      league = sLeague[0]
    }
  }
  return league
}

function getRanking(state) {
  return state.ranking
}

function getSelfPlayerDetails(state) {
  return (state.self && state.users[state.self]) ?
    state.users[state.self] :
    null
}

function getPlayersOfMe(state) {
  return (state.self && state.users[state.self] && state.users[state.self].players) ?
      state.users[state.self].players :
      []
}

function getLoading(state) {
  return state.loading
}

function getLoadingMessages(state) {
  return state.loadingMessages
}

function getFetchedGift(state) {
  return state.fetchedGift
}

function getGiftBonus(state) {
  return state.giftBonus
}

function getGiftLevel(state) {
  return state.giftLevel
}

function getLeagues(state) {
  return state.leagues
}

function getSelfPlayersStatsFetched(state) {
  return state.selfPlayersStatsFetched
}

function getPlayersStatsFetched(state) {
  return state.playersStatsFetched
}

export default {
  getAuthData,
  getErrorMessage,
  getBids,
  getPlayers,
  getUsers,
  getTeams,
  getBearerToken,
  getSelf,
  getSelfData,
  getLeague,
  getLeagues,
  getSelectedLeague,
  getSelfPlayerDetails,
  getPlayersOfMe,
  getRanking,
  getLoading,
  getLoadingMessages,
  getFetchedGift,
  getGiftBonus,
  getLiveData,
  getGiftLevel,
  getSelfPlayersStatsFetched,
  getPlayersStatsFetched,
}