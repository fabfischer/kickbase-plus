<template>
  <div>
    <v-container v-if="lineup && lineup.length">
      <v-banner
        single-line
      >
        current formation: {{ formation }}

        <template v-slot:actions>
          <v-select
            :items="possibleFormations"
            filled
            label="change formation"
            color="primary"
            v-model="selectedFormation"
            @change="changeFormation"
          ></v-select>
        </template>
      </v-banner>
      <div class="field">
        <div class="position__container position--forwards">
          <lineup-item
            v-for="forward in lineupBlocks.forwards"
            :key="forward.id"
            :item="forward"
            :matches="matches"
            v-on:openChangeDialog="openChangeDialog"
          ></lineup-item>
        </div>
        <div class="position__container position--midfielders">
          <lineup-item
            v-for="midfielder in lineupBlocks.midfielders"
            :key="midfielder.id"
            :item="midfielder"
            :matches="matches"
            v-on:openChangeDialog="openChangeDialog"
          ></lineup-item>
        </div>
        <div class="position__container position--defenders">
          <lineup-item
            v-for="defender in lineupBlocks.defenders"
            :key="defender.id"
            :item="defender"
            :matches="matches"
            v-on:openChangeDialog="openChangeDialog"
          ></lineup-item>
        </div>
        <div class="position__container position--goalie">
          <lineup-item
            v-for="goalie in lineupBlocks.goalie"
            :key="goalie.id"
            :item="goalie"
            :matches="matches"
            v-on:openChangeDialog="openChangeDialog"
          ></lineup-item>
        </div>
        
      </div>

      <div class="h4 mt-4">Goalies</div>
      <lineup-table :items="goalies"></lineup-table>
      <div class="h4 mt-4">Defenders</div>
      <lineup-table :items="defenders"></lineup-table>
      <div class="h4 mt-4">Midfielders</div>
      <lineup-table :items="midfielders"></lineup-table>
      <div class="h4 mt-4">Forwards</div>
      <lineup-table :items="forwards"></lineup-table>

      <v-dialog
        v-model="lineUpDialog.show"
        width="75%"
      >
        <v-card>
          <v-card-title class="headline black white--text">
            change position: {{ positionName(lineUpDialog.position) }}
          </v-card-title>

          <v-card-text>
            <div class="change-line-up__container">
              <div class="change-line-up__container__column">
                <h3>current player</h3>
                <div v-if="lineUpDialog.player && lineUpDialog.player.lastName">
                  <h2>{{ playerName(lineUpDialog.player) }}</h2>
                  <span v-if="playerVs(lineUpDialog.player)"  class="vsInfo vsInfo--left">
                    vs: <img :src="playerVs(lineUpDialog.player).img" class="vsTeam" /> {{ playerVs(lineUpDialog.player).abbr }}
                  </span> 
                  <div class="change-line-up__player">
                    <status-pill :player="lineUpDialog.player"></status-pill>
                    <div v-if="playerImg(lineUpDialog.player)" class="change-line-up__img">
                      <img :src="playerImg(lineUpDialog.player)" />
                    </div>
                    <div v-if="playerTeamImg(lineUpDialog.player)" class="change-line-up__img change-line-up__img--logo">
                      <img :src="playerTeamImg(lineUpDialog.player)" />
                    </div>
                  </div>
                </div>
                <div v-else>
                  no player selected yet
                </div>
              </div>
              <div class="change-line-up__container__column">
                <h3>
                  other {{ positionName(lineUpDialog.position) }} player<br>
                  <small>(not already in line-up)</small>
                </h3>
                <div
                  class="change-line-up__other-player"
                  v-for="otherPlayer in otherPlayer(lineUpDialog.player)"
                  :key="otherPlayer.id"
                >
                  <v-btn block color="deep-purple darken-3 white--text" x-large @click="saveLineup(lineUpDialog.player, otherPlayer)">
                    {{ playerName(otherPlayer) }}
                    <img :src="playerTeamImg(otherPlayer)" v-if="playerTeamImg(otherPlayer)" />
                    <status-pill :player="otherPlayer"></status-pill>
                    <span v-if="playerVs(otherPlayer)"  class="vsInfo vsInfo--dark">
                        vs: <img :src="playerVs(otherPlayer).img" class="vsTeam" /> {{ playerVs(otherPlayer).abbr }}
                    </span> 
                  </v-btn>
                </div>
                <v-btn v-if="lineUpDialog.player && lineUpDialog.player.id" block color="red darken-3 white--text" x-large @click="saveLineup(lineUpDialog.player, {position:lineUpDialog.player.position})">
                    reset position 
                  </v-btn>
              </div>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn
              color="secondary"
              @click="closeChangeDialog"
            >
              cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
    <spinner v-else></spinner>
  </div>
  
</template>

<script>
import api from '../api/api'
import moment from 'moment'
import { mapGetters, mapMutations } from 'vuex'

