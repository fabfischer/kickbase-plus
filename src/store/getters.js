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

function getSelectedPlayers(state) {
  return state.selectedPlayers
}

function getSelectedPlayersMarketValueSum(state) {
  return state.selectedPlayersMarketValueSum
}

function getUsers(state) {
  return state.users
}

function getTeams(state) {
  return state.teams
}

function getMarketValueComparisonPlayer(state) {
  return state.marketValueComparisonPlayer
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

function getMatches(state) {
  return state.matches
}

function getNextMatchDay(state) {
  return state.nextMatchDay
}

function getUsersDetails(state) {
  return (state.self && state.users[state.self]) ?
    state.users[state.self] :
    null
}

function getPlayersOfUser(state) {
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

function getOfferOpenPlayerNotOnMarketPanel(state) {
  return state.offerOpenPlayerNotOnMarketPanel
}

function getGeneralPlayerCardShowAlwaysAllDetails(state) {
  return state.generalPlayerCardShowAlwaysAllDetails
}

function getOfferOpenPlayerWithoutAnyOfferPanel(state) {
  return state.offerOpenPlayerWithoutAnyOfferPanel
}

function getOfferThreshold(state) {
  return state.offerThreshold
}

function getOfferOrder(state) {
  return state.offerOrder
}

function getOfferShowTooLowOffersOnly(state) {
  return state.offerShowTooLowOffersOnly
}

function getTransfermarketExpiryDateFadeEffect(state) {
  return state.transfermarketExpiryDateFadeEffect
}

function getTransfermarketExpiryDisplayType(state) {
  return state.transfermarketExpiryDisplayType
}

function getOfferOrderLabel(state) {
  return state.defaults.offerOrders[state.offerOrder.init] ?? 'n/a'
}

function getDefaults(state) {
  return state.defaults
}

function getInitialized(state) {
  return state.initialized
}

function getNextThreeMatchDays(state) {
  return state.nextThreeMatchDays
}

export default {
  getInitialized,
  getAuthData,
  getErrorMessage,
  getBids,
  getPlayers,
  getSelectedPlayers,
	getSelectedPlayersMarketValueSum,
  getUsers,
  getBearerToken,
  getSelf,
  getSelfData,
  getTeams,
  getMatches,
  getNextMatchDay,
  getLeague,
  getLeagues,
  getSelectedLeague,
  getUsersDetails,
  getPlayersOfUser,
  getRanking,
  getLoading,
  getLoadingMessages,
  getFetchedGift,
  getGiftBonus,
  getLiveData,
  getGiftLevel,
  getOfferOpenPlayerNotOnMarketPanel,
  getOfferOpenPlayerWithoutAnyOfferPanel,
  getGeneralPlayerCardShowAlwaysAllDetails,
  getTransfermarketExpiryDateFadeEffect,
  getTransfermarketExpiryDisplayType,
  getOfferThreshold,
  getOfferShowTooLowOffersOnly,
  getOfferOrder,
  getOfferOrderLabel,
  getDefaults,
  getMarketValueComparisonPlayer,
  getNextThreeMatchDays,
}