<template>
  <div class="full-width-container">
    <h2 class="text-h3 text-sm-h2 mb-5">Settings</h2>

    <v-card outlined class="mb-5">
      <v-card-text>
        <h3 class="text-h5 text-sm-h4 mb-5">General</h3>
        <p>coming soon</p>
      </v-card-text>
    </v-card>

    <v-card outlined class="mb-5">
      <v-card-text>
        <h3 class="text-h5 text-sm-h4 mb-5">Transfer market</h3>
        <p>coming soon</p>
        <!-- <p>bid buttons</p> -->
      </v-card-text>
    </v-card>

    <v-card outlined class="mb-5">
      <v-card-text>
        <h3 class="text-h5 text-sm-h4 mb-5">Offers / Sell</h3>

        <div class="setting">
          <h4 class="text-h5 setting__headline text--primary">Offer Threshold</h4>
          <div class="setting__description">
            <p class="text-body-1">This setting affects:</p>
            <ul class="mb-2 text-body-1">
              <li>Button: "Decline all bids that are too low"</li>
              <li>Buttons: "Decline and add again"</li>
            </ul>
            <p class="text-body-1">

              This setting specifies the threshold at which an offer is considered to be "too low".<br>The specification
              is in percent. Default is: <span class="setting__default-value">{{ getDefaults.offerThreshold }}</span>
            </p>

            <p>
              You can find the buttons at
              <router-link to="/sell">Offers / Sell</router-link>
              .
            </p>

            <v-alert
                type="info"
                outlined
            >
              <p>Good to know:</p>
              <p>Kickbase will give you an offer that will be between -1% and +1% of that player's market value each
                time.</p>
              <p class="text-caption">
                Example:<br>
                Your player has a market value of <em>1.000.000</em> and Kickbase offered you a bid, which will be
                between -100.000 € (lowest bid) and 100.000 € (highest bid).
                <br>
                If you click the "Decline all bids that are too low" button, the offer will be rejected if the bid is
                not at least "<strong>{{ rejectAllExampleValue | numeral('0,0 $') }}</strong>" high (based on your
                current setting). If an offer was rejected,
                the player will
                be automatically put back on the transfer market.
              </p>
            </v-alert>

          </div>
          <div class="setting__input">
            <p class="mb-0 text-caption">Percentage:</p>
            <number-input controls :step="0.05" inline :max=.95 :min=.05 v-model="offerThresholdSetting"></number-input>
            <saved-alert :value="showAlerts.offerThresholdSetting"></saved-alert>
          </div>
        </div>

        <div class="setting">
          <h4 class="text-h5 setting__headline text--primary">Order by</h4>
          <div class="setting__description">
            <p class="text-body-1">
              With this setting you can define how the order should be right after loading all offers.
            </p>

            <p class="text-body-1">Changing the order within the offer list is only temporary and will be reset as soon
              as you leave the page</p>

            <p class="text-body-1">
              Default is: <span class="setting__default-value">"order by &nbsp;<em>{{ offerOrderDefaultLabel }}</em>"</span>
            </p>

            <p>
              You can find the order select at
              <router-link to="/sell">Offers / Sell</router-link>
              .
            </p>

          </div>
          <div class="setting__input">
            <sell-view-order :is-temporary=false :callback="offerOrderSaveBubble"></sell-view-order>
            <saved-alert :value="showAlerts.offerOrder"></saved-alert>
          </div>
        </div>

        <div class="setting">
          <h4 class="text-h5 setting__headline text--primary">Expand panels</h4>
          <div class="setting__description">
            <p class="text-body-1">
              These settings control which panels should be opened automatically as soon as there are players in the respective category.
            </p>

            <p>
              You can find the panels at
              <router-link to="/sell">Offers / Sell</router-link>
              .
            </p>
            <div class="setting__fieldset">
              <p class="text-h6 text--primary">Player not on market: </p>
              <p class="text-body-1">
                Default is: <span class="setting__default-value">{{ getPanelWording(this.getDefaults.offerOpenPlayerNotOnMarketPanel) }}</span>
              </p>
              <v-switch
                  v-model="offerOpenPlayerNotOnMarketPanelSetting"
                  inset
                  :label="offerOpenPlayerNotOnMarketPanelSettingLabel"
              ></v-switch>
              <saved-alert :value="showAlerts.offerOpenPlayerNotOnMarketPanelSetting"></saved-alert>

            </div>
            <div class="setting__fieldset">
              <p class="text-h6 text--primary">Player without any offer: </p>
              <p class="text-body-1">
                Default is: <span class="setting__default-value">{{ getPanelWording(this.getDefaults.offerOpenPlayerWithoutAnyOfferPanel) }}</span>
              </p>
              <v-switch
                  v-model="offerOpenPlayerWithoutAnyOfferPanelSetting"
                  inset
                  :label="offerOpenPlayerWithoutAnyOfferPanelSettingLabel"
              ></v-switch>
              <saved-alert :value="showAlerts.offerOpenPlayerWithoutAnyOfferPanelSetting"></saved-alert>
            </div>
          </div>
        </div>

        <div class="setting">
          <h4 class="text-h5 setting__headline text--primary">Show only too low offers</h4>
          <div class="setting__description">
            <p class="text-body-1">
              If this checkbox is set, only offers that are too low will be shown directly after loading the page (see option "Offer Threshold" above)
            </p>

            <p class="text-body-1">Changing the checkbox within the offer list is only temporary and will be reset as soon
              as you leave the page.</p>

            <p class="text-body-1">
              Default is: <span class="setting__default-value">{{ getDefaults.offerShowTooLowOffersOnly }}</span>
            </p>

            <p>
              You can find the order select at
              <router-link to="/sell">Offers / Sell</router-link>
              .
            </p>

          </div>
          <div class="setting__input">
            <v-checkbox
                v-model="offerShowTooLowOffersOnlySetting"
                label="show only too low offers"
            ></v-checkbox>
            <saved-alert :value="showAlerts.offerShowTooLowOffersOnlySetting"></saved-alert>
          </div>
        </div>


      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import {mapGetters, mapMutations} from "vuex"
