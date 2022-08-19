<template>
  <div>
    <v-container v-if="items && items.length">
      <v-card style="margin-bottom: 20px;" v-for="item in items" :key="item.id">
        <div class="d-flex flex-no-wrap justify-space-between">
        <v-avatar
          v-if="getPlayerImage(item)"
          tile
          size="125"
        >
          <v-img :src="getPlayerImage(item)" aspect-ratio="1"></v-img>
        </v-avatar>
        <v-list-item three-line>
          <v-list-item-content>
          <div class="overline">
            {{ item.age | age }}
          </div>
          <v-list-item-title class="headline mb-1 wrap-title">
            <span class="news-details" v-html="getCardsText(item)"></span>
          </v-list-item-title>

          <div class="flex-wrap max-height news-details" v-if="getPurchaseInfo(item)" v-html="getPurchaseInfo(item)">
          </div>
          </v-list-item-content>
        </v-list-item>
        </div>
      </v-card>
    </v-container>
    <spinner v-else></spinner>
  </div>
  
</template>

<script>
import { mapGetters, mapMutations } from 'vuex' 
import api from '../api/api'
import numeral from 'numeral'
numeral.locale('deff')

import moment from 'moment'

import Spinner from './Spinner'

export default {
  name: 'feed-view',
  components: {
    Spinner
  },
  filters: {
    age: (age) => {
      const m = moment().add(age, 'seconds')
      return m.toNow()
    }
  },
  data: () => ({
    items: [],
  }),
  computed: {
    ...mapGetters(['getBearerToken', 'getSelf', 'getPlayersOfMe', 'getLeague', 'getPlayers']),
    getToken() {
      return api.getToken()
    },
  },
  mounted() {
    window.setTimeout(() => {
      api.loadFeed(this.setFeed)
    }, 2000)
  },
  methods: {
    ...mapMutations(['addLoadingMessage', 'setLoading', 'resetLoading']),
    setFeed(data) {
      if (data.items) {
        this.items = data.items.sort((itemA, itemB) => {
          if (itemA.age > itemB.age) {
            return 1
          } else if(itemA.age < itemB.age) {
            return -1
          }
          return 0
        })
        this.items.forEach((item) => {
          if (item.meta && item.meta.p && item.meta.p.i) {
            api.loadPlayersStats(item.meta.p.i)
          }
        })
      }
    },
    getPlayerImage(item) {
      let pid = null

      if (item.meta && item.meta.p && item.meta.p.i) {
        pid = item.meta.p.i
      }

      if (item.meta && item.meta.pid) {
        pid = item.meta.pid
      }

      if (item.meta && item.meta.f) {
        return item.meta.f
      }
      if (pid) {
        return `https://kkstr.s3.amazonaws.com/pool/playersbig/${pid}.png`
      }

      return null
    },
    getCardsText(item) {
      let text = null
      
      // sold to computer
      if (item.type === 15 && item.meta && item.meta.s && item.meta.s.n && item.meta.p && item.meta.p.n) {
        text = `<strong>${item.meta.s.n}</strong> sold <strong>${item.meta.p.n}</strong> to KICKBASE`
      }

      // purchase from computer
      if (item.type === 15 && item.meta && item.meta.b && item.meta.b.n && item.meta.p && item.meta.p.n) {
        let buyer = 'KICKBASE'

        if (item.meta.s && item.meta.s.n) {
          buyer = item.meta.s.n
        }

        text = `<strong>${item.meta.b.n}</strong> bought <strong>${item.meta.p.n}</strong> from ${buyer} for:`
      }

      // transfer market
      if (item.type === 3) {
        text = `<strong>${item.meta.pfn} ${item.meta.pln}</strong> is on the transfer market`
      }

      // news
      if (item.type === 16) {
        text = `<strong>${item.meta.t}</strong> ${item.meta.sti}`
      }

      return text
    },
    getPurchaseInfo(item) {
      let purchaseInfo = null

      // purchase info
      if (item.type === 15 && item.meta && item.meta.b) {
        const p = numeral(item.meta.v).format('0,0 $')
        purchaseInfo = `${p}`

        if (item.meta.p && this.getPlayers[item.meta.p.i]) {
          purchaseInfo += ' / MV: ' + numeral(this.getPlayers[item.meta.p.i].marketValue).format('0,0 $')
          const pp = item.meta.v - this.getPlayers[item.meta.p.i].marketValue

          if (pp > 0) {
            purchaseInfo += '&nbsp;/&nbsp;<span style="color: red"> paid ' + numeral(pp).format('0,0 $') + ' more than MV</span>'
          } else {
            purchaseInfo += '&nbsp;/&nbsp;<span style="color: green"> paid ' + numeral(pp).format('0,0 $') + ' less than MV</span>'
          }

        }
      } else if (item.type === 15 && item.meta && item.meta.s) {
        const p = numeral(item.meta.v).format('0,0 $')
        purchaseInfo = `${p}`

        if (item.meta.p && this.getPlayers[item.meta.p.i]) {
          purchaseInfo += ' / MV: ' + numeral(this.getPlayers[item.meta.p.i].marketValue).format('0,0 $')
          const pp = item.meta.v - this.getPlayers[item.meta.p.i].marketValue

          if (pp > 0) {
            purchaseInfo += '&nbsp;/&nbsp;<span style="color: green"> sold ' + numeral(pp).format('0,0 $') + ' over MV</span>'
          } else {
            purchaseInfo += '&nbsp;/&nbsp;<span style="color: red"> sold ' + numeral(pp).format('0,0 $') + ' below MV</span>'
          }

        }
      }

      return purchaseInfo
    }
  }
};
</script>
