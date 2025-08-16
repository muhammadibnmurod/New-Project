<template>
  <div
    class="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300"
  >
    <!-- Sahifa sarlavhasi va boshqaruv paneli -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
      <div class="flex flex-col">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          {{ t('pages.title') }}
        </h2>
        <span v-if="data" class="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
          {{ t('pages.total_wagons', { count: data.totalMonthlyCount }) }}
        </span>
      </div>
      <div class="mt-4 md:mt-0 flex flex-wrap items-center gap-2 w-full md:w-1/2">
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="t('pages.search_placeholder')"
          class="flex-grow px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 shadow-sm transition-all min-w-0"
        />
        <button
          @click="expandAll"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap flex-grow sm:flex-grow-0"
        >
          {{ t('pages.expand_all') }}
        </button>
        <button
          @click="collapseAll"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap flex-grow sm:flex-grow-0"
        >
          {{ t('pages.collapse_all') }}
        </button>
      </div>
    </div>

    <!-- Yuklanish, xato va natija yo'qligi holatlari -->
    <div v-if="isLoading" class="flex flex-col justify-center items-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400 font-medium">{{ t('pages.loading') }}</p>
    </div>
    <div
      v-else-if="error"
      class="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-6 rounded-xl shadow-md"
    >
      <p class="font-semibold">{{ t('pages.error') }}</p>
      <p class="text-sm">{{ error }}</p>
    </div>
    <div v-else-if="filteredData.length === 0" class="text-center py-20">
      <p class="text-lg md:text-xl text-gray-500 dark:text-gray-400">{{ t('pages.no_results') }}</p>
    </div>

    <!-- Asosiy kontent: accordion kartochkalar -->
    <div v-else class="space-y-6">
      <div
        v-for="depot in filteredData"
        :key="depot.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <!-- Depo sarlavhasi (ochish/yopish tugmasi) -->
        <button
          @click="toggleDepot(depot.id)"
          class="w-full text-left p-4 flex items-center justify-between font-semibold text-base md:text-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span class="text-gray-900 dark:text-gray-100">{{ depot.name }}</span>
          <span class="text-gray-500 dark:text-gray-400 text-xs md:text-sm ml-2"
            >({{ depot.stations.reduce((acc, s) => acc + s.releasedVagons.length, 0) }} vagon)</span
          >
          <svg
            :class="{ 'rotate-180': expandedDepots[depot.id] }"
            class="w-5 h-5 ml-auto md:ml-2 transition-transform duration-300 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
        <!-- Depo ichidagi stansiyalar -->
        <div v-if="expandedDepots[depot.id]" class="p-2 md:p-4 space-y-4">
          <div
            v-for="station in depot.stations"
            :key="station.id"
            class="bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
          >
            <!-- Stansiya sarlavhasi (ochish/yopish tugmasi) -->
            <button
              @click="toggleStation(depot.id, station.id)"
              class="w-full text-left p-3 flex items-center justify-between font-medium text-sm md:text-base dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {{ station.name }}
              <svg
                :class="{ 'rotate-180': expandedStations[`${depot.id}-${station.id}`] }"
                class="w-4 h-4 ml-auto md:ml-2 transition-transform duration-300 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            <!-- Stansiya ichidagi vagonlar jadvali -->
            <div
              v-if="expandedStations[`${depot.id}-${station.id}`]"
              class="p-3 dark:bg-gray-800 overflow-x-auto"
            >
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      v-for="col in tableColumns"
                      :key="col.key"
                      class="px-2 md:px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {{ t(`table.headers.${col.header}`) }}
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <tr
                    v-for="vagon in station.releasedVagons"
                    :key="vagon.id"
                    class="transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td
                      v-for="col in tableColumns"
                      :key="col.key"
                      :class="{
                        'px-2 md:px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono':
                          col.key === 'vagonNumber',
                        'px-2 md:px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400':
                          col.key !== 'vagonNumber',
                      }"
                    >
                      <!-- Ma'lumot turlari bo'yicha shartli renderlash -->
                      <span
                        v-if="col.key === 'vagonType'"
                        class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {{ vagon[col.key] }}
                      </span>
                      <span
                        v-else-if="col.key === 'repairType'"
                        :class="{
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                            vagon.repairType?.toLowerCase() === 'current',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                            vagon.repairType?.toLowerCase() === 'planned',
                        }"
                        class="px-2 py-1 rounded-full text-xs font-semibold"
                      >
                        {{ getTranslatedValue('repair_types', vagon.repairType) }}
                      </span>
                      <span
                        v-else-if="col.key === 'loadStatus'"
                        :class="{
                          'text-green-600 dark:text-green-300':
                            vagon.loadStatus?.toLowerCase() === 'loaded',
                          'text-gray-600 dark:text-gray-400':
                            vagon.loadStatus?.toLowerCase() === 'unloaded',
                        }"
                        class="font-semibold"
                      >
                        {{ getTranslatedValue('statuses', vagon.loadStatus) }}
                      </span>
                      <span
                        v-else-if="col.key === 'ownerType'"
                        :class="{
                          'text-purple-600 dark:text-purple-300':
                            vagon.ownerType?.toLowerCase() === 'private',
                          'text-indigo-600 dark:text-indigo-300':
                            vagon.ownerType?.toLowerCase() === 'invertar',
                        }"
                        class="font-semibold"
                      >
                        {{ getTranslatedValue('owner_types', vagon.ownerType) }}
                      </span>
                      <span v-else-if="col.key === 'transitPermit'">
                        <svg
                          v-if="vagon.transitPermit"
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <svg
                          v-else
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                      <span v-else>{{ getVagonValue(vagon, col.key) }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { getPlannedTakenOutWagons } from '../../api/user_vagon/PlannedTakenOutWagons.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Holat (state) o'zgaruvchilari
const data = ref(null)
const isLoading = ref(true)
const error = ref(null)
const searchTerm = ref('')
const expandedDepots = ref({})
const expandedStations = ref({})
const isDark = ref(false) // Dark mode holati

// Jadval uchun aniq belgilangan ustunlar ro'yxati
const tableColumns = [
  { key: 'vagonNumber', header: 'vagon_no' },
  { key: 'vagonCode', header: 'vagon_code' },
  { key: 'vagonType', header: 'vagon_type' },
  { key: 'releaseDate', header: 'release_date' },
  { key: 'takenOutDate', header: 'taken_out_date' },
  { key: 'ownerType', header: 'owner_type' },
  { key: 'ownershipName', header: 'ownership_name' },
  { key: 'repairType', header: 'repair_type' },
  { key: 'loadStatus', header: 'load_status' },
  { key: 'transitPermit', header: 'transit_permit' },
]

// Ma'lumotlarni yuklash va mavzuni boshlash
onMounted(async () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDark.value)

  try {
    const res = await getPlannedTakenOutWagons()
    data.value = res
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})

