<template>
  <div
    class="relative w-full h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-end bg-white dark:bg-gray-900 transition-all duration-300 "
  >
    <div class="relative" ref="dropdownRef">
      <!-- Profile Image -->
      <img
        src="https://i.pravatar.cc/40"
        alt="Profile"
        class="w-10 h-10 rounded-full cursor-pointer ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 transition-all duration-200"
        @click.stop="toggleDropdown"
      />

      <!-- Dropdown Menu -->
      <div
        v-if="dropdownOpen"
        class="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-200 ease-out"
        :class="{
          'opacity-100 scale-100': dropdownOpen,
          'opacity-0 scale-95 pointer-events-none': !dropdownOpen,
        }"
      >
        <!-- Profile Button -->
        <button
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          @click="() => alert('Profilga kirish')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profilga kirish
        </button>

        <!-- Language Dropdown -->
        <div class="relative">
          <button
            class="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            @click.stop="languageOpen = !languageOpen"
          >
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5h18M3 12h18M3 19h18M12 3v18"
                />
              </svg>
              Til: {{ selectedLang }}
            </div>
            <svg
              class="w-4 h-4 transform transition-transform duration-200"
              :class="{ 'rotate-180': languageOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Language Submenu -->
          <div
            v-if="languageOpen"
            class="absolute right-full top-0 mr-2 w-32 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-200 ease-out"
            :class="{
              'opacity-100 scale-100': languageOpen,
              'opacity-0 scale-95 pointer-events-none': !languageOpen,
            }"
          >
            <button
              v-for="lang in ['Uzbek', 'English', 'Russian', 'Krill']"
              :key="lang"
              @click="selectLanguage(lang)"
              class="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
              :class="{
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300':
                  selectedLang === lang,
              }"
            >
              {{ lang }}
            </button>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          @click="toggleTheme"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="
                darkMode
                  ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                  : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
              "
            />
          </svg>
          {{ darkMode ? 'Light Mode' : 'Dark Mode' }}
        </button>

        <!-- Logout Button -->
        <button
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
          @click="logout"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1"
            />
          </svg>
          Chiqish
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
const selectedLang = ref('Uzbek')
const dropdownRef = ref<HTMLElement | null>(null)
const router = useRouter()
const { locale } = useI18n()

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

console.log(localStorage.getItem('accessToken'))

onMounted(() => {
  const storedTheme = localStorage.getItem('theme')
  darkMode.value = storedTheme === 'dark'
  applyDarkMode()

  const savedLang = localStorage.getItem('lang') || 'uz'
  const langMap: Record<string, string> = {
    uz: 'Uzbek',
    eng: 'English',
    ru: 'Russian',
    kr: 'Krill',
  }
  selectedLang.value = langMap[savedLang] || 'Uzbek'
  locale.value = savedLang
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) languageOpen.value = false
}

function selectLanguage(lang: string) {
  selectedLang.value = lang
  const langMap: Record<string, string> = {
    Uzbek: 'uz',
    English: 'en',
    Russian: 'ru',
    Krill: 'kr',
  }
  const newLocale = langMap[lang] || 'uz'
  locale.value = newLocale
  localStorage.setItem('lang', newLocale)
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
      console.error('Logout xatosi:', response.status, errorText)
      throw new Error('Chiqishda xatolik yuz berdi')
    }

    localStorage.clear()
    router.push('/')
  } catch (error) {
    console.error('Logout xatolik:', error)
    alert('Chiqishda xatolik yuz berdi')
  }
}
</script>

<style scoped>
/* Smooth transitions for dropdowns */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
