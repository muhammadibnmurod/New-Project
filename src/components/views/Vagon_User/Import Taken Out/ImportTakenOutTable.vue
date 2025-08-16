<template>
  <div
    :class="{ 'bg-gray-900 text-gray-300': isDarkMode, 'bg-gray-50 text-gray-900': !isDarkMode }"
    class="min-h-screen py-4 sm:py-6 px-4 sm:px-6 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2
          class="text-2xl font-semibold"
          :class="{ 'text-white': isDarkMode, 'text-gray-800': !isDarkMode }"
        >
          Vagonlarni Import Qilish va Chiqarib Yuborish
        </h2>
        <button
          @click="toggleTheme"
          class="p-2 rounded-full"
          :class="{
            'bg-gray-800 text-gray-300 hover:bg-gray-700': isDarkMode,
            'bg-gray-200 text-gray-700 hover:bg-gray-300': !isDarkMode,
          }"
        >
          <svg
            v-if="isDarkMode"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>

      <div v-if="loadingStats" class="flex justify-center items-center h-64">
        <div
          class="animate-spin w-10 h-10 border-t-2 border-blue-500 border-solid rounded-full"
        ></div>
        <span class="ml-2" :class="{ 'text-gray-400': isDarkMode, 'text-gray-600': !isDarkMode }">
          Ma'lumotlar yuklanmoqda...
        </span>
      </div>

      <div v-if="!loadingStats" class="mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div
            :class="{
              'bg-gray-800 text-gray-300': isDarkMode,
              'bg-white text-gray-800': !isDarkMode,
            }"
            class="rounded-lg shadow p-4"
          >
            <p class="text-sm text-gray-500">Jami Vagonlar</p>
            <p
              class="text-2xl font-semibold"
              :class="{ 'text-blue-400': isDarkMode, 'text-blue-600': !isDarkMode }"
            >
              {{ stats.total }}
            </p>
          </div>
          <div
            :class="{
              'bg-gray-800 text-gray-300': isDarkMode,
              'bg-white text-gray-800': !isDarkMode,
            }"
            class="rounded-lg shadow p-4"
          >
            <p class="text-sm text-gray-500">Import qilinganlar</p>
            <p
              class="text-2xl font-semibold"
              :class="{ 'text-yellow-400': isDarkMode, 'text-yellow-600': !isDarkMode }"
            >
              {{ stats.imported }}
            </p>
          </div>
          <div
            :class="{
              'bg-gray-800 text-gray-300': isDarkMode,
              'bg-white text-gray-800': !isDarkMode,
            }"
            class="rounded-lg shadow p-4"
          >
            <p class="text-sm text-gray-500">Eksport qilinganlar</p>
            <p
              class="text-2xl font-semibold"
              :class="{ 'text-purple-400': isDarkMode, 'text-purple-600': !isDarkMode }"
            >
              {{ stats.exported }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="!loadingCharts"
        :class="{ 'bg-gray-800': isDarkMode, 'bg-white': !isDarkMode }"
        class="rounded-lg shadow p-6 mb-8"
      >
        <div class="flex items-center justify-between mb-4 flex-wrap">
          <h3
            class="text-lg font-semibold"
            :class="{ 'text-white': isDarkMode, 'text-gray-800': !isDarkMode }"
          >
            Vagonlar Harakati (Ustunli Diagramma)
          </h3>
          <div
            :class="{ 'bg-gray-700': isDarkMode, 'bg-gray-200': !isDarkMode }"
            class="inline-flex space-x-2 rounded-lg p-1 mt-2 sm:mt-0"
          >
            <button
              @click="fetchChartData('daily')"
              :class="{
                'bg-blue-500 text-white shadow-md': activeFilter === 'daily',
                'text-gray-400': isDarkMode && activeFilter !== 'daily',
                'text-gray-700': !isDarkMode && activeFilter !== 'daily',
              }"
              class="px-3 py-1 rounded-lg text-xs font-semibold focus:outline-none transition-colors duration-200"
            >
              Kunlik
            </button>
            <button
              @click="fetchChartData('monthly')"
              :class="{
                'bg-blue-500 text-white shadow-md': activeFilter === 'monthly',
                'text-gray-400': isDarkMode && activeFilter !== 'monthly',
                'text-gray-700': !isDarkMode && activeFilter !== 'monthly',
              }"
              class="px-3 py-1 rounded-lg text-xs font-semibold focus:outline-none transition-colors duration-200"
            >
              Oylik
            </button>
            <button
              @click="fetchChartData('yearly')"
              :class="{
                'bg-blue-500 text-white shadow-md': activeFilter === 'yearly',
                'text-gray-400': isDarkMode && activeFilter !== 'yearly',
                'text-gray-700': !isDarkMode && activeFilter !== 'yearly',
              }"
              class="px-3 py-1 rounded-lg text-xs font-semibold focus:outline-none transition-colors duration-200"
            >
              Yillik
            </button>
          </div>
        </div>
        <div class="chart-container" style="height: 300px; width: 100%; position: relative">
          <Bar :data="barChartDataFiltered" :options="chartOptions" />
        </div>
      </div>

      <div
        v-if="!loadingCharts"
        :class="{ 'bg-gray-800': isDarkMode, 'bg-white': !isDarkMode }"
        class="rounded-lg shadow p-6 mb-8"
      >
        <h3
          class="text-lg font-semibold mb-4"
          :class="{ 'text-white': isDarkMode, 'text-gray-800': !isDarkMode }"
        >
          Depolar Bo'yicha Vagonlar Soni (Ustunli Diagramma)
        </h3>
        <div class="chart-container" style="height: 300px; width: 100%; position: relative">
          <Bar :data="barChartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { getImportTakenOut } from '@/api/user_vagon/importTakenOut.js'
import { Line, Bar } from 'vue-chartjs'
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
  LineElement,
)

// Theme state
const isDarkMode = ref(false)
watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// Data and state
const fullDepoList = ref({}) // Holds data for the top stats (unfiltered)
const filteredDepoList = ref({}) // Holds data for the charts (filtered by button)
const loadingStats = ref(true)
const loadingCharts = ref(true)
const activeFilter = ref('yearly') // Default to 'yearly' instead of 'daily'

// Function to fetch all data for statistics
const fetchAllDataForStats = async () => {
  loadingStats.value = true
  try {
    const res = await getImportTakenOut('all') // Assuming 'all' gets all data. If not, check API docs.
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

// Fetch data on mount
onMounted(() => {
  fetchAllDataForStats()
  fetchChartData('yearly') // Initial load for the charts is now 'yearly'
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
        label: `Import qilinganlar (${activeFilter.value === 'daily' ? 'kunlik' : activeFilter.value === 'monthly' ? 'oylik' : 'yillik'})`,
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
