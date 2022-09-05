<template>
  <div>
    <div v-if="loaded">
      <div v-if="seasonStats.length">

        <player-points-seasons :seasons="seasonStats"></player-points-seasons>

        <h3 class="mt-2">Season {{ seasonStats[0].t }}</h3>
        <v-simple-table v-if="latestSeasonStats">
          <template v-slot:default>
            <tbody>
            <tr>
              <th>Matches</th>
              <td>
                <strong>{{ latestSeasonStats.matches }}</strong><span v-if="pastMatchDays">of {{ pastMatchDays }}</span>
                ({{ latestSeasonStats.startMatches }} from the start)
              </td>
            </tr>
            <tr>
              <th>Minutes played</th>
              <td>
                <strong>{{ latestSeasonStats.secondsPlayed / 60 | numeral }}</strong>minutes
                (<strong class="font-italic">⌀ {{
                  latestSeasonStats.secondsPlayed / 60 / latestSeasonStats.matches | numeral
                }}</strong>mins per game)
              </td>
            </tr>
            <tr>
              <th>Goals</th>
              <td>
                <strong>{{ latestSeasonStats.goals }}</strong>
                (⌀ {{ (latestSeasonStats.goals / latestSeasonStats.matches) | numeral('0.[00]') }} per game,
                on average scores a goal every <strong
                  class="font-italic">{{ latestSeasonStats.secondsPerGoal / 60 | numeral }}</strong>minutes)
              </td>
            </tr>
            <tr>
              <th>Assists</th>
              <td>
                <strong>{{ latestSeasonStats.assists }}</strong>
              </td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
      <div v-else>
        <h2 class="mt-2">no data</h2>
      </div>
    </div>
    <div v-else class="player-points-loader">
      <v-progress-circular
          :width="3"
          color="primary"
          indeterminate
      ></v-progress-circular>
      <span class="player-points-loader__info">Loading</span>
    </div>
  </div>
</template>

<script>
import {mapGetters} from "vuex";
import api from "@/api/api";
import PlayerPointsSeasons from "@/components/Player/PlayerPoints/PlayerPointsSeasons";
import numeral from "numeral";

export default {
  name: "PlayerPointsStatistic",
  components: {PlayerPointsSeasons},
  props: {
    player: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      loaded: false,
      points: [],
    }
  },
  computed: {
    ...mapGetters([
      'getPlayers',
      'getMatches',
      'getNextThreeMatchDays',
    ]),
    pastMatchDays() {
      let playedMatches = null
      if (this.getMatches.length) {
        playedMatches = this.getMatches[0].md
      }
      return playedMatches
    },
    latestSeasonStats() {
      let season = null
      let seasonId = 0
      const playerDetails = this.getPlayers[this.player.id]
      if (playerDetails && playerDetails.seasons && playerDetails.seasons.length) {
        playerDetails.seasons.forEach((seasonObj) => {
          const sId = seasonObj.seasonId * 1
          if (sId > seasonId) {
            season = seasonObj
            seasonId = sId
          }
        })
      }
      return season
    },
    seasonStats() {
      if (this.points && this.points.s && this.points.s.length) {
        let highestPoints = 0
        const seasons = this.points.s

        // add some details, like highest points and missing game days
        const sLength = seasons.length
        seasons.forEach((season, index) => {
          let seasonPoints = 0
          let matches = 0
          let startingFormation = 0
          const playedSeasonGameDays = []
          if (season.m && season.m.length) {
            season.m.forEach((match) => {
              playedSeasonGameDays.push(match.d)
              if (match.p > highestPoints) {
                highestPoints = match.p
              }
              seasonPoints += match.p
              if (match.ms) {
                startingFormation++
              }
              matches++
            })

            season.seasonPoints = seasonPoints
            season.matches = matches
            season.average = numeral(seasonPoints / matches).format('0')
            season.startingFormation = startingFormation

            const missingGameDays = [];
            for (let i = 1; i <= 34; i++) {
              if (playedSeasonGameDays.indexOf(i) === -1) {
                if ((index + 1) === sLength && i >= this.pastMatchDays) {
                  continue;
                }
                missingGameDays.push(i);
              }
            }

            missingGameDays.forEach((matchday) => {
              season.m.push({d: matchday, missed: true})
            })

            season.m.sort((a, b) => {
              if (a.d > b.d) {
                return 1
              } else {
                return -1
              }
            })
          }
        })


        seasons.forEach((season) => {
          season.highestPoints = highestPoints
        })

        // add next match days as a season. hack way, but the easiest/fastest one
        if (this.getNextThreeMatchDays && this.getNextThreeMatchDays.length) {
          const matches = [];

          this.getNextThreeMatchDays.forEach((matchDay) => {
            const match = this.findGameByTeamId(matchDay)

            if (match) {
              matches.push(match)
            }
          })

          if (matches.length) {
            const dummySeason = {
              m: matches,
              t: 'next match days',
              hideSummary: true
            }
            seasons.push(dummySeason)
          }
        }

        return seasons
      } else {
        return []
      }

    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      this.points = await api.loadPlayersPoints(this.player.id)
      this.loaded = true
    },
    findGameByTeamId(matchDay) {
      let v = null

      if (matchDay.m && matchDay.m.length) {
        matchDay.m.forEach((match) => {
          const t1Id = (typeof match.t1 === 'object') ? match.t1.i : match.t1i
          const t2Id = (typeof match.t2 === 'object') ? match.t2.i : match.t2i
          const t1Score = (typeof match.t2 === 'object') ? match.t1.g : match.t1s
          const t2Score = (typeof match.t2 === 'object') ? match.t2.g : match.t2s

          if (t1Id * 1 === this.player.teamId * 1 || t2Id * 1 === this.player.teamId * 1) {
            match.d = matchDay.md
            match.p = 0
            match.t1i = t1Id
            match.t2i = t2Id
            match.t1s = t1Score
            match.t2s = t2Score
            v = match
          }
        })
      }
      return v
    }
  },
}
</script>

<style scoped>

</style>