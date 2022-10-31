import Constants from "../Constants"

function setPlayers(state, players) {
  state.players = players
}

function setUsers(state, users) {
  state.users = users
}

function setTeams(state, teams) {
  state.teams = teams
}

function setMatches(state, matches) {
  state.matches = matches
}

function setNextMatchDay(state, nextMatchDay) {
  state.nextMatchDay = nextMatchDay
}

function setLiveData(state, liveData) {
  state.liveData = liveData
}

function addPlayer(state, player) {
  if (player.id) {
    const players = Object.assign({}, state.players)
    players[player.id] = player
    state.players = players
  }
}

function addUsersPlayer(state, payload) {
  if (payload.user && payload.players) {
    const users = Object.assign({}, state.users)
    const user = Object.assign({}, users[payload.user])

    user.players = payload.players

    users[payload.user] = user
    state.users = users
    if (payload.user.id * 1 === state.self) {
      state.players = payload.players
    }
  }
}

function addTransfersToUser(state, payload) {
  if (payload.user && payload.transfers) {
    const users = Object.assign({}, state.users)
    const user = Object.assign({}, users[payload.user])
    const originTransfers = user.transfers || {}
    const transfers = Object.assign(originTransfers, payload.transfers)

    const sortedKeys = Object.keys(transfers).sort((a, b) => (a > b ? -1 : 1))
    const lastTransfers = []
    for (let x = 0; x < 20; x++) {
      if (sortedKeys[x]) {
        lastTransfers.push(transfers[sortedKeys[x]])
      }
    }

    user.lastTransfers = lastTransfers
    user.transfers = transfers
    users[payload.user] = user
    state.users = users
  }
}

function addUser(state, user) {
  if (user.id) {
    const users = Object.assign({}, state.users)
    user.ts = Date.now()
    users[user.id] = user
    state.users = users
  }
}

function setBids(state, bids) {
  state.bids = bids
}

function setErrorMessage(state, errorMessage) {
  state.errorMessage = errorMessage
}

function setAuthData(state, authData) {
  state.authData = authData
}

function setLoading(state, loadingState) {
  state.loading = loadingState
}

function setFetchedGift(state, fetchedGift) {
  state.fetchedGift = fetchedGift
}

function setGiftLevel(state, giftLevel) {
  state.giftLevel = giftLevel
}

function setGiftBonus(state, giftBonus) {
  state.giftBonus = giftBonus
}

function setSelf(state, self) {
  state.self = self
}

function setSelfData(state, selfData) {
  state.selfData = selfData
}

function setLeagues(state, leagues) {
  state.leagues = leagues
}

function setLeague(state, league) {
  state.league = league
}

function resetLoading(state) {
  state.loading = false
  state.loadingMessages = []
}

function setLoadingMessages(state, messages) {
  state.loadingMessages = messages
}

function setRanking(state, ranking) {
  state.ranking = ranking
}

function addLoadingMessage(state, message) {
  state.loadingMessages.push({
    message
  })
}

function addErrorLoadingMessage(state, message) {
  state.loadingMessages.push({
    message,
    error: true
  })
}

function setOfferThreshold(state, offerThreshold) {
  localStorage.setItem(Constants.LOCALSTORAGE.OFFER_THRESHOLD, offerThreshold)
  state.offerThreshold = offerThreshold
}

function setOfferShowTooLowOffersOnly(state, offerShowTooLowOffersOnly) {
  localStorage.setItem(Constants.LOCALSTORAGE.OFFER_SHOW_TOO_LOW_OFFERS_ONLY, offerShowTooLowOffersOnly)
  state.offerShowTooLowOffersOnly = offerShowTooLowOffersOnly
}

function setGeneralPlayerCardShowAlwaysAllDetails(state, generalPlayerCardShowAlwaysAllDetails) {
  localStorage.setItem(Constants.LOCALSTORAGE.GENERAL_PLAYER_CARD_SHOW_ALWAYS_ALL_DETAILS, generalPlayerCardShowAlwaysAllDetails)
  state.generalPlayerCardShowAlwaysAllDetails = generalPlayerCardShowAlwaysAllDetails
}

function setOfferOpenPlayerNotOnMarketPanel(state, offerOpenPlayerNotOnMarketPanel) {
  localStorage.setItem(Constants.LOCALSTORAGE.OFFER_PANEL_PLAYER_NOT_ON_MARKET, offerOpenPlayerNotOnMarketPanel)
  state.offerOpenPlayerNotOnMarketPanel = offerOpenPlayerNotOnMarketPanel
}

function setOfferOpenPlayerWithoutAnyOfferPanel(state, offerOpenPlayerWithoutAnyOfferPanel) {
  localStorage.setItem(Constants.LOCALSTORAGE.OFFER_PANEL_PLAYER_WITHOUT_ANY_OFFER, offerOpenPlayerWithoutAnyOfferPanel)
  state.offerOpenPlayerWithoutAnyOfferPanel = offerOpenPlayerWithoutAnyOfferPanel
}

function setTransfermarketExpiryDateFadeEffect(state, transfermarketExpiryDateFadeEffect) {
  localStorage.setItem(Constants.LOCALSTORAGE.TRANSFER_MARKET_EXPIRY_DATE_FADE_EFFECT, transfermarketExpiryDateFadeEffect)
  state.transfermarketExpiryDateFadeEffect = transfermarketExpiryDateFadeEffect
}

function setTransfermarketExpiryDisplayType(state, transfermarketExpiryDisplayType) {
  localStorage.setItem(Constants.LOCALSTORAGE.TRANSFER_MARKET_EXPIRY_DISPLAY_TYPE, transfermarketExpiryDisplayType)
  state.transfermarketExpiryDisplayType = transfermarketExpiryDisplayType
}

function setOfferOrder(state, payload) {
  if (payload.isTemporary === true) {
    state.offerOrder.temporary = payload.order
  } else {
    state.offerOrder.init = payload.order
    localStorage.setItem(Constants.LOCALSTORAGE.OFFER_ORDER, payload.order)
  }
}

function setMarketValueComparison(state, marketValueComparisonPlayer) {
  state.marketValueComparisonPlayer = marketValueComparisonPlayer
}

function setInitialized(state, initialized) {
  state.initialized = initialized
}

function setNextThreeMatchDays(state, nextThreeMatchDays) {
  state.nextThreeMatchDays = nextThreeMatchDays
}

export default {
  setInitialized,
  addPlayer,
  addUsersPlayer,
  addTransfersToUser,
  addUser,
  setSelf,
  setTeams,
  setMatches,
  setNextMatchDay,
  setSelfData,
  setLeague,
  setPlayers,
  setUsers,
  setNextThreeMatchDays,
  setBids,
  setErrorMessage,
  setLoadingMessages,
  setAuthData,
  setLoading,
  setRanking,
  resetLoading,
  addLoadingMessage,
  addErrorLoadingMessage,
  setFetchedGift,
  setGiftLevel,
  setGiftBonus,
  setLiveData,
  setLeagues,
  setOfferThreshold,
  setOfferShowTooLowOffersOnly,
  setOfferOpenPlayerNotOnMarketPanel,
  setOfferOpenPlayerWithoutAnyOfferPanel,
  setGeneralPlayerCardShowAlwaysAllDetails,
  setTransfermarketExpiryDateFadeEffect,
  setTransfermarketExpiryDisplayType,
  setOfferOrder,
  setMarketValueComparison,
}