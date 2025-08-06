```vue
<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen shadow-md">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('wagon_details') }}</h2>
      <button
        @click="openModal"
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!isAuthenticated || isSubmitting"
      >
        {{ t('add_new_wagon') }}
      </button>
    </div>

    <!-- Authentication Error -->
    <div
      v-if="!isAuthenticated"
      class="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300 rounded-lg flex justify-between items-center"
    >
      <span>{{ t('auth_error_message') }}</span>
      <button
        @click="error = null"
        class="text-yellow-600 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="mb-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg flex justify-between items-center"
    >
      <span>{{ error }}</span>
      <button
        @click="clearMessages"
        class="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-100"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Success State -->
    <div
      v-if="successMessage"
      class="mb-4 p-4 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 rounded-lg flex justify-between items-center"
    >
      <span>{{ successMessage }}</span>
      <button
        @click="clearMessages"
        class="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Filter and Search -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
          t('filter_by_company')
        }}</label>
        <select
          v-model="selectedVchd"
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">{{ t('all_companies') }}</option>
          <option v-for="vchd in vchds" :key="vchd.id" :value="vchd.id">
            {{ vchd.name[locale] || vchd.name.uz }}
          </option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
          t('search_by_company')
        }}</label>
        <input
          v-model="searchQuery"
          type="text"
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          :placeholder="t('search_company_placeholder')"
        />
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
          t('filter_by_date')
        }}</label>
        <input
          v-model="filterDate"
          type="date"
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          :placeholder="t('select_date')"
        />
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
          t('filter_by_type')
        }}</label>
        <select
          v-model="filterType"
          class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">{{ t('select_type') }}</option>
          <option value="day">{{ t('daily') }}</option>
          <option value="month">{{ t('monthly') }}</option>
          <option value="year">{{ t('yearly') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-4 text-gray-600 dark:text-gray-300">
      {{ t('loading') }}
    </div>

    <!-- Table -->
    <div
      v-if="!isLoading"
      class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <table v-if="filteredVagons.length" class="min-w-full table-auto bg-white dark:bg-gray-800">
        <thead>
          <tr
            class="bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            <th class="p-4 text-left">#</th>
            <th class="p-4 text-left">{{ t('wagon_number') }}</th>
            <th class="p-4 text-left">{{ t('company') }}</th>
            <th class="p-4 text-left">{{ t('imported_time') }}</th>
            <th class="p-4 text-left">{{ t('taken_out_time') }}</th>
            <th class="p-4 text-left">{{ t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(vagon, index) in paginatedVagons"
            :key="vagon.id"
            class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <td class="p-4 text-gray-900 dark:text-gray-200">{{ startIndex + index + 1 }}</td>
            <td class="p-4 text-gray-900 dark:text-gray-200">{{ vagon.number }}</td>
            <td class="p-4 text-gray-900 dark:text-gray-200">
              {{ vagon.vchd?.[locale] || vagon.vchd?.uz || '—' }}
            </td>
            <td class="p-4 text-gray-900 dark:text-gray-200">
              {{ formatDate(vagon.importedTime) }}
            </td>
            <td class="p-4 text-gray-900 dark:text-gray-200">
              {{ vagon.timeTakenOut ? formatDate(vagon.timeTakenOut) : '—' }}
            </td>
            <td class="p-4">
              <button
                @click="openTakenOutModal(vagon)"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-150"
                :disabled="!isAuthenticated || isSubmitting"
              >
                {{ t('edit_taken_out_time') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-else
        class="p-4 text-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg"
      >
        {{ t('no_vagons_found') }}
      </div>
    </div>

    <!-- Modal for Adding New Wagon -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ease-out"
      :class="{ 'opacity-100': showModal, 'opacity-0': !showModal }"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl p-6 sm:p-8 transform transition-all duration-300 ease-out"
        :class="{ 'scale-100': showModal, 'scale-95': !showModal }"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ t('add_new_wagon') }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
              t('wagon_number')
            }}</label>
            <input
              v-model="newVagon.number"
              type="text"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :placeholder="t('wagon_number_placeholder')"
            />
            <p v-if="formErrors.number" class="text-red-600 dark:text-red-300 text-sm mt-1">
              {{ formErrors.number }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
              t('description')
            }}</label>
            <input
              v-model="newVagon.description"
              type="text"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :placeholder="t('description_placeholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
              t('type')
            }}</label>
            <input
              v-model="newVagon.type"
              type="text"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :placeholder="t('type_placeholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
              t('imported_time')
            }}</label>
            <input
              v-model="newVagon.importedTime"
              type="datetime-local"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <p v-if="formErrors.importedTime" class="text-red-600 dark:text-red-300 text-sm mt-1">
              {{ formErrors.importedTime }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
              t('company')
            }}</label>
            <select
              v-model="newVagon.vchdId"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option disabled value="">{{ t('select') }}</option>
              <option v-for="vchd in vchds" :key="vchd.id" :value="vchd.id">
                {{ vchd.name[locale] || vchd.name.uz }}
              </option>
            </select>
            <p v-if="formErrors.vchdId" class="text-red-600 dark:text-red-300 text-sm mt-1">
              {{ formErrors.vchdId }}
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button
            @click="closeModal"
            class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            :disabled="isSubmitting"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="submitVagon"
            class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting || !isAuthenticated || !isFormValid"
          >
            {{ isSubmitting ? t('saving') : t('save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Setting/Editing Taken Out Time -->
    <div
      v-if="showTakenOutModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ease-out"
      :class="{ 'opacity-100': showTakenOutModal, 'opacity-0': !showTakenOutModal }"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all duration-300 ease-out"
        :class="{ 'scale-100': showTakenOutModal, 'scale-95': !showTakenOutModal }"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
            {{ selectedVagon?.timeTakenOut ? t('edit_taken_out_time') : t('set_taken_out_time') }}
          </h3>
          <button
            @click="closeTakenOutModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            :disabled="isSubmitting"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
              t('taken_out_time')
            }}</label>
            <input
              v-model="takenOutTime"
              type="datetime-local"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :placeholder="t('taken_out_placeholder')"
            />
            <p v-if="formErrors.takenOutTime" class="text-red-600 dark:text-red-300 text-sm mt-1">
              {{ formErrors.takenOutTime }}
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button
            @click="closeTakenOutModal"
            class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            :disabled="isSubmitting"
          >
            {{ t('cancel') }}
          </button>
          <button
            @click="submitTakenOutTime"
            class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting || !isAuthenticated || !takenOutTime"
          >
            {{ isSubmitting ? t('saving') : t('save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div
      v-if="totalPages > 1"
      class="flex justify-center mt-6 space-x-2 text-sm font-medium text-gray-600 dark:text-gray-300"
    >
      <button
        @click="currentPage--"
        :disabled="currentPage === 1 || isSubmitting"
        class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('previous') }}
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        :class="[
          'px-3 py-1 rounded-lg border',
          currentPage === page
            ? 'bg-blue-600 text-white border-blue-600'
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700',
          isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        :disabled="isSubmitting"
      >
        {{ page }}
      </button>

      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages || isSubmitting"
        class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('next') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const route = useRoute()
const vagonlar = ref([])
const vchds = ref([])
const showModal = ref(false)
const showTakenOutModal = ref(false)
const takenOutTime = ref('')
const selectedVagonId = ref(null)
const selectedVagon = ref(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref(null)
const successMessage = ref(null)
const isAuthenticated = ref(!!localStorage.getItem('accessToken'))
const selectedVchd = ref('')
const searchQuery = ref('')
const filterDate = ref('')
const filterType = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const formErrors = ref({})

const newVagon = ref({
  number: '',
  description: '',
  type: '',
  importedTime: '',
  vchdId: '',
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const paginatedVagons = computed(() => {
  const start = startIndex.value
  const end = start + itemsPerPage.value
  return filteredVagons.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredVagons.value.length / itemsPerPage.value)),
)

const isFormValid = computed(() => {
  const numberRegex = /^\d{5}$/
  formErrors.value = {}

  if (!numberRegex.test(newVagon.value.number)) {
    formErrors.value.number = t('invalid_wagon_number')
  }
  if (!newVagon.value.importedTime) {
    formErrors.value.importedTime = t('imported_time_required')
  }
  if (!newVagon.value.vchdId) {
    formErrors.value.vchdId = t('company_required')
  }

  return Object.keys(formErrors.value).length === 0
})

const filteredVagons = computed(() => {
  let result = [...vagonlar.value]

  if (selectedVchd.value) {
    result = result.filter((vagon) => vagon.vchd?.id === selectedVchd.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter((vagon) =>
      (vagon.vchd?.[locale.value] || vagon.vchd?.uz || '').toLowerCase().includes(query),
    )
  }

  return result.sort((a, b) => {
    const nameA = a.vchd?.[locale.value] || a.vchd?.uz || ''
    const nameB = b.vchd?.[locale.value] || b.vchd?.uz || ''
    return nameA.localeCompare(nameB, locale.value)
  })
})

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const checkAuth = () => {
  const token = localStorage.getItem('accessToken')
  isAuthenticated.value = !!token
  if (!token) {
    error.value = t('auth_error')
  }
  console.log('Auth check:', { token: !!token })
  return token
}

const clearMessages = () => {
  error.value = null
  successMessage.value = null
}

const showSuccessMessage = (message) => {
  clearMessages()
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}

const fetchData = async () => {
  const token = checkAuth()
  if (!token) return

  isLoading.value = true
  clearMessages()
  try {
    const res = await fetch('http://192.168.136.207:3000/vagons', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      const errorText = await res.text()
      console.log('Fetch vagons error:', errorText)
      if (res.status === 401) throw new Error(t('auth_error_token_invalid'))
      if (res.status === 404) throw new Error(t('vagons_not_found'))
      throw new Error(`${t('fetch_vagons_error')} ${res.status} - ${errorText}`)
    }
    const json = await res.json()
    vagonlar.value = Array.isArray(json) ? json : []
    console.log('Vagons:', vagonlar.value)
  } catch (e) {
    console.error(t('error'), e.message)
    error.value = e.message || t('fetch_vagons_error_general')
  } finally {
    isLoading.value = false
  }
}

const fetchVchds = async () => {
  const token = checkAuth()
  if (!token) return

  isLoading.value = true
  clearMessages()
  try {
    const res = await fetch('http://192.168.136.207:3000/vchds', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      const errorText = await res.text()
      console.log('Fetch VCHDs error:', errorText)
      if (res.status === 401) throw new Error(t('auth_error_token_invalid'))
      throw new Error(`${t('fetch_vchds_error')} ${res.status} - ${errorText}`)
    }
    const json = await res.json()
    vchds.value = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []
    console.log('VCHDs:', vchds.value)
  } catch (e) {
    console.error(t('fetch_vchds_error'), e.message)
    error.value = e.message || t('fetch_vchds_error_general')
  } finally {
    isLoading.value = false
  }
}

const fetchTakenOutStats = async () => {
  const token = checkAuth()
  if (!token) return

  if (!filterDate.value || !filterType.value) {
    error.value = t('date_and_type_required')
    return
  }

  isLoading.value = true
  clearMessages()
  try {
    const url = new URL('http://192.168.136.207:3000/vchds/taken-out-stats')
    url.searchParams.append('date', filterDate.value)
    url.searchParams.append('type', filterType.value)
    url.searchParams.append('page', currentPage.value)
    url.searchParams.append('limit', itemsPerPage.value)

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.log('Fetch taken out stats error:', errorText)
      if (res.status === 401) throw new Error(t('auth_error_token_invalid'))
      if (res.status === 400) throw new Error(`${t('invalid_request_error')} ${errorText}`)
      throw new Error(`${t('fetch_taken_out_stats_error')} ${res.status} - ${errorText}`)
    }

    const json = await res.json()
    vagonlar.value = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []
    console.log('Taken out stats:', vagonlar.value)
    showSuccessMessage(t('filter_applied_success'))
  } catch (e) {
    console.error(t('error'), e.message)
    error.value = e.message || t('fetch_taken_out_stats_error_general')
  } finally {
    isLoading.value = false
  }
}

const submitVagon = async () => {
  const token = checkAuth()
  if (!token) {
    console.log('No token found')
    return
  }

  if (!isFormValid.value) {
    console.log('Form validation failed:', formErrors.value)
    error.value = t('required_fields_error')
    return
  }

  isSubmitting.value = true
  clearMessages()
  try {
    const payload = {
      number: newVagon.value.number.trim(),
      description: newVagon.value.description.trim() || undefined,
      type: newVagon.value.type.trim() || undefined,
      importedTime: newVagon.value.importedTime,
      vchdId: newVagon.value.vchdId,
    }
    console.log('Submit payload:', payload)

    const res = await fetch('http://192.168.136.207:3000/vagons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.log('Server error:', errorText)
      if (res.status === 401) throw new Error(t('auth_error_token_invalid'))
      if (res.status === 400) throw new Error(`${t('invalid_request_error')} ${errorText}`)
      throw new Error(`${t('create_vagon_error')} ${res.status} - ${errorText}`)
    }

    closeModal()
    await fetchData()
    showSuccessMessage(t('add_vagon_success'))
  } catch (e) {
    console.error('Submit error:', e.message)
    error.value = e.message || t('create_vagon_error_general')
  } finally {
    isSubmitting.value = false
  }
}

const openTakenOutModal = (vagon) => {
  if (!isAuthenticated.value) {
    error.value = t('auth_error')
    return
  }
  selectedVagonId.value = vagon.id
  selectedVagon.value = vagon
  takenOutTime.value = vagon.timeTakenOut || ''
  showTakenOutModal.value = true
  clearMessages()
  formErrors.value = {}
}

const closeTakenOutModal = () => {
  showTakenOutModal.value = false
  takenOutTime.value = ''
  selectedVagonId.value = null
  selectedVagon.value = null
  clearMessages()
  formErrors.value = {}
}

const submitTakenOutTime = async () => {
  const token = checkAuth()
  if (!token) return

  formErrors.value = {}
  if (!takenOutTime.value) {
    formErrors.value.takenOutTime = t('taken_out_time_required')
    error.value = t('taken_out_time_required')
    return
  }

  isSubmitting.value = true
  clearMessages()
  try {
    const res = await fetch(`http://192.168.136.207:3000/vagons/${selectedVagonId.value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({ timeTakenOut: takenOutTime.value }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.log('Server error:', errorText)
      if (res.status === 401) throw new Error(t('auth_error_token_invalid'))
      if (res.status === 400) throw new Error(`${t('invalid_request_error')} ${errorText}`)
      if (res.status === 404) throw new Error(`${t('vagon_not_found')} ${selectedVagonId.value}`)
      throw new Error(`${t('update_error')} ${res.status} - ${errorText}`)
    }

    closeTakenOutModal()
    await fetchData()
    showSuccessMessage(t('update_success'))
  } catch (e) {
    console.error('Submit taken out time error:', e.message)
    error.value = e.message || t('taken_out_time_error_general')
  } finally {
    isSubmitting.value = false
  }
}

const openModal = () => {
  if (!isAuthenticated.value) {
    error.value = t('auth_error')
    return
  }
  showModal.value = true
  Object.assign(newVagon.value, {
    number: '',
    description: '',
    type: '',
    importedTime: '',
    vchdId: '',
  })
  clearMessages()
  formErrors.value = {}
}

const closeModal = () => {
  showModal.value = false
  clearMessages()
  formErrors.value = {}
}

watch([filterDate, filterType], () => {
  if (filterDate.value && filterType.value) {
    fetchTakenOutStats()
  } else {
    fetchData()
  }
})

onMounted(() => {
  fetchData()
  fetchVchds()
})
</script>
```
