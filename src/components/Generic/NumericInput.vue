<template>
  <div
      :class="[
      'vue-numeric-input',
      size,
      controlsType === 'updown' ? 'updown' : ''
    ]"
  >
    <formatted-number-input
        :value="newValue"
        :nullValue="initialNumber"
        decimal=","
        separator="."
        class="numeric-input"
        v-on:change="submit"
        v-on:input="emitPreview"
    >
    </formatted-number-input>
    <!--
    need refactpring
    <button
        type="button"
        v-if="controls"
        class="input-btn btn-decrement"
        @mousedown.left="start(decrement)"
        @touchstart.prevent="start(decrement)"
        @touchend.prevent="stop"
        :disabled="disabled || minDisable"
    >
      <span class="btn-icon"></span>
    </button>
    <button
        type="button"
        v-if="controls"
        class="input-btn btn-increment"
        @mousedown.left="start(increment)"
        @touchstart.prevent="start(increment)"
        @touchend.prevent="stop"
        :disabled="disabled || maxDisable"
    >
      <span class="btn-icon"></span>
    </button> -->
  </div>
</template>
<script>
import FormattedNumberInput from './FormattedNumberInput/numberInput'
import numeral from 'numeral'

numeral.locale('deff')

/**
 * this is a fork of vue-numeric-input
 * adapted to the needs of this app
 * credits to: JayeshLab
 * url: https://github.com/JayeshLab/vue-numeric-input
 */
const timeInterval = 100;
import debounce from "lodash.debounce"

