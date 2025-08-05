
import { defineStore } from 'pinia'

export const useDarkModeStore = defineStore('darkMode', {
  state: () => ({
    darkMode: localStorage.getItem('theme') === 'dark',
  }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      this.applyTheme()
    },
    applyTheme() {
      const html = document.documentElement
      if (this.darkMode) {
        html.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        html.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    },
    initTheme() {
      this.applyTheme()
    },
  },
})
