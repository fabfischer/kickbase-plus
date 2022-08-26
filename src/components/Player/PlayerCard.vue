<template>
  <v-card
      class="elevation-6 pa-4 mt-5 player-card"
  >
    <div v-if="hasPreHeadSlot" class="player-card__pre-head">
      <div class="player-card__pre-head__content">
        <slot name="pre-head"></slot>
      </div>
    </div>
    <div class="player-card-content-wrapper">
      <div class="player-card-meta" >
        <div class="player-card-meta__content">
          <div class="player-card__image">
            <v-img :src="teamImage" aspect-ratio="1" class="player-card__team-image">
            </v-img>
            <v-img :src="getPlayerImage" aspect-ratio="1" class="hidden-xs-only player-card__player-image">
              <template v-slot:placeholder>
                <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                >
                  <v-icon size="128">
                    fa-user-alt
                  </v-icon>
                </v-row>
              </template>
            </v-img>
          </div>
          <div class="player-card-meta__item" v-if="hidePlayerStatus === false">
            <status-pill :player="player"></status-pill>
          </div>
          <div class="player-card-meta__item player-card-meta__item--sm-fourth" v-if="hidePlayerMarketValue === false">
            <v-alert type="info" dense text icon="fa-euro-sign" class="mb-0">
              {{ getComputedPrice }} (MV)
            </v-alert>
          </div>
          <div class="player-card-meta__item player-card-meta__item--sm-third">
            <v-alert :color="getGrowthColor" dense text :icon="getGrowthIcon" class="mt-0">{{
                getDiffMV | numeral('0,0 $')
              }} (growth)
            </v-alert>
          </div>
          <div class="player-card-meta__item player-card-meta__item--sm-fifth" v-if="hidePlayerPoints === false">
            <v-alert :color="genericInfoFieldColor" dense text icon="fa-poll">
              ⌀ {{ player.averagePoints }} / {{ player.totalPoints }}
            </v-alert>
          </div>
          <div class="player-card-meta__item player-card-meta__item--sm-fifth" v-if="hidePlayerPosition === false">
            <v-alert :color="genericInfoFieldColor" dense text icon="fa-futbol">{{ getPosition }}</v-alert>
          </div>
        </div>
      </div>

      <div class="player-card-slot" ref="playerCardContent">
        <div class="player-card-head">
          <h2 class="text-h5 text-sm-h4 mb-3 font-weight-bold">
            <span v-if="player.knownName">{{ player.knownName }}</span>
            <span v-else>{{ player.firstName }} {{ player.lastName }}</span>
            <span class="hidden-xs-only caption">(#{{ player.id }})</span>
          </h2>
        </div>
        <slot></slot>

        <div :class="statsCssClass">
          <v-expansion-panels accordion focusable class="elevation-1 player-card-accordion">
            <slot name="extra-expansion-panel"></slot>
            <v-expansion-panel
                v-if="showPurchaseStatistic"
            >
              <v-expansion-panel-header class="elevation-0">
                <v-icon class="mr-2 player-card-accordion__icon" color="teal darken-2">fa-search-dollar</v-icon>
                purchase statistics
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-data-table
                    :headers="getPlayerStatistics.headers"
                    :items="getPlayerStatistics.values"
                    :hide-default-footer="true"
                    class="elevation-1"
                ></v-data-table>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel
            >
              <v-expansion-panel-header class="elevation-0">
                <v-icon class="mr-2 player-card-accordion__icon" color="blue lighten-2">fa-chart-line</v-icon>
                market value trend
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <player-market-value-trend :player="player"></player-market-value-trend>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
        <v-btn @click="toggleStatistics" class="hidden-sm-and-up">
          <span v-if="statsCssClass === initStatsCssClass">show</span>
          <span v-else>hide</span>
          &nbsp;statistics
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
import {mapGetters} from "vuex";

import StatusPill from "../StatusPill";
import numeral from "numeral";
import PlayerMarketValueTrend from "./PlayerMarketValueTrend";

export default {
  name: "PlayerCard",
  components: {
    StatusPill,
    PlayerMarketValueTrend,
  },
  props: {
    player: {
      required: true,
      type: Object
    },
    hideMeta: {
      type: Boolean,
      required: false,
      default: false,
    },
    hidePlayerStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    hidePlayerPosition: {
      type: Boolean,
      required: false,
      default: false,
    },
    hidePlayerPoints: {
      type: Boolean,
      required: false,
      default: false,
    },
    hidePlayerMarketValue: {
      type: Boolean,
      required: false,
      default: false,
    },
    showPurchaseStatistic: {
      type: Boolean,
      required: false,
      default: true,
    }
  },
  data() {
    return {
      statsCssClass: 'hidden-xs-only',
      initStatsCssClass: null,
      playerMetaWidth: null,
    }
  },
  mounted() {
    this.initStatsCssClass = this.statsCssClass
    this.determinePlayerMetaWidth()
  },
  computed: {
    ...mapGetters([
      'getPlayers',
    ]),
    hasPreHeadSlot() {
      return !!this.$slots['pre-head']
    },
    getPlayerImage() {
      return `https://kkstr.s3.amazonaws.com/pool/playersbig/${this.player.id}.png`
    },
    getComputedPrice() {
      return numeral(this.player.price).format('0,0')
    },
    getGrowthColor() {
      let positive = '#2a5b2a'
      let negative = '#682828'
      if (this.$vuetify.theme.dark) {
        positive = '#afd3af'
        negative = '#e6b6b6'
      }
      return (this.getDiffMV > 0) ? positive : negative
    },
    getGrowthIcon() {
      return (this.getDiffMV > 0) ? 'fa-caret-up' : 'fa-caret-down'
    },
    getPlayerStatistics() {
      return {
        headers: [
          {
            'text': 'Stat',
            'value': 'stat',
            'sortable': false,
          },
          {
            'text': '',
            'value': 'value',
            'sortable': false,
          },
        ],
        values: [
          {
            'stat': 'Profit',
            'value': numeral(this.getDiffPurchasePrice).format('0,0')
          },
          {
            'stat': 'Growth to today',
            'value': numeral(this.getDiffMV).format('0,0')
          },
          {
            'stat': 'Current market value',
            'value': numeral(this.player.marketValue).format('0,0')
          },
          {
            'stat': 'Last market value',
            'value': numeral(this.getYesterdaysMV).format('0,0')
          },
          {
            'stat': 'Purchase price',
            'value': numeral(this.getPlayersPurchaseSum).format('0,0')
          },
          {
            'stat': 'Market value change since purchase',
            'value': numeral(this.getPlayersMarketValueChange).format('0,0')
          },
        ]
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
    getYesterdaysMV() {
      if (
          this.getPlayers[this.player.id]
          && this.getPlayers[this.player.id].marketValues.length > 3
      ) {
        return this.getPlayers[this.player.id].marketValues[this.getPlayers[this.player.id].marketValues.length - 2].m
      }
      return null
    },
    getDiffMV() {
      if (
          this.getPlayers[this.player.id]
          && this.getPlayers[this.player.id].marketValues
          && this.getPlayers[this.player.id].marketValues[this.getPlayers[this.player.id].marketValues.length - 1]
          && this.getPlayers[this.player.id].marketValues[this.getPlayers[this.player.id].marketValues.length - 2]
      ) {
        return this.getPlayers[this.player.id].marketValues[this.getPlayers[this.player.id].marketValues.length - 1].m - this.getPlayers[this.player.id].marketValues[this.getPlayers[this.player.id].marketValues.length - 2].m
      }
      return null
    },
    getDiffPurchasePrice() {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer && this.player.offers) {
        return this.player.offers[0].price - this.getPlayers[this.player.id].leaguePlayer.buyPrice
      }
      return null
    },
    getPlayersPurchaseMVDiff() {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer) {
        return this.player.marketValue - this.getPlayers[this.player.id].leaguePlayer.buyPrice
      }
      return null
    },
    getPlayersMarketValueChange() {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer) {
        return this.getPlayers[this.player.id].leaguePlayer.marketValueChange
      }
      return null
    },
    getPlayersPurchaseSum() {
      if (this.getPlayers[this.player.id] && this.getPlayers[this.player.id].leaguePlayer) {
        return this.getPlayers[this.player.id].leaguePlayer.buyPrice
      }
      return null
    },
    genericInfoFieldColor() {
      return (this.$vuetify.theme.dark) ? '#ccc' : '#2A3B4D'
    },
  },
  methods: {
    toggleStatistics() {
      if (this.statsCssClass === this.initStatsCssClass) {
        this.statsCssClass = null
      } else {
        this.statsCssClass = this.initStatsCssClass
      }
    },
    determinePlayerMetaWidth() {
      if (this.$refs.playerCardContent) {
        this.playerMetaWidth = this.$refs.playerCardContent.offsetWidth
      }
    }
  }
}
</script>