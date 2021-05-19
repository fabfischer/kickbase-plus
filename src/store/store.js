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
    bearerToken: '',
    ranking: null,
    // todo: deprecated?
    startDate: '2019-08-02T12:00:00Z',
  },
  getters,
  mutations,
  actions,
})

export default store