<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen shadow-md relative">
    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="(notification, index) in notifications"
        :key="index"
        class="relative p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-out transform"
        :class="{
          'bg-green-50 dark:bg-green-900/80 border-l-4 border-green-500 text-green-800 dark:text-green-200':
            notification.type === 'success',
          'bg-red-50 dark:bg-red-900/80 border-l-4 border-red-500 text-red-800 dark:text-red-200':
            notification.type === 'error',
          'bg-yellow-50 dark:bg-yellow-900/80 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200':
            notification.type === 'warning',
        }"
        style="animation: slide-in 0.4s ease-out"
      >
        <div class="flex items-center gap-3">
          <svg
            v-if="notification.type === 'success'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <svg
            v-if="notification.type === 'error'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <svg
            v-if="notification.type === 'warning'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{{ notification.message }}</span>
        </div>
        <button
          @click="removeNotification(index)"
          class="absolute top-2 right-2 text-current hover:text-gray-600 dark:hover:text-gray-200"
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
    </div>

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
const isAuthenticated = ref(!!localStorage.getItem('accessToken'))
const selectedVchd = ref('')
const searchQuery = ref('')
const filterDate = ref('')
const filterType = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const formErrors = ref({})
const notifications = ref([])

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
  let result = vagonlar.value

  if (selectedVchd.value) {
    result = result.filter((vagon) => vagon.vchdId === selectedVchd.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter((vagon) => {
      const vchdName = vagon.vchd?.[locale.value] || vagon.vchd?.uz || ''
      return vchdName.toLowerCase().includes(query)
    })
  }

  if (filterDate.value && filterType.value) {
    result = result.filter((vagon) => {
      if (!vagon.timeTakenOut) return false
      const takenOutDate = new Date(vagon.timeTakenOut)
      const filterDateObj = new Date(filterDate.value)

      if (filterType.value === 'day') {
        return (
          takenOutDate.getFullYear() === filterDateObj.getFullYear() &&
          takenOutDate.getMonth() === filterDateObj.getMonth() &&
          takenOutDate.getDate() === filterDateObj.getDate()
        )
      } else if (filterType.value === 'month') {
        return (
          takenOutDate.getFullYear() === filterDateObj.getFullYear() &&
          takenOutDate.getMonth() === filterDateObj.getMonth()
        )
      } else if (filterType.value === 'year') {
        return takenOutDate.getFullYear() === filterDateObj.getFullYear()
      }
      return true
    })
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
    addNotification('warning', t('auth_error'))
  }
  console.log('Auth check:', { token: !!token })
  return token
}

const addNotification = (type, message) => {
  notifications.value.push({ type, message })
  setTimeout(() => {
    removeNotification(0)
  }, 5000) // Auto-dismiss after 5 seconds
}

const removeNotification = (index) => {
  notifications.value.splice(index, 1)
}

const clearMessages = () => {
  notifications.value = []
}

const showSuccessMessage = (message) => {
  clearMessages()
  addNotification('success', message)
}

const fetchVchdsAndVagons = async () => {
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
      console.log('Fetch VCHDs and vagons error:', errorText)
      if (res.status === 401) throw new Error(t('auth_error_token_invalid'))
      throw new Error(`${t('fetch_data_error')} ${res.status} - ${errorText}`)
    }
    const json = await res.json()
    vchds.value = Array.isArray(json.data) ? json.data : []

    // Flatten vagons and include VCHD name
    vagonlar.value = vchds.value.flatMap((vchd) =>
      vchd.vagons.map((vagon) => ({
        ...vagon,
        vchdId: vchd.id,
        vchd: vchd.name,
      })),
    )

    console.log('VCHDs:', vchds.value)
    console.log('Vagons:', vagonlar.value)
  } catch (e) {
    console.error(t('error'), e.message)
    addNotification('error', e.message || t('fetch_data_error_general'))
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
    addNotification('error', t('required_fields_error'))
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
    await fetchVchdsAndVagons()
    showSuccessMessage(t('add_vagon_success'))
  } catch (e) {
    console.error('Submit error:', e.message)
    addNotification('error', e.message || t('create_vagon_error_general'))
  } finally {
    isSubmitting.value = false
  }
}

const openTakenOutModal = (vagon) => {
  if (!isAuthenticated.value) {
    addNotification('warning', t('auth_error'))
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
    addNotification('error', t('taken_out_time_required'))
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
    await fetchVchdsAndVagons()
    showSuccessMessage(t('update_success'))
  } catch (e) {
    console.error('Submit taken out time error:', e.message)
    addNotification('error', e.message || t('taken_out_time_error_general'))
  } finally {
    isSubmitting.value = false
  }
}

const openModal = () => {
  if (!isAuthenticated.value) {
    addNotification('warning', t('auth_error'))
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
    showSuccessMessage(t('filter_applied_success'))
  } else {
    fetchVchdsAndVagons()
  }
})

onMounted(() => {
  fetchVchdsAndVagons()
})
</script>

<style>
/* Animation for toast notifications */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
