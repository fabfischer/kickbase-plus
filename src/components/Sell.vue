<template>
  <v-container>
    <v-layout
        justify-center
        v-if="(playersStack && playersStack.length) || (playerNotOnMarket && playerNotOnMarket.length)"
    >
      <v-row class="sell-row">

        <v-col xs="12" sm="6" cols="12" order="2" order-sm="1">
          <h3 class="headline">Not on market</h3>

          <v-card
              class="pa-2"
              outlined
              tile
              v-for="(player, inx) in playerNotOnMarket"
              :key="inx"
          >
            <h3 class="title">
              <span v-if="player.knownName">{{ player.knownName }}</span>
              <span v-else>{{ player.firstName }} {{ player.lastName }}</span>
            </h3>
            <v-btn block color="grey darken-1 white--text" large @click="putOnMarket(player)">Put on market</v-btn>
          </v-card>
        </v-col>

        <v-col xs="12" sm="6" cols="12" order="2" order-sm="1">
          <h3 class="headline">Current Offers</h3>

          <v-card
              class="pa-2 ma-2"
              outlined
              tile
              v-for="(player, inx) in offers"
              :key="inx"
          >


            <div class="v-data-table elevation-1 theme--lightX">
              <div class="v-data-table__wrapper">
                <table class="details">
                  <tbody>
                  <tr>
                    <td colspan="2">
                      <status-pill style="float:right;" :player="player"></status-pill>
                      <h2 class="subtitle player-name">
                        <span v-if="player.knownName">{{ player.knownName }}</span>
                        <span v-else>{{ player.firstName }} {{ player.lastName }}</span>
                      </h2>
                    </td>
                  </tr>
                  <tr v-if="hasOffer(player)">
                    <th>Offer</th>
                    <td>
                      <div
                          v-for="offer in player.offers"
                          :key="offer.id"
                      >
                        <v-chip outlined class="ma-2">{{ getOffer(offer) }}</v-chip>
                        <v-chip class="ma-2">{{ getCalcOffer(offer, player.marketValue) | numeral('0,0 $') }}</v-chip>
                        <v-chip class="ma-2" text-color="white"
                                :color="(getPercent(offer, player.marketValue) > minPercent) ? 'green' : 'red'">
                          {{ getPercent(offer, player.marketValue) }} %
                        </v-chip>
                        <v-chip class="ma-2" dark>
                          offer expires: {{ offer.validUntilDate | expiry }}
                        </v-chip>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="hasOffer(player)">
                    <td colspan="2">
                      <v-btn dark large block @click="removePlayerFromMarket(player, true)" color="red">
                        <v-icon color="white" left>fa-times</v-icon>
                        DECLINE AND ADD AGAIN
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="hasOffer(player)">
                    <th colspan="2">
                      <v-divider></v-divider>
                    </th>
                  </tr>
                  <tr v-if="hasOffer(player)">
                    <td colspan="2">
                      <v-btn block large dark @click="acceptOffers(player)" color="green">
                        <v-icon color="white" left>fa-times</v-icon>
                        ACCEPT
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="hasOffer(player)">
                    <th colspan="2">
                      <v-divider></v-divider>
                    </th>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <table class="subtable">
                        <tr>
                          <th>diff offer∕purchase price:</th>
                          <td>
                            <v-chip outlined
                                    :class="{'green':(getDiffPurchasePrice(player) > 0), 'red':(getDiffPurchasePrice(player) < 0)}">
                              {{ getDiffPurchasePrice(player) | numeral('0,0 $') }}
                            </v-chip>
                          </td>
                        </tr>
                        <tr>
                          <th>diff to today:</th>
                          <td>{{ getDiffMV(player) | numeral('0,0 $') }}</td>
                        </tr>
                        <tr>
                          <th>diff offer∕market value:</th>
                          <td>
                            <v-chip>
                              {{ getPlayersPurchaseMVDiff(player) | numeral('0,0 $') }}
                            </v-chip>
                          </td>
                        </tr>
                        <tr>
                          <th>market value:</th>
                          <td>{{ player.marketValue | numeral('0,0 $') }}</td>
                        </tr>
                        <tr>
                          <th>last market value:</th>
                          <td>{{ getYesterdaysMV(player) | numeral('0,0 $') }}</td>
                        </tr>
                        <tr>
                          <th>market change since purchase:</th>
                          <td>{{ getPlayersMarketValueChange(player) | numeral('0,0 $') }}</td>
                        </tr>
                        <tr>
                          <th>purchase price:</th>
                          <td>{{ getPlayersPurchaseSum(player) | numeral('0,0 $') }}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <v-divider/>
          </v-card>

        </v-col>

      </v-row>

    </v-layout>
    <spinner v-else></spinner>
  </v-container>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import api from '../api/api'
import numeral from 'numeral'
import moment from 'moment'

numeral.locale('deff')

import StatusPill from './StatusPill'
import Spinner from './Spinner'

