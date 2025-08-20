<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const wagons = ref([])
const loading = ref(false)
const error = ref(null)

const fetchWagons = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get("http://192.168.136.207:3000/outcome/current/released")
    wagons.value = res.data.flatMap(region =>
      region.stations.flatMap(st =>
        st.releasedVagons.map(v => ({
          region: region.name,
          station: st.name,
          ...v
        }))
      )
    )
  } catch (err) {
    error.value = t("error")
  } finally {
    loading.value = false
  }
}

onMounted(fetchWagons)
</script>

<template>
  <div class="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
    <div class="max-w-7xl mx-auto">
      <h2
        class="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6 border-b-2 border-indigo-500 pb-2"
      >
        {{ t("title") }}
      </h2>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="text-indigo-600 dark:text-indigo-400 font-medium text-lg">
          {{ t("loading") }}
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative"
        role="alert"
      >
        <strong class="font-bold">Xato!</strong>
        <span class="block sm:inline ml-2">{{ error }}</span>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!wagons.length"
        class="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg relative"
        role="alert"
      >
        <strong class="font-bold">{{ t("warning") }}</strong>
        <span class="block sm:inline ml-2">{{ t("empty") }}</span>
      </div>

      <!-- Table -->
      <div
        v-else
        class="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700"
      >
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-300">
          <thead class="text-xs text-gray-700 dark:text-gray-200 uppercase bg-gray-100 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3">{{ t("region") }}</th>
              <th class="px-6 py-3">{{ t("station") }}</th>
              <th class="px-6 py-3">{{ t("vagonNumber") }}</th>
              <th class="px-6 py-3">{{ t("vagonType") }}</th>
              <th class="px-6 py-3">{{ t("ownership") }}</th>
              <th class="px-6 py-3">{{ t("repairType") }}</th>
              <th class="px-6 py-3">{{ t("status") }}</th>
              <th class="px-6 py-3">{{ t("releaseDate") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="wagon in wagons"
              :key="wagon.id"
              class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out"
            >
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {{ wagon.region }}
              </td>
              <td class="px-6 py-4">{{ wagon.station }}</td>
              <td class="px-6 py-4">{{ wagon.vagonNumber }}</td>
              <td class="px-6 py-4">{{ wagon.vagonType }}</td>
              <td class="px-6 py-4">{{ wagon.ownership?.ownershipName }}</td>
              <td class="px-6 py-4">{{ wagon.repairType }}</td>
              <td class="px-6 py-4">
                <span
                  :class="wagon.loadStatus === 'loaded'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'"
                  class="px-2.5 py-0.5 rounded-full font-semibold text-xs"
                >
                  {{ wagon.loadStatus }}
                </span>
              </td>
              <td class="px-6 py-4">{{ wagon.releaseDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
