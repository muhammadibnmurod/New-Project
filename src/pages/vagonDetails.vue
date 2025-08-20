<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Vagon tafsilotlari</h2>
      <button
        @click="openModal"
        class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 shadow-sm"
        :disabled="!isAuthenticated"
      >
        Yangi vagon qo‘shish
      </button>
    </div>

    <!-- Authentication Error -->
    <div
      v-if="!isAuthenticated"
      class="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-300 rounded-lg flex justify-between items-center"
    >
      <span>Iltimos, tizimga kiring. Autentifikatsiya tokeni topilmadi.</span>
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
        @click="error = null"
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

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-4 text-gray-600 dark:text-gray-300">
      Yuklanmoqda...
    </div>

    <!-- Table -->
    <div
      v-if="!isLoading"
      class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <table v-if="vagonlar.length" class="min-w-full table-auto bg-white dark:bg-gray-800">
        <thead>
          <tr
            class="bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            <th class="p-4 text-left">#</th>
            <th class="p-4 text-left">Vagon raqami</th>
            <th class="p-4 text-left">Korxona</th>
            <th class="p-4 text-left">Kirgan vaqti</th>
            <th class="p-4 text-left">Chiqqan vaqti</th>
            <th class="p-4 text-left">Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(vagon, index) in vagonlar"
            :key="vagon.id"
            class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
          >
            <td class="p-4 text-gray-900 dark:text-gray-200">{{ index + 1 }}</td>
            <td class="p-4 text-gray-900 dark:text-gray-200">{{ vagon.number }}</td>
            <td class="p-4 text-gray-900 dark:text-gray-200">{{ vagon.vchd?.uz || '—' }}</td>
            <td class="p-4 text-gray-900 dark:text-gray-200">
              {{ formatDate(vagon.importedTime) }}
            </td>
            <td class="p-4 text-gray-900 dark:text-gray-200">{{ vagon.timeTakenOut || '—' }}</td>
            <td class="p-4">
              <button
                @click="setTakenOutTime(vagon.id)"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-150"
                :disabled="!isAuthenticated"
              >
                Chiqib ketgan vaqtni qo‘shish
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-else
        class="p-4 text-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg"
      >
        Hozircha vagonlar mavjud emas. Yangi vagon qo‘shish uchun yuqoridagi tugmani bosing.
      </div>
    </div>

    <!-- Modal -->
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
          <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">Yangi vagon qo‘shish</h3>
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Vagon raqami</label
            >
            <input
              v-model="newVagon.number"
              type="text"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Vagon raqamini kiriting"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Tavsif</label
            >
            <input
              v-model="newVagon.description"
              type="text"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Tavsifni kiriting"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Turi</label
            >
            <input
              v-model="newVagon.type"
              type="text"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Vagon turini kiriting"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Kirgan vaqti</label
            >
            <input
              v-model="newVagon.importedTime"
              type="datetime-local"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Korxona</label
            >
            <select
              v-model="newVagon.vchdId"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option disabled value="">Tanlang</option>
              <option v-for="vchd in vchds" :key="vchd.id" :value="vchd.id">
                {{ vchd.uz }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button
            @click="closeModal"
            class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Bekor qilish
          </button>
          <button
            @click="submitVagon"
            class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
            :disabled="isSubmitting || !isAuthenticated"
          >
            {{ isSubmitting ? 'Saqlanmoqda...' : 'Saqlash' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { useRoute } from 'vue-router'
import { API } from '../api/api.js' // shu yerda sen yaratgan API faylga yo‘lini yozasan

// const route = useRoute()
const vagonlar = ref([])
const vchds = ref([])
const showModal = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref(null)
const isAuthenticated = ref(!!localStorage.getItem('accessToken'))

const newVagon = ref({
  number: '',
  description: '',
  type: '',
  importedTime: '',
  vchdId: '',
})

const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString('uz-UZ', {
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
    error.value = 'Autentifikatsiya xatosi: Iltimos, tizimga kiring'
  }
  return token
}

const fetchData = async () => {
  if (!checkAuth()) return
  isLoading.value = true
  error.value = null
  try {
    const res = await API.get('/vagons')
    vagonlar.value = res.data || []
  } catch (e) {
    console.error('Xatolik:', e.message)
    error.value = e.response?.data?.message || e.message
  } finally {
    isLoading.value = false
  }
}

const fetchVchds = async () => {
  if (!checkAuth()) return
  isLoading.value = true
  error.value = null
  try {
    const res = await API.get('/vchds')
    vchds.value = res.data?.data || []
  } catch (e) {
    console.error('Korxonalarni olishda xatolik:', e.message)
    error.value = e.response?.data?.message || e.message
  } finally {
    isLoading.value = false
  }
}

const submitVagon = async () => {
  if (!checkAuth()) return

  if (!newVagon.value.number || !newVagon.value.importedTime || !newVagon.value.vchdId) {
    error.value = 'Iltimos, vagon raqami, kirgan vaqti va korxonani to‘ldiring'
    return
  }

  isSubmitting.value = true
  error.value = null
  try {
    await API.post('/vagons', newVagon.value)
    closeModal()
    await fetchData()
  } catch (e) {
    console.error('Yuborishda xatolik:', e.message)
    error.value = e.response?.data?.message || e.message
  } finally {
    isSubmitting.value = false
  }
}

const setTakenOutTime = async (vagonId) => {
  if (!checkAuth()) return

  const time = prompt(
    'Chiqib ketgan sanani kiriting (YYYY-MM-DDTHH:MM formatida, masalan: 2025-08-06T12:30):',
  )
  if (!time) return

  const timeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
  if (!timeRegex.test(time)) {
    error.value = 'Noto‘g‘ri sana formati. Iltimos, YYYY-MM-DDTHH:MM formatida kiriting'
    return
  }

  try {
    await API.patch(`/vagons/${vagonId}/taken-out`, { timeTakenOut: time })
    await fetchData()
  } catch (e) {
    console.error('Chiqqan sanani yozishda xatolik:', e.message)
    error.value = e.response?.data?.message || e.message
  }
}

const openModal = () => {
  if (!isAuthenticated.value) {
    error.value = 'Autentifikatsiya xatosi: Iltimos, tizimga kiring'
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
  error.value = null
}

const closeModal = () => {
  showModal.value = false
  error.value = null
}

onMounted(() => {
  fetchData()
  fetchVchds()
})
</script>
