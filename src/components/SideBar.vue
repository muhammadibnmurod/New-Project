```vue
<template>
  <aside
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :class="[
      'transition-all duration-500 ease-in-out flex flex-col',
      collapsed ? 'w-20 px-2 items-center' : 'w-64 px-4',
      'bg-white dark:bg-gray-800 text-black dark:text-white bg-opacity-95 backdrop-blur-lg min-h-[calc(100vh-2rem)] py-4',
    ]"
  >
    <!-- Header -->
    <div
      class="mb-8"
      :class="collapsed ? 'w-full flex justify-center' : 'flex justify-between items-center px-2'"
    >
      <button
        @click="collapsed = !collapsed"
        class="flex flex-col items-center gap-[6px] p-2 group hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
      >
        <div
          class="h-0.5 transition-all duration-300 rounded-full bg-gray-600 dark:bg-gray-200"
          :class="collapsed ? 'w-5' : 'w-6'"
        ></div>
        <div
          class="h-0.5 transition-all duration-300 rounded-full bg-gray-600 dark:bg-gray-200"
          :class="collapsed ? 'w-4' : 'w-6'"
        ></div>
        <div
          class="h-0.5 transition-all duration-300 rounded-full bg-gray-600 dark:bg-gray-200"
          :class="collapsed ? 'w-3' : 'w-6'"
        ></div>
      </button>
    </div>

    <!-- Menu Items -->
    <nav class="flex flex-col gap-2 flex-1 w-full">
      <div
        v-for="item in filteredMenu"
        :key="item.label"
        @click="selectItem(item)"
        class="relative flex items-center transition-all duration-200"
        :class="[
          collapsed ? 'justify-center' : 'justify-between px-3',
          'py-3 rounded-lg cursor-pointer',
          isActive(item)
            ? 'bg-blue-600 text-white shadow-sm'
            : item.pro
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700',
        ]"
      >
        <div
          :class="[
            'flex gap-3 items-center w-full transition-all duration-300',
            collapsed ? 'flex-col justify-center' : 'flex-row justify-start',
          ]"
        >
          <component
            :is="item.icon"
            class="w-6 h-6 text-gray-600 dark:text-gray-300"
            :class="isActive(item) ? 'text-white' : 'group-hover:text-blue-500'"
          />
          <span
            v-if="!collapsed"
            class="text-sm font-medium"
            :class="isActive(item) ? 'text-white' : 'text-gray-800 dark:text-gray-200'"
          >
            {{ t(item.label) }}
          </span>
        </div>

        <span v-if="item.pro && !collapsed" class="text-gray-400 dark:text-gray-300 text-xs">
          🔒
        </span>

        <div
          v-if="item.badge && !collapsed"
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-xs px-2 py-0.5 rounded-full text-white"
        >
          {{ item.badge }}
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { useDarkModeStore } from '../stores/darkModeStore.js'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChartBarIcon, TruckIcon, UserIcon } from '@heroicons/vue/24/outline'
import { jwtDecode } from 'jwt-decode' // To'g'ri nomli eksport

const collapsed = ref(true)
const active = ref('vchd_statistics')
const currentUserRole = ref(null) // Foydalanuvchi roli
const darkModeStore = useDarkModeStore()
const router = useRouter()
const { t } = useI18n()

// Asosiy menyu ro'yxati
const menu = [
  { label: 'vchd_statistics', icon: ChartBarIcon, path: '/vchd' },
  { label: 'wagon_details', icon: TruckIcon, path: '/vagon' },
  { label: 'user', icon: UserIcon, path: '/user', superadminOnly: true }, // Faqat superadmin uchun
]

// Filtrlangan menyu: faqat superadmin uchun user menyusini ko'rsatadi
const filteredMenu = computed(() => {
  if (currentUserRole.value === 'superadmin') {
    return menu // Superadmin uchun barcha menyu ko'rsatiladi
  }
  return menu.filter((item) => !item.superadminOnly)
})

// Foydalanuvchi rolini JWT dan olish
const fetchCurrentUserRole = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    currentUserRole.value = null
    return
  }
  try {
    const decoded = jwtDecode(token)
    currentUserRole.value = decoded.role || null
  } catch (e) {
    console.error('JWT decode error:', e.message)
    currentUserRole.value = null
    localStorage.removeItem('accessToken') // Noto'g'ri tokenni o'chirish
  }
}

onMounted(() => {
  darkModeStore.initTheme()
  fetchCurrentUserRole() // Foydalanuvchi rolini olish
})

function handleMouseEnter() {
  collapsed.value = false
}

function handleMouseLeave() {
  collapsed.value = true
}

function selectItem(item) {
  if (!item.pro) {
    active.value = item.label
    if (item.path) {
      router.push(item.path)
    }
  }
}

function isActive(item) {
  return active.value === item.label && !item.pro
}
</script>
```
