<template>
  <input
      type="text"
      autocomplete="off"
      :value="maskedValue"
      @change="noop"
      @input="input"
      v-on:keyup.enter="change"
      v-number="config"
      class="v-number"
  />
</template>

<script>
/**
 * all kudos go to: Dipak Sarkar
 * https://github.com/coders-tm/vue-number-format/tree/vue2.0
 */
import directive from './directive'
import options from './options'

export default {
  props: {
    value: {
      required: true,
    },
    nullValue: {
      type: [Number, String],
      default: () => options.nullValue
    },
    masked: {
      type: Boolean,
      default: false
    },
    reverseFill: {
      type: Boolean,
      default: options.reverseFill
    },
    precision: {
      type: Number,
      default: () => options.precision
    },
    decimal: {
      type: String,
      default: () => options.decimal
    },
    separator: {
      type: String,
      default: () => options.separator
    },
    prefix: {
      type: String,
      default: () => options.prefix
    },
    suffix: {
      type: String,
      default: () => options.suffix
    },
  },
  directives: {
    number: directive
  },
  data() {
    return {
      maskedValue: null,
      unmaskedValue: null,
      initialized: false
    }
  },
  watch: {
    value(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.maskedValue = newValue
      }
    }
  },
  mounted() {
    this.maskedValue = this.value
  },
  methods: {
    input({target}) {
      this.maskedValue = target.value
      this.unmaskedValue = target.unmaskedValue
      if (this.initialized) {
        this.$emit('input', this.emittedValue)
      } else if (target.value.match(/(\d)\./)) {
        this.initialized = true
      }
    },
    change() {
      this.$emit('change', this.emittedValue)
    },
    noop() {
      // dummy function
    }
  },
  computed: {
    emittedValue() {
      return this.masked ? this.maskedValue : this.unmaskedValue
    },
    config() {
      return this.$props
    }
  }
}
</script>
