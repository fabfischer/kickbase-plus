<template>
  <div class="options-bar">
    <div class="options-bar__mobile_content" v-if="mobileState === false">
      <v-btn large fab color="secondary" class="options-bar__expand-btn elevation-15" @click="toggleMobileState">
        {{ title }}
      </v-btn>
      <div class="other-buttons">
        <slot name="other-buttons"></slot>
      </div>
    </div>
    <div
        class="options-bar__expanded_content"
        :class="{'options-bar__expanded_content--active':mobileState, 'elevation-15': mobileState}"
    >
      <div class="options-bar__expanded_content__inner">
        <div class="options-bar__expanded_content__inner__content">
          <p class="text-h6 mb-6">{{ title }}</p>
          <slot name="content"></slot>
          <v-btn v-if="hasInfoSlot" class="mb-2 options-bar__info-button" text color="info" @click="toggleShowInfo">
            <span v-if="showInfo">hide</span>
            <span v-else>show</span>
            {{ infoButtonTitle }}
          </v-btn>
          <div class="options-bar__info_content" v-if="showInfo">
            <slot name="info"></slot>
          </div>
        </div>

        <v-btn v-if="mobileState" block x-large class="mt-5 kp-button elevation-0" @click="toggleMobileState">close</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OptionsBar",
  props: {
    title: {
      default: 'Options',
      required: false,
      type: String,
    },
    infoButtonTitle: {
      type: String,
      required: false,
      default: 'Show'
    }
  },
  data() {
    return {
      showInfo: false,
      mobileState: false,
    }
  },
  computed: {
    hasInfoSlot() {
      return !!this.$slots.info
    },
  },
  methods: {
    toggleShowInfo() {
      this.showInfo = !this.showInfo
    },
    toggleMobileState() {
      this.mobileState = !this.mobileState
      const change = this.mobileState ? 'add' : 'remove'
      document.body.classList[change]('options-open')
    },
  }
}
</script>