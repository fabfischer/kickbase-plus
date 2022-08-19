<template>
  <player-card
      :class="{'own-bid':hasOwnBid, 'no-bid':hasNoBid, 'only':hasOnlySelfBid}"
      class="bid-row"
      :player="player"
      :show-purchase-statistic=false
  >
    <template v-slot:pre-head>
      <v-alert
          text
          :color="(isDarkTheme) ? 'deep-purple lighten-3': 'deep-purple darken-4'"
          icon="fa-clock"
      >
        {{ expiryDate }}
      </v-alert>

      <v-alert v-if="hasNoBid"
               text
               :color="(isDarkTheme) ? 'lime darken-3': 'orange darken-3'"
               icon="fa-exclamation-circle"
      >
        NO BID
      </v-alert>

      <v-alert v-if="hasOnlySelfBid" text dark class="text--white" color="pink accent-4" icon="fa-bomb">
        YOUR BID ONLY
      </v-alert>

      <v-alert v-else-if="hasOwnBid" text dark class="text--white"
               :color="(isDarkTheme) ? 'purple darken-1': 'purple accent-4'" icon="fa-clipboard-check">
        YOU BID
      </v-alert>

      <template v-if="foreignOffers.length">
        <v-alert v-for="bid in foreignOffers"
                 :key="bid.id"
                 text
                 :color="(isDarkTheme) ? 'green lighten-4': 'green darken-4'"
                 icon="fa-money-bill-wave"
        >
          <span class="text-caption">{{ bid.userName }}</span>
          <small>&nbsp;{{ getDate(bid.date) }}</small>
        </v-alert>
      </template>

      <v-alert v-if="player.userId" text :color="(isDarkTheme) ? 'brown lighten-3': 'brown darken-3'" icon="fa-user">
        Player: {{ player.username }}
      </v-alert>
    </template>

    <v-form @submit.prevent="sendForm" class="playerBidForm mt-5 mb-4">
      <div class="d-sm-flex d-block">
        <div class="bid-input-container mr-5">
          <vue-numeric-input
              :initialNumber="bidValue"
              :has-bid="(playerBid !== null)"
              :min="1"
              align="center"
              :mousewheel=false
              v-on:input="setInputValue"
              v-on:enter-event="setInputValue"
              :placeholder="inputPlaceholder"
          ></vue-numeric-input>
          <saved-alert :value="showSavedAlert" message="saved bid for player"></saved-alert>
        </div>
        <div class="bid-input-container">
          <div class="text-caption">
            {{ getComputedBid }}
            <span
                v-if="getComputedBid !== 'no bid'"
            >
            <span class="hidden-sm-and-up">, </span>
          <br class="hidden-xs-only">
            you bid
            <strong>{{ getComputedDifference.number }}</strong> Euros{{ getComputedDifferenceWording }}
            (<span
                :class="{'text--green': (getComputedDifference.number<=0), 'text--red': (getComputedDifference.number>0)}">{{
                getComputedDifference.percentage
              }} %</span>)
          </span>
          </div>
        </div>
      </div>

    </v-form>
    <v-btn v-if="hasOwnBid" class="kp-button kp-button__decline mb-5" @click="revokeBid" block x-large>
      revoke own bid ({{ getComputedBid }})
    </v-btn>
    <!--
    TODO: re-introduce with settings options
        -->
    <div class="mb-5">
      <h3 class="text-subtitle-1">Bid-Buttons:</h3>
      <div class="bids-button-row">
        <v-btn
            @click="sendPercentageBid(percent)"
            dense
            outlined
            v-for="percent in bidButtons"
            :key="percent"
        >
          <span v-html="getButtonLabel(percent)"></span>
        </v-btn>
      </div>
    </div>

    <template v-slot:extra-expansion-panel v-if="player.offers && player.offers.length && hasOnlySelfBid === false">
      <v-expansion-panel
      >
        <v-expansion-panel-header class="elevation-0">
          <v-icon class="mr-2 player-card-accordion__icon" color="green darken-1">fa-money-bill-wave</v-icon>
          <strong>{{ player.offers.length }}</strong> user bid on this player
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-simple-table class="mb-5 bid-table">
            <template>
              <tbody>
              <tr>
                <th>
                  Name
                </th>
                <th>
                  Details
                </th>
              </tr>
              <tr v-for="(offer, okey) in sortedOffers" :key="okey" :class="{'foo': offer.isSelf}">
                <td>
                  <span v-if="offer.userName">{{ offer.userName }}</span>
                  <span v-else>KICKBASE</span>:
                </td>
                <td>
              <span v-if="offer.userId != getSelf">
              {{ getDate(offer.date) }}
              <small> / has {{ getUsersPlayers(offer.userId) }} players</small>
            </span>
                  <span v-else>
            {{ offer.price | numeral('0,0 $') }}
          </span>
                </td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </template>

  </player-card>
