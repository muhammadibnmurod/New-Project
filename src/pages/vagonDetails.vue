<template>
  <div class="p-4">
    <h2 class="text-lg font-semibold mb-4">Vagon tafsilotlari (ID: {{ vchdId }})</h2>

    <table class="min-w-full table-auto">
      <thead>
        <tr class="bg-gray-100 dark:bg-gray-800 text-sm text-left">
          <th class="p-2">#</th>
          <th class="p-2">Vagon raqami</th>
          <th class="p-2">Kirgan vaqti</th>
          <th class="p-2">Chiqqan vaqti</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(vagon, index) in vagonlar"
          :key="vagon.id"
          class="border-b dark:border-gray-700"
        >
          <td class="p-2">{{ index + 1 }}</td>
          <td class="p-2">{{ vagon.vagonNumber }}</td>
          <td class="p-2">{{ vagon.importedAt }}</td>
          <td class="p-2">{{ vagon.takenOutAt || '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const vchdId = route.params.id
const vagonlar = ref([])

onMounted(async () => {
  try {
    const res = await fetch(`http://192.168.136.207:3000/vchds/vagon-details/${vchdId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
    const json = await res.json()
    vagonlar.value = json.data || []
  } catch (e) {
    console.error('Xatolik:', e)
  }
})
</script>
