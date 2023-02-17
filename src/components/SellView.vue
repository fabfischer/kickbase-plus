<template>
  <div
      class="full-width-container full-width-container--with-options-bar"
      v-if="(playersStack && playersStack.length) || (playerNotOnMarket && playerNotOnMarket.length)"
  >
    <options-bar info-button-title="your defaults">
      <template v-slot:content>
        <reload-button :loading="loading" v-on:click.native="load" color="transparent" extra-classes="desktop"></reload-button>
        <sell-view-order></sell-view-order>
        <v-checkbox
            v-model="showPlayerWithTooLowOffersOnly"
            label="show only too low offers"
        ></v-checkbox>

        <div v-if="computedDeclinableOffers.length">
          <v-btn
              class="kp-button kp-button__decline-all kp-button--in-options-bar mb-4"
              x-large
              @click="declineAllTooLowOrExpiredOffers"
          >
            decline all <strong>{{ computedDeclinableOffers.length }} offers</strong> that are too low or expired
          </v-btn>

          <p class="text-caption">Players with too low offers:</p>
          <ol class="text-caption mb-5">
            <li v-for="tooLowOffer in computedDeclinableOffers" :key="tooLowOffer.id">
              {{ tooLowOffer.displayName }}
            </li>
          </ol>

        </div>
      </template>
      <template v-slot:other-buttons>
        <reload-button :loading="loading" v-on:click.native="load" :large=true color="secondary"></reload-button>
        <v-btn
            v-if="computedDeclinableOffers.length"
            large
            fab
            @click="declineAllTooLowOrExpiredOffers"
            color="red darken-4 text--white"
            class="button-text-wrap button-text-065rem">
          decline <strong>{{ computedDeclinableOffers.length }}</strong> offers
        </v-btn>
      </template>
      <template v-slot:info>
        <v-alert outlined type="info" :icon=false>
          <div class="d-flex align-center">
            <v-icon color="info" class="mr-2">fa-info-circle</v-icon>
            <p class="caption mb-0">
              your default settings:
            </p>
          </div>
          <v-simple-table>
            <template>
              <tbody>
              <tr>
                <th>Order</th>
                <td>{{ getOfferOrderLabel }}</td>
              </tr>
              <tr>
                <th>Offer threshold</th>
                <td>{{ getOfferThreshold }}</td>
              </tr>
              <tr>
                <th>Open "player not on market" panel</th>
                <td>{{ getOfferOpenPlayerNotOnMarketPanel }}</td>
              </tr>
              <tr>
                <th>Open "player without any offer" panel</th>
                <td>{{ getOfferOpenPlayerWithoutAnyOfferPanel }}</td>
              </tr>
              <tr>
                <th>Checkbox "Show only too low offers"</th>
                <td>{{ getOfferShowTooLowOffersOnly }}</td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-alert>
      </template>
    </options-bar>

    <div class="flex-grow-1 options-bar__sibling" v-if="loading === false">
      <v-expansion-panels v-model="openPanels" multiple accordion focusable class="elevation-1 player-card-accordion">
        <v-expansion-panel
        >
          <v-expansion-panel-header class="elevation-0">
            <v-icon class="mr-2 player-card-accordion__icon">fa-money-bill-wave</v-icon>
            <strong>{{ playerNotOnMarket.length }}</strong> player not on market
          </v-expansion-panel-header>
          <v-expansion-panel-content>
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
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel
            v-if="playerWithoutAnyOffer.length > 0"
        >
          <v-expansion-panel-header class="elevation-0">
            <v-icon class="mr-2 player-card-accordion__icon">fa-spinner</v-icon>
            <strong>{{ playerWithoutAnyOffer.length }}</strong> players who have no offer at the moment
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <offer-player-item
                v-for="player in playerWithoutAnyOffer"
                :key="player.id"
                :player="player"
                :hide-meta=!getGeneralPlayerCardShowAlwaysAllDetails
            >
            </offer-player-item>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <offer-player-item
          v-for="player in playerWithAnOffer"
          :key="player.id"
          :player="player"
          :show-player-with-too-low-offers-only="showPlayerWithTooLowOffersOnly"
          v-on:acceptOffer="acceptOffer"
          v-on:setPlayerOnMarketAgain="setPlayerOnMarketAgain"
      >
      </offer-player-item>
    </div>
    <div v-else class="flex-grow-1 options-bar__sibling" >
      <spinner></spinner>
    </div>
  </div>
  <spinner v-else></spinner>
