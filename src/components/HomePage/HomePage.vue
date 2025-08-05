<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    router.push('/')
  }
})
</script>

<template>
  <h1>Hello World</h1>
</template>

<style scoped></style>
