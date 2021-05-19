<template>
  <div style="width:100%">
    <v-container v-if="getRanking">
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
                rank 1 advantage
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, r) in ranks"
              :key="item.userId"
              :class="{'light-blue lighten-4':(item.userId==getSelf)}"
            >
              <td>{{ r+1 }}.</td>
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

      <v-tabs
          v-model="tab"
          align-with-title
        >
          <v-tabs-slider></v-tabs-slider>

          <v-tab
            v-for="item in trends"
            :key="item"
          >
            {{ item }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
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
    </v-container>
    <spinner v-else></spinner>
  </div>
  
</template>

<script>
import { mapGetters } from 'vuex' 
import api from '../api/api'
import Spinner from './Spinner'
import RankingLineChart from './RankingLineChart'

export default {
  name: 'Ranking',
  components: {
    Spinner,
    RankingLineChart,
  },
  data: () => ({
    tab: 0,
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

            let advantage = 0
            let r1Advantage = 0
            if (cM[i+1]) {
              advantage = element.points - cM[i+1].points
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
    init: function() {
      if (this.getSelf) {
        api.loadRanking(() => {
          
        })
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
    getChartDetailsByKey(key) {
      let addedLabels = false
      const labels = []
      const datasets = []

      this.ranks.forEach((rank) => {
        if (addedLabels === false) {
          for(let x = 1; x <= rank.trends.dayPoints.length; x++) {
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
    // kudos: https://stackoverflow.com/a/16348977/515462
    stringToColor(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let colour = '#';
      for (let i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
      }
      return colour;
    }
  }
};
</script>
