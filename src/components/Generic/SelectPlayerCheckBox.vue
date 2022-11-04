<template>
          <td><v-checkbox
            v-model="isSelectedPlayer">
            </v-checkbox>
          </td>
</template>

<script>
import {mapMutations, mapGetters} from 'vuex';

export default {
  props: {
    player: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters([
      'getSelectedPlayers'
    ]),
    isSelectedPlayer: {
        get() {
            return this.getSelectedPlayers[this.player.id] !== undefined;
        },
        set(value) {
          if(value && this.getSelectedPlayers[this.player.id] === undefined){
            this.setSelectedPlayers(this.player);
          } else if (!value && this.getSelectedPlayers[this.player.id] !== undefined){
            this.setSelectedPlayers(this.player)
          }
        }
    },
  },
  methods: {
       ...mapMutations([
      'setSelectedPlayers'
    ]),

  }
}
</script>