<template>
  <aside :class="[
    'transition-all duration-500 ease-in-out flex flex-col',
    collapsed ? 'w-20 px-2 items-center' : 'w-64 px-4',
    'bg-white dark:bg-gray-800 text-black dark:text-white bg-opacity-95 backdrop-blur-lg min-h-[calc(100vh-2rem)] py-4 shadow-xl',
  ]">
    <div class="mb-8" :class="collapsed ? 'w-full flex justify-center' : 'flex justify-between items-center px-2'">
      <button @click="collapsed = !collapsed"
        class="flex flex-col items-center gap-[6px] p-2 group hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200">
        <div class="h-0.5 transition-all duration-300 rounded-full bg-gray-600 dark:bg-gray-200"
          :class="collapsed ? 'w-5' : 'w-6'"></div>
        <div class="h-0.5 transition-all duration-300 rounded-full bg-gray-600 dark:bg-gray-200"
          :class="collapsed ? 'w-4' : 'w-6'"></div>
        <div class="h-0.5 transition-all duration-300 rounded-full bg-gray-600 dark:bg-gray-200"
          :class="collapsed ? 'w-3' : 'w-6'"></div>
      </button>
    </div>

    <nav class="flex flex-col gap-2 flex-1 w-full">
      <div v-for="item in filteredMenu" :key="item.label" @click="selectItem(item)"
        class="relative flex items-center transition-all duration-200 group" :class="[
          collapsed ? 'justify-center' : 'justify-between px-3',
          'py-3 rounded-lg cursor-pointer',
          isActive(item)
            ? 'bg-blue-600 text-white shadow-lg'
            : item.pro
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700',
        ]">
        <div :class="[
          'flex gap-3 items-center w-full transition-all duration-300',
          collapsed ? 'flex-col justify-center' : 'flex-row justify-start',
        ]">
          <component :is="item.icon" class="w-6 h-6" :class="isActive(item)
            ? 'text-white'
            : 'text-gray-600 dark:text-gray-300 group-hover:text-blue-500'
            " />
          <span v-if="!collapsed" class="text-sm font-medium transition-colors duration-200"
            :class="isActive(item) ? 'text-white' : 'text-gray-800 dark:text-gray-200'">
            {{ t(item.label) }}
          </span>
        </div>

        <div v-if="collapsed"
          class="absolute left-full ml-4 whitespace-nowrap bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          {{ t(item.label) }}
        </div>

        <span v-if="item.pro && !collapsed"
          class="text-gray-400 dark:text-gray-300 text-xs transition-opacity duration-200">
          🔒
        </span>

        <div v-if="item.badge && !collapsed"
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-xs px-2 py-0.5 rounded-full text-white transition-opacity duration-200">
          {{ item.badge }}
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { useDarkModeStore } from '../stores/darkModeStore.js'
import { onMounted, ref, computed, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ChartBarSquareIcon,
  ArrowDownTrayIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  ArrowTopRightOnSquareIcon,
  UserGroupIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/solid'
import { jwtDecode } from 'jwt-decode'

const collapsed = ref(true)
const active = ref('vchd_statistics')
const currentUserRole = ref(null)
const darkModeStore = useDarkModeStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const menu = [
  { label: 'vchd_statistics', icon: ChartBarSquareIcon, path: '/vchd', roles: ['moderator'] },
  { label: 'import_taken_out', icon: ArrowDownTrayIcon, path: '/import_taken_out', roles: ['viewer'] },
  { label: 'vagon_user', icon: BuildingOffice2Icon, path: '/vagon_user', roles: ['viewer'] },
  { label: 'planned_taken_out', icon: ClipboardDocumentListIcon, path: '/planned_taken_out', roles: ['viewer'] },
  { label: 'get_taken_out', icon: ArrowTopRightOnSquareIcon, path: '/get_taken_out', roles: ['viewer'] },
  { label: 'user', icon: UserGroupIcon, path: '/user', roles: ['superadmin'] },
  { label: 'current_taken_out', icon: ClockIcon, path: '/current_taken_out', roles: ['viewer'] },
  { label: 'released', icon: WrenchScrewdriverIcon, path: '/released', roles: ['viewer'] },
  { label: 'last_table', icon: WrenchScrewdriverIcon, path: '/last_table', roles: ['viewer'] },
  { label: 'wagon_page', icon: WrenchScrewdriverIcon, path: '/wagon_page', roles: ['add_admin'] },
  { label: 'create_wagons', icon: ClipboardDocumentListIcon, path: '/create_wagons', roles: ['viewer'] },




]

const filteredMenu = computed(() => {
  if (!currentUserRole.value) return []
  return menu.filter((item) => item.roles.includes(currentUserRole.value))
})

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
    localStorage.removeItem('accessToken')
  }
}

watchEffect(() => {
  const currentPath = route.path
  const matchedItem = menu.find((item) => item.path === currentPath)
  if (matchedItem) {
    active.value = matchedItem.label
  }
})

onMounted(() => {
  darkModeStore.initTheme()
  fetchCurrentUserRole()
})

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

<style scoped>
/* Optional: Add custom transitions or styles here if needed beyond Tailwind */
</style>