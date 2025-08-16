<template>
  <div
    class="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen text-gray-900 dark:text-gray-100 font-sans"
  >
    <div class="min-w-full mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">
          <span
            class="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 py-1 rounded-lg px-3"
          >
            Vagon
          </span>
          Chiqarilgan Vagonlar
        </h2>
      </div>

      <div v-if="!loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div
          class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-transform hover:scale-105"
        >
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Jami Filtrlangan Vagonlar</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.total }}</p>
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-transform hover:scale-105"
        >
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Chiqarilgan Vagonlar</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.takenOut }}</p>
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-transform hover:scale-105"
        >
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Qolgan Vagonlar</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.remaining }}</p>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && filteredVagons.length > 0"
        class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8"
      >
        <div
          class="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Holatga umumiy nazar
          </h3>
          <div class="chart-container" style="height: 300px; max-height: 300px; position: relative">
            <Doughnut :data="doughnutChartData" :options="chartOptions" />
          </div>
        </div>

        <div
          class="lg:col-span-3 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Depo bo'yicha hisob
          </h3>
          <div class="chart-container" style="height: 300px; max-height: 300px; position: relative">
            <Bar :data="barChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div
        class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        <div class="flex flex-col sm:flex-row gap-3 w-full">
          <div class="relative flex-grow">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Vagon raqami bo'yicha qidirish..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-colors"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>

          <select
            v-model="selectedDepo"
            class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
          >
            <option value="">Barcha Depolar</option>
            <option v-for="(depo, id) in depotList" :key="id" :value="id">
              {{ depo.name }}
            </option>
          </select>

          <select
            v-model="dateFilter"
            class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
          >
            <option value="all">Barcha Sanalar</option>
            <option value="today">Bugun</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu oy</option>
          </select>
        </div>
      </div>

      <!-- Pagination Info -->
      <div class="flex items-center justify-between mb-4 px-2">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredVagons.length }} / {{ totalVagons }} ta vagon ko'rsatilmoqda
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">Sahifadagi qatorlar:</span>
          <select
            v-model="itemsPerPage"
            class="px-2 py-1 border rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <!-- Loading and No Data States -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-pulse flex flex-col items-center">
          <svg
            class="animate-spin h-12 w-12 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.001 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <div class="mt-4 text-gray-500 dark:text-gray-400">Ma'lumotlar yuklanmoqda...</div>
        </div>
      </div>

      <div
        v-else-if="filteredVagons.length === 0"
        class="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md"
      >
        <div class="text-gray-500 dark:text-gray-400 text-lg">Hech qanday vagon topilmadi</div>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Filtrlarni sozlashga harakat qilib ko'ring.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto border rounded-xl shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      >
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                #
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Depo
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Stansiya
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Vagon
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Egasining turi
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Egalik
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Chiqarilgan sana
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(vagon, index) in paginatedVagons"
              :key="vagon.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td
                class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                {{ startItem + index }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                {{ vagon.depotName }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                {{ vagon.stationName }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {{ vagon.vagonNumber }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ vagon.ownerType }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ vagon.ownershipName }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm">
                <span
                  v-if="vagon.releaseDate"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                >
                  {{ formatDate(vagon.releaseDate) }}
                </span>
                <span v-else class="text-gray-500 dark:text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredVagons.length > 0"
        class="flex items-center justify-between mt-6 border-t border-gray-200 dark:border-gray-700 pt-4"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredVagons.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}-{{
            endItem
          }}
          dan {{ filteredVagons.length }} tasi
        </div>
        <div class="flex space-x-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
          >
            Oldingi
          </button>
          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="{
                'bg-blue-600 text-white border-blue-600': currentPage === page,
                'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600':
                  currentPage !== page,
              }"
              class="px-3 py-1 border rounded-md text-sm font-medium transition-colors"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
          >
            Keyingi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