export default {
  name: "vue-numeric-input",
  components: {
    FormattedNumberInput
  },
  props: {
    name: String,
    value: [String, Number],
    placeholder: String,
    min: {
      type: Number,
      default: Number.MIN_SAFE_INTEGER
    },
    max: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    },
    step: {
      type: Number,
      default: 1
    },
    align: {
      type: String,
      default: "left"
    },
    width: {
      type: String
    },
    size: {
      type: String,
      default: "normal",
      validator: value => {
        return ["small", "normal", "large"].includes(value);
      }
    },
    precision: {
      type: Number,
      validator(val) {
        return val >= 0 && Number.isInteger(val);
      }
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    controls: {
      type: Boolean,
      default: true
    },
    controlsType: {
      type: String,
      default: "plusminus"
    },
    mousewheel: {
      type: Boolean,
      default: false
    },
    isInput: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: null
    },
    initialNumber: {
      type: Number,
      default: null,
      required: false,
    },
    hasBid: {
      type: Boolean,
      default: false,
      required: false,
    },
    resetCall: {
      type: Boolean,
      default: false,
      required: false,
    },
    enterEvent: {
      type: Function,
      default: null,
      required: false,
    }
  },
  data() {
    return {
      newValue: 0,
      minDisable: false,
      maxDisable: false,
      interval: null,
      startTime: null,
      handler: Function,
      initialized: false,
      temporaryStep: 1,
      debouncedCallback: null,
      valueBeforeChange: 0,
      hasFocus: false,
      stepsCounterIncrease: 0,
      stepsCounterDecrease: 0,
    };
  },
  watch: {
    resetCall(newValue) {
      if (newValue === true) {
        this.newValue = this.initialNumber
        this.temporaryStep = this.step
        this.valueBeforeChange = 0
        this.$emit('input-reset', true)
      }
    },
    newValue() {
      /*
      console.log(newValue)
      this.debouncedCallback(() => {
        if (newValue === this.newValue && newValue !== null) {
          this.$emit('submit', {value: newValue, focus: false, triggeredByEnterKey: false})
        }
      });*/
    },
    /*value: {
      immediate: true,
      handler(val) {
        /!*if (this.precision) {
          val = this.toPrecision(val, this.precision);
        }
        if (this.max && val >= this.max) {
          this.newValue = this.max;
        } else if (this.min && val <= this.min) {
          this.newValue = this.min;
        } else {
          this.newValue = val;
        }

        if (this.newValue !== val) {
          this.$emit("input", this.newValue);
        }*!/
      }
    },*/
    hasBid(newValue) {
      if (newValue === true) {
        const values = this.getNewValues(this.initialNumber)
        this.newValue = values.newValue
        // this.valueBeforeChange = values.valueBeforeChange
      } else if (newValue === false) {
        this.computedValue = null
      }
    },
    initialNumber(newValue, oldValue) {
      if (newValue > 0 && (oldValue !== undefined)) {
        const values = this.getNewValues(this.initialNumber)
        this.newValue = values.newValue
        // this.valueBeforeChange = values.valueBeforeChange
      }
    }
  },
  mounted() {
    this.temporaryStep = this.step
    this.debouncedCallback = debounce((...args) => {
      if (typeof args[0] === 'function') {
        args[0]()
      }
    }, 1000);
  },
  methods: {
    emitPreview(newValue) {
      this.$emit('preview', newValue)
    },
    submit(newValue) {
      this.newValue = newValue
      this.$emit('submit', {value: newValue, focus: false, triggeredByEnterKey: true})
    },
    getNewValues(value) {
      let tmpValue = value + ''
      const sRegex = new RegExp('/[,.\\s]*/', 'g')
      const plainValue = numeral(tmpValue.replaceAll(sRegex, '')).value()

      return {
        newValue: plainValue,
        valueBeforeChange: plainValue,
      }
    },
    /**
     * Function convert value to number
     * @param val
     * @returns {number | Number}
     */
    toNumber(val) {
      var n = parseFloat(val);
      return isNaN(n) ? val : n;
    },
    /**
     * Function to return fixed decimal precision of input val
     * @param val
     * @param prec
     * @returns {number | Number}
     */
    toPrecision(val, precision) {
      if (precision === undefined) precision = this.numPrecision;
      return parseFloat(
          Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision)
      );
    },
    /**
     * Function to get the precision of a v
     * @param value
     * @returns {number | Number}
     */
    getPrecision(value) {
      if (value === undefined) return 0;
      const valueString = value.toString();
      const dotPosition = valueString.indexOf(".");
      let precision = 0;
      if (dotPosition !== -1) {
        precision = valueString.length - dotPosition - 1;
      }
      return precision;
    },
    /**
     * Increment the current numeric value
     */
    increment() {
      if (!this.readonly && !this.disabled) {

        if (this.stepsCounterIncrease > 71) {
          this.temporaryStep = 100000
        } else if (this.stepsCounterIncrease > 55) {
          this.temporaryStep = 10000
        } else if (this.stepsCounterIncrease > 41) {
          this.temporaryStep = 1000
        } else if (this.stepsCounterIncrease > 25) {
          this.temporaryStep = 100
        } else if (this.stepsCounterIncrease > 11) {
          this.temporaryStep = 10
        }

        let val = 0;
        if (this.newValue) {
          val = this.newValue
        } else if (this.initialNumber) {
          val = this.initialNumber
        }
        const precisionFactor = Math.pow(10, this.numValuePrecision);
        const newVal =
            Math.round(precisionFactor * val + precisionFactor * this.temporaryStep) /
            precisionFactor;
        if (newVal <= this.max) {
          this.minDisable = false;
          this.newValue = newVal;
        } else {
          this.maxDisable = true;
        }

        this.stepsCounterIncrease++
      }
    },
    /**
     * Decrement the current numeric value
     */
    decrement() {
      if (!this.readonly && !this.disabled) {

        if (this.stepsCounterDecrease > 71) {
          this.temporaryStep = 100000
        } else if (this.stepsCounterDecrease > 55) {
          this.temporaryStep = 10000
        } else if (this.stepsCounterDecrease > 41) {
          this.temporaryStep = 1000
        } else if (this.stepsCounterDecrease > 25) {
          this.temporaryStep = 100
        } else if (this.stepsCounterDecrease > 11) {
          this.temporaryStep = 10
        }

        let val = 0;
        if (this.newValue) {
          val = this.newValue * 1
        } else if (this.initialNumber) {
          val = this.initialNumber * 1
        }
        const precisionFactor = Math.pow(10, this.numValuePrecision);
        const newVal =
            Math.round(precisionFactor * val - precisionFactor * this.temporaryStep) /
            precisionFactor;
        if (newVal >= this.min) {
          this.maxDisable = false;
          this.newValue = newVal;
        } else {
          this.minDisable = true;
        }

        this.stepsCounterDecrease++
      }
    },
    /**
     *  Start a repetitive call to increment and decrement method after a timeInterval on mousedown event and will stop on mouseup event on controls
     * @param handler - increment or decrement method
     */
    start(handler) {
      document.addEventListener("mouseup", this.stop);
      this.startTime = new Date();
      this.handler = handler;
      clearInterval(this.interval);
      this.interval = setInterval(handler, timeInterval);
    },
    /**
     * clear interval on mouseup event and remove the listener
     * @param evt - event to be removed
     */
    stop(evt) {
      document.removeEventListener(evt.type, this.stop);
      if (new Date() - this.startTime < timeInterval) {
        this.handler();
      }
      clearInterval(this.interval);
      this.interval = null;
      this.handler = null;
      this.startTime = null;
      if (this.value !== this.computedValue)
        this.$emit("change", this.computedValue);
    },
    /**
     * focus method to set the focus on input
     */
    focus() {
      if (!this.disabled) {
        this.$refs.input.focus();
      }
    },
  },
  computed: {
    computedValue: {
      get() {
        return this.newValue ?? null;
      },
      set(value) {
        if (this.newValue && value !== null) {
          if (this.initialNumber && (this.newValue === 0 || this.newValue === undefined) && this.initialized === false) {
            this.initialized = true
            this.valueBeforeChange = this.newValue
          }
          this.newValue = value;
          this.$emit("input", {value: this.newValue, focus: this.hasFocus});
          this.debouncedCallback(() => {
            this.valueBeforeChange = this.newValue
            this.temporaryStep = this.step
            this.stepsCounterIncrease = 0
            this.stepsCounterDecrease = 0
          });
        }
      }
    },
    numValuePrecision() {
      const stepPrecision = this.getPrecision(this.step);
      if (this.precision !== undefined) {
        return this.precision;
      } else {
        return Math.max(
            this.getPrecision(this.computedValue || 0),
            stepPrecision
        );
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.interval);
    this.interval = null;
    this.handler = null;
    this.startTime = null;
  }
};
</script>
<style lang="scss">
.vue-numeric-input {
  position: relative;
  box-sizing: border-box;
  height: 48px;
}