// Mavzuni almashtirish funksiyasi
const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

const filteredData = computed(() => {
  if (!searchTerm.value.trim() || !data.value) return data.value?.depots || []

  const term = searchTerm.value.toLowerCase()

  return data.value.depots
    .map((depot) => {
      const filteredStations = depot.stations
        .map((station) => {
          const filteredVagons = station.releasedVagons.filter((v) =>
            [depot.name, station.name, v.vagonNumber, v.vagonCode, v.vagonType].some((field) =>
              String(field).toLowerCase().includes(term),
            ),
          )
          return filteredVagons.length > 0 ? { ...station, releasedVagons: filteredVagons } : null
        })
        .filter(Boolean)

      return filteredStations.length > 0 ? { ...depot, stations: filteredStations } : null
    })
    .filter(Boolean)
})

function toggleDepot(depotId) {
  expandedDepots.value[depotId] = !expandedDepots.value[depotId]
  if (!expandedDepots.value[depotId]) {
    Object.keys(expandedStations.value).forEach((stationId) => {
      if (stationId.startsWith(depotId + '-')) {
        expandedStations.value[stationId] = false
      }
    })
  }
}

function toggleStation(depotId, stationId) {
  const key = `${depotId}-${stationId}`
  expandedStations.value[key] = !expandedStations.value[key]
}

function expandAll() {
  filteredData.value.forEach((depot) => {
    expandedDepots.value[depot.id] = true
    depot.stations.forEach((station) => {
      expandedStations.value[`${depot.id}-${station.id}`] = true
    })
  })
}

function collapseAll() {
  expandedDepots.value = {}
  expandedStations.value = {}
}

// Tarjimalar uchun funksiya
const getTranslatedValue = (key, value) => {
  if (!value) return '-'
  const i18nKey = `table.${key}.${value.toLowerCase()}`
  return t(i18nKey) || value
}

// Jadval uchun ma'lumot olish
const getVagonValue = (vagon, key) => {
  if (key === 'ownershipName') {
    return vagon.ownership?.ownershipName || '-'
  }
  return vagon[key] || '-'
}
</script>

<style scoped>
/* Optional: Custom styles or transitions if needed */
</style>
