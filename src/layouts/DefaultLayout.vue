<script setup lang="ts">
  import SideBar from '../components/SideBar.vue'
  import Header from '../components/Header.vue'
</script>

<template>
  <div class="flex">
    <SideBar />
    <div class="flex-1 flex flex-col">
      <Header />
      <div class="">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