export default {
  name: 'sell-view',
  components: {
    StatusPill,
    Spinner,
  },
  data: () => ({
    offers: [],
    playerNotOnMarket: [],
    playersStack: [],
    minPercent: .6,
    overlay: false,
    actionMessages: []
  }),
  filters: {
    expiry: (validUntilDate) => {
      const m = moment(validUntilDate)
      return m.fromNow()
    }
  },
  computed: {
    ...mapGetters(['getSelf', 'getPlayersOfMe', 'getLeague', 'getPlayers']),
    getToken() {
      return api.getToken()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapMutations(['addLoadingMessage', 'setLoading', 'resetLoading']),
    init: function () {
      if (this.getSelf) {
        const r = async () => {
          await api.loadUsersPlayer(this.getSelf, true)
          await api.loadUsersPlayerOffers(this.setPlayers)
        }

        if (this.getPlayers && this.getPlayers.length) {
          window.setTimeout(r, 2000)
        } else {
          api.loadBids(false, () => {
            window.setTimeout(r, 2000)
          })
        }
      } else {
        // window.setTimeout(this.init, 1000)
      }
    },
    setPlayers: function (data) {
      window.setTimeout(() => {
        this.resetLoading()
      }, 500)
      this.offers = []
      this.playerNotOnMarket = []
      this.playersStack = []
      if (data.players && data.players.length) {
        data.players.forEach((player) => {
          if (player.userId && player.userId * 1 === this.getSelf) {
            if (!player.offers || (player.offers && player.offers.length >= 0)) {
              this.offers.push(player)
              this.playersStack.push(player.id)
            }
          }
        })

        this.offers.sort((a, b) => (a.expiry > b.expiry) ? 1 : -1)

        this.getPlayersOfMe.forEach((player) => {
          if (this.playersStack.indexOf(player.id) === -1) {
            this.playerNotOnMarket.push(player)
          }
        })

      }
    },
    getYesterdaysMV(player) {
      if (
          this.getPlayers[player.id]
          && this.getPlayers[player.id].marketValues.length > 3
      ) {
        return this.getPlayers[player.id].marketValues[this.getPlayers[player.id].marketValues.length - 2].m
      }
    },
    getDiffMV(player) {
      if (
          this.getPlayers[player.id]
          && this.getPlayers[player.id].marketValues
          && this.getPlayers[player.id].marketValues[this.getPlayers[player.id].marketValues.length - 1]
          && this.getPlayers[player.id].marketValues[this.getPlayers[player.id].marketValues.length - 2]
      ) {
        return this.getPlayers[player.id].marketValues[this.getPlayers[player.id].marketValues.length - 1].m - this.getPlayers[player.id].marketValues[this.getPlayers[player.id].marketValues.length - 2].m
      }
    },
    getDiffPurchasePrice(player) {
      if (this.getPlayers[player.id] && this.getPlayers[player.id].leaguePlayer && player.offers) {
        return player.offers[0].price - this.getPlayers[player.id].leaguePlayer.buyPrice
      }
    },
    getPlayersPurchaseMVDiff(player) {
      if (this.getPlayers[player.id] && this.getPlayers[player.id].leaguePlayer) {
        return player.marketValue - this.getPlayers[player.id].leaguePlayer.buyPrice
      }
    },
    getPlayersMarketValueChange(player) {
      if (this.getPlayers[player.id] && this.getPlayers[player.id].leaguePlayer) {
        return this.getPlayers[player.id].leaguePlayer.marketValueChange
      }
    },
    getPlayersPurchaseSum(player) {
      if (this.getPlayers[player.id] && this.getPlayers[player.id].leaguePlayer) {
        return this.getPlayers[player.id].leaguePlayer.buyPrice
      }
    },
    getCalcOffer(offer, marketValue) {
      return (offer.price) - marketValue
    },
    getPercent(offer, marketValue) {
      const calc = this.getCalcOffer(offer, marketValue)
      return Number.parseFloat((calc / marketValue * 100)).toPrecision(4)
    },
    getOffer(offer) {
      return numeral(offer.price).format('0,0 $')
    },
    putOnMarket(player) {
      this.setLoading(true)
      api.putOnMarket(
          player,
          () => {
            api.loadUsersPlayerOffers(this.setPlayers)
          },
      )
    },
    removePlayerFromMarket(player, twice) {
      let hasMaxOffer = false

      if (player.offers && player.offers.length) {
        player.offers.forEach((offer) => {
          const p = this.getPercent(offer, player.marketValue) * 1
          if (p > this.minPercent) {
            hasMaxOffer = true
          }
        })
      }

      if (hasMaxOffer) {
        if (window.confirm('Reput player "' + player.firstName + ' ' + player.lastName + '" despite max offer?')) {
          this.setPlayerOnMarketAgain(player, twice)
        }
      } else {
        this.setPlayerOnMarketAgain(player, twice)
      }
    },
    setPlayerOnMarketAgain(player, twice) {
      this.setLoading(true)

      api.removePlayerFromMarket(
          player,
          () => {
            api.putOnMarket(
                player,
                () => {
                  api.loadUsersPlayerOffers(this.setPlayers)
                },
                twice
            )
          }
      )
    },
    hasOffer(player) {
      return (player.offers && player.offers.length)
    },
    acceptOffers(player) {
      if (window.confirm('Accept offer for player "' + player.firstName + ' ' + player.lastName + '" ?')) {
        this.setLoading(true)
        const offers = []
        player.offers.forEach((offer) => {

          const p = this.getPercent(offer, player.marketValue) * 1

          if (p > this.minPercent) {
            offers.push({
              offerId: offer.id,
              price: offer.price,
              percent: p,
              playerId: player.id
            })
          }


        })
        offers.sort((a, b) => {
          if (a.price < b.price) {
            return 1
          } else if (a.price > b.price) {
            return -1
          } else {
            return 0
          }
        })

        offers.forEach((offer) => {
          api.acceptBids(offer, () => {
            api.loadUsersPlayer(this.getSelf, false, () => {
              api.loadUsersPlayerOffers(this.setPlayers)
            })
          })
        })


      }
    }
  }
};
</script>
