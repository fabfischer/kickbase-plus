<template>
  <div>
    <v-data-table
        :headers="getLastDayChanges.headers"
        :items="getLastDayChanges.values"
        :hide-default-footer="true"
        class="elevation-1"
        v-if="getLastDayChanges"
    ></v-data-table>
    <div v-else class="stats-loading">
    </div>
    <v-btn block v-on:click="fetchData">fetch data again</v-btn>
  </div>
</template>

<script>
import moment from "moment";
import numeral from "numeral";
import api from "../../api/api";
import {mapGetters} from "vuex";


export default {
  name: "PlayerMarketValueTrend",
  props: {
    player: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {}
  },
  mounted() {
  },
  computed: {
    ...mapGetters([
      'getPlayers',
    ]),
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
        if (mv && mv.length) {
          for (let y = mv.length; y >= (mv.length - 21); y--) {
            if (mv[y]) {
              const date = moment(mv[y].d)
              values.labels.push(date.format('DD MM'))
              values.datasets[0].data.push(mv[y].m)
            }
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
  },
  methods: {
    fetchData() {
      api.loadPlayersStats(this.player.id)
    },
  }
}
</script>

<style scoped>

</style>