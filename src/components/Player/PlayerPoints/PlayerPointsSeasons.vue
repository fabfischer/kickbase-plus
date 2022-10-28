<template>
  <div class="player-points" ref="seasons">
    <div class="player-points__season" v-for="season in seasons" :key="season.i">
      <div class="player-points__title">
        <span>{{ season.t }}</span>
      </div>
      <div class="player-points__matches">
        <div class="player-points__match" v-for="match in season.m" :key="season.i + '-' + match.d">
          <div class="player-points__match__day">
            <strong>{{ match.d }}.</strong><br>match day
          </div>
          <div class="player-points__match__missed_bar" v-if="match.missed">
            <v-icon color="white" class="mt-1" size="16">fa-ban</v-icon>

            <span>
                  missed match day
                </span>
          </div>
          <template v-else>
            <div
                class="player-points__match__bar"
            >
              <div
                  :style="{height:calculateBarIndicatorHeight(match.p, season.highestPoints)}"
                  class="player-points__match__bar__indicator"
                  :class="[getIndicatorCssClass(match.p)]"
              >
                <template v-if="match.g > 0">
                  <v-icon class="mb-1" size="16" color="white" v-for="g in match.g" :key="'goal-' + g">fa-futbol
                  </v-icon>
                </template>
                <template v-if="match.a > 0">
                  <v-icon class="mb-1" size="16" color="white" v-for="a in match.a" :key="'assist-' + a">fa-star
                  </v-icon>
                </template>
              </div>
            </div>
            <div class="player-points__match__points">
              {{ match.p }}
            </div>
            <div class="player-points__match__game-details">
              <div class="player-points__match__game-details__logos">
                <v-img :src="getTeamImageById(match.t1i)" max-width="24" max-height="24"></v-img>
                <v-img :src="getTeamImageById(match.t2i)" max-width="24" max-height="24"></v-img>
              </div>
              <div class="player-points__match__game-details__result">
                {{ match.t1s }}:{{ match.t2s }}
              </div>
            </div>

            <div class="player-points__match__minutes">
              <span v-if="match.sp > 0">
              {{ match.sp / 60 | numeral }}'
              </span>
              <span v-else>
                0'
              </span>
            </div>
          </template>
        </div>
        <div class="player-points__season__summary" v-if="!season.hideSummary">
          <v-icon size="32">fa-star</v-icon>
          <div class="player-points__season__summary__part">
            <strong>{{ season.t }}</strong>
            summary
          </div>
          <div class="player-points__season__summary__part">
            <strong>{{ season.seasonPoints }}</strong>
            points
          </div>
          <div class="player-points__season__summary__part">
            <strong>{{ season.average }}</strong>
            ∅ points
          </div>
          <div class="player-points__season__summary__part">
            <strong>{{ season.matches }}</strong>
            matches
          </div>
          <div class="player-points__season__summary__part">
            <strong>{{ season.startingFormation }}</strong>
            starting formation
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getBundesligaClubImageUrlById} from "@/helper/helper";

export default {
  name: "PlayerPointsSeasons",
  props: {
    seasons: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.$refs.seasons.scrollLeft = this.$refs.seasons.scrollWidth
  },
  methods: {
    getTeamImageById(id) {
      return getBundesligaClubImageUrlById(id)
    },
    calculatePointsPercentage(points, highestPoints) {
      if (!points || points === 0) {
        return 0;
      }
      return Math.floor((points / highestPoints) * 100)
    },
    calculateBarIndicatorHeight(points, highestPoints) {
      const p = this.calculatePointsPercentage(points, highestPoints)
      const sub = (p > 95) ? 10 : 0;
      return (p - sub) + '%'
    },
    getIndicatorCssClass(points) {
      if (points > 100) {
        return 'player-points__match__bar__indicator--green'
      } /*else if (p > 33) {
        return 'player-points__match__bar__indicator--yellow'
      }*/
      return 'player-points__match__bar__indicator--red'
    }
  }
}
</script>

<style scoped>

</style>