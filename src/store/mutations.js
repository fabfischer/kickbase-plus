function setPlayers(state, players) {
  state.players = players
}

function setUsers(state, users) {
  state.users = users

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

export default {
  addPlayer,
  addUsersPlayer,
  addTransfersToUser,
  addUser,
  setSelf,
  setSelfData,
  setLeague,
  setPlayers,
  setUsers,
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
}