// I'll assume you have a way to import the API function,
// if not, you'd paste its code here.
import { getTakenOutVagons } from '../../api/user_vagon/getTakenOutVagons.js'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const depotList = ref({})
const allVagons = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedDepo = ref('')
const dateFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const doughnutChartData = ref({ labels: [], datasets: [{ backgroundColor: [], data: [] }] })
const barChartData = ref({
  labels: [],
  datasets: [{ label: "Depo bo'yicha vagonlar", backgroundColor: '#3B82F6', data: [] }],
})
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { color: '#9ca3af' } },
  },
  scales: {
    y: { ticks: { color: '#9ca3af' }, beginAtZero: true },
    x: { ticks: { color: '#9ca3af' } },
  },
})

const totalVagons = computed(() => allVagons.value.length)

const filteredVagons = computed(() => {
  let vagons = allVagons.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    vagons = vagons.filter((v) => v.vagonNumber?.toString().includes(query))
  }

  if (selectedDepo.value) {
    vagons = vagons.filter((v) => v.depotId === selectedDepo.value)
  }

  if (dateFilter.value !== 'all') {
    const now = new Date()
    let startDate
    if (dateFilter.value === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (dateFilter.value === 'week') {
      const firstDayOfWeek = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
      startDate = new Date(now.setDate(firstDayOfWeek))
      startDate.setHours(0, 0, 0, 0)
    } else if (dateFilter.value === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    vagons = vagons.filter((v) => {
      const releaseDate = new Date(v.releaseDate)
      return !isNaN(releaseDate.getTime()) && releaseDate >= startDate
    })
  }

  return vagons
})

const stats = computed(() => {
  const total = filteredVagons.value.length
  const takenOut = filteredVagons.value.filter((v) => v.takenOutDate).length
  const remaining = total - takenOut

  const byDepo = filteredVagons.value.reduce((acc, vagon) => {
    const depoName = vagon.depotName || "Noma'lum"
    acc[depoName] = (acc[depoName] || 0) + 1
    return acc
  }, {})

  return { total, takenOut, remaining, byDepo }
})

const paginatedVagons = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredVagons.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredVagons.value.length / itemsPerPage.value)
})

const startItem = computed(() => {
  return filteredVagons.value.length > 0 ? (currentPage.value - 1) * itemsPerPage.value + 1 : 0
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value
  return end > filteredVagons.value.length ? filteredVagons.value.length : end
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    let start = Math.max(1, currentPage.value - 2)
    let end = Math.min(totalPages.value, start + maxVisible - 1)
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
  }
  return pages
})

// Functions
const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page) => {
  currentPage.value = page
}

const updateCharts = () => {
  doughnutChartData.value.labels = ['Chiqarilgan', 'Qolgan']
  doughnutChartData.value.datasets[0].data = [stats.value.takenOut, stats.value.remaining]
  doughnutChartData.value.datasets[0].backgroundColor = ['#10B981', '#F59E0B']

  barChartData.value.labels = Object.keys(stats.value.byDepo)
  barChartData.value.datasets[0].data = Object.values(stats.value.byDepo)
}

// Watchers
watch([searchQuery, selectedDepo, dateFilter], () => {
  currentPage.value = 1
  updateCharts()
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

// Lifecycle hook
onMounted(async () => {
  try {
    const res = await getTakenOutVagons()
    const depots = {}
    const vagons = []

    res.depots.forEach((depo) => {
      depots[depo.id] = { id: depo.id, name: depo.name }

      depo.stations.forEach((station) => {
        station.releasedVagons.forEach((vagon) => {
          vagons.push({
            ...vagon,
            depotName: depo.name,
            depotId: depo.id,
            stationName: station.name,
            stationId: station.id,
            ownershipName: vagon.ownership?.ownershipName || "Noma'lum",
          })
        })
      })
    })

    depotList.value = depots
    allVagons.value = vagons

    updateCharts()
  } catch (error) {
    console.error("Ma'lumotlarni olishda xatolik:", error)
  } finally {
    loading.value = false
  }
})
</script>