</template>

<script>
import api from '../api/api'
import {mapGetters} from 'vuex'
import debounce from "lodash.debounce";

import moment from 'moment'
import numeral from 'numeral'

numeral.locale('deff')

import PlayerCard from './Player/PlayerCard'
import VueNumericInput from './Generic/NumericInput'
import SavedAlert from './Generic/SavedAlert'
import {sleep} from "@/helper/helper";

const lastDayChangesClassConst = 'hidden-sm-and-down'

export default {
  props: ['player'],
  components: {
    PlayerCard,
    VueNumericInput,
    SavedAlert,
  },
  data() {
    return {
      playerBid: null,
      playerBidRepresentation: null,
      options: {
        responsive: false,
        maintainAspectRatio: false
      },
      calcPercent: 0.0096,
      calc05Percent: 0.005,
      calc03Percent: 0.003,
      calcPercentSafe: 0.009,
      lastDayChangesClass: '',
      selectedBidStep: 1,
      debouncedCallback: null,
      showSavedAlert: false,
      inputValue: null,
      bidButtons: [
        0,
        -0.9,
        //-0.5,
        0.3,
        0.5,
        //0.9,
      ]
    }
  },
  mounted() {
    this.lastDayChangesClass = lastDayChangesClassConst
    const offers = this.player.offers
    if (offers && offers.length) {
      offers.forEach((offer) => {
        if (offer.userId * 1 === this.$store.getters.getSelf) {
          this.playerBid = offer.price
        }
      })
    }
    this.debouncedCallback = debounce((...args) => {
      if (typeof args[0] === 'function') {
        args[0]()
      }
    }, 1000);
  },
  watch: {
    inputValue(newValue) {
      this.debouncedCallback(() => {
        if (newValue === this.inputValue && newValue !== null) {
          this.sendForm()
        }
      });
    }
  },
  computed: {
    ...mapGetters([
      'getSelf',
      'getPlayers',
      'getUsers',
      'getBids',
    ]),
    bidValue() {
      return this.playerBid ?? this.player.marketValue
    },
    inputPlaceholder() {
      return this.player.marketValue + ''
    },
    sortedOffers() {
      if (this.player.offers && this.player.offers.length) {
        const sortedOffers = [...this.player.offers]
        sortedOffers.sort((a, b) => {
          const aIsOwnBid = a.userId * 1 === this.getSelf
          const bIsOwnBid = b.userId * 1 === this.getSelf

          if (aIsOwnBid) {
            a.isSelf = true
            return -1
          }

          if (bIsOwnBid) {
            b.isSelf = true
            return 1
          }

        })

        return sortedOffers
      }

      return []
    },
    foreignOffers() {
      return this.sortedOffers.filter((offer) => offer.userId * 1 !== this.getSelf)
    },
    hasPlayerStats() {
      return (Object.keys(this.getPlayers).length >= 1
          &&
          this.getPlayers[this.player.id]
      )
    },
    expiryDate() {
      const m = moment().subtract(this.player.expiry, 'seconds')
      return m.toNow()
    },
    getComputedPrice() {
      return numeral(this.player.price).format('0,0')
    },
    getComputedBid() {
      const calcBid = this.inputValue ?? this.playerBid
      return (calcBid) ? numeral(calcBid).format('0,0') : 'no bid'
    },
    getComputedDifference() {
      const calcBid = this.inputValue ?? this.playerBid

      const number = (calcBid) ? numeral(calcBid - this.player.price).format('0,0') : 'no bid'
      const c = (calcBid - this.player.price) / this.player.price * 100
      const percentage = Number.parseFloat(c).toPrecision(2)

      return {
        number,
        percentage
      }
    },
    getComputedDifferenceWording() {
      let wording = ', which is exactly the market value'
      if (this.getComputedDifference.number < 0) {
        wording = ' less than the market value'
      } else if (this.getComputedDifference.number > 0) {
        wording = ' more than the market value'
      }
      return wording
    },
    isDarkTheme() {
      return this.$vuetify.theme.dark
    },
    getLastChanges() {
      if (this.getPlayers[this.player.id]) {
        const mv = this.getPlayers[this.player.id].marketValues //.sort((a, b) => (a.d > b.d) ? -1 : 1)
        const values = {
          labels: [],
          datasets: [
            {
              label: 'market value',
              // backgroundColor: '#f87979',
              data: []
            }
          ]
        }
        for (let y = mv.length; y >= (mv.length - 21); y--) {
          if (mv[y]) {
            const date = moment(mv[y].d)
            values.labels.push(date.format('DD MM'))
            values.datasets[0].data.push(mv[y].m)
          }
        }
        values.labels = values.labels.reverse()
        values.datasets[0].data = values.datasets[0].data.reverse()
        return values
      } else {
        return null
      }
    },
    getLastDayChanges() {
      const headers = [
        {
          'text': 'day',
          'value': 'day',
          'sortable': false,
        },
        {
          'text': 'change',
          'value': 'change',
          'sortable': false,
        }
      ];
      const mv = this.getLastChanges

      if (mv && mv.datasets && mv.datasets.length) {
        const values = mv.datasets[0].data.slice(0).reverse()
        const day7Value = (values[6]) ? numeral(values[0] - values[6]).format('0,0') : null
        const day14Value = (values[13]) ? numeral(values[0] - values[13]).format('0,0') : null

        if (day7Value === 0 || day14Value === 0) {
          return null
        }

        return {
          headers,
          values: [
            {
              'day': 'yesterday',
              'change': numeral(values[0] - values[1]).format('0,0')
            },
            {
              'day': '7 days change',
              'change': day7Value
            },
            {
              'day': '14 days change',
              'change': day14Value
            }
          ]
        }
      }
      return {
        headers
      }
    },
    getPosition() {
      let position = ''
      switch (this.player.position) {
        case 1:
          position = 'goalkeeper'
          break;
        case 2:
          position = 'defender'
          break;
        case 3:
          position = 'midfielder'
          break;
        case 4:
          position = 'forward'
          break;
      }
      return position
    },
    teamImage() {
      return '/assets/teams/' + this.player.teamId + '.png'
    },
    hasOwnBid() {
      const offers = this.player.offers
      let hasOwnBid = false
      if (offers && offers.length) {
        offers.forEach((offer) => {
          if (offer.userId == this.$store.getters.getSelf) {
            hasOwnBid = true
          }
        })
      }
      return hasOwnBid
    },
    hasOnlySelfBid() {
      return (this.player.offers && this.player.offers.length === 1 && this.hasOwnBid)
    },
    hasNoBid() {
      const offers = this.player.offers
      return (offers && offers.length === 0 || !offers)
    },
  },
  methods: {
    setInputValue(value) {
      this.inputValue = value
    },
    fetchData() {
      api.loadPlayersStats(this.player.id, null, true)
    },
    getDate(date) {
      const m = moment(date)
      return m.fromNow()
    },
    revokeBid() {

      let offer = null
      this.getBids.forEach((bid) => {
        if (bid.id === this.player.id && bid.offers && bid.offers.length) {
          bid.offers.forEach((offerObject) => {
            if (offerObject.userId * 1 === this.getSelf) {
              offer = offerObject
            }
          })
        }
      })

      if (offer) {
        api.revokeBid(this.player.id, offer.id, async () => {
          this.playerBid = null
          await api.loadBids(false)
        })
      }
    },
    sendPercentageBid(percent) {
      this.playerBid = numeral(this.getPercentMVValue(percent)).format('0') * 1
      this.sendForm()
    },
    sendForm() {
      let bid = this.player.marketValue
      if (this.inputValue) {
        bid = this.inputValue
      } else if (this.playerBid) {
        bid = this.playerBid
      }
      api.sendBid(this.player.id, bid, async (data) => {
        if (data.offerId) {
          this.playerBid = bid
          this.inputValue = null
          this.showSavedAlert = true
          await api.loadBids(false)
          await sleep(1500)
          this.showSavedAlert = false
        }
      })
    },
    resetPlayerBid() {
      if (!this.hasOwnBid) {
        this.playerBid = null
      }
    },
    getUsersPlayers(userId) {
      const users = this.getUsers
      return (
          users[userId] && users[userId].players && users[userId].players.length
      ) ? users[userId].players.length : 0
    },
    openLastDayChanges() {
      if (this.lastDayChangesClass === '') {
        this.lastDayChangesClass = lastDayChangesClassConst
      } else {
        this.lastDayChangesClass = ''
      }
    },
    getPercentMVValue(percent) {
      return this.player.marketValue + (this.player.marketValue * percent / 100)
    },
    getPercentMVValueRepresentation(percent) {
      return numeral(this.getPercentMVValue(percent)).format('0,0')
    },
    getButtonLabel(percent) {
      let mvA = ''
      const value = this.getPercentMVValueRepresentation(percent)
      if (percent < 0) {
        mvA = percent + '%'
      } else if (percent > 0) {
        mvA = '+' + percent + '%'
      }

      return `<strong>MV${mvA}</strong>: ${value}`
    }
  }
}
</script>