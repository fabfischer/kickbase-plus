<template>
    <v-simple-table dense>
        <template v-slot:default>
            <thead>
                <tr>
                    <th class="text-left" style="width: 25%">
                        Name
                    </th>
                    <th class="text-left" style="width: 25%">
                        Total points
                    </th>
                    <th class="text-left" style="width: 25%">
                        Average points
                    </th>
                    <th class="text-left" style="width: 25%">
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
                        <span v-if="item.knownName">{{ item.knownName }}</span>
                        <span v-else>{{ item.firstName }} {{ item.lastName }}</span>
                    </td>
                    <td>{{ item.totalPoints }}</td>
                    <td>{{ item.averagePoints }}</td>
                    <td><status-pill :player="item"></status-pill></td>
                </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>

<script>
import StatusPill from './StatusPill'
export default {
    props: {
        items: {
            type: Array,
            required: true,
        }
    },
    components: {
        StatusPill
    },
};
</script>
