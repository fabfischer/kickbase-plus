import VueRouter from 'vue-router'
import Vue from 'vue'

import Home from '../components/Home'
import TransfermarketView from '../components/TransfermarketView'
import SellView from '../components/SellView'
import Feed from '../components/Feed'
import LiveView from '../components/LiveView'
import Lineup from '../components/Lineup'
import Ranking from '../components/Ranking'
import SettingsView from '../components/SettingsView'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/home', component: Home },
  { path: '/feed', component: Feed },
  { path: '/transfermarket', component: TransfermarketView },
  { path: '/sell', component: SellView },
  { path: '/live', component: LiveView },
  { path: '/lineup', component: Lineup },
  { path: '/table', component: Ranking },
  { path: '/settings', component: SettingsView },
]

const router = new VueRouter({
  routes,
  scrollBehavior () {
    return { x: 0, y: 0 }
  }

})

export default router