.vue-numeric-input.small {
  height: 20px;
  font-size: 12px;
}

.vue-numeric-input.small .numeric-input {
  padding: 2px 1.4rem;
}

.vue-numeric-input.large {
  height: 42px;
  font-size: 34px;
}

.vue-numeric-input.large .numeric-input {
  padding: 2px 2.8rem;
}

.vue-numeric-input .numeric-input {
  height: inherit;
  padding: 2px 2rem;
  box-sizing: border-box;
  font-size: 20px;
  border: 1px solid #cccccc;
  border-radius: 2px;
  display: block;
  line-height: 1.8rem;
  transition: all 0.1s ease 0s;
  width: 100%;
  -moz-appearance: textfield !important;
  text-align: center;

  .theme--dark & {
    border-color: #333;
    color: #fff;
  }
}

.numeric-input::-webkit-inner-spin-button, .numeric-input::-webkit-outer-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

.vue-numeric-input .numeric-input:focus {
  outline: none;
  border-color: #409eff;
}

.vue-numeric-input button {
  position: absolute;
  width: 48px;
  padding: 0.2rem;
  margin: 0;
  cursor: pointer;
  text-align: center;
  transition: all 0.1s ease 0s;
  background: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.1);
}

.vue-numeric-input button:focus {
  outline: none !important;
}

.vue-numeric-input.small button {
  width: 20px;
}

.vue-numeric-input.large button {
  width: 40px;
}

.vue-numeric-input button:hover {
  background: rgba(0, 0, 0, 0.2);
}

.vue-numeric-input button:active {
  background: #333;
}

.vue-numeric-input button:disabled {
  opacity: 0.5;
  box-shadow: none;
  cursor: not-allowed;
}

.vue-numeric-input .numeric-input.no-control {
  padding: 2px 5px;
}

.vue-numeric-input .btn-increment {
  right: 0;
  top: 0;
  bottom: 0;
  border-radius: 2px;
  border-width: 1px;
}

.vue-numeric-input .btn-increment .btn-icon {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.vue-numeric-input .btn-increment .btn-icon:before {
  display: inline-block;
  visibility: visible;
  content: "";
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='CurrentColor' viewBox='0 0 16 16'><path d='M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z'/></svg>");
  background-repeat: no-repeat;
  background-size: 65% 65%;
  background-position: center;
  width: 100%;
  height: 100%;

  .theme--dark & {
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 16 16'><path d='M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z'/></svg>");
  }
}

.vue-numeric-input .btn-increment .btn-icon:after {
  position: absolute;
  visibility: hidden;
  content: "";
}

.vue-numeric-input .btn-decrement {
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 2px;
  border-width: 1px;
}

.vue-numeric-input .btn-decrement .btn-icon {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.vue-numeric-input .btn-decrement .btn-icon:before {
  display: inline-block;
  visibility: visible;
  content: "";
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 16 16'><path d='M0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z'/></svg>");
  background-repeat: no-repeat;
  background-size: 65% 65%;
  background-position: center;
  width: 100%;
  height: 100%;

  .theme--dark & {
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 16 16'><path d='M0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z'/></svg>");
  }
}

.vue-numeric-input .btn-decrement .btn-icon:after {
  visibility: hidden;
  content: "";
  clear: both;
  height: 0;
}

.vue-numeric-input.updown .numeric-input {
  padding: 5px 2rem 5px 5px;
}

.vue-numeric-input.updown .btn-increment {
  right: 0;
  top: 0;
  bottom: 50%;
  border-radius: 2px 2px 0 0;
  border-width: 1px 1px 0;
}

.vue-numeric-input.updown .btn-increment .btn-icon {
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-width: 0 0.45rem 0.45rem;
  border-color: transparent transparent #111;
  border-style: solid;
  margin: -0.25rem 0 0 -0.4rem;
}

.vue-numeric-input.updown .btn-increment .btn-icon::before {
  visibility: hidden;
  display: block;
  content: "";
  clear: both;
  height: 0;
}

.vue-numeric-input.updown .btn-decrement .btn-icon::before {
  content: "";
}

.vue-numeric-input.updown .btn-increment .btn-icon::after {
  visibility: hidden;
  display: block;
  content: "";
  clear: both;
  height: 0;
}

.vue-numeric-input.updown .btn-decrement {
  right: 0;
  top: 50%;
  bottom: 0;
  left: auto;
  border-radius: 0 0 2px 2px;
  border-width: 0 1px 1px;
}

.vue-numeric-input.updown .btn-decrement .btn-icon {
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-width: 0.45rem 0.45rem 0;
  border-color: #111 transparent transparent;
  border-style: solid;
  margin: -0.25rem 0 0 -0.4rem;
}
</style>
