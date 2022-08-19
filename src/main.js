import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import numeral from 'numeral'
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import VueNumberInput from '@chenfengyuan/vue-number-input';

import router from './router/router'
import store from './store/store'
import Constants from "./Constants";

require('./scss/styles.scss')

Vue.config.productionTip = false

numeral.register('locale', 'deff', {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal: function () {
        return '.';
    },
    currency: {
        symbol: '€'
    }
})

Vue.use(vueNumeralFilterInstaller, {locale: 'deff'});
Vue.use(VueNumberInput);

let offerThreshold = localStorage.getItem(Constants.LOCALSTORAGE.OFFER_THRESHOLD) * 1
if (!offerThreshold) {
    offerThreshold = store.getters.getDefaults.offerThreshold
}
store.commit('setOfferThreshold', offerThreshold)

let offerOrder = localStorage.getItem(Constants.LOCALSTORAGE.OFFER_ORDER)
if (!offerOrder) {
    offerOrder = store.getters.getDefaults.offerOrder
}
store.commit('setOfferOrder', {order: offerOrder, isTemporary: false})

let offerPanelPlayerNotOnMarket = localStorage.getItem(Constants.LOCALSTORAGE.OFFER_PANEL_PLAYER_NOT_ON_MARKET)
if (typeof offerPanelPlayerNotOnMarket === "undefined" || offerPanelPlayerNotOnMarket === null) {
    offerPanelPlayerNotOnMarket = store.getters.getDefaults.offerOpenPlayerNotOnMarketPanel
} else {
    offerPanelPlayerNotOnMarket = (offerPanelPlayerNotOnMarket === "true")
}
store.commit('setOfferOpenPlayerNotOnMarketPanel', offerPanelPlayerNotOnMarket)

let offerOpenPlayerWithoutAnyOfferPanel = localStorage.getItem(Constants.LOCALSTORAGE.OFFER_PANEL_PLAYER_WITHOUT_ANY_OFFER)
if (typeof offerOpenPlayerWithoutAnyOfferPanel === "undefined" || offerOpenPlayerWithoutAnyOfferPanel === null) {
    offerOpenPlayerWithoutAnyOfferPanel = store.getters.getDefaults.offerOpenPlayerWithoutAnyOfferPanel
} else {
    offerOpenPlayerWithoutAnyOfferPanel = (offerOpenPlayerWithoutAnyOfferPanel === "true")
}
store.commit('setOfferOpenPlayerWithoutAnyOfferPanel', offerOpenPlayerWithoutAnyOfferPanel)

let offerShowTooLowOffersOnly = localStorage.getItem(Constants.LOCALSTORAGE.OFFER_SHOW_TOO_LOW_OFFERS_ONLY)
if (typeof offerShowTooLowOffersOnly === "undefined" || offerShowTooLowOffersOnly === null) {
    offerShowTooLowOffersOnly = store.getters.getDefaults.offerShowTooLowOffersOnly
} else {
    offerShowTooLowOffersOnly = (offerShowTooLowOffersOnly === "true")
}
store.commit('setOfferShowTooLowOffersOnly', offerShowTooLowOffersOnly)

new Vue({
    vuetify,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
