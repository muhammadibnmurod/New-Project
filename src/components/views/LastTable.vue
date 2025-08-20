<template>
    <div
        :class="['p-4 sm:p-6 lg:p-8 dark:bg-gray-900 min-h-screen', darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900']">
        <div class="max-w-7xl mx-auto dark:bg-gray-900">
            <h2 class="text-3xl font-extrabold mb-6 dark:text-white">{{ t("title") }}</h2>

            <div
                class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h3 class="text-xl font-bold mb-4 dark:text-white">{{ t("globalStats") }}</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th v-for="(val, key) in globalCounts" :key="key"
                                    class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white">
                                    {{ key }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td v-for="(val, key) in globalCounts" :key="key"
                                    class="px-4 py-2 whitespace-nowrap text-sm font-semibold text-center text-blue-600 dark:text-blue-400">
                                    {{ val }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="space-y-6">
                <div v-for="depot in depots" :key="depot.depotId"
                    class="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <div class="flex items-center dark:text-white justify-between p-4 cursor-pointer"
                        @click="toggleDepot(depot.depotId)">
                        <h3 class="text-lg font-bold">{{ depot.depotName }}</h3>
                        <span class="text-gray-500 dark:text-gray-300">
                            <svg v-if="expandedDepot !== depot.depotId" xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6 transform transition-transform duration-300" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6 transform rotate-180 transition-transform duration-300" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>

                    <div v-if="expandedDepot === depot.depotId"
                        class="p-4 border-t border-gray-200 dark:text-white dark:border-gray-900">
                        <div class="overflow-x-auto mb-6">
                            <h4 class="text-md font-semibold mb-2">{{ t("depotTotal") }}</h4>
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th v-for="(val, key) in depot.counts" :key="key"
                                            class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            {{ key }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td v-for="(val, key) in depot.counts" :key="key"
                                            class="px-4 py-2 whitespace-nowrap text-sm font-medium text-center text-purple-600 dark:text-purple-400">
                                            {{ val }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="overflow-x-auto">
                            <h4 class="text-md font-semibold mb-2">{{ t("stations") }}</h4>
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th
                                            class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                                            {{ t("station") }}
                                        </th>
                                        <th v-for="(val, key) in depot.stations[0]?.counts" :key="key"
                                            class="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">
                                            {{ key }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="station in depot.stations" :key="station.stationId"
                                        class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                        <td
                                            class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {{
                                                station.stationName }}</td>
                                        <td v-for="(val, key) in station.counts" :key="key"
                                            class="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">
                                            {{ val }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import axios from "axios"

const globalCounts = ref({})
const depots = ref([])
const expandedDepot = ref(null)

const darkMode = ref(localStorage.getItem("darkMode") === "true")
const { t } = useI18n()

const toggleDepot = (depotId) => {
    expandedDepot.value = expandedDepot.value === depotId ? null : depotId
}

onMounted(async () => {
    try {
        const res = await axios.get("http://192.168.136.207:3000/outcome/DO2/broken")
        globalCounts.value = res.data.globalCounts
        depots.value = res.data.depots
    } catch (error) {
        console.error("Xatolik:", error)
    }
})

// Boshqa komponentdagi o'zgarishlarni tinglash
window.addEventListener("storage", (e) => {
    if (e.key === "darkMode") {
        darkMode.value = e.newValue === "true"
    }
})
</script>