<template>
  <div class="full-width-container">
    <h2 class="text-h3 text-sm-h2 mb-5">Settings</h2>

    <v-card outlined class="mb-5">
      <v-card-text>
        <h3 class="text-h5 text-sm-h4 mb-5">General</h3>

        <div class="setting">
          <h4 class="text-h5 setting__headline text--primary">Player-Card</h4>
          <div class="setting__description">
            <p></p>

            <div class="setting__fieldset">
              <p class="text-h6 text--primary">Show always all details of a player card</p>
              <p class="text-body-1">In some contexts a player card doesn't display all details of a player. You can change this behaviour
                and force all details to be displayed with this setting. You can see an example of a changed behaviour below.
                <br>Default is: <span class="setting__default-value">{{
                    getPlayerCardShowAlwaysAllDetailsInfo(this.getDefaults.generalPlayerCardShowAlwaysAllDetails)
                  }}</span></p>

              <p class="text-body-1">A simplified view of the player card is currently used in the following situations:</p>
              <ul class="mb-2 text-body-1">
                <li>
                  <router-link to="/sell">Offers / Sell</router-link>: player with no offer
                </li>
              </ul>

              <p class="text-body-1">

              </p>
              <v-switch
                  v-model="generalPlayerCardShowAlwaysAllDetailsSetting"
                  inset
                  :label="showAlwaysAllDetailsOfAPlayerCardPanelSettingLabel"
              ></v-switch>
              <saved-alert :value="showAlerts.generalPlayerCardShowAlwaysAllDetailsSetting"></saved-alert>

              <v-expansion-panels  class="elevation-1 player-card-accordion">
                <v-expansion-panel
                >
                  <v-expansion-panel-header class="elevation-0">
                    <v-icon class="mr-2 player-card-accordion__icon" color="blue lighten-2">fa-user</v-icon>
                    live example (click to open)
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <player-card :player="dummyPlayer" :hide-meta="!generalPlayerCardShowAlwaysAllDetailsSetting"></player-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>

            </div>
          </div>
        </div>
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
              Default is: <span class="setting__default-value">"order by &nbsp;<em>{{
                offerOrderDefaultLabel
              }}</em>"</span>
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
              These settings control which panels should be opened automatically as soon as there are players in the
              respective category.
            </p>

            <p>
              You can find the panels at
              <router-link to="/sell">Offers / Sell</router-link>
              .
            </p>
            <div class="setting__fieldset">
              <p class="text-h6 text--primary">Player not on market: </p>
              <p class="text-body-1">
                Default is: <span class="setting__default-value">{{
                  getPanelWording(this.getDefaults.offerOpenPlayerNotOnMarketPanel)
                }}</span>
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
                Default is: <span class="setting__default-value">{{
                  getPanelWording(this.getDefaults.offerOpenPlayerWithoutAnyOfferPanel)
                }}</span>
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
              If this checkbox is set, only offers that are too low will be shown directly after loading the page (see
              option "Offer Threshold" above)
            </p>

            <p class="text-body-1">Changing the checkbox within the offer list is only temporary and will be reset as
              soon
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
import PlayerCard from "@/components/Player/PlayerCard";

const openAutomaticallyWording = 'Open panel automatically'
const keepClosedWording = 'Keep panel closed'

const showAlwaysAllDetailsInPlayerCard = 'Show always all details'
const hideDetailsInSomePlayerCardContexts = 'Hide details in some contexts'

export default {
  name: "SettingsView",
  components: {PlayerCard, SavedAlert, SellViewOrder},
  data() {
    return {
      initialized: false,
      offerThresholdSetting: null,
      generalPlayerCardShowAlwaysAllDetailsSetting: null,
      offerOpenPlayerNotOnMarketPanelSetting: null,
      offerOpenPlayerWithoutAnyOfferPanelSetting: null,
      offerShowTooLowOffersOnlySetting: null,
      debouncedCallback: null,
      showAlerts: {
        generalPlayerCardShowAlwaysAllDetailsSetting: false,
        offerThresholdSetting: false,
        offerOrder: false,
        offerOpenPlayerNotOnMarketPanelSetting: false,
        offerOpenPlayerWithoutAnyOfferPanelSetting: false,
        offerShowTooLowOffersOnlySetting: false,
      },
      dummyPlayer: {
        "id": "23",
        "teamId": "9",
        "userId": "123456789",
        "userProfile": "https://kickbase.b-cdn.net/user/76d32515d3e3459386352033b1412ae0.jpeg",
        "username": "Dummy",
        "firstName": "John",
        "lastName": "Doe",
        "profile": null,
        "status": 0,
        "position": 3,
        "number": 6,
        "totalPoints": 1814,
        "averagePoints": 181,
        "marketValue": 48059668,
        "price": 48059668,
        "date": "2022-10-17T13:18:04Z",
        "expiry": 2580336,
        "offers": [],
        "lus": 1,
        "marketValueTrend": 2,
        "hasHighOffer": false,
        "hasLowOffer": false,
        "hasExpiredOffers": false,
        "hasKickbaseOffersOnly": false,
        "displayName": "John Dow"
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
    this.generalPlayerCardShowAlwaysAllDetailsSetting = this.getGeneralPlayerCardShowAlwaysAllDetails
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
    generalPlayerCardShowAlwaysAllDetailsSetting(newValue) {
      this.debouncedCallback(() => {
        if (newValue === this.generalPlayerCardShowAlwaysAllDetailsSetting && this.initialized) {
          this.setGeneralPlayerCardShowAlwaysAllDetails(newValue)
          this.flashSaveMessage('generalPlayerCardShowAlwaysAllDetailsSetting')
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
      'getGeneralPlayerCardShowAlwaysAllDetails',
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
    },
    showAlwaysAllDetailsOfAPlayerCardPanelSettingLabel() {
      return (this.generalPlayerCardShowAlwaysAllDetailsSetting)
          ? showAlwaysAllDetailsInPlayerCard
          : hideDetailsInSomePlayerCardContexts
    }
  },
  methods: {
    ...mapMutations([
      'setOfferThreshold',
      'setOfferOpenPlayerNotOnMarketPanel',
      'setOfferOpenPlayerWithoutAnyOfferPanel',
      'setOfferShowTooLowOffersOnly',
      'setGeneralPlayerCardShowAlwaysAllDetails',
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
    },
    getPlayerCardShowAlwaysAllDetailsInfo(value) {
      return (value) ? showAlwaysAllDetailsInPlayerCard : hideDetailsInSomePlayerCardContexts
    }
  }
}
</script>