</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import api from '../api/api'

import Spinner from './Spinner'
import OfferPlayerItem from './Sell/OfferPlayerItem'
import OptionsBar from "./Generic/OptionsBar";
import ReloadButton from "./Generic/ReloadButton";
import SellViewOrder from "./Sell/OrderSelect";
import {isHighOffer, sleep, offerIsExpired} from "@/helper/helper";

export default {
  name: 'sell-view',
  components: {
    SellViewOrder,
    OptionsBar,
    Spinner,
    OfferPlayerItem,
    ReloadButton
  },
  data: () => ({
    offers: [],
    playerNotOnMarket: [],
    playersStack: [],
    overlay: false,
    showPlayerWithTooLowOffersOnly: false,
    actionMessages: [],
    openPanels: [],
    tooLowOffers: [],
    expiredOffers: [],
    viewOrder: null,
    loading: true,
  }),
  watch: {
    offers() {
      // set active panels
      this.openPanels = []
      if (this.getOfferOpenPlayerNotOnMarketPanel === true && this.playerNotOnMarket.length) {
        this.openPanels.push(0)
      }
      if (this.getOfferOpenPlayerWithoutAnyOfferPanel === true && this.playerWithoutAnyOffer.length) {
        this.openPanels.push(1)
      }
    },
  },
  computed: {
    ...mapGetters([
      'getInitialized',
      'getSelf',
      'getPlayersOfUser',
      'getLeague',
      'getPlayers',
      'getOfferThreshold',
      'getDefaults',
      'getOfferOrderLabel',
      'getOfferOpenPlayerNotOnMarketPanel',
      'getOfferOpenPlayerWithoutAnyOfferPanel',
      'getOfferOrder',
      'getOfferShowTooLowOffersOnly',
      'getGeneralPlayerCardShowAlwaysAllDetails',
    ]),
    getToken() {
      return api.getToken()
    },
    playerWithoutAnyOffer() {
      return this.offers.filter((pl) => (!pl.offers || (pl.offers && pl.offers.length === 0)))
    },
    playerWithAnOffer() {
      let playerWithAnOffer = this.offers.filter((pl) => (pl.offers && pl.offers.length >= 1))

      if (this.getComputedOrder === "oldest") {
        playerWithAnOffer.sort((a, b) => (a.expiry > b.expiry) ? 1 : -1)
      } else if (this.getComputedOrder === "newest") {
        playerWithAnOffer.sort((a, b) => (a.expiry > b.expiry) ? -1 : 1)
      }
      return playerWithAnOffer
    },
    getComputedOrder() {
      return this.getOfferOrder.temporary ?? this.getOfferOrder.init
    },
    computedDeclinableOffers() {
      return [...this.tooLowOffers, ...this.expiredOffers]
    }
  },
  mounted() {
    this.init()
    this.showPlayerWithTooLowOffersOnly = this.getOfferShowTooLowOffersOnly
  },
  methods: {
    ...mapMutations(['addLoadingMessage', 'setLoading', 'resetLoading']),
    init: async function () {
      if (this.getInitialized) {
        await this.load()
      } else {
        window.setTimeout(this.init, 1000)
      }
    },
    async load() {
      this.loading = true
      await api.loadUsersStats(true)
      await this.loadOffers()
    },
    async loadOffers() {
      const currentOffers = await api.loadUsersPlayerOffers()
      this.setPlayers(currentOffers)
    },
    sortOffers(order) {
      this.viewOrder = order
    },
    setPlayers: function (data) {
      window.setTimeout(() => {
        this.resetLoading()
      }, 500)
      this.offers = []
      this.playerNotOnMarket = []
      this.playersStack = []
      this.tooLowOffers = []
      this.expiredOffers = []
      if (data.players && data.players.length) {
        data.players.forEach((player) => {
          if (player.userId && player.userId * 1 === this.getSelf) {
            if (!player.offers || (player.offers && player.offers.length >= 0)) {
              player.hasHighOffer = this.hasHighOffer(player)
              player.hasLowOffer = this.hasLowOffer(player)
              player.hasExpiredOffers = this.hasExpiredOffers(player)
              player.hasKickbaseOffersOnly = this.hasKickbaseOffersOnly(player)
              player.displayName = player.knownName ?? `${player.firstName} ${player.lastName}`

              if (player.hasHighOffer === false && player.hasLowOffer === true) {
                this.tooLowOffers.push(player)
              } else if (player.hasExpiredOffers === true && player.hasKickbaseOffersOnly === true) {
                this.expiredOffers.push(player)
              }

              this.offers.push(player)
              this.playersStack.push(player.id)
            }
          }
        })

        this.sortOffers()

        this.getPlayersOfUser.forEach((player) => {
          if (this.playersStack.indexOf(player.id) === -1) {
            this.playerNotOnMarket.push(player)
          }
        })

      }

      window.setTimeout(() => {
        this.loading = false
      }, 500)
    },
    async putOnMarket(player) {
      this.setLoading(true)
      await api.putOnMarket(player)
      await this.loadOffers()
    },
    async setPlayerOnMarketAgain(player) {
      await api.setPlayerOnMarketAgain(player)
      await this.loadOffers()
    },
    async acceptOffer(payload) {
      this.setLoading(true)
      await api.acceptBids(payload.offer)
      await sleep(500);
      await api.loadUsersStats(true)
      await sleep(500);
      await this.loadOffers()
    },
    async declineAllTooLowOrExpiredOffers() {
      const playerIds = []
      for (const player of this.computedDeclinableOffers) {
        await api.setPlayerOnMarketAgain(player)
        playerIds.push(player.id)
      }
      await sleep(500)
      await this.load()
      if (this.playerNotOnMarket) {
        let reAdded = false
        for (const playerNotOnMarket of this.playerNotOnMarket) {
          if (playerIds.indexOf(playerNotOnMarket.id) !== -1) {
            await api.setPlayerOnMarketAgain(playerNotOnMarket)
            reAdded = true
          }
        }
        if (reAdded) {
          await this.load()
        }
      }
    },
    hasKickbaseOffersOnly(player) {
      let result = false
      if (player.offers && player.offers.length) {
        const offerResult = player.offers.filter((offer) => {
          return offer.userName
        })
        result = (offerResult.length === 0)
      }
      return result
    },
    hasHighOffer(player) {
      let result = false
      if (player.offers && player.offers.length) {
        const offerResult = player.offers.filter((offer) => {
          return isHighOffer(player, offer, this.getOfferThreshold)
        })
        result = (offerResult.length >= 1)
      }
      return result
    },
    hasLowOffer(player) {
      let result = false
      if (player.offers && player.offers.length) {
        const offerResult = player.offers.filter((offer) => {
          return isHighOffer(player, offer, this.getOfferThreshold) === false
        })
        result = (offerResult.length >= 1)
      }
      return result
    },
    hasExpiredOffers(player) {
      let result = false
      if (player.offers && player.offers.length) {
        const offerResult = player.offers.filter((offer) => {
          return offerIsExpired(offer) === true
        })
        result = (offerResult.length >= 1)
      }
      return result
    },
  }
};
</script>
