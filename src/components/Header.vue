<template>
  <div
    class="relative w-full h-16 px-4 flex items-center justify-end transition-all duration-300 bg-white text-black dark:text-white"
  >
    <div class="relative" ref="dropdownRef">
      <img
        src="https://i.pravatar.cc/40"
        alt="Profile"
        class="w-10 h-10 rounded-full cursor-pointer"
        @click.stop="toggleDropdown"
      />

      <div
        v-if="dropdownOpen"
        class="absolute right-0 mt-2 w-52 rounded-md shadow-lg py-2 z-50 transition-all bg-white text-black dark:bg-[#2a2a2a] dark:text-white"
      >
        <button
          class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          @click="() => alert('Profilga kirish')"
        >
          🧑 Profilga kirish
        </button>

        <div class="relative">
          <button
            class="w-full text-left px-4 py-2 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800"
            @click.stop="languageOpen = !languageOpen"
          >
            🌐 Til: {{ selectedLang }}
          </button>

          <div
            v-if="languageOpen"
            class="absolute right-full top-0 mr-2 w-28 rounded-md shadow-lg z-50 bg-white text-black dark:bg-[#2a2a2a] dark:text-white"
          >
            <button
              v-for="lang in ['Uzbek', 'English', 'Russion', 'Krill']"
              :key="lang"
              @click="selectLanguage(lang)"
              class="w-full px-3 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {{ lang }}
            </button>
          </div>
        </div>

        <button
          class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          @click="toggleTheme"
        >
          {{ darkMode ? '☀️ Light Mode' : '🌙 Dark Mode' }}
        </button>

        <button
          class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500"
          @click="logout"
        >
          🚪 Chiqish
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDarkModeStore } from '../stores/darkModeStore'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

const dropdownOpen = ref(false)
const languageOpen = ref(false)
const selectedLang = ref('uz')
const dropdownRef = ref<HTMLElement | null>(null)
const router = useRouter()

const darkModeStore = useDarkModeStore()
const { darkMode } = storeToRefs(darkModeStore)

function applyDarkMode() {
  const html = document.documentElement
  if (darkMode.value) {
    html.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    html.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const { locale } = useI18n()

onMounted(() => {
  const storedTheme = localStorage.getItem('theme')
  darkMode.value = storedTheme === 'dark'
  applyDarkMode()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  languageOpen.value = false
}

function selectLanguage(lang: string) {
  selectedLang.value = lang
  localStorage.setItem('lang', lang)

  // mapping to i18n locale codes
  const langMap: Record<string, string> = {
    Uzbek: 'uz',
    English: 'eng',
    Russion: 'ru',
    Krill: 'krill',
  }

  onMounted(() => {
    const storedTheme = localStorage.getItem('theme')
    darkMode.value = storedTheme === 'dark'
    applyDarkMode()

    const savedLang = localStorage.getItem('lang') || 'uz'
    const langMap: Record<string, string> = {
      uz: 'Uzbek',
      eng: 'English',
      ru: 'Russion',
      kr: 'Krill',
    }
    selectedLang.value = langMap[savedLang]
    locale.value = savedLang

    document.addEventListener('click', handleClickOutside)
  })

  locale.value = langMap[lang] || 'uz' // i18n tilni o'zgartirish
  languageOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    dropdownOpen.value = false
    languageOpen.value = false
  }
}

function toggleTheme() {
  darkModeStore.toggleDarkMode()
  applyDarkMode()
}

async function logout() {
  try {
    const token = localStorage.getItem('accessToken')

    const response = await fetch('http://192.168.136.207:3000/auth/logout', {
      method: 'POST',
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server javobi:', errorText)
    }

    localStorage.clear()
    router.push('/')
  } catch (error) {
    console.error('Logout xatolik:', error)
    alert('Chiqishda xatolik yuz berdi')
  }
}
</script>