import StatusPill from './StatusPill'
import Spinner from './Spinner'
import LineupItem from './LineupItem'
import LineupTable from './LineupTable'
import { nextMatch } from '../helper/helper'

export default {
  name: 'lineup-component',
  components: {
    LineupTable,
    LineupItem,
    StatusPill,
    Spinner,
  },
  data: () => ({
    formation: null,
    selectedFormation: null,
    possibleFormations: [
      '3-4-3',
      '3-5-2',
      '3-6-1',
      '4-2-4',
      '4-3-3',
      '4-4-2',
      '4-5-1',
      '5-2-3',
      '5-3-2',
      '5-4-1',
    ],
    lineup: [],
    lineupBlocks: {
      goalie: [],
      defenders: [],
      midfielders: [],
      forwards: []
    },
    players: [],
    positions: {
      goalie: 1,
      defenders: 0,
      midfielders: 0,
      forwards: 0
    },
    matches: [],
    lineUpDialog: {
      show: false,
      position: '',
      player: null,
    },
    
  }),
  computed: {
    ...mapGetters([
      'getLeague',
      'getSelf',
    ]),
    goalies() {
      let goalies = []
      if (this.players.length) {
        goalies = this.players.filter((item) => item.position === 1).sort(this.sort)
      }
      return goalies
    },
    defenders() {
      let defenders = []
      if (this.players.length) {
        defenders = this.players.filter((item) => item.position === 2).sort(this.sort)
      }
      return defenders
    },
    midfielders() {
      let midfielders = []
      if (this.players.length) {
        midfielders = this.players.filter((item) => item.position === 3).sort(this.sort)
      }
      return midfielders
    },
    forwards() {
      let forwards = []
      if (this.players.length) {
        forwards = this.players.filter((item) => item.position === 4).sort(this.sort)
      }
      return forwards
    },
    linedUpGoalie() {
      const players = []
      if (this.goalies.length) {
        if (this.lineup.length) {
          this.lineup.forEach((id) => {
            this.goalies.forEach(player => {
              if (id === player.id) {
                players.push(player)
              }
            });
          })
        }
      }
      const oLength = players.length
      if (oLength < this.positions.goalie) {
        for(let x = 0; x < this.positions.goalie - oLength; x++) {
          players.push({position: 1})
        }
      }
      return players
    },
    linedUpDefenders() {
      const players = []
      if (this.defenders.length) {
        if (this.lineup.length) {
          this.lineup.forEach((id) => {
            this.defenders.forEach(player => {
              if (id === player.id && players.length < this.positions.defenders) {
                players.push(player)
              }
            });
          })
        }
      }
      const oLength = players.length
      if (oLength < this.positions.defenders) {
        for(let x = 0; x < this.positions.defenders - oLength; x++) {
          players.push({position: 2})
        }
      }
      return players
    },
    linedUpMidfielders() {
      const players = []
      if (this.midfielders.length) {
        if (this.lineup.length) {
          this.lineup.forEach((id) => {
            this.midfielders.forEach(player => {
              if (id === player.id && players.length < this.positions.midfielders) {
                players.push(player)
              }
            });
          })
        }
      }
      const oLength = players.length
      if (oLength < this.positions.midfielders) {
        for(let x = 0; x < this.positions.midfielders - oLength; x++) {
          players.push({position: 3})
        }
      }
      return players
    },
    linedUpForwards() {
      const players = []
      if (this.forwards.length) {
        if (this.lineup.length) {
          this.lineup.forEach((id) => {
            this.forwards.forEach(player => {
              if (id === player.id && players.length < this.positions.forwards) {
                players.push(player)
              }
            });
          })
        }
      }
      const oLength = players.length
      if (oLength < this.positions.forwards) {
        for(let x = 0; x < this.positions.forwards - oLength; x++) {
          players.push({position: 4})
        }
      }
      return players
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    ...mapMutations([
      'setLoading'
    ]),
    init: function() {
      if (this.getSelf) {
        this.loadLineup()

        api.loadMatches(null, (data) => {
          if (data.m && data.m.length) {
            const lastMatch = data.m[data.m.length - 1]
            if (moment(lastMatch.d).isSameOrAfter(new Date(), 'day') === true) {
              this.matches = data.m
            } else {
              const nextMatchday = data.cmd + 1
              if (nextMatchday <= 34) {
                api.loadMatches(nextMatchday, (data) => {
                  if (data.m && data.m.length) {
                    this.matches = data.m
                  }
                })
              }
            }
          }
        })
      } else {
        window.setTimeout(this.init, 1000)
      }
    },
    loadLineup() {
      api.loadLineup((data) => {
        this.parseLineup(data)
      })
    },
    parseLineup(data) {
      if (data.type === undefined) {
        this.formation = '3-5-2'
        const dummy = {position:'dummy'}
        this.lineupBlocks.goalie = [null]
        this.lineupBlocks.defenders = [null,null,null]
        this.lineupBlocks.midfielders = [null,null,null,null,null]
        this.lineupBlocks.forwards = [null,null]
        this.saveLineup({}, dummy)
      }
      else if(data.lineup && data.players) {
        this.players = data.players

        if (data.type) {
          this.formation = data.type
          const positions = this.formation.split('-')
          this.positions.defenders = positions[0] * 1
          this.positions.midfielders = positions[1] * 1
          this.positions.forwards = positions[2] * 1
        }
        this.lineup = data.lineup

        this.lineupBlocks.goalie = this.linedUpGoalie
        this.lineupBlocks.defenders = this.linedUpDefenders
        this.lineupBlocks.midfielders = this.linedUpMidfielders
        this.lineupBlocks.forwards = this.linedUpForwards
      }
    },
    sort(a, b) {
      if (a.totalPoints < b.totalPoints) {
        return 1;
      }
      if (a.totalPoints > b.totalPoints) {
        return -1;
      }
      return 0;
    },
    openChangeDialog(data) {
      this.lineUpDialog.show = true
      this.lineUpDialog.position = data.player.position
      this.lineUpDialog.player = data.player
    },
    closeChangeDialog() {
      this.lineUpDialog.show = false
      this.lineUpDialog.position = null
      this.lineUpDialog.player = null
    },
    changeFormation() {
      this.formation = this.selectedFormation
      this.saveLineup({},{position:'dummy'})
    },
    saveLineup(oldPlayer, newPlayer) {

      this.setLoading(true)
      this.lineUpDialog.show = false

      const goalieBlock = this.lineupBlocks.goalie.map((obj) => (obj && obj.id) ? obj.id : null)
      const defendersBlock = this.lineupBlocks.defenders.map((obj) => (obj && obj.id) ? obj.id : null)
      const midfieldersBlock = this.lineupBlocks.midfielders.map((obj) => (obj && obj.id) ? obj.id : null)
      const forwardsBlock = this.lineupBlocks.forwards.map((obj) => (obj && obj.id) ? obj.id : null)

      const goalie = (newPlayer.position === 1) ? this.changeBlockLineup(goalieBlock, oldPlayer, newPlayer) : goalieBlock
      const defenders = (newPlayer.position === 2) ? this.changeBlockLineup(defendersBlock, oldPlayer, newPlayer) : defendersBlock
      const midfielders = (newPlayer.position === 3) ? this.changeBlockLineup(midfieldersBlock, oldPlayer, newPlayer) : midfieldersBlock
      const forwards = (newPlayer.position === 4) ? this.changeBlockLineup(forwardsBlock, oldPlayer, newPlayer) : forwardsBlock

      const newLineup = [...goalie, ...defenders, ...midfielders, ...forwards]
      console.log(goalie, defenders, midfielders, forwards)

      api.saveLineup(
        {
          type: this.formation, 
          id: this.getLeague,
          actionId: 'LU' + this.getLeague, 
          players: newLineup
        },
        () => {
          this.loadLineup()
          this.setLoading(false)
        },
        () => {
          this.setLoading(false)
        }
      )
    },
    changeBlockLineup(block, oldPlayer, newPlayer) {

      const newPlayerValue = (newPlayer && newPlayer.id) ? newPlayer.id : null
      const oldPlayerValue = (oldPlayer && oldPlayer.id) ? oldPlayer.id : null
      const newBlock = []
      let added = false

      if (block.length) {
        block.forEach((id) => {
          if (id === oldPlayerValue && added === false) {
            newBlock.push(newPlayerValue)
            added = true
          } else {
            newBlock.push(id)
          }
        })
      } else {
        newBlock.push(newPlayerValue)
      }

      return newBlock
    },
    positionName(position) {
      let positionString = null
      if (position === 1) {
        positionString = 'goalie'
      } else if (position === 2) {
        positionString = 'defender'
      } else if (position === 3) {
        positionString = 'midfielder'
      } else if (position === 4) {
        positionString = 'forward'
      }
      return positionString
    },
    playerName(player) {
      let name = ''
      if (player) {
        if (player.knownName) {
          name = player.knownName
        } else {
          name = player.firstName + ' ' + player.lastName
        }
      }
      return name
    },
    playerImg(player) {
      let img = null
      if (player) {
        img = player.profileBig
      }
      return img
    },
    playerTeamImg(player) {
      let img = null
      if (player) {
        img = '/assets/teams/' + player.teamId + '.png'
      }
      return img
    },
    otherPlayer(player) {
      let players = []
      if (player) {
        if (player.position === 1) {
          players = this.goalies.filter((p) => p.id !== player.id)
        } else if (player.position === 2) {
          players = this.defenders.filter((p) => p.id !== player.id)
        } else if (player.position === 3) {
          players = this.midfielders.filter((p) => p.id !== player.id)
        } else if (player.position === 4) {
          players = this.forwards.filter((p) => p.id !== player.id)
        }
        players = players.filter((p) => this.lineup.indexOf(p.id) === -1)
      }
      return players
    },
    playerVs(player) {
      return nextMatch(this.matches, player)
    }
  }
};
</script>
