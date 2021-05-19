import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import numeral from 'numeral'
import vueNumeralFilterInstaller from 'vue-numeral-filter';

import router from './router/router'
import store from './store/store'

require ('./scss/styles.scss')

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

Vue.use(vueNumeralFilterInstaller, { locale: 'deff' });


new Vue({
    vuetify,
    router,
    store,
    render: h => h(App)
}).$mount('#app')
