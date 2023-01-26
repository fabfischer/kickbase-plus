import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import mutations from './mutations'
import actions from './actions'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    initialized: false,
    fetchedGift: null,
    giftBonus: 0,
    giftLevel: 0,
    errorMessage: null,
    authData: {},
    teams: [],
    bids: [],
    players: {},
    selectedPlayers: {},
    selectedPlayersMarketValueSum: 0,
    users: {},
    liveData: {},
    matches: [],
    nextThreeMatchDays: [],
    nextMatchDay: null,
    loading: false,
    loadingMessages: [],
    leagues: [],
    league: null,
    self: null,
    selfData: null,
    bearerToken: '',
    ranking: null,
    marketValueComparisonPlayer: null,
    defaults: {
      offerThreshold: .6,
      offerOrder: 'newest',
      generalPlayerCardShowAlwaysAllDetails: false,
      offerOpenPlayerNotOnMarketPanel: true,
      offerOpenPlayerWithoutAnyOfferPanel: false,
      offerShowTooLowOffersOnly: false,
      transfermarketExpiryDateFadeEffect: true,
      transfermarketExpiryDisplayType: 'relative',
      offerOrders: {
        oldest: 'oldest first',
        newest: 'newest first'
      },
    },
    offerThreshold: null,
    generalPlayerCardShowAlwaysAllDetails: false,
    offerShowTooLowOffersOnly: false,
    offerOpenPlayerNotOnMarketPanel: false,
    offerOpenPlayerWithoutAnyOfferPanel: false,
    transfermarketExpiryDateFadeEffect: false,
    transfermarketExpiryDisplayType: null,
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