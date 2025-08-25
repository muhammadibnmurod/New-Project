<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8 flex items-start justify-center font-sans transition-colors duration-300"
    :class="darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'">
    <div class="p-6 rounded-xl shadow-lg w-full max-w-7xl border transition-colors duration-300"
      :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'">
      <h1 class="text-2xl font-bold mb-6 text-center transition-colors duration-300"
        :class="darkMode ? 'text-white' : 'text-gray-800'">
        {{ $t("korxonalaekesimida") }}
      </h1>

      <div v-if="loading" class="flex justify-center items-center min-h-[200px]">
        <span :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
          {{ $t("loading") }}
        </span>
      </div>

      <div v-else-if="error" class="flex justify-center items-center min-h-[200px] p-4 rounded-lg"
        :class="darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'">
        <span class="text-lg font-semibold">{{ $t("error") }}</span>
      </div>

      <div v-else-if="!data?.result?.length" class="flex justify-center items-center min-h-[200px] p-4 rounded-lg"
        :class="darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'">
        <span class="text-lg font-semibold">{{ $t("empty") }}</span>
      </div>

      <div v-else>
        <div class="overflow-x-auto rounded-lg shadow border transition-colors duration-300"
          :class="darkMode ? 'border-gray-700' : 'border-gray-200'">
          <table class="min-w-full divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-200'">
            <thead
              :class="darkMode ? 'bg-gradient-to-r from-indigo-700 to-purple-700' : 'bg-gradient-to-r from-blue-500 to-indigo-600'">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg text-white">
                  {{ $t("depotName") }}
                </th>
                <th v-for="key in sortedCountKeys" :key="key"
                  class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">
                  {{ key }}
                </th>
              </tr>
            </thead>
            <tbody :class="darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'">
              <tr v-for="(item, index) in data.result" :key="item.depotId || index"
                :class="index % 2 === 0 ? (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') : ''">
                <td class="px-6 py-4 text-sm font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-900'">
                  {{ item.depotName }}
                </td>
                <td v-for="key in sortedCountKeys" :key="key" class="px-6 py-4 text-sm"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                  {{ item.counts?.[key] || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="data.allCounts" class="mt-8 p-6 rounded-xl shadow border transition-colors duration-300"
          :class="darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200'">
          <h2 class="text-xl font-bold mb-4" :class="darkMode ? 'text-green-300' : 'text-green-800'">
            {{ t("total") }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="([key, value]) in Object.entries(data.allCounts)" :key="key"
              class="flex flex-col p-4 rounded-lg shadow-sm border transition-colors duration-300"
              :class="darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-green-100'">
              <span :class="darkMode ? 'text-gray-400' : 'text-gray-600'">{{ $t(key) }}</span>
              <span :class="darkMode ? 'text-green-400' : 'text-green-700'" class="text-2xl font-bold">
                {{ $t(value) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { API } from "../../api/api.js";
import { useDarkModeStore } from "@/stores/darkModeStore";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

const data = ref(null);
const loading = ref(true);
const error = ref(null);

const darkModeStore = useDarkModeStore();
const { darkMode } = storeToRefs(darkModeStore);

const { t, locale } = useI18n({
  inheritLocale: true,
  useScope: 'global',
});
const sortedCountKeys = computed(() => {
  const keys = new Set();
  if (data.value?.result) {
    data.value.result.forEach((item) => {
      if (item.counts) {
        Object.keys(item.counts).forEach((k) => keys.add(k));
      }
    });
  }
  return Array.from(keys).sort();
});

function changeLang(lang) {
  locale.value = lang;
  localStorage.setItem("lang", lang);
}

onMounted(async () => {
  try {
    const res = await API.get("/outcome/current/imported");
    data.value = res.data;
  } catch (err) {
    error.value = err.message || "Error";
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
