<script setup lang="ts">
import { ref } from 'vue'
import BackgroundImage from '../assets/background-img.jpg'
import { useRouter } from 'vue-router'
import { getCurrentInstance } from 'vue'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const response = await fetch('http://192.168.136.207:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    if (!response.ok) {
      throw new Error("Noto'g'ri login yoki parol")
    }

    const data = await response.json()

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('username', data.username)

    await router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 sm:px-6 lg:px-8"
  >
    <div
      class="w-full max-w-6xl mx-auto flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl bg-gray-800"
    >
      <!-- Left: Background image and text (only for md and up) -->
      <div
        class="md:w-1/2 hidden md:flex flex-col justify-between p-8 lg:p-12 bg-cover bg-center"
        :style="{ backgroundImage: `url(${BackgroundImage})` }"
      >
        <div class="text-left">
          <h1 class="text-4xl font-bold mb-4">AMU</h1>
        </div>
        <div>
          <h2 class="text-2xl font-semibold">Capturing Moments,</h2>
          <h2 class="text-2xl font-semibold mb-2">Creating Memories</h2>
          <div class="flex space-x-2 mt-4">
            <span class="w-2 h-2 bg-white/50 rounded-full"></span>
            <span class="w-2 h-2 bg-white/50 rounded-full"></span>
            <span class="w-2 h-2 bg-white rounded-full"></span>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="w-full md:w-1/2 p-6 sm:p-10 lg:p-12">
        <div class="text-right mb-4">
          <a href="#" class="text-sm text-white hover:underline">Back to website →</a>
        </div>

        <h2 class="text-3xl font-bold mb-8">Welcome back</h2>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <input
            v-model="username"
            type="text"
            placeholder="Login"
            class="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div class="flex justify-between items-center text-sm text-gray-400">
            <label class="flex items-center">
              <input type="checkbox" class="mr-2" />
              Remember me
            </label>
            <a href="#" class="text-blue-400 hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded"
            :disabled="loading"
          >
            {{ loading ? 'Logging in...' : 'Log in' }}
          </button>

          <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>
