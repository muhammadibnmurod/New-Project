<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div class="container mx-auto p-4 md:p-8">
            <h1 class="text-3xl font-bold text-center mb-8 text-blue-900 dark:text-blue-300">
                Vagonlarni Boshqarish
            </h1>

            <!-- Form card -->
            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
                <h2 class="text-2xl font-semibold mb-6 text-blue-700 dark:text-blue-400">
                    {{ editingWagon ? 'Vagonni Tahrirlash' : 'Yangi Vagon Yaratish' }}
                </h2>
                <form @submit.prevent="editingWagon ? updateWagon() : createWagon()" class="space-y-4">
                    <input v-model="wagonForm.number" type="text" placeholder="Vagon raqami"
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                        required />
                    <input v-model="wagonForm.createdAt" type="datetime-local"
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        required />

                    <select v-model="wagonForm.wagonDepotId"
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        required>
                        <option disabled value="">Deponi tanlang</option>
                        <option v-for="depot in depots" :key="depot.id" :value="depot.id"
                            class="dark:text-white dark:bg-gray-700">
                            {{ depot.name }}
                        </option>
                    </select>

                    <div class="flex items-center space-x-4">
                        <button type="submit"
                            class="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition duration-300">
                            {{ editingWagon ? 'Saqlash' : 'Yaratish' }}
                        </button>
                        <button v-if="editingWagon" type="button" @click="cancelEdit"
                            class="w-full bg-gray-500 text-white font-bold py-3 rounded-md hover:bg-gray-600 transition duration-300">
                            Bekor qilish
                        </button>
                    </div>
                </form>
            </div>

            <!-- List card -->
            <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 class="text-2xl font-semibold mb-6 text-blue-700 dark:text-blue-400">Vagonlar ro'yxati</h2>
                <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400">Yuklanmoqda...</div>
                <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
                <ul v-else class="space-y-4">
                    <li v-for="wagon in wagons" :key="wagon.id"
                        class="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
                        <div class="mb-2 md:mb-0">
                            <span class="font-semibold text-lg text-gray-800 dark:text-gray-200">{{ wagon.number
                                }}</span>
                            <span class="text-sm text-gray-500 dark:text-gray-400 block md:inline-block md:ml-4">
                                Depo: {{ getDepotName(wagon.wagonDepot.id) }}
                            </span>
                            <span class="text-sm text-gray-500 dark:text-gray-400 block md:inline-block md:ml-4">
                                Yaratilgan: {{ new Date(wagon.createdAt).toLocaleString() }}
                            </span>
                        </div>
                        <div class="flex space-x-2">
                            <button @click="startEdit(wagon)"
                                class="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition duration-300">
                                Tahrirlash
                            </button>
                            <button @click="deleteWagon(wagon.id)"
                                class="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition duration-300">
                                O'chirish
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { API } from "@/api/api.js";

const wagons = ref([]);
const loading = ref(true);
const error = ref(null);
const editingWagon = ref(null);
const wagonForm = ref({
    number: '',
    createdAt: '',
    wagonDepotId: '',
});
const depots = ref([]);

const fetchWagons = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await API.get('/create-wagons');
        wagons.value = response.data;
    } catch (err) {
        console.error('Vagonlarni olishda xatolik:', err);
        error.value = 'Vagonlarni yuklashda xatolik yuz berdi.';
    } finally {
        loading.value = false;
    }
};

const fetchDepots = async () => {
    try {
        // API endpointni va ma'lumotlar strukturasini to'g'irladim
        const response = await API.get('/wagon-depots/names');
        depots.value = response.data.data;
    } catch (err) {
        console.error('Depolarni yuklashda xatolik:', err);
    }
};

const createWagon = async () => {
    try {
        const payload = {
            ...wagonForm.value,
            createdAt: new Date(wagonForm.value.createdAt).toISOString(),
        };
        const response = await API.post('/create-wagons', payload);
        wagons.value.push(response.data);
        resetForm();
    } catch (err) {
        console.error('Yangi vagon yaratishda xatolik:', err);
        error.value = 'Vagon yaratishda xatolik yuz berdi.';
    }
};

const updateWagon = async () => {
    try {
        const payload = {
            ...wagonForm.value,
            createdAt: new Date(wagonForm.value.createdAt).toISOString(),
        };
        const response = await API.patch(`/create-wagons/${editingWagon.value.id}`, payload);
        const index = wagons.value.findIndex(w => w.id === editingWagon.value.id);
        if (index !== -1) {
            wagons.value[index] = response.data;
        }
        cancelEdit();
    } catch (err) {
        console.error('Vagonni tahrirlashda xatolik:', err);
        error.value = 'Vagonni tahrirlashda xatolik yuz berdi.';
    }
};

const deleteWagon = async (id) => {
    try {
        await API.delete(`/create-wagons/${id}`);
        wagons.value = wagons.value.filter(w => w.id !== id);
    } catch (err) {
        console.error('Vagonni o‘chirishda xatolik:', err);
        error.value = 'Vagonni o‘chirishda xatolik yuz berdi.';
    }
};

const getDepotName = (depotId) => {

    console.log('Depo ID:', depotId, depots.value);
    const depot = depots.value.find(d => d.id === depotId);
    return depot ? depot.name : 'Noma\'lum depo';
};

const startEdit = (wagon) => {
    editingWagon.value = wagon;
    wagonForm.value = {
        number: wagon.number,
        createdAt: wagon.createdAt ? wagon.createdAt.slice(0, 16) : '',
        wagonDepotId: wagon.wagonDepotId,
    };
};

const cancelEdit = () => {
    editingWagon.value = null;
    resetForm();
};

const resetForm = () => {
    wagonForm.value = {
        number: '',
        createdAt: '',
        wagonDepotId: '',
    };
};

onMounted(() => {
    fetchDepots();
    fetchWagons();
});
</script>

<style scoped></style>
