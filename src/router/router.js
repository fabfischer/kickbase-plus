import VueRouter from 'vue-router'
import Vue from 'vue'

import Home from '../components/Home'
import Transfermarket from '../components/Transfermarket'
import Sell from '../components/Sell'
import Feed from '../components/Feed'
import Live from '../components/Live'
import Lineup from '../components/Lineup'
import Ranking from '../components/Ranking'

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/home', component: Home },
  { path: '/feed', component: Feed },
  { path: '/transfermarket', component: Transfermarket },
  { path: '/sell', component: Sell },
  { path: '/live', component: Live },
  { path: '/lineup', component: Lineup },
  { path: '/table', component: Ranking },
]

const router = new VueRouter({
  routes
})

export default router