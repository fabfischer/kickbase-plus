<template>
  <player-card
      :class="{'offer--high':player.hasHighOffer, 'offer--low':player.hasLowOffer}"
      :player="player"
      :hide-player-status="hidePlayerCardDetail"
      :hide-player-position="hidePlayerCardDetail"
      :hide-player-points="hidePlayerCardDetail"
      :hide-meta="hideMeta"
      v-if="show"
  >
    <v-card
        v-for="offer in player.offers"
        :key="offer.id"
        class="mb-6 elevation-0 offer"
        :class="(isAnHighOffer(offer)) ? 'offer--high' : 'offer--low'"
    >
      <v-card-text>
        <p class="mb-0" v-if="hasNonCPUOffers(player)===true">
              <span v-if="offer.userName">
                {{ offer.userName }}
              </span>
          <span v-else>KICKBASE</span>
        </p>
        <p class="text-subtitle-1 text-sm-h5 text--primary mb-0">
          <strong>{{ getOffer(offer) }}</strong> |
          <span class="text-caption text-sm-body-1">
            <span v-if="offer.userName">from {{ offer.date | expiry }}</span>
            <span v-else>
              <span class="hidden-xs-only">expires</span>
              <span class="hidden-sm-and-up">exp.</span>
              {{ offer.validUntilDate | expiry }}
            </span>
          </span>
        </p>
        <div class="text-subtitle-2 text-sm-h6 text--primary mb-0 d-flex align-center">
          <span class="profit-info" :class="(isAnHighOffer(offer)) ? 'profit-info--green' : 'profit-info--red'">
            Offer: {{ calcOffer(offer, player.marketValue) | numeral('0,0 $') }} ({{ percent(offer) }}%)
          </span>
          <span class="profit-info" :class="(profit(offer) > 1) ? 'profit-info--green' : 'profit-info--red'">
            Profit: {{ profit(offer) | numeral('0,0 $') }}
          </span>
        </div>
      </v-card-text>
      <v-card-actions>
        <accept-button :offer="offer" :player="player" :is-high-offer="isAnHighOffer(offer)"
                       v-on:acceptOffer="acceptOffer"></accept-button>
      </v-card-actions>
    </v-card>

    <div class="mb-5">
      <v-btn v-if="hasOffer(player)" class="kp-button kp-button__decline-all"  x-large block @click="removePlayerFromMarket(player)">
        <v-icon left>fa-times</v-icon>
        DECLINE <span v-if="hasNonCPUOffers(player)===true">&nbsp;ALL&nbsp;</span> AND ADD AGAIN
      </v-btn>
    </div>
  </player-card>
</template>

<script>
import numeral from 'numeral'
import moment from 'moment'
import {mapGetters, mapMutations} from "vuex";

numeral.locale('deff')

import AcceptButton from './AcceptButton'
import api from "../../api/api";
import PlayerCard from "../Player/PlayerCard";
import {isHighOffer, getCalcOffer, getPercent, sleep} from "@/helper/helper";

export default {
  name: "offer-player-item",
  components: {
    PlayerCard,
    AcceptButton,
  },
  data: () => ({
  }),
  props: {
    player: {
      required: true,
      type: Object
    },
    showPlayerWithTooLowOffersOnly: {
      required: false,
      default: false,
      type: Boolean
    },
    hideMeta: {
      required: false,
      default: false,
      type: Boolean
    },
  },
  filters: {
    expiry: (validUntilDate) => {
      const m = moment(validUntilDate)
      return m.fromNow()
    }
  },
  computed: {
    ...mapGetters(['getSelf', 'getPlayersOfMe', 'getLeague', 'getPlayers', 'getOfferThreshold']),
    show() {
      return (!this.showPlayerWithTooLowOffersOnly || (this.showPlayerWithTooLowOffersOnly && this.player.hasLowOffer))
    },
    hidePlayerCardDetail() {
      return false //(!this.player.offers || (this.player.offers & this.player.offers.length === 0)) === true
    },
  },
  methods: {
    ...mapMutations(['addLoadingMessage', 'setLoading', 'resetLoading']),
    calcOffer(offer, marketValue) {
      return getCalcOffer(offer, marketValue)
    },
    percent(offer) {
      return getPercent(this.player, offer)
    },
    isAnHighOffer(offer) {
      return isHighOffer(this.player, offer, this.getOfferThreshold)
    },
    hasNonCPUOffers(offer) {
      return offer.offers.filter((o) => o.userName).length > 0
    },
    getOffer(offer) {
      return numeral(offer.price).format('0,0 $')
    },
    hasOffer(player) {
      return (player.offers && player.offers.length)
    },
    profit(offer) {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer) {
        return offer.price - this.getPlayers[this.player.id].leaguePlayer.buyPrice
      }
      return null
    },
    removePlayerFromMarket(player) {
      if (this.player.hasHighOffer) {
        if (window.confirm('Add player "' + player.firstName + ' ' + player.lastName + '" to the transfer market again despite high offer?')) {
          this.setPlayerOnMarketAgain(player)
        }
      } else {
        this.setPlayerOnMarketAgain(player)
      }
    },

    async setPlayerOnMarketAgain(player) {
      /*this.setLoading(true)
      await api.removePlayerFromMarket(player)
      await sleep(500);
      await api.putOnMarket(player)
      // await api.loadUsersPlayerOffers(this.setPlayers)
      await sleep(500);
      await api.loadUsersPlayerOffers((d) => {
        this.$emit('setPlayers', d)
      })*/
      api.setPlayerOnMarketAgain(player, (d) => {
        this.$emit('setPlayers', d)
      })
    },

    async acceptOffer(payload) {
      this.setLoading(true)
      await api.acceptBids(payload.offer)
      await sleep(500);
      await api.loadUsersPlayer(this.getSelf, false)
      await sleep(500);
      await api.loadUsers(false)
      await api.loadUsersPlayerOffers((d) => {
        this.$emit('setPlayers', d)
      })
    }
  }
}
</script>