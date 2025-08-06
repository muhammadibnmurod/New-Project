<template>
  <div class="p-4">
    <div
      class="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800"
      >
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ t('vchd_statistics') }}
          </h2>
        </div>

        <div class="flex items-center gap-3">
          <!-- Sana tanlash -->
          <input
            type="date"
            v-model="selectedDate"
            class="border rounded-md px-3 py-1 text-sm text-gray-700 dark:text-gray-200"
            :max="maxDate"
          />

          <!-- Search -->
          <div class="flex items-center bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-1 shadow-sm">
            <svg
              class="w-4 h-4 text-gray-400"
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
              class="bg-transparent outline-none text-sm px-2 text-gray-700 dark:text-gray-200 min-w-[160px]"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-[700px] w-full table-auto">
          <thead class="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <tr class="text-sm text-gray-600 dark:text-gray-300">
              <th class="p-3 text-left sticky top-0 z-10">#</th>
              <th class="p-3 text-left sticky top-0 z-10">{{ t('company') }}</th>
              <th class="p-3 text-center sticky top-0 z-10">{{ t('imported') }}</th>
              <th class="p-3 text-center sticky top-0 z-10">{{ t('exported') }}</th>
              <th class="p-3 text-center sticky top-0 z-10">{{ t('difference') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(row, index) in pagedData"
              :key="row.vchdId"
              class="transition-colors duration-150 odd:bg-white even:bg-gray-50 dark:odd:bg-transparent dark:even:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/60"
            >
              <td class="p-3 text-sm text-gray-700 dark:text-gray-200">
                {{ startIndex + index + 1 }}
              </td>

              <td class="p-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium"
                  >
                    {{ avatarText(row.name.uz) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900 dark:text-gray-100">
                      {{ row.name.uz }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ t('id') }}: {{ row.vchdId }}
                    </span>
                  </div>
                </div>
              </td>

              <td class="p-3 text-center">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  {{ Number(row.importedCount) }}
                </span>
              </td>

              <td class="p-3 text-center">
                <span
                  class="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                >
                  {{ Number(row.takenOutCount) }}
                </span>
              </td>

              <td class="p-3 text-center">
                <span :class="diffClass(row)">
                  {{ Number(row.importedCount) - Number(row.takenOutCount) >= 0 ? '+' : '' }}
                  {{ Number(row.importedCount) - Number(row.takenOutCount) }}
                </span>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="filteredData.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-500 dark:text-gray-400">
                {{ t('no_data_found') }}
              </td>
            </tr>
          </tbody>

          <!-- Footer totals -->
          <tfoot>
            <tr
              class="bg-gradient-to-r from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 font-semibold text-gray-900 dark:text-gray-100"
            >
              <td colspan="2" class="p-3 text-right">{{ t('total') }}:</td>
              <td class="p-3 text-center">{{ jamiKirgan }}</td>
              <td class="p-3 text-center">{{ jamiChiqgan }}</td>
              <td class="p-3 text-center">
                {{ jamiKirgan - jamiChiqgan >= 0 ? '+' : '' }}{{ jamiKirgan - jamiChiqgan }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="flex items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-gray-800"
      >
        <div class="text-sm text-gray-600 dark:text-gray-300">
          {{ t('showing') }}:
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ startIndex + 1 }}</span> -
          <span class="font-medium text-gray-900 dark:text-gray-100">
            {{ Math.min(endIndex, filteredData.length) }}
          </span>
          /
          <span class="font-medium text-gray-900 dark:text-gray-100">{{
            filteredData.length
          }}</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="page === 1"
            class="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm disabled:opacity-50"
          >
            {{ t('prev') }}
          </button>
          <div class="text-sm text-gray-700 dark:text-gray-200 px-2">
            {{ t('page') }} {{ page }} / {{ totalPages }}
          </div>
          <button
            @click="nextPage"
            :disabled="page === totalPages"
            class="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm disabled:opacity-50"
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
    if (!res.ok) throw new Error("Serverdan ma'lumot olishda xatolik")
    const json = await res.json()
    data.value = json.data || []
    page.value = 1
  } catch (e) {
    console.error(e)
    data.value = []
  }
}

const { t, locale } = useI18n()

watch(locale, () => {

  }
)

onMounted(() => {
  fetchDataByDate(selectedDate.value)
})

watch(selectedDate, (newDate) => {
  fetchDataByDate(newDate)
})

// Qolgan kod: filtering, pagination, hisoblashlar va boshqalar
const filteredData = computed(() => {
  if (!query.value.trim()) return data.value
  const q = query.value.toLowerCase()
  return data.value.filter(
    (r) => r.name.uz.toLowerCase().includes(q) || r.vchdId.toLowerCase().includes(q),
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
  if (diff > 0) return 'text-green-600 dark:text-green-300 font-medium'
  if (diff < 0) return 'text-red-600 dark:text-red-300 font-medium'
  return 'text-gray-700 dark:text-gray-200 font-medium'
}

function prevPage() {
  if (page.value > 1) page.value--
}

function nextPage() {
  if (page.value < totalPages.value) page.value++
}
</script>

<style scoped>
thead th.sticky {
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 10;
}
</style>
