<template>
  <div class="full-width-container">
    <div v-if="getRanking && ranks && ranks.length && getSelf">
      <v-tabs
          v-model="tabMain"
          background-color="blue-grey darken-2"
          dark
          grow
      >
        <v-tab>
          League
        </v-tab>
        <v-tab>
          Detailed Ranking
        </v-tab>
        <v-tab>
          Progression Graphs
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tabMain">
        <v-tab-item>
          <v-expansion-panels multiple accordion class="elevation-2">
            <v-expansion-panel
                v-for="(item) in ranks"
                :key="item.userId"
                class="elevation-4"
            >
              <v-expansion-panel-header>
                <template>
                  <div class="d-flex text-h5 text-lg-h4" style="align-items: center">
                    <div>
                      <strong class="">{{ item.points }}</strong><br/>
                      <small class="d-block text-center text--disabled text-caption">Points</small>
                    </div>
                    <v-avatar v-if="item.user.profile" class="my-2 ma-3">
                      <img
                          :src="item.user.profile"
                      >
                    </v-avatar>
                    <v-avatar v-else class="my-2 ma-3"></v-avatar>
                    {{ item.user.name }}
                  </div>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>

                <v-expansion-panels multiple accordion class="elevation-2" v-if="item.user.model && item.user.model.lineup">
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Lineup ({{ item.user.model.lineup.type }})
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      {{ item.user.model.lineup.type }}: <br>
                      {{ item.user.computedLineup }}
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Players ({{ item.user.playerList.length }})
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <ol>
                        <li v-for="player in item.user.playerList" :key="player.name">
                          {{ player.name }}
                        </li>
                      </ol>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Players per Team
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <table class="kp-table">
                        <tr v-for="(team, n) in item.user.playerPerTeamList"
                            :key="team.teamId">
                          <th style="width: 20px">
                            {{ n + 1 }}.
                            <br>
                            <v-img
                                :src="getTeamImageById(team.teamId)"
                                width="36"
                                height="36"
                                aspect-ratio="1"
                                contain
                            ></v-img>
                          </th>
                          <td>
                            <div>
                              <strong>{{ team.teamName }}: {{ team.players.length }}</strong>
                            </div>
                            <ol>
                              <li v-for="player in team.players"
                                  :key="player.name">
                                {{ player.name }}
                              </li>
                            </ol>
                          </td>
                        </tr>
                      </table>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-tab-item>
        <v-tab-item>
          <v-simple-table class="mb-6">
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-left">
                  #
                </th>
                <th class="text-left d-none d-sm-table-cell">
                </th>
                <th class="text-left">
                  Name
                </th>
                <th class="text-left">
                  total points
                </th>
                <th class="text-left">
                  average points
                </th>
                <th class="text-left">
                  advantage to next rank
                </th>
                <th class="text-left">
                  points to 1st place
                </th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="(item, r) in ranks"
                  :key="item.userId"
                  :class="{'light-blue lighten-4':(item.userId==getSelf)}"
              >
                <td>{{ r + 1 }}.</td>
                <td class="d-none d-sm-table-cell">
                  <v-avatar v-if="item.user.profile" class="my-2">
                    <img
                        :src="item.user.profile"
                    >
                  </v-avatar>
                </td>
                <td>{{ item.user.name }}</td>
                <td>{{ item.points }}</td>
                <td>{{ item.average }}</td>
                <td>{{ item.advantage }}</td>
                <td>{{ item.r1Advantage }}</td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-tab-item>
        <v-tab-item>
          <v-tabs
              v-model="tabPG"
              align-with-title
              background-color="blue-grey darken-3"
              dark
              grow
          >
            <v-tabs-slider></v-tabs-slider>

            <v-tab
                v-for="item in trends"
                :key="item"
            >
              {{ item }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabPG">
            <v-tab-item
                v-for="item in trends"
                :key="item"
            >
              <v-card flat style="height: 500px; position: relative;">
                <div style="height: 500px; position: relative;">
                  <ranking-line-chart
                      :height=500
                      :width=1000
                      :chartdata="getChartDetailsByKey(item)"
                      :options="getChartOptionsByKey(item)"
                  >
                  </ranking-line-chart>
                </div>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-tab-item>
      </v-tabs-items>
    </div>
    <spinner v-else></spinner>
  </div>

</template>

<script>
import {mapGetters, mapMutations} from 'vuex'
import api from '../api/api'
import Spinner from './Spinner'
import RankingLineChart from './RankingLineChart'
import {getBundesligaClubImageUrlById} from "@/helper/helper";

export default {
  name: 'ranking-view',
  components: {
    Spinner,
    RankingLineChart,
  },
  data: () => ({
    tabMain: 0,
    tabPG: 0,
    trends: [
      'placement',
      'dayPoints',
      'dayPlacement',
      'points',
      'teamValue',
    ],
    trendOptions: {
      placement: {
        rankOrder: true
      }
    },
    chartOptions: {
      default: {
        responsive: false,
        scales: {
          yAxes: [{
            ticks: {
              precision: 0,
            }
          }]
        }
      },
      reverse: {
        responsive: false,
        scales: {
          yAxes: [{
            ticks: {
              precision: 0,
              reverse: true
            }
          }]
        }
      },

    }
  }),
  computed: {
    ...mapGetters([
      'getSelf',
      'getRanking',
      'getUsers',
    ]),
    ranks() {
      let table = []

      if (this.getRanking
          && this.getRanking.users && this.getRanking.users.length
          && this.getRanking.matchDays && this.getRanking.matchDays.length
      ) {
        const l = this.getRanking.matchDays.length - 1
        const cM = this.getRanking.matchDays[l].users

        cM.forEach((element, i) => {
          cM[i].average = Math.round(element.points / l)
          const user = this.getRanking.users.filter((user) => user.id === element.userId)
          if (user.length === 1) {

            const cUser = {...user[0]}
            cUser.model = this.getUsers[element.userId]
            cUser.computedLineup = this.getComputedLineupForUser(cUser.model)
            cUser.playerList = this.getComputedPlayerListForUser(cUser.model)
            cUser.playerPerTeamList = this.getComputedPlayerPerTeamListForUser(cUser.model)

            let advantage = 0
            let r1Advantage = 0
            if (cM[i + 1]) {
              advantage = element.points - cM[i + 1].points
            }
            if (i !== 0) {
              r1Advantage = cM[0].points - element.points
            }
            element.advantage = advantage
            element.r1Advantage = r1Advantage

            element.trends = {}
            this.trends.forEach((trend) => {
              element.trends[trend] = []
            })
            this.getRanking.matchDays.forEach((md) => {
              if (md.users && md.users.length) {
                const mdUser = md.users.filter((user) => user.userId === element.userId)
                if (mdUser.length) {
                  this.trends.forEach((trend) => {
                    if (mdUser[0][trend])
                      element.trends[trend].push(mdUser[0][trend])
                  })
                }
              }
            })

            element.user = cUser
          }
        });
        table = cM
      }

      return table
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapMutations(['setRanking']),
    init: async function () {
      this.setRanking(null)
      if (this.getSelf) {
        const users = Object.keys(this.getUsers)
        for (let i = 0; i < users.length; i++) {
          const user = users[i]
          await api.loadUsersLineup(user)
          await api.loadUsersPlayers(user, false)
        }
        await api.loadRanking()
      } else {
        window.setTimeout(this.init, 1000)
      }
    },
    sort(a, b) {
      if (a.points < b.points) {
        return 1;
      }
      if (a.points > b.points) {
        return -1;
      }
      return 0;
    },
    getChartOptionsByKey(key) {
      if (key === 'dayPlacement' || key === 'placement') {
        return this.chartOptions.reverse
      }
      return this.chartOptions.default
    },
    getComputedLineupForUser(userModel) {
      const returnValStack = []
      if (userModel
          && userModel.players
          && userModel.players.length
          && userModel.lineup
          && userModel.lineup.players
          && userModel.lineup.players.length) {
        userModel.lineup.players.forEach((playerId) => {
          userModel.players.forEach((player) => {
            if (player.id === playerId) {
              if (player.knownName) {
                returnValStack.push(player.knownName)
              } else {
                returnValStack.push(player.lastName)
              }
            }
          })
        })
      }
      return returnValStack.join(' - ')
    },
    getComputedPlayerPerTeamListForUser(userModel) {
      const players = this.getComputedPlayerListForUser(userModel)
      const teams = {}
      players.forEach((player) => {
        if (teams[player.teamId]) {
          teams[player.teamId].players.push(player)
        } else {
          teams[player.teamId] = {
            teamId: player.teamId,
            teamName: player.teamName,
            players: [player]
          }
        }
      })
      const teamArray = []
      Object.keys(teams).forEach((teamId) => {
        teamArray.push(teams[teamId])
      })
      teamArray.sort(function (a, b) {
        const teamA = a.players.length
        const teamB = b.players.length
        if (teamA > teamB) {
          return -1
        }
        if (teamA < teamB) {
          return 1
        }
        return 0
      })
      return teamArray
    },
    getComputedPlayerListForUser(userModel) {
      const returnValStack = []

      if (userModel
          && userModel.players
          && userModel.players.length) {
        const players = userModel.players
        players.sort(function (a, b) {
          if (a.position > b.position) {
            return 1
          }
          if (a.position < b.position) {
            return -1
          }
          return 0
        })

        players.forEach((player) => {
          if (player.knownName) {
            returnValStack.push({name: player.knownName, teamId: player.teamId, teamName: player.teamName})
          } else {
            returnValStack.push({
              name: player.firstName + " " + player.lastName,
              teamId: player.teamId,
              teamName: player.teamName
            })
          }
        })

      }

      return returnValStack
    },
    getTeamImageById(teamId) {
      return getBundesligaClubImageUrlById(teamId)
    },
    getChartDetailsByKey(key) {
      let addedLabels = false
      const labels = []
      const datasets = []

      this.ranks.forEach((rank) => {
        if (addedLabels === false) {
          for (let x = 1; x <= rank.trends.dayPoints.length; x++) {
            labels.push(x)
          }
          addedLabels = true
        }

        const data = {
          label: rank.user.name,
          borderColor: this.stringToColor(rank.user.name),
          data: rank.trends[key],
          borderWidth: 3,
          lineTension: 0,
          fill: false,
        }

        datasets.push(data)
      })
      return {
        labels,
        datasets
      }
    },
    // kudos: https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
    stringToColor(str) {
      var colors = [
        "#e51c23",
        "#e91e63",
        "#791335",
        "#9c27b0",
        "#2c0835",
        "#673ab7",
        "#3f51b5",
        "#5677fc",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#259b24",
        "#99d798",
        "#12ff12",
        "#8bc34a",
        "#afb42b",
        "#ff9800",
        "#ff5722",
        "#9d2f0c",
        "#795548",
        "#ee00ff",
        "#607d8b",
        "#0988c5",
        "#132127",
      ]

      var hash = 0;
      if (str.length === 0) return hash;
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
      }
      hash = ((hash % colors.length) + colors.length) % colors.length;
      return colors[hash];
    }
  }
};
</script>
