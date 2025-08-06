<template>
  <div class="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-100 dark:bg-gray-900 ">
    <div class="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-700"
      >
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('vchd_statistics') }}
        </h2>
        <div class="flex flex-col sm:flex-row items-center gap-3">
          <!-- Date Picker -->
          <div class="relative">
            <input
              type="date"
              v-model="selectedDate"
              class="w-full sm:w-40 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              :max="maxDate"
            />
          </div>
          <!-- Search Bar -->
          <div
            class="relative flex items-center w-full sm:w-64 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500"
          >
            <svg
              class="w-5 h-5 ml-3 text-gray-400 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              v-model="query"
              type="text"
              :placeholder="t('search_placeholder')"
              class="w-full px-3 py-2 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr class="text-sm font-medium text-gray-600 dark:text-gray-300">
              <th class="p-4 text-left sticky top-0 bg-inherit z-10">#</th>
              <th class="p-4 text-left sticky top-0 bg-inherit z-10">{{ t('company') }}</th>
              <th class="p-4 text-center sticky top-0 bg-inherit z-10">{{ t('imported') }}</th>
              <th class="p-4 text-center sticky top-0 bg-inherit z-10">{{ t('exported') }}</th>
              <th class="p-4 text-center sticky top-0 bg-inherit z-10">{{ t('difference') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in pagedData"
              :key="row.vchdId"
              class="border-b border-gray-200 dark:border-gray-700 transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            >
              <td class="p-4 text-sm text-gray-700 dark:text-gray-200">
                {{ startIndex + index + 1 }}
              </td>
              <td class="p-4">
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-md"
                  >
                    {{ avatarText(row.name.uz) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ row.name[locale] || row.name.uz }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ t('id') }}: {{ row.vchdId }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="p-4 text-center">
                <span
                  class="inline-flex items-center justify-center px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 shadow-sm"
                >
                  {{ Number(row.importedCount) }}
                </span>
              </td>
              <td class="p-4 text-center">
                <span
                  class="inline-flex items-center justify-center px-4 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 shadow-sm"
                >
                  {{ Number(row.takenOutCount) }}
                </span>
              </td>
              <td class="p-4 text-center">
                <span :class="diffClass(row)">
                  {{ Number(row.importedCount) - Number(row.takenOutCount) >= 0 ? '+' : '' }}
                  {{ Number(row.importedCount) - Number(row.takenOutCount) }}
                </span>
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-if="filteredData.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                {{ t('no_data_found') }}
              </td>
            </tr>
          </tbody>
          <!-- Footer Totals -->
          <tfoot>
            <tr class="bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white">
              <td colspan="2" class="p-4 text-right">{{ t('total') }}:</td>
              <td class="p-4 text-center">{{ jamiKirgan }}</td>
              <td class="p-4 text-center">{{ jamiChiqgan }}</td>
              <td class="p-4 text-center">
                {{ jamiKirgan - jamiChiqgan >= 0 ? '+' : '' }}{{ jamiKirgan - jamiChiqgan }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="text-sm text-gray-600 dark:text-gray-300">
          {{ t('showing') }}:
          <span class="font-medium text-gray-900 dark:text-white">{{ startIndex + 1 }}</span> -
          <span class="font-medium text-gray-900 dark:text-white">
            {{ Math.min(endIndex, filteredData.length) }}
          </span>
          /
          <span class="font-medium text-gray-900 dark:text-white">{{ filteredData.length }}</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="prevPage"
            :disabled="page === 1"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {{ t('prev') }}
          </button>
          <span class="text-sm text-gray-700 dark:text-gray-200">
            {{ t('page') }} {{ page }} / {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="page === totalPages"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {{ t('next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const data = ref([])
const query = ref('')
const page = ref(1)
const perPage = ref(6)
const maxDate = new Date().toISOString().split('T')[0]
const selectedDate = ref(maxDate)

const { t, locale } = useI18n()

async function fetchDataByDate(date) {
  try {
    const res = await fetch(
      `http://192.168.136.207:3000/vchds/vagon-stats?date=${date}&type=year`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    )
    if (!res.ok) throw new Error(t('fetchError'))
    const json = await res.json()
    data.value = json.data || []
    page.value = 1
  } catch (e) {
    console.error("Ma'lumot olishda xatolik:", e.message)
    data.value = []
  }
}

onMounted(() => {
  fetchDataByDate(selectedDate.value)
})

watch(selectedDate, (newDate) => {
  fetchDataByDate(newDate)
})

watch(locale, () => {
  // Trigger re-render when locale changes to update displayed names
  data.value = [...data.value]
})

const filteredData = computed(() => {
  if (!query.value.trim()) return data.value
  const q = query.value.toLowerCase()
  return data.value.filter(
    (r) =>
      r.name[locale.value]?.toLowerCase().includes(q) ||
      r.name.uz.toLowerCase().includes(q) ||
      r.vchdId.toLowerCase().includes(q),
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / perPage.value)))
const startIndex = computed(() => (page.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + perPage.value)
const pagedData = computed(() => filteredData.value.slice(startIndex.value, endIndex.value))

const jamiKirgan = computed(() =>
  filteredData.value.reduce((sum, r) => sum + Number(r.importedCount), 0),
)
const jamiChiqgan = computed(() =>
  filteredData.value.reduce((sum, r) => sum + Number(r.takenOutCount), 0),
)

function avatarText(name = '') {
  const parts = String(name).split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function diffClass(row) {
  const diff = Number(row.importedCount) - Number(row.takenOutCount)
  if (diff > 0) return 'text-green-600 dark:text-green-400 font-semibold'
  if (diff < 0) return 'text-red-600 dark:text-red-400 font-semibold'
  return 'text-gray-700 dark:text-gray-200 font-semibold'
}

function prevPage() {
  if (page.value > 1) page.value--
}

function nextPage() {
  if (page.value < totalPages.value) page.value++
}
</script>

<style scoped>
/* Custom styles for sticky headers and smooth transitions */
thead th.sticky {
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

table {
  border-collapse: separate;
  border-spacing: 0;
}

tr {
  transition: background-color 0.2s ease;
}

input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.5) sepia(1) saturate(5) hue-rotate(175deg);
}
.dark input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
}
</style>
