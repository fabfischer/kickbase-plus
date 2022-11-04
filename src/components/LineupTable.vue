<template>
    <v-simple-table dense>
        <template v-slot:default>
            <thead>
                <tr>
                   <th class="text-left" style="width: 5%">
                        Sell
                    </th>                    
                    <th class="text-left" style="width: 25%">
                        Name
                    </th>
                   <th class="text-left" style="width: 20%">
                        Market Value
                    </th>
                    <th class="text-left" style="width: 20%">
                        Total points
                    </th>
                    <th class="text-left" style="width: 15%">
                        Average points
                    </th>
                    <th class="text-left" style="width: 15%">
                        Status
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                v-for="item in items"
                :key="item.name"
                >
                    <td>
                        <select-player-check-box :player="item"></select-player-check-box>
                   </td>
                    <td>
                        <span v-if="item.knownName">{{ item.knownName }}</span>
                        <span v-else>{{ item.firstName }} {{ item.lastName }}</span>
                    </td>
                   <td>{{ marketValueFormated(item) }}</td>                    
                    <td>{{ item.totalPoints }}</td>
                    <td>{{ item.averagePoints }}</td>
                    <td><status-pill :player="item"></status-pill></td>
                </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>

<script>
import numeral from "numeral";
import StatusPill from './StatusPill';
import SelectPlayerCheckBox from "./Generic/SelectPlayerCheckBox.vue";
export default {
    props: {
        items: {
            type: Array,
            required: true,
        }
    },
    components: {
        StatusPill,
        SelectPlayerCheckBox,
    },
  methods: { 
      marketValueFormated(item) {
        return numeral(item.marketValue).format("0,0");
      },
  }
};
</script>
