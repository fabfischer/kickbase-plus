<template>
  <v-select
      :items="orderOptions"
      label="Sort order"
      v-model="orderLabel"
      outlined
  ></v-select>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";

export default {
  name: "sell-view-order",
  props: {
    callback: {
      type: Function,
      required: false,
      default: null,
    },
    isTemporary: {
      type: Boolean,
      required: false,
      default: true,
    }
  },
  data() {
    return {
      order: null,
      orderLabel: null,
    }
  },
  watch: {
    order(newOrder) {
      if (typeof this.callback === 'function') {
        this.callback(newOrder)
      }
    },
    orderLabel(newLabel) {
      let key = null
      const o = Object.keys(this.getDefaults.offerOrders)
      o.forEach((oKey) => {
        if (this.getDefaults.offerOrders[oKey] === newLabel) {
          key = oKey
        }
      })

      if (key) {
        this.order = key
        this.storeOrder()
      }
    }
  },
  mounted() {
    this.orderLabel = this.getOrderLabelByKey()
  },
  computed: {
    ...mapGetters(['getDefaults', 'getOfferOrder']),
    orderOptions() {
      const o = Object.keys(this.getDefaults.offerOrders)
      const options = []
      o.forEach((oKey) => {
        options.push(this.getDefaults.offerOrders[oKey])
      })
      return options
    },
    computedValue() {
      return (this.isTemporary && this.getOfferOrder.temporary) ? this.getOfferOrder.temporary : this.getOfferOrder.init
    },
  },
  methods: {
    ...mapMutations(['setOfferOrder']),
    storeOrder() {
      const valid = Object.hasOwn(this.getDefaults.offerOrders, this.order)
      let newOrder = this.order
      if (valid === false) {
        newOrder = this.getDefaults.offerOrder
      }
      if (this.computedValue !== newOrder) {
        this.setOfferOrder({order: newOrder, isTemporary: this.isTemporary})
      }
    },
    getOrderLabelByKey() {
      return this.getDefaults.offerOrders[this.computedValue]
    },
  },
}
</script>