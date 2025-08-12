<template>
  <div
    class="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
  >
    <div
      class="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300"
    >
      <!-- Header with Stats (unchanged) -->
      <div
        class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700"
      >
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
          {{ t('released_vagons') }}
        </h2>
        <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          <div
            v-for="n in 4"
            :key="n"
            class="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl h-20"
          ></div>
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            class="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <p class="text-sm font-medium text-blue-600 dark:text-blue-300">
              {{ t('total_vagons') }}
            </p>
            <p class="text-2xl font-bold text-blue-800 dark:text-blue-100">{{ stats.total }}</p>
          </div>
          <div
            class="bg-green-100 dark:bg-green-900/40 p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <p class="text-sm font-medium text-green-600 dark:text-green-300">
              {{ t('released') }}
            </p>
            <p class="text-2xl font-bold text-green-800 dark:text-green-100">
              {{ stats.released }}
            </p>
          </div>
          <div
            class="bg-yellow-100 dark:bg-yellow-900/40 p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <p class="text-sm font-medium text-yellow-600 dark:text-yellow-300">
              {{ t('imported') }}
            </p>
            <p class="text-2xl font-bold text-yellow-800 dark:text-yellow-100">
              {{ stats.imported }}
            </p>
          </div>
          <div
            class="bg-red-100 dark:bg-red-900/40 p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <p class="text-sm font-medium text-red-600 dark:text-red-300">{{ t('taken_out') }}</p>
            <p class="text-2xl font-bold text-red-800 dark:text-red-100">{{ stats.takenOut }}</p>
          </div>
        </div>
      </div>

      <!-- Table Controls (unchanged) -->
      <div
        class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gray-50 dark:bg-gray-700"
      >
        <div class="relative w-full sm:w-80">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              class="w-5 h-5 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            v-model="query"
            type="text"
            :placeholder="t('search_placeholder')"
            class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-300 dark:text-white transition-all duration-200"
            @input="debounceSearch"
            aria-label="Search vagons"
          />
        </div>

        <div class="flex gap-3 w-full sm:w-auto">
          <button
            @click="openAddModal"
            class="px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Add new vagon"
          >
            {{ t('add_vagon') }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
            <tr class="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
              <th class="p-4 text-left">#</th>
              <th class="p-4 text-left">{{ t('vagon_number') }}</th>
              <th class="p-4 text-left">{{ t('vagon_code') }}</th>
              <th class="p-4 text-left">{{ t('vagon_type') }}</th>
              <th class="p-4 text-left">{{ t('owner_type') }}</th>
              <th class="p-4 text-left">{{ t('load_status') }}</th>
              <th class="p-4 text-left">{{ t('repair_type') }}</th>
              <th class="p-4 text-left">{{ t('ownership') }}</th>
              <th class="p-4 text-left">{{ t('repair_classification') }}</th>
              <th class="p-4 text-left">{{ t('station') }}</th>
              <th class="p-4 text-left">{{ t('actions') }}</th>
            </tr>
            <tr class="bg-gray-50 dark:bg-gray-600">
              <th class="p-2">
                <input
                  v-model="filters.id"
                  type="text"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
                  :placeholder="t('search_placeholder')"
                  @input="debounceSearch"
                  aria-label="Filter by number"
                />
              </th>
              <th class="p-2">
                <input
                  v-model="filters.vagonNumber"
                  type="text"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
                  :placeholder="t('search_placeholder')"
                  @input="debounceSearch"
                  aria-label="Filter by vagon number"
                />
              </th>
              <th class="p-2">
                <input
                  v-model="filters.vagonCode"
                  type="text"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
                  :placeholder="t('search_placeholder')"
                  @input="debounceSearch"
                  aria-label="Filter by vagon code"
                />
              </th>
              <th class="p-2">
                <input
                  v-model="filters.vagonType"
                  type="text"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
                  :placeholder="t('search_placeholder')"
                  @input="debounceSearch"
                  aria-label="Filter by vagon type"
                />
              </th>
              <th class="p-2">
                <select
                  v-model="filters.ownerType"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                  @change="debounceSearch"
                  aria-label="Filter by owner type"
                >
                  <option value="">{{ t('--------') }}</option>
                  <option value="uzbekiston_temir_yollari">
                    {{ t('owner_uzbekistan_railways') }}
                  </option>
                  <option value="private">{{ t('owner_private') }}</option>
                </select>
              </th>
              <th class="p-2">
                <select
                  v-model="filters.loadStatus"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                  @change="debounceSearch"
                  aria-label="Filter by load status"
                >
                  <option value="">{{ t('--------') }}</option>
                  <option value="loaded">{{ t('load_loaded') }}</option>
                  <option value="unloaded">{{ t('load_unloaded') }}</option>
                </select>
              </th>
              <th class="p-2">
                <select
                  v-model="filters.repairType"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                  @change="debounceSearch"
                  aria-label="Filter by repair type"
                >
                  <option value="">{{ t('--------') }}</option>
                  <option value="planned">{{ t('repair_planned') }}</option>
                  <option value="current">{{ t('repair_current') }}</option>
                </select>
              </th>
              <th class="p-2">
                <select
                  v-model="filters.ownershipId"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                  @change="debounceSearch"
                  aria-label="Filter by ownership"
                >
                  <option value="">{{ t('--------') }}</option>
                  <option v-for="ownership in ownerships" :key="ownership.id" :value="ownership.id">
                    {{ ownership.ownershipName || 'Unknown' }}
                  </option>
                </select>
              </th>
              <th class="p-2">
                <select
                  v-model="filters.repairClassificationId"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                  @change="debounceSearch"
                  aria-label="Filter by repair classification"
                >
                  <option value="">{{ t('--------') }}</option>
                  <option
                    v-for="repair in repairClassifications"
                    :key="repair.id"
                    :value="repair.id"
                  >
                    {{ repair.shortDescription || 'Unknown' }}
                  </option>
                </select>
              </th>
              <th class="p-2">
                <select
                  v-model="filters.stationId"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                  @change="debounceSearch"
                  aria-label="Filter by station"
                >
                  <option value="">{{ t('--------') }}</option>
                  <option v-for="station in stations" :key="station.id" :value="station.id">
                    {{ station.name || 'Unknown' }}
                  </option>
                </select>
              </th>
              <th class="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading" v-for="n in 5" :key="n" class="animate-pulse">
              <td class="p-4">
                <div class="h四大 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </td>
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </td>
            </tr>
            <tr
              v-else
              v-for="(row, index) in pagedData"
              :key="row.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150"
            >
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ startIndex + index + 1 }}
              </td>
              <td class="p-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ row.vagonNumber }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">{{ row.vagonCode }}</td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ row.vagonType || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ t(`owner_${row.ownerType}`) || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200':
                      row.loadStatus === 'loaded',
                    'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300':
                      row.loadStatus === 'unloaded',
                  }"
                >
                  <svg
                    v-if="row.loadStatus === 'loaded'"
                    class="w-3 h-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {{ t(`load_${row.loadStatus}`) || 'N/A' }}
                </span>
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ t(`repair_${row.repairType}`) || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ row.ownership?.ownershipName || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ row.repairClassification?.shortDescription || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ row.station?.name || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(row)"
                    class="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
                    title="Edit"
                    aria-label="Edit vagon"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteVagon(row.id)"
                    class="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                    title="Delete"
                    aria-label="Delete vagon"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M7 7h10m-10 0V5a2 2 0 012-2h4a2 2 0 012 2v2"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!isLoading && filteredData.length === 0">
              <td colspan="11" class="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                {{ t('no_data_found') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (unchanged) -->
      <div
        class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
      >
        <div class="text-sm text-gray-600 dark:text-gray-300">
          {{ t('showing') }} {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredData.length) }} /
          {{ filteredData.length }}
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="page === 1"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous page"
          >
            {{ t('prev') }}
          </button>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200"
            >{{ page }} / {{ totalPages }}</span
          >
          <button
            @click="nextPage"
            :disabled="page === totalPages"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next page"
          >
            {{ t('next') }}
          </button>
        </div>
      </div>

      <!-- Add/Edit Modal (unchanged) -->
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 scale-95"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ isEditing ? t('edit_vagon') : t('add_vagon') }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-150"
              aria-label="Close modal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveVagon" class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {{ t('vagon_number') }} *
                </label>
                <input
                  v-model="newVagon.vagonNumber"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                  aria-describedby="vagonNumberError"
                />
                <p
                  v-if="errors.vagonNumber"
                  id="vagonNumberError"
                  class="text-red-500 text-xs mt-1"
                >
                  {{ errors.vagonNumber }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {{ t('vagon_code') }} *
                </label>
                <input
                  v-model="newVagon.vagonCode"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                  aria-describedby="vagonCodeError"
                />
                <p v-if="errors.vagonCode" id="vagonCodeError" class="text-red-500 text-xs mt-1">
                  {{ errors.vagonCode }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('vagon_type') }}
              </label>
              <input
                v-model="newVagon.vagonType"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                aria-label="Vagon type"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('operation') }} *
              </label>
              <select
                v-model="newVagon.operation"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                aria-label="Operation type"
              >
                <option value="release">{{ t('operation_release') }}</option>
                <option value="import">{{ t('operation_import') }}</option>
                <option value="take_out">{{ t('operation_take_out') }}</option>
              </select>
              <p v-if="errors.operation" class="text-red-500 text-xs mt-1">
                {{ errors.operation }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {{ t('owner_type') }}
                </label>
                <select
                  v-model="newVagon.ownerType"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  aria-label="Owner type"
                >
                  <option value="invertar">
                    {{ t('owner_uzbekistan_railways') }}
                  </option>
                  <option value="private">{{ t('owner_private') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {{ t('load_status') }}
                </label>
                <select
                  v-model="newVagon.loadStatus"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  aria-label="Load status"
                >
                  <option value="loaded">{{ t('load_loaded') }}</option>
                  <option value="unloaded">{{ t('load_unloaded') }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('repair_type') }}
              </label>
              <select
                v-model="newVagon.repairType"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                aria-label="Repair type"
              >
                <option value="planned">{{ t('repair_planned') }}</option>
                <option value="current">{{ t('repair_current') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('ownership') }}
              </label>
              <select
                v-model="newVagon.ownershipId"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                aria-label="Ownership"
              >
                <option value="">{{ t('--------') }}</option>
                <option v-for="ownership in ownerships" :key="ownership.id" :value="ownership.id">
                  {{ ownership.ownershipName || 'Unknown' }}
                </option>
              </select>
              <p v-if="errors.ownershipId" class="text-red-500 text-xs mt-1">
                {{ errors.ownershipId }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('repair_classification') }}
              </label>
              <select
                v-model="newVagon.repairClassificationId"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                aria-label="Repair classification"
              >
                <option value="">{{ t('--------') }}</option>
                <option v-for="repair in repairClassifications" :key="repair.id" :value="repair.id">
                  {{ repair.shortDescription || 'Unknown' }}
                </option>
              </select>
              <p v-if="errors.repairClassificationId" class="text-red-500 text-xs mt-1">
                {{ errors.repairClassificationId }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('station') }}
              </label>
              <select
                v-model="newVagon.stationId"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                aria-label="Station"
              >
                <option value="">{{ t('--------') }}</option>
                <option v-for="station in stations" :key="station.id" :value="station.id">
                  {{ station.name || 'Unknown' }}
                </option>
              </select>
              <p v-if="errors.stationId" class="text-red-500 text-xs mt-1">
                {{ errors.stationId }}
              </p>
            </div>

            <div class="flex items-center">
              <input
                v-model="newVagon.transitPermit"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
                id="transitPermit"
              />
              <label
                for="transitPermit"
                class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                {{ t('transit_permit') }}
              </label>
            </div>

            <div v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium transition-all duration-200"
                aria-label="Cancel"
              >
                {{ t('cancel') }}
              </button>
              <button
                type="submit"
                class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-sm font-medium transition-all duration-200"
                :disabled="isSubmitting"
                aria-label="Save vagon"
              >
                {{ isSubmitting ? t('saving') : t('save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce } from 'lodash'

const { t } = useI18n()

const data = ref([])
const query = ref('')
const page = ref(1)
const perPage = ref(10)
const maxDate = new Date().toISOString().split('T')[0]
const selectedDate = ref(maxDate)
const showModal = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const isLoading = ref(false)
const errors = ref({})
const ownerships = ref([])
const repairClassifications = ref([])
const stations = ref([])

const filters = ref({
  id: '',
  vagonNumber: '',
  vagonCode: '',
  vagonType: '',
  ownerType: '',
  loadStatus: '',
  repairType: '',
  ownershipId: '',
  repairClassificationId: '',
  stationId: '',
})

const stats = ref({
  total: 0,
  released: 0,
  imported: 0,
  takenOut: 0,
})

const newVagon = ref({
  id: null,
  vagonNumber: '',
  vagonCode: '',
  vagonType: '',
  ownershipId: '',
  ownerType: 'private',
  operation: 'release',
  repairClassificationId: '',
  repairType: 'current',
  transitPermit: true,
  loadStatus: 'loaded',
  stationId: '',
})

const API_BASE_URL = 'http://192.168.136.207:3000'

// Helper function for API calls with retry logic
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || t('fetch_error'))
      }
      return responseData
    } catch (e) {
      if (i === retries - 1) throw e
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// Fetch ownerships
async function fetchOwnerships() {
  try {
    isLoading.value = true
    const response = await fetchWithRetry(`${API_BASE_URL}/ownerships`, {})
    ownerships.value = response.data || []
  } catch (e) {
    console.error('Ownerships olishda xatolik:', e.message)
    errors.value.general = t('fetch_ownerships_error')
    ownerships.value = []
  } finally {
    isLoading.value = false
  }
}

// Fetch repair classifications
async function fetchRepairClassifications(code = null) {
  try {
    isLoading.value = true
    const url = code
      ? `${API_BASE_URL}/repair-classifications?code=${code}`
      : `${API_BASE_URL}/repair-classifications`
    const response = await fetchWithRetry(url, {})
    repairClassifications.value = response.data || []
  } catch (e) {
    console.error('Repair classifications olishda xatolik:', e.message)
    errors.value.general = t('fetch_repair_classifications_error')
    repairClassifications.value = []
  } finally {
    isLoading.value = false
  }
}

// Fetch stations
async function fetchStations() {
  try {
    isLoading.value = true
    const response = await fetchWithRetry(`${API_BASE_URL}/stations`, {})
    stations.value = response || []
  } catch (e) {
    console.error('Stations olishda xatolik:', e.message)
    errors.value.general = t('fetch_stations_error')
    stations.value = []
  } finally {
    isLoading.value = false
  }
}

// Fetch data and calculate stats
async function fetchDataByDate(date) {
  try {
    isLoading.value = true
    const response = await fetchWithRetry(`${API_BASE_URL}/released-vagons?date=${date}`, {})
    data.value = response.data || []
    page.value = 1

    // Calculate stats
    stats.value.total = data.value.length
    stats.value.released = data.value.filter((v) => v.operation === 'release').length
    stats.value.imported = data.value.filter((v) => v.operation === 'import').length
    stats.value.takenOut = data.value.filter((v) => v.operation === 'take_out').length
  } catch (e) {
    console.error("Ma'lumot olishda xatolik:", e.message)
    errors.value.general = t('fetch_error')
    data.value = []
    stats.value = { total: 0, released: 0, imported: 0, takenOut: 0 }
  } finally {
    isLoading.value = false
  }
}

// Save vagon
async function saveVagon() {
  errors.value = {}

  // Validate inputs
  if (!newVagon.value.vagonNumber) {
    errors.value.vagonNumber = t('vagon_number_required')
    return
  }
  if (!newVagon.value.vagonCode) {
    errors.value.vagonCode = t('vagon_code_required')
    return
  }
  if (!newVagon.value.operation) {
    errors.value.operation = t('operation_required')
    return
  }
  if (
    newVagon.value.ownershipId &&
    !ownerships.value.some((o) => o.id === newVagon.value.ownershipId)
  ) {
    errors.value.ownershipId = t('invalid_ownership')
    return
  }
  if (
    newVagon.value.repairClassificationId &&
    !repairClassifications.value.some((r) => r.id === newVagon.value.repairClassificationId)
  ) {
    errors.value.repairClassificationId = t('invalid_repair_classification')
    return
  }
  if (newVagon.value.stationId && !stations.value.some((s) => s.id === newVagon.value.stationId)) {
    errors.value.stationId = t('invalid_station')
    return
  }

  isSubmitting.value = true

  const payload = {
    vagonNumber: Number(newVagon.value.vagonNumber),
    vagonCode: newVagon.value.vagonCode,
    vagonType: newVagon.value.vagonType || null,
    ownershipId: newVagon.value.ownershipId || null,
    ownerType: newVagon.value.ownerType,
    operation: newVagon.value.operation,
    repairClassificationId: newVagon.value.repairClassificationId || null,
    repairType: newVagon.value.repairType || null,
    transitPermit: newVagon.value.transitPermit,
    loadStatus: newVagon.value.loadStatus || null,
    stationId: newVagon.value.stationId || null,
  }

  try {
    const url = isEditing.value
      ? `${API_BASE_URL}/released-vagons/${newVagon.value.id}`
      : `${API_BASE_URL}/released-vagons`
    const method = isEditing.value ? 'PATCH' : 'POST'

    const response = await fetchWithRetry(url, {
      method,
      body: JSON.stringify(payload),
    })

    await fetchDataByDate(selectedDate.value)
    closeModal()
  } catch (e) {
    console.error('Vagon saqlashda xatolik:', e.message)
    if (e.message.includes('Ownership not found')) {
      errors.value.ownershipId = t('ownership_not_found')
    } else if (e.message.includes('already exists')) {
      errors.value.vagonNumber = t('vagon_exists')
    } else {
      errors.value.general = e.message || t('save_vagon_error')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Delete vagon
async function deleteVagon(id) {
  if (!confirm(t('confirm_delete'))) return

  try {
    isLoading.value = true
    await fetchWithRetry(`${API_BASE_URL}/released-vagons/${id}`, {
      method: 'DELETE',
    })
    await fetchDataByDate(selectedDate.value)
  } catch (e) {
    console.error("Vagon o'chirishda xatolik:", e.message)
    errors.value.general = t('delete_vagon_error')
  } finally {
    isLoading.value = false
  }
}

// Modal functions
function openAddModal() {
  isEditing.value = false
  newVagon.value = {
    id: null,
    vagonNumber: '',
    vagonCode: '',
    vagonType: '',
    ownershipId: '',
    ownerType: 'private',
    operation: 'release',
    repairClassificationId: '',
    repairType: 'current',
    transitPermit: true,
    loadStatus: 'loaded',
    stationId: '',
  }
  showModal.value = true
}

function openEditModal(vagon) {
  isEditing.value = true
  newVagon.value = { ...vagon, vagonNumber: String(vagon.vagonNumber) }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  newVagon.value = {
    id: null,
    vagonNumber: '',
    vagonCode: '',
    vagonType: '',
    ownershipId: '',
    ownerType: 'private',
    operation: 'release',
    repairClassificationId: '',
    repairType: 'current',
    transitPermit: true,
    loadStatus: 'loaded',
    stationId: '',
  }
  errors.value = {}
}

// Debounced search
const debounceSearch = debounce(() => {
  page.value = 1
}, 300)

// Computed properties for pagination and filtering
const filteredData = computed(() => {
  return data.value.filter((row) => {
    const q = query.value.toLowerCase()
    const matchesQuery =
      !q ||
      String(row.vagonNumber).includes(q) ||
      row.vagonCode.toLowerCase().includes(q) ||
      (row.vagonType && row.vagonType.toLowerCase().includes(q)) ||
      row.operation.toLowerCase().includes(q) ||
      (row.ownerType && row.ownerType.toLowerCase().includes(q)) ||
      (row.loadStatus && row.loadStatus.toLowerCase().includes(q)) ||
      (row.repairType && row.repairType.toLowerCase().includes(q)) ||
      (row.ownership?.ownershipName && row.ownership.ownershipName.toLowerCase().includes(q)) ||
      (row.repairClassification?.shortDescription &&
        row.repairClassification.shortDescription.toLowerCase().includes(q)) ||
      (row.station?.name && row.station.name.toLowerCase().includes(q))

    const matchesFilters =
      (!filters.value.id || String(row.id).includes(filters.value.id)) &&
      (!filters.value.vagonNumber || String(row.vagonNumber).includes(filters.value.vagonNumber)) &&
      (!filters.value.vagonCode ||
        row.vagonCode.toLowerCase().includes(filters.value.vagonCode.toLowerCase())) &&
      (!filters.value.vagonType ||
        (row.vagonType &&
          row.vagonType.toLowerCase().includes(filters.value.vagonType.toLowerCase()))) &&
      (!filters.value.ownerType || row.ownerType === filters.value.ownerType) &&
      (!filters.value.loadStatus || row.loadStatus === filters.value.loadStatus) &&
      (!filters.value.repairType || row.repairType === filters.value.repairType) &&
      (!filters.value.ownershipId || row.ownership?.id === filters.value.ownershipId) &&
      (!filters.value.repairClassificationId ||
        row.repairClassification?.id === filters.value.repairClassificationId) &&
      (!filters.value.stationId || row.station?.id === filters.value.stationId)

    return matchesQuery && matchesFilters
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / perPage.value)))
const startIndex = computed(() => (page.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + perPage.value)
const pagedData = computed(() => filteredData.value.slice(startIndex.value, endIndex.value))

// Pagination functions
function prevPage() {
  if (page.value > 1) page.value--
}

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

// Initial data fetch
onMounted(() => {
  fetchDataByDate(selectedDate.value)
  fetchOwnerships()
  fetchRepairClassifications()
  fetchStations()
})

// Watch for date changes
watch(selectedDate, (newDate) => {
  fetchDataByDate(newDate)
})
</script>
