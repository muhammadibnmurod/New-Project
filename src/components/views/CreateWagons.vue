<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div class="container mx-auto p-4 md:p-8">
            <h1 class="text-3xl font-bold text-center mb-8 text-blue-900 dark:text-blue-300">
                Vagon Depolari Hisoboti
            </h1>

            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 class="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-400">
                    Depolar ro'yxati
                </h2>
                
                <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 p-8">
                    Yuklanmoqda...
                </div>
                <div v-else-if="error" class="text-center text-red-500 p-8">
                    Xatolik: {{ error }}
                </div>
                
                <div v-else class="overflow-x-auto">
                    <table class="min-w-full bg-white dark:bg-gray-800">
                        <thead>
                            <tr class="w-full bg-gray-100 dark:bg-gray-700 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <th class="py-3 px-4 rounded-tl-lg">Depo nomi</th>
                                <th class="py-3 px-4 text-center rounded-tr-lg">Yaratilgan vagonlar soni</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr 
                                v-for="depot in depots" 
                                :key="depot.id" 
                                class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                                <td class="py-3 px-4 text-gray-800 dark:text-gray-200">{{ depot.name }}</td>
                                <td class="py-3 px-4 text-center text-gray-800 dark:text-gray-200">{{ depot.createdWagonsCount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="!loading && !error && totalWagons > 0" class="flex justify-between items-center mt-6">
                    <button
                        @click="changePage(-1)"
                        :disabled="page === 1"
                        class="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-300"
                    >
                        Avvalgisi
                    </button>
                    <span class="text-gray-700 dark:text-gray-300">
                        Sahifa {{ page }} dan {{ totalPages }}
                    </span>
                    <button
                        @click="changePage(1)"
                        :disabled="page === totalPages"
                        class="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors duration-300"
                    >
                        Keyingisi
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { API } from "@/api/api.js";

const depots = ref([]);
const loading = ref(true);
const error = ref(null);
const page = ref(1); 
const limit = ref(10); 
const totalWagons = ref(0);

const totalPages = computed(() => {
    return Math.ceil(totalWagons.value / limit.value);
});

const fetchDepots = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await API.get('/create-wagons/depots', {
            params: { page: page.value, limit: limit.value }
        });

        depots.value = response.data.depots;
        totalWagons.value = response.data.totalCreatedWagons;
    } catch (err) {
        console.error('Depolarni yuklashda xatolik:', err);
        error.value = 'Depolarni yuklashda xatolik yuz berdi.';
    } finally {
        loading.value = false;
    }
};

const changePage = (direction) => {
    const newPage = page.value + direction;
    if (newPage >= 1 && newPage <= totalPages.value) {
        page.value = newPage;
    }
};

onMounted(() => {
    fetchDepots();
});

watch(page, () => {
    fetchDepots();
});
</script>

<style scoped>
th, td {
    padding: 0.75rem 1rem;
}
</style>
