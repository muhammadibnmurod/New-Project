<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOutcome } from '../../../../api/user_vagon/Outcome.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const outcomes = ref([])
const isLoading = ref(true)
const error = ref(null)
const searchTerm = ref('')
const expandedRegions = ref({})
const expandedStations = ref({})
const isDark = ref(false)

const tableColumns = [
  { key: 'vagonNumber', header: 'vagon_no' },
  { key: 'vagonCode', header: 'code' },
  { key: 'vagonType', header: 'type' },
  { key: 'releaseDate', header: 'release_date' },
  { key: 'ownerType', header: 'owner' },
  { key: 'repairType', header: 'repair_type' },
  { key: 'loadStatus', header: 'load_status' },
]

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDark.value)

  try {
    const res = await getOutcome()
    outcomes.value = res.data
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

const filteredOutcomes = computed(() => {
  if (!searchTerm.value.trim()) return outcomes.value

  const term = searchTerm.value.toLowerCase()

  return outcomes.value
    .map((region) => {
      const filteredStations = region.stations
        .map((station) => {
          const filteredVagons = station.vagons.filter((v) =>
            [region.name, station.name, v.vagonNumber, v.vagonCode, v.vagonType].some((field) =>
              String(field).toLowerCase().includes(term),
            ),
          )
          return filteredVagons.length > 0 ? { ...station, vagons: filteredVagons } : null
        })
        .filter(Boolean)

      return filteredStations.length > 0 ? { ...region, stations: filteredStations } : null
    })
    .filter(Boolean)
})

function toggleRegion(regionId) {
  expandedRegions.value[regionId] = !expandedRegions.value[regionId]
  if (!expandedRegions.value[regionId]) {
    Object.keys(expandedStations.value).forEach((stationId) => {
      if (stationId.startsWith(regionId + '-')) {
        expandedStations.value[stationId] = false
      }
    })
  }
}

function toggleStation(regionId, stationId) {
  const key = `${regionId}-${stationId}`
  expandedStations.value[key] = !expandedStations.value[key]
}

function expandAll() {
  filteredOutcomes.value.forEach((region) => {
    expandedRegions.value[region.id] = true
    region.stations.forEach((station) => {
      expandedStations.value[`${region.id}-${station.id}`] = true
    })
  })
}

function collapseAll() {
  expandedRegions.value = {}
  expandedStations.value = {}
}

const getTranslatedRepairType = (type) => {
  if (!type) return '-'
  const key = `table.repair_types.${type}`
  return t(key) || type
}
</script>

<template>
  <div
    class="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300"
  >
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
      <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-100">{{ t('pages.title') }}</h2>
      <div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2 w-full md:w-1/2">
        <input
          v-model="searchTerm"
          type="text"
          :placeholder="t('pages.search_placeholder')"
          class="flex-grow px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 shadow-sm transition-all"
        />
        <button
          @click="expandAll"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
        >
          {{ t('pages.expand_all') }}
        </button>
        <button
          @click="collapseAll"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
        >
          {{ t('pages.collapse_all') }}
        </button>
      </div>
    </div>

    <!-- Yuklanish, xato va natija yo'qligi holatlari -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      <p class="ml-4 text-gray-600 dark:text-gray-400 font-medium">{{ t('pages.loading') }}</p>
    </div>
    <div
      v-else-if="error"
      class="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-6 rounded-xl shadow-md"
    >
      <p class="font-semibold">{{ t('pages.error') }}</p>
      <p class="text-sm">{{ error }}</p>
    </div>
    <div v-else-if="filteredOutcomes.length === 0" class="text-center py-20">
      <p class="text-xl text-gray-500 dark:text-gray-400">{{ t('pages.no_results') }}</p>
    </div>

    <!-- Asosiy kontent: accordion kartochkalar -->
    <div v-else class="space-y-6">
      <div
        v-for="region in filteredOutcomes"
        :key="region.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <!-- Hudud sarlavhasi (ochish/yopish tugmasi) -->
        <button
          @click="toggleRegion(region.id)"
          class="w-full text-left p-4 flex items-center justify-between font-semibold text-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span class="text-gray-900 dark:text-gray-100">{{ region.name }}</span>
          <span class="text-gray-500 dark:text-gray-400 text-sm"
            >({{ region.stations.reduce((acc, s) => acc + s.vagons.length, 0) }} vagon)</span
          >
          <svg
            :class="{ 'rotate-180': expandedRegions[region.id] }"
            class="w-5 h-5 ml-2 transition-transform duration-300 text-gray-600 dark:text-gray-300"
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
        <!-- Hudud ichidagi stansiyalar -->
        <div v-if="expandedRegions[region.id]" class="p-4 space-y-4">
          <div
            v-for="station in region.stations"
            :key="station.id"
            class="bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
          >
            <!-- Stansiya sarlavhasi (ochish/yopish tugmasi) -->
            <button
              @click="toggleStation(region.id, station.id)"
              class="w-full text-left p-3 flex items-center justify-between font-medium text-base dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {{ station.name }}
              <svg
                :class="{ 'rotate-180': expandedStations[`${region.id}-${station.id}`] }"
                class="w-4 h-4 ml-2 transition-transform duration-300 text-gray-500 dark:text-gray-400"
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
              v-if="expandedStations[`${region.id}-${station.id}`]"
              class="overflow-x-auto p-3 dark:bg-gray-800"
            >
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      v-for="col in tableColumns"
                      :key="col.key"
                      class="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {{ t(`table.headers.${col.header}`) }}
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                >
                  <tr
                    v-for="vagon in station.vagons"
                    :key="vagon.id"
                    class="transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td
                      v-for="col in tableColumns"
                      :key="col.key"
                      :class="{
                        'px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono':
                          col.key === 'vagonNumber',
                        'px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400':
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
                            vagon.repairType?.toLowerCase() === 'major',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                            vagon.repairType?.toLowerCase() === 'medium',
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
                            vagon.repairType?.toLowerCase() === 'minor',
                        }"
                        class="px-2 py-1 rounded-full text-xs font-semibold"
                      >
                        {{ getTranslatedRepairType(vagon.repairType) }}
                      </span>
                      <span
                        v-else-if="col.key === 'loadStatus'"
                        :class="{
                          'text-green-600 dark:text-green-300':
                            vagon.loadStatus?.toLowerCase() === 'loaded',
                          'text-gray-600 dark:text-gray-400': ['unloaded', 'empty'].includes(
                            vagon.loadStatus?.toLowerCase(),
                          ),
                        }"
                        class="font-semibold"
                      >
                        {{ vagon[col.key] }}
                      </span>
                      <span v-else>{{ vagon[col.key] }}</span>
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
