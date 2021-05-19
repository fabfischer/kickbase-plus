<template>
    <div class="position--lined-up" @click="openChangeDialog">
        <div v-if="item.firstName">
            <div class="avatar">
                    <img
                        v-if="item.profileBig"
                        :src="item.profileBig"
                    >
                    <v-avatar v-else>

                    </v-avatar>
            </div>
            <div>
                <status-pill :player="item"></status-pill>
                <img :src="teamImage" class="club" />
                <span v-if="item.knownName">{{ item.knownName }}</span>
                <span v-else>{{ item.firstName }} {{ item.lastName }}</span>
                <br>
                <span v-if="nextMatchComputed" class="vsInfo">
                    vs: <img :src="nextMatchComputed.img" class="vsTeam" /> {{ nextMatchComputed.abbr }}
                </span> 
            </div>
        </div>
        <div v-else>
            <v-avatar class="no-position" size="168">
                <v-icon size="168" color="blue-grey darken-2">
                    fa-plus-circle
                </v-icon>
            </v-avatar>
        </div>
    </div>
</template>

<script>
import StatusPill from './StatusPill'
import { nextMatch } from '../helper/helper'

export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
        matches: {
            type: Array,
            required: false,
        }
    },
    components: {
        StatusPill
    },
    computed: {
        teamImage() {
            return '/assets/teams/' + this.item.teamId + '.png'
        },
        nextMatchComputed() {
            return nextMatch(this.matches, this.item)
        }
    },
    methods: {
        openChangeDialog() {
            const p = this.item
            p.match = this.match
            this.$emit('openChangeDialog', {player: p})
        }
    }
};
</script>
