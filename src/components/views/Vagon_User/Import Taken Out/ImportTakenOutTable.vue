```vue
<template>
  <div :class="{ 'bg-gray-900 text-gray-300': isDarkMode, 'bg-gray-50 text-gray-900': !isDarkMode }"
    class="min-h-screen py-4 sm:py-6 px-4 sm:px-6 transition-colors duration-300">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold" :class="{ 'text-white': isDarkMode, 'text-gray-800': !isDarkMode }">
          {{ t('import_taken_out_h2') }}
        </h2>
      </div>

      <div v-if="loadingStats" class="flex justify-center items-center h-64">
        <div class="animate-spin w-10 h-10 border-t-2 border-blue-500 border-solid rounded-full"></div>
        <span class="ml-2" :class="{ 'text-gray-400': isDarkMode, 'text-gray-600': !isDarkMode }">
          Ma'lumotlar yuklanmoqda...
        </span>
      </div>

      <div v-if="!loadingStats" class="mb-8">
        <div class="max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div :class="{
            'bg-gray-800 text-gray-300': isDarkMode,
            'bg-white text-gray-800': !isDarkMode,
          }" class="rounded-lg shadow p-4 w-full">
            <p class="text-sm text-gray-500">{{ t('importqilinganlar') }}</p>
            <p class="text-2xl font-semibold"
              :class="{ 'text-yellow-400': isDarkMode, 'text-yellow-600': !isDarkMode }">
              {{ stats.imported }}
            </p>
          </div>
          <div :class="{
            'bg-gray-800 text-gray-300': isDarkMode,
            'bg-white text-gray-800': !isDarkMode,
          }" class="rounded-lg shadow p-4 w-full">
            <p class="text-sm text-gray-500">{{ t('exportqilingan') }}</p>
            <p class="text-2xl font-semibold"
              :class="{ 'text-purple-400': isDarkMode, 'text-purple-600': !isDarkMode }">
              {{ stats.exported }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="!loadingCharts" :class="{ 'bg-gray-800': isDarkMode, 'bg-white': !isDarkMode }"
        class="rounded-lg shadow p-6 mb-8">
        <div class="flex items-center justify-between mb-4 flex-wrap">
          <h3 class="text-lg font-semibold" :class="{ 'text-white': isDarkMode, 'text-gray-800': !isDarkMode }">
            {{ t('depo_boyicha_vagonlar_soni') }}
          </h3>
          <div :class="{ 'bg-gray-700': isDarkMode, 'bg-gray-200': !isDarkMode }"
            class="inline-flex space-x-2 rounded-lg p-1 mt-2 sm:mt-0">
            <button @click="fetchChartData('daily')" :class="{
              'bg-blue-500 text-white shadow-md': activeFilter === 'daily',
              'text-gray-400': isDarkMode && activeFilter !== 'daily',
              'text-gray-700': !isDarkMode && activeFilter !== 'daily',
            }" class="px-3 py-1 rounded-lg text-xs font-semibold focus:outline-none transition-colors duration-200">
              {{t('Kunlik')}}
            </button>
            <button @click="fetchChartData('monthly')" :class="{
              'bg-blue-500 text-white shadow-md': activeFilter === 'monthly',
              'text-gray-400': isDarkMode && activeFilter !== 'monthly',
              'text-gray-700': !isDarkMode && activeFilter !== 'monthly',
            }" class="px-3 py-1 rounded-lg text-xs font-semibold focus:outline-none transition-colors duration-200">
              {{t('Oylik')}}
            </button>
            <button @click="fetchChartData('yearly')" :class="{
              'bg-blue-500 text-white shadow-md': activeFilter === 'yearly',
              'text-gray-400': isDarkMode && activeFilter !== 'yearly',
              'text-gray-700': !isDarkMode && activeFilter !== 'yearly',
            }" class="px-3 py-1 rounded-lg text-xs font-semibold focus:outline-none transition-colors duration-200">
              {{t('Yillik')}}
            </button>
          </div>
        </div>
        <div class="chart-container" style="height: 300px; width: 100%; position: relative">
          <Bar :data="barChartDataFiltered" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { getImportTakenOut } from '@/api/user_vagon/importTakenOut.js'
import { Bar } from 'vue-chartjs'
import { useDarkModeStore } from '@/stores/darkModeStore'
import { useI18n } from 'vue-i18n'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
)

// Use the dark mode store
const darkModeStore = useDarkModeStore()
const isDarkMode = computed(() => darkModeStore.darkMode)

// i18n
const { t } = useI18n()
// Data and state
const fullDepoList = ref({})
const filteredDepoList = ref({})
const loadingStats = ref(true)
const loadingCharts = ref(true)
const activeFilter = ref('yearly')

// Function to fetch all data for statistics
const fetchAllDataForStats = async () => {
  loadingStats.value = true
  try {
    const res = await getImportTakenOut('all')
    fullDepoList.value = res
  } catch (error) {
    console.error('Error fetching all vagon data:', error)
  } finally {
    loadingStats.value = false
  }
}

// Function to fetch filtered data for charts
const fetchChartData = async (filter) => {
  loadingCharts.value = true
  activeFilter.value = filter
  try {
    const res = await getImportTakenOut(filter)
    filteredDepoList.value = res
  } catch (error) {
    console.error('Error fetching filtered chart data:', error)
  } finally {
    loadingCharts.value = false
  }
}

// Fetch data and initialize theme on mount
onMounted(() => {
  darkModeStore.initTheme() // Initialize theme on mount
  fetchAllDataForStats()
  fetchChartData('yearly')
})

// Chart data for Bar Chart (Depo Bo'yicha)
const barChartData = computed(() => {
  const labels = filteredDepoList.value.data?.depos
    ? Object.keys(filteredDepoList.value.data.depos)
    : []
  const data = filteredDepoList.value.data?.depos
    ? Object.values(filteredDepoList.value.data.depos).map((d) => d.countVagons)
    : []
  const barColors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#6EE7B7',
    '#93C5FD',
  ]

  return {
    labels: labels,
    datasets: [
      {
        label: "Depo Bo'yicha Vagonlar Soni",
        backgroundColor: labels.map((_, index) => barColors[index % barColors.length]),
        data: data,
      },
    ],
  }
})

// Chart data for Vagonlar Harakati (only Import and Export)
const barChartDataFiltered = computed(() => {
  if (
    !filteredDepoList.value ||
    !filteredDepoList.value.data ||
    !filteredDepoList.value.data.depos
  ) {
    return { labels: [], datasets: [] }
  }

  const labels = Object.keys(filteredDepoList.value.data.depos)
  const dataImported = Object.values(filteredDepoList.value.data.depos).map((d) => d.importedCount)
  const dataExported = Object.values(filteredDepoList.value.data.depos).map((d) => d.exportedCount)
  const colorImported = isDarkMode.value ? '#FBBF24' : '#F59E0B'
  const colorExported = isDarkMode.value ? '#A78BFA' : '#8B5CF6'

  return {
    labels: labels,
    datasets: [
      {
        label: `Import qilinganlar (${activeFilter.value === 'daily' ? 'Kunlik' : activeFilter.value === 'monthly' ? 'Oylik' : 'Yillik'})`,
        backgroundColor: colorImported,
        borderColor: colorImported,
        data: dataImported,
      },
      {
        label: `Eksport qilinganlar (${activeFilter.value === 'daily' ? 'kunlik' : activeFilter.value === 'monthly' ? 'oylik' : 'yillik'})`,
        backgroundColor: colorExported,
        borderColor: colorExported,
        data: dataExported,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: isDarkMode.value ? '#9ca3af' : '#6b7280',
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      ticks: {
        color: isDarkMode.value ? '#9ca3af' : '#6b7280',
      },
      grid: {
        color: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
      beginAtZero: true,
    },
    x: {
      ticks: {
        color: isDarkMode.value ? '#9ca3af' : '#6b7280',
      },
      grid: {
        color: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
}))

// Computed statistics
const stats = computed(() => {
  if (!fullDepoList.value.data) return { total: 0, imported: 0, exported: 0 }
  const { AllVagonsCount, AllImportedCount, AllExportedCount } = fullDepoList.value.data
  return {
    total: AllVagonsCount,
    imported: AllImportedCount,
    exported: AllExportedCount,
  }
})
</script>
```