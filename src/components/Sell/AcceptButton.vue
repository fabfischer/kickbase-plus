<template>
  <v-btn
      block
      large
      text
      x-large
      @click="acceptOffer()"
      class="mb-2 mb-sm-5 kp-button kp-button__accept"
      :class="{'high-offer':isHighOffer, 'low-offer':!isHighOffer}"
  >
    <v-icon color="white"  left>fa-check-circle</v-icon>
    ACCEPT {{ offerWording }} OFFER
    <span v-if="showNameInfo">
      &nbsp;FROM <strong>{{ username }}</strong>
    </span>
  </v-btn>
</template>
<script>

export default {
  name: 'accept-button-sell',
  components: {},
  props: {
    offer: {
      required: true,
      type: Object
    },
    player: {
      required: true,
      type: Object
    },
    isHighOffer: {
      required: false,
      type: Boolean,
      default: false,
    }
  },
  computed: {
    showNameInfo() {
      return (this.offer.userName)
    },
    username() {
      return (this.offer.userName) ? this.offer.userName : 'KICKBASE'
    },

    offerWording() {
      return (this.isHighOffer) ? 'high' : 'low'
    },
  },
  methods: {
    acceptOffer() {
      const msg = `Accept ${this.username}'s offer for player "${this.player.firstName} ${this.player.lastName}" ?`

      if (window.confirm(msg)) {

        const offer = {
          offerId: this.offer.id,
          playerId: this.player.id
        }

        this.$emit('acceptOffer', {
          offer
        })
      }
    }
  }
}
</script>