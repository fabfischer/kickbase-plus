<template>
  <v-container>
    <div v-if="getPlayer && getPlayer.length">
      <v-card style="margin-bottom: 20px;" v-for="player in getPlayer" :key="player.id">
        <div class="d-flex flex-no-wrap justify-space-between">
        <v-list-item three-line>
          <v-list-item-content>
            <v-row no-gutters>
              <v-col>
                <v-list-item-title class="headline mb-1 wrap-title">
                  <span v-html="player.n"></span>
                </v-list-item-title>
              </v-col>
              <v-col>
                <v-list-item-title class="headline mb-1 wrap-title">
                    {{player.t}} / {{player.st}}
                </v-list-item-title>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col>
                <v-data-table
                  :headers="headers"
                  :items="player.pl"
                  :options="options"
                  :mobile-breakpoint="0"
                  class="elevation-1"
                  hide-default-footer
                ></v-data-table>
              </v-col>
            </v-row>
          
          </v-list-item-content>
        </v-list-item>
        </div>
      </v-card>
    </div>
    <spinner v-else></spinner>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex' 
import api from '../api/api'
import numeral from 'numeral'
numeral.locale('deff')

import Spinner from './Spinner'

export default {
  name: 'live-view',
  components: {
    Spinner,
  },
  data: () => ({
    headers: [
          {
            text: 'Firstname',
            align: 'start',
            value: 'fn',
          },
          { text: 'Lastname', value: 'n' },
          { text: 'Nr', value: 'nr', mobile: false, align: ' d-none d-md-table-cell' },
          { text: 'Yellow-Card', value: 'y', mobile: false, align: ' d-none d-md-table-cell' },
          { text: 'Yellow/Red-Card', value: 'yr', align: ' d-none d-md-table-cell' },
          { text: 'Red-Card', value: 'r', align: ' d-none d-md-table-cell' },
          { text: 'Assits', value: 'a', align: ' d-none d-md-table-cell' },
          { text: 'Goal', value: 'g', align: ' d-none d-md-table-cell' },
          { text: 'position', value: 'p', align: ' d-none d-md-table-cell' },
          { text: 's', value: 's', align: ' d-none d-md-table-cell' },
          { text: 'tid', value: 'tid', align: ' d-none d-md-table-cell' },
          { text: 'Points', value: 't' },

        ],
    options: {
      itemsPerPage: 100,
      body: {
        isMobile: false,
      }
    }
  }
  ),
  computed: {
    ...mapGetters(['getLiveData']),
    getPlayer() {
      if (this.getLiveData && this.getLiveData.u && this.getLiveData.u.length) {
        const pl = this.getLiveData.u
        pl.sort((a, b)=>{
          if (a.t > b.t) {
            return -1
          } else if(a.t < b.t) {
            return 1
          }
          if (a.t === b.t) {
            if (a.st > b.st) {
              return -1
            } else if(a.st < b.st) {
              return 1
            }
          }
          return 0
        })
        return pl
      }
      return []
    }
  },
  mounted() {
    window.setTimeout(() => {
      api.loadGlobalLiveData()
    }, 2000)
  },
  methods: {
  }
};
</script>