import debounce from "lodash.debounce"
import SellViewOrder from "./Sell/OrderSelect";
import SavedAlert from "./Generic/SavedAlert";

const openAutomaticallyWording = 'Open panel automatically'
const keepClosedWording = 'Keep panel closed'

export default {
  name: "SettingsView",
  components: {SavedAlert, SellViewOrder},
  data() {
    return {
      initialized: false,
      offerThresholdSetting: null,
      offerOpenPlayerNotOnMarketPanelSetting: null,
      offerOpenPlayerWithoutAnyOfferPanelSetting: null,
      offerShowTooLowOffersOnlySetting: null,
      debouncedCallback: null,
      showAlerts: {
        offerThresholdSetting: false,
        offerOrder: false,
        offerOpenPlayerNotOnMarketPanelSetting: false,
        offerOpenPlayerWithoutAnyOfferPanelSetting: false,
        offerShowTooLowOffersOnlySetting: false,
      }
    }
  },
  created() {
    this.debouncedCallback = debounce((...args) => {
      if (typeof args[0] === 'function') {
        args[0]()
      }
    }, 1000);
  },
  mounted() {
    this.offerThresholdSetting = this.getOfferThreshold
    this.offerOpenPlayerNotOnMarketPanelSetting = this.getOfferOpenPlayerNotOnMarketPanel
    this.offerOpenPlayerWithoutAnyOfferPanelSetting = this.getOfferOpenPlayerWithoutAnyOfferPanel
    this.offerShowTooLowOffersOnlySetting = this.getOfferShowTooLowOffersOnly
  },
  watch: {
    offerThresholdSetting(newValue) {
      this.debouncedCallback(() => {
        if (newValue === this.offerThresholdSetting && this.initialized) {
          this.setOfferThreshold(newValue)
          this.flashSaveMessage('offerThresholdSetting')
        }
        this.initialized = true
      });
    },
    offerShowTooLowOffersOnlySetting(newValue) {
      this.debouncedCallback(() => {
        if (newValue === this.offerShowTooLowOffersOnlySetting && this.initialized) {
          this.setOfferShowTooLowOffersOnly(newValue)
          this.flashSaveMessage('offerShowTooLowOffersOnlySetting')
        }
        this.initialized = true
      });
    },
    offerOpenPlayerNotOnMarketPanelSetting(newValue) {
      this.debouncedCallback(() => {
        if (newValue === this.offerOpenPlayerNotOnMarketPanelSetting && this.initialized) {
          this.setOfferOpenPlayerNotOnMarketPanel(newValue)
          this.flashSaveMessage('offerOpenPlayerNotOnMarketPanelSetting')
        }
        this.initialized = true
      });
    },
    offerOpenPlayerWithoutAnyOfferPanelSetting(newValue) {
      this.debouncedCallback(() => {
        if (newValue === this.offerOpenPlayerWithoutAnyOfferPanelSetting && this.initialized) {
          this.setOfferOpenPlayerWithoutAnyOfferPanel(newValue)
          this.flashSaveMessage('offerOpenPlayerWithoutAnyOfferPanelSetting')
        }
        this.initialized = true
      });
    },
  },
  computed: {
    ...mapGetters([
      'getDefaults',
      'getOfferThreshold',
      'getOfferOpenPlayerNotOnMarketPanel',
      'getOfferOpenPlayerWithoutAnyOfferPanel',
      'getOfferShowTooLowOffersOnly',
    ]),
    rejectAllExampleValue() {
      return 1000000 * 0.1 * this.getOfferThreshold
    },
    offerOrderDefaultLabel() {
      return this.getDefaults.offerOrders[this.getDefaults.offerOrder]
    },
    offerOpenPlayerWithoutAnyOfferPanelSettingLabel() {
      return (this.offerOpenPlayerWithoutAnyOfferPanelSetting) ? openAutomaticallyWording : keepClosedWording
    },
    offerOpenPlayerNotOnMarketPanelSettingLabel() {
      return (this.offerOpenPlayerNotOnMarketPanelSetting) ? openAutomaticallyWording : keepClosedWording
    }
  },
  methods: {
    ...mapMutations([
      'setOfferThreshold',
      'setOfferOpenPlayerNotOnMarketPanel',
      'setOfferOpenPlayerWithoutAnyOfferPanel',
      'setOfferShowTooLowOffersOnly',
    ]),
    offerOrderSaveBubble() {
      this.flashSaveMessage('offerOrder')
    },
    flashSaveMessage(alertName) {
      if (this.initialized && Object.hasOwn(this.showAlerts, alertName)) {
        this.showAlerts[alertName] = true
        window.setTimeout(() => {
          this.showAlerts[alertName] = false
        }, 2000)
      }
    },
    getPanelWording(value) {
      return (value) ? openAutomaticallyWording : keepClosedWording
    }
  }
}
</script>