<template>
  <v-card
      elevation="10"
      class="bid-row"
      :class="{'own-bid':hasOwnBid, 'no-bid':hasNoBid, 'only':hasOnlySelfBid}"
  >
    <v-chip-group
        column
        color="deep-purple darken-4"
        class="head bid-head"
        :style="[{'background-image':'url('+teamImage+')'}]"
    >
      <v-chip pill
              :color="(this.$vuetify.theme.dark) ? 'amber darken-2': 'amber accent-2'"
      >
        <v-icon left>fa-clock</v-icon>
        {{ expiryDate }}
      </v-chip>
      <v-chip class="players-name"
              :color="(this.$vuetify.theme.dark) ? 'cyan darken-3': 'cyan lighten-3'"
      >
        <v-icon left>fa-running</v-icon>
        <strong class="label">
              <span v-if="player.knownName">
                {{ player.knownName }}
              </span>
          <span v-else>
                {{ player.firstName }} {{ player.lastName }}
              </span>
        </strong>
        &nbsp;<span class="hidden-xs-only">(#{{ player.id }})</span> &nbsp;⌀ {{ player.averagePoints }} /
        {{ player.totalPoints }}

      </v-chip>
      <status-pill :player="player"></status-pill>
      <v-chip pill>
        <v-icon left class="hidden-xs-only">fa-futbol</v-icon>
        {{ getPosition }}
      </v-chip>

      <v-chip v-if="hasNoBid"
              :color="(this.$vuetify.theme.dark) ? 'lime darken-3': 'lime accent-1'"
              class="hidden-xs-only"
      >
        <v-icon left>fa-exclamation-circle</v-icon>
        NO BID
      </v-chip>

      <v-chip v-if="hasOnlySelfBid" dark class="text--white hidden-xs-only" color="pink accent-4">
        <v-icon dark left>fa-bomb</v-icon>
        YOUR BID ONLY
      </v-chip>

      <v-chip v-if="player.userId" dark class="text--white" color="brown accent-4">
        <v-icon dark left>fa-user</v-icon>
        Player: {{ player.username }}
      </v-chip>
    </v-chip-group>

    <fieldset class="no-padding-bottom">
      <v-chip-group
          column
          v-if="player.offers && player.offers.length"
      >
        <v-chip v-for="(offer, okey) in player.offers" :key="okey">
          <span v-if="offer.userName">{{ offer.userName }}</span>
          <span v-else>KICKBASE</span>
          :&nbsp;
          <span v-if="offer.userId != getSelf">
              {{ getDate(offer.date) }}
              <small> / {{ offer.price | numeral('0,0 $') }} / {{ getUsersPlayers(offer.userId) }} players</small>
            </span>
          <span v-else>
            {{ offer.price | numeral('0,0 $') }}
          </span>
        </v-chip>
      </v-chip-group>
    </fieldset>

    <fieldset>

      <v-row>
        <v-col xs="12" sm="6" cols="12" order="2" order-sm="1">
          <v-card
              class="pa-2"
              outlined
              tile
          >
            <v-form @submit.prevent="sendForm" class="playerBidForm">
              <v-text-field
                  v-model="playerBid"
                  label="Bid"
                  type="number"
                  filled
                  @focus="setPlayerBid"
                  @blur="resetPlayerBid"
              ></v-text-field>
            </v-form>

            <div class="v-data-table elevation-1 theme--lightX">
              <div class="v-data-table__wrapper">
                <table>
                  <tbody>
                  <tr>
                    <td class="text-start">
                      your bid
                    </td>
                    <td class="text-start">
                      {{ getComputedBid }}
                    </td>
                  </tr>
                  <tr class="" v-if="hasOwnBid">
                    <td colspan="2">
                      <v-btn color="red" class="darken-3 white--text" @click="revokeBid" block>revoke own bid
                        ({{ getComputedBid }})
                      </v-btn>
                      <br>
                    </td>
                  </tr>
                  <tr>
                    <td class="text-start" colspan="2">
                      <h3>Bid-Buttons:</h3>
                      <div class="bids-button-row">
                        <v-btn @click="sendMVBid">MV: {{ getComputedPrice }}</v-btn>
                        <v-btn @click="sendMinus09Bid"><strong>MV - 0.9%</strong>: {{ getMinus09PercentMV }}</v-btn>
                        <v-btn @click="sendPlus05Bid"><strong>MV + 0.5%</strong>: {{ get05PercentPrice }}</v-btn>
                        <v-btn @click="sendPlus03Bid"><strong>MV + 0.3%</strong>: {{ get03PercentPrice }}</v-btn>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col xs="12" sm="6" cols="12" order="1" order-sm="2">
          <v-card
              class="pa-2"
              outlined
              tile
          >
            <v-chip-group column>
              <v-chip pill @click="openLastDayChanges">
                <v-avatar
                    left
                    color="blue-grey darken-1"
                    class="text--white"
                >
                  P
                </v-avatar>

                {{ getComputedPrice }}

                <v-avatar
                    right
                    color="darkgrey"
                >
                  <v-icon v-if="player.marketValueTrend == 0">fa-arrow-right</v-icon>
                  <v-icon v-if="player.marketValueTrend == 1">fa-arrow-up</v-icon>
                  <v-icon v-if="player.marketValueTrend == 2">fa-arrow-down</v-icon>
                </v-avatar>
              </v-chip>
            </v-chip-group>
            <v-data-table
                :headers="getLastDayChanges.headers"
                :items="getLastDayChanges.values"
                :hide-default-footer="true"
                class="elevation-1" :class=lastDayChangesClass
                v-if="getLastDayChanges"
            ></v-data-table>
            <div v-else class="stats-loading">
            </div>
            <v-btn :class=lastDayChangesClass block v-on:click="fetchData">fetch data</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </fieldset>
  </v-card>
</template>

<script>
import api from '../api/api'
import {mapGetters} from 'vuex'

import moment from 'moment'
import numeral from 'numeral'

numeral.locale('deff')

import StatusPill from './StatusPill'

const lastDayChangesClassConst = 'hidden-sm-and-down'

export default {
  props: ['player'],
  components: {
    StatusPill,
  },
  data() {
    return {
      playerBid: null,
      options: {
        responsive: false,
        maintainAspectRatio: false
      },
      calcPercent: 0.0096,
      calc05Percent: 0.005,
      calc03Percent: 0.003,
      calcPercentSafe: 0.009,
      lastDayChangesClass: ''
    }
  },
  mounted() {
    this.lastDayChangesClass = lastDayChangesClassConst
    const offers = this.player.offers
    if (offers && offers.length) {
      offers.forEach((offer) => {
        if (offer.userId == this.$store.getters.getSelf) {
          this.playerBid = offer.price
        }
      })
    }
    if (!this.playerBid) {
      // this.playerBid = this.player.price
    }
  },
  computed: {
    ...mapGetters([
      'getSelf',
      'getPlayers',
      'getUsers',
      'getBids',
    ]),
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
    getBidVsMVClass() {
      let cssClass = ''

      if (this.playerBid) {
        if (this.playerBid >= this.getRaw1PercentMV) {
          cssClass = 'higher-than-comp-value'
        } else {
          cssClass = 'lower-than-comp-value'
        }
      }

      return cssClass
    },
    getBidVsEstFriClass() {
      let cssClass = ''

      if (this.playerBid && this.getEsitmatedFridayPrice) {
        if (this.playerBid >= this.getEsitmatedFridayPrice.price) {
          cssClass = 'higher-than-comp-value'
        } else {
          cssClass = 'lower-than-comp-value'
        }
      }

      return cssClass
    },
    getBidVsEstFri1PClass() {
      let cssClass = ''
      const price = this.getEsitmatedFridayPrice

      if (this.playerBid && price) {
        if (this.playerBid >= this.getRaw1PercentMV) {
          cssClass = 'higher-than-comp-value'
        } else {
          cssClass = 'lower-than-comp-value'
        }
      }

      return cssClass
    },
    getRaw1PercentMV() {
      return this.calc1PercentIncrease(this.player.marketValue)
    },
    getRaw1PercentMVDecrease() {
      return this.calc1PercentDecrease(this.player.marketValue)
    },
    getComputedPrice() {
      return numeral(this.player.price).format('0,0')
    },
    getComputedBid() {
      return (this.playerBid) ? numeral(this.playerBid).format('0,0') : 'no bid'
    },
    getComputedMV() {
      return numeral(this.player.marketValue).format('0,0')
    },
    get1PercentMV() {
      return numeral(this.getRaw1PercentMV).format('0,0')
    },
    getMinus09PercentMV() {
      return numeral(this.getRaw1PercentMVDecrease).format('0,0')
    },
    get1PercentPrice() {
      return numeral(this.calc1PercentIncrease(this.player.price)).format('0,0')
    },
    get05PercentPrice() {
      return numeral(this.calc05PercentIncrease(this.player.price)).format('0,0')
    },
    get03PercentPrice() {
      return numeral(this.calc03PercentIncrease(this.player.price)).format('0,0')
    },
    getEsitmatedFridayPrice() {
      const mvs = this.getLastChanges
      if (mvs) {
        const values = mvs.datasets[0].data.slice(0).reverse()
        if (values[0]) {
          const days = moment().day("Friday").diff(moment(new Date()), 'day')
          const diff = (values[0] - values[1])
          return {price: this.player.marketValue + (diff * days), days, diff}
        } else {
          return null
        }
      } else {
        return null
      }
    },
    getComputedEsitmatedFridayPrice() {
      const price = this.getEsitmatedFridayPrice
      if (price) {
        return numeral(price.price).format('0,0')
      } else {
        return 'n/a'
      }

    },
    getComputedEsitmatedFriday1PercentPrice() {
      const price = this.getEsitmatedFridayPrice
      return (price) ? numeral(this.calc1PercentIncrease(price.price)).format('0,0') : 'n/a'
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
    fetchData() {
      api.loadPlayersStats(this.player.id, null, true)
    },
    calc1PercentIncrease(value) {
      return value + (value * this.calcPercent)
    },
    calc05PercentIncrease(value) {
      return value + (value * this.calc05Percent)
    },
    calc03PercentIncrease(value) {
      return value + (value * this.calc03Percent)
    },
    calc1PercentDecrease(value) {
      return value - (value * this.calcPercentSafe)
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
    sendMVBid() {
      this.playerBid = numeral(this.player.marketValue).format('0')
      this.sendForm()
    },
    sendMinus09Bid() {
      this.playerBid = numeral(this.calc1PercentDecrease(this.player.marketValue)).format('0')
      this.sendForm()
    },
    sendMultiMinus09Bid() {
      this.playerBid = numeral(this.calc1PercentDecrease(this.player.marketValue)).format('0')
      this.sendForm(true)
    },
    sendPlus05Bid() {
      this.playerBid = numeral(this.calc05PercentIncrease(this.player.marketValue)).format('0')
      this.sendForm()
    },
    sendPlus03Bid() {
      this.playerBid = numeral(this.calc03PercentIncrease(this.player.marketValue)).format('0')
      this.sendForm()
    },
    sendForm(multi) {
      api.sendBid(this.player.id, this.playerBid, async (data) => {
        if (data.offerId) {
          await api.loadBids(false)
        }
      }, multi)
    },
    setPlayerBid() {
      if (!this.playerBid) {
        this.playerBid = this.player.price
      }
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
    }
  }
}
</script>