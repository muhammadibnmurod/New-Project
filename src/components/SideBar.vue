<template>
  <aside
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :class="[
      'min-h-[calc(103vh-3rem)] my-2 mx-2 p-4 rounded-2xl shadow-lg transition-[width,background-color] duration-500 ease-in-out flex flex-col',
      collapsed ? 'w-20 px-2 items-center' : 'w-64 px-4',
      'bg-white text-black dark:bg-[#111] dark:text-white bg-opacity-90 backdrop-blur',
    ]"
  >
    <!-- Header -->
    <div
      class="mb-6"
      :class="collapsed ? 'w-full flex justify-center' : 'flex justify-between items-center px-2'"
    >
      <h1 v-if="!collapsed" class="text-2xl font-bold text-center flex-1">Lorem</h1>
      <button
        @click="collapsed = !collapsed"
        class="flex flex-col items-center gap-[5px] p-2 group"
      >
        <div
          class="h-0.5 transition-all duration-300 rounded-full bg-black dark:bg-white"
          :class="collapsed ? 'w-5' : 'w-6'"
        ></div>
        <div
          class="h-0.5 transition-all duration-300 rounded-full bg-black dark:bg-white"
          :class="collapsed ? 'w-4' : 'w-6'"
        ></div>
        <div
          class="h-0.5 transition-all duration-300 rounded-full bg-black dark:bg-white"
          :class="collapsed ? 'w-3' : 'w-6'"
        ></div>
      </button>
    </div>

    <!-- Menu Items -->
    <div class="flex flex-col gap-2 flex-1 w-full">
      <div
        v-for="item in menu"
        :key="item.label"
        @click="selectItem(item)"
        class="relative flex items-center transition justify-start"
        :class="[
          collapsed ? 'justify-center' : 'justify-between px-3',
          'py-3 rounded-lg cursor-pointer',
          isActive(item)
            ? 'bg-blue-600 text-white'
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
          <span class="text-xl">{{ item.icon }}</span>
          <span v-if="!collapsed" class="text-sm">{{ item.label }}</span>
        </div>

        <span v-if="item.pro && !collapsed" class="text-gray-400 dark:text-gray-300">🔒</span>

        <div
          v-if="item.badge && !collapsed"
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-xs px-2 py-0.5 rounded-full text-white"
        >
          {{ item.badge }}
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useDarkModeStore } from '../stores/darkModeStore.js'
import { onMounted, ref } from 'vue'

const collapsed = ref(true)
const active = ref('Dashboard')

const darkModeStore = useDarkModeStore()

onMounted(() => {
  darkModeStore.initTheme()
})

const menu = [
  { label: 'Vchd', icon: '📊' },
  { label: 'Vagon', icon: '🔥' },
]

function handleMouseEnter() {
  collapsed.value = false
}

function handleMouseLeave() {
  collapsed.value = true
}

function selectItem(item) {
  if (!item.pro) active.value = item.label
}

function isActive(item) {
  return active.value === item.label && !item.pro
}
</script>
