import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import mutations from './mutations'
import actions from './actions'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    fetchedGift: null,
    giftBonus: 0,
    giftLevel: 0,
    errorMessage: null,
    authData: {},
    teams: [],
    bids: [],
    players: {},
    users: {},
    liveData: {},
    loading: false,
    loadingMessages: [],
    leagues: [],
    league: null,
    self: null,
    selfData: null,
    selfPlayersStatsFetched: null,
    playersStatsFetched: {},
    bearerToken: '',
    ranking: null,
    defaults: {
      offerThreshold: .6,
      offerOrder: 'newest',
      offerOpenPlayerNotOnMarketPanel: true,
      offerOpenPlayerWithoutAnyOfferPanel: false,
      offerShowTooLowOffersOnly: false,
      offerOrders: {
        oldest: 'oldest first',
        newest: 'newest first'
      },
    },
    offerThreshold: null,
    offerShowTooLowOffersOnly: false,
    offerOpenPlayerNotOnMarketPanel: false,
    offerOpenPlayerWithoutAnyOfferPanel: false,
    offerOrder: {
      init: null,
      temporary: null,
    },
  },
  getters,
  mutations,
  actions,
})

export default store