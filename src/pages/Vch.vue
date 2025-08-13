<template>
  <div
    class="p-6 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
  >
    <div
      class="max-w-8xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300"
    >
      <!-- Header with Stats -->
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

      <!-- Table Controls -->
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
            @click="openManageWagonsModal"
            class="px-4 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-sm font-medium hover:from-teal-700 hover:to-indigo-700 dark:from-teal-500 dark:to-indigo-500 dark:hover:from-teal-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Manage wagons"
          >
            {{ t('manage_wagons') }}
          </button>
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
              <th class="p-4 text-left">
                <input
                  type="checkbox"
                  v-model="selectAll"
                  @change="toggleSelectAll"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Select all vagons"
                />
              </th>
              <th class="p-4 text-left">{{ t('vagon_number') }}</th>
              <th class="p-4 text-left">{{ t('vagon_code') }}</th>
              <th class="p-4 text-left">{{ t('vagon_type') }}</th>
              <th class="p-4 text-left">{{ t('owner_type') }}</th>
              <th class="p-4 text-left">{{ t('load_status') }}</th>
              <th class="p-4 text-left">{{ t('repair_type') }}</th>
              <th class="p-4 text-left">{{ t('ownership') }}</th>
              <th class="p-4 text-left">{{ t('repair_classification') }}</th>
              <th class="p-4 text-left">{{ t('station') }}</th>
              <th class="p-4 text-left">{{ t('operation') }}</th>
              <th class="p-4 text-left">{{ t('actions') }}</th>
            </tr>
            <tr class="bg-gray-50 dark:bg-gray-600">
              <th class="p-2"></th>
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
              <th class="p-2">
                <select
                  v-model="filters.operation"
                  class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500"
                  @change="debounceSearch"
                  aria-label="Filter by operation"
                >
                  <option value="">{{ t('--------') }}</option>
                  <option value="release">{{ t('operation_release') }}</option>
                  <option value="import">{{ t('operation_import') }}</option>
                  <option value="take_out">{{ t('operation_take_out') }}</option>
                </select>
              </th>
              <th class="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading" v-for="n in 5" :key="n" class="animate-pulse">
              <td class="p-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
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
              <td class="p-4">
                <input
                  type="checkbox"
                  v-model="selectedWagons"
                  :value="row.id"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :aria-label="`Select vagon ${row.vagonNumber}`"
                />
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
                {{ getOwnershipName(row.ownershipId) || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ row.repairClassification?.shortDescription || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ row.station?.name || 'N/A' }}
              </td>
              <td class="p-4 text-sm text-gray-700 dark:text-gray-300">
                {{ t(`operation_${row.operation}`) || 'N/A' }}
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
              <td colspan="12" class="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                {{ t('no_data_found') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
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

      <!-- Manage Wagons Modal -->
      <div
        v-if="showManageWagonsModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-95"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t('manage_wagons') }}
            </h3>
            <button
              @click="closeManageWagonsModal"
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

          <form @submit.prevent="processManageWagons" class="space-y-6">
            <!-- Operation Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('operation') }} *
              </label>
              <div class="flex gap-3">
                <button
                  type="button"
                  @click="manageOperation = 'select'"
                  class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  :class="{
                    'bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600':
                      manageOperation === 'select',
                    'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600':
                      manageOperation !== 'select',
                  }"
                  aria-label="Select wagons"
                >
                  {{ t('select_wagons') }}
                </button>
                <button
                  type="button"
                  @click="manageOperation = 'import'"
                  class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  :class="{
                    'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600':
                      manageOperation === 'import',
                    'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600':
                      manageOperation !== 'import',
                  }"
                  aria-label="Import wagons"
                >
                  {{ t('operation_import') }}
                </button>
                <button
                  type="button"
                  @click="manageOperation = 'take_out'"
                  class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  :class="{
                    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600':
                      manageOperation === 'take_out',
                    'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600':
                      manageOperation !== 'take_out',
                  }"
                  aria-label="Take out wagons"
                >
                  {{ t('operation_take_out') }}
                </button>
              </div>
              <p v-if="manageErrors.operation" class="text-red-500 text-xs mt-2">
                {{ manageErrors.operation }}
              </p>
            </div>

            <!-- Wagon Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('vagons') }} *
              </label>
              <div class="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <input
                    v-model="wagonSearchQuery.number"
                    type="text"
                    :placeholder="t('vagon_number')"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    @input="filterWagons"
                  />
                </div>
                <div>
                  <input
                    v-model="wagonSearchQuery.code"
                    type="text"
                    :placeholder="t('vagon_code')"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    @input="filterWagons"
                  />
                </div>
              </div>
              <div
                class="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-64 overflow-y-auto bg-white dark:bg-gray-700"
              >
                <div
                  v-for="wagon in filteredWagons"
                  :key="wagon.id"
                  class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-all duration-150"
                >
                  <input
                    type="checkbox"
                    v-model="selectedWagonsForManage"
                    :value="wagon.id"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    :aria-label="`Select vagon ${wagon.vagonNumber}`"
                  />
                  <label class="ml-3 text-sm text-gray-700 dark:text-gray-200">
                    {{ wagon.vagonNumber }} - {{ wagon.vagonCode }}
                  </label>
                </div>
                <p
                  v-if="filteredWagons.length === 0"
                  class="text-gray-500 dark:text-gray-400 text-sm"
                >
                  {{ t('no_wagons_found') }}
                </p>
              </div>
              <p v-if="manageErrors.wagons" class="text-red-500 text-xs mt-2">
                {{ manageErrors.wagons }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {{ t('selected_wagons') }}: {{ selectedWagonsForManage.length }}
              </p>
            </div>

            <div v-if="manageErrors.general" class="text-red-500 text-sm">
              {{ manageErrors.general }}
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeManageWagonsModal"
                class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium transition-all duration-200"
                aria-label="Cancel"
              >
                {{ t('cancel') }}
              </button>
              <button
                type="submit"
                class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-sm font-medium transition-all duration-200"
                :disabled="isSubmitting"
                aria-label="Confirm operation"
              >
                {{ isSubmitting ? t('processing') : t('confirm') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Notification -->
      <div
        v-if="notification.message"
        class="fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300"
        :class="{
          'bg-green-600 text-white': notification.type !== 'error',
          'bg-red-600 text-white': notification.type === 'error',
          'opacity-0': !notification.visible,
        }"
      >
        <span>{{ notification.message }}</span>
        <button
          @click="closeNotification"
          class="text-white hover:text-gray-200 transition-colors duration-150"
          aria-label="Close notification"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Add/Edit Modal -->
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
                  {{ ` ${repair.code} - ${repair.shortDescription}` || 'Unknown' }}
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
const showManageWagonsModal = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const isLoading = ref(false)
const errors = ref({})
const manageErrors = ref({})
const ownerships = ref([])
const repairClassifications = ref([])
const stations = ref([])
const selectedWagons = ref([])
const selectedWagonsForManage = ref([])
const selectAll = ref(false)
const filteredWagons = ref([])
const manageOperation = ref('')
const notification = ref({ message: '', visible: false, type: 'success' })
const wagonSearchQuery = ref({ number: '', code: '' }) // Faqat bitta e'lon

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
  operation: '',
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

// Helper function to get ownership name by ID
function getOwnershipName(ownershipId) {
  if (!ownershipId) return 'N/A'
  const ownership = ownerships.value.find((o) => o.id === ownershipId)
  return ownership?.ownershipName || 'N/A'
}

// Filter wagons for Manage Wagons modal
function filterWagons() {
  const number = wagonSearchQuery.value.number.toLowerCase()
  const code = wagonSearchQuery.value.code.toLowerCase()
  filteredWagons.value = data.value.filter(
    (wagon) =>
      (!number || String(wagon.vagonNumber).toLowerCase().includes(number)) &&
      (!code || wagon.vagonCode.toLowerCase().includes(code)),
  )
}

// Notification funksiyalari
function showNotification(message, type = 'success') {
  notification.value = { message, visible: true, type }
  setTimeout(() => {
    notification.value.visible = false
    setTimeout(() => {
      notification.value.message = ''
      notification.value.type = 'success'
    }, 300) // Transition animatsiyasi uchun
  }, 3000) // 3 soniya ko'rsatiladi
}

function closeNotification() {
  notification.value.visible = false
  setTimeout(() => {
    notification.value.message = ''
    notification.value.type = 'success'
  }, 300)
}

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
      console.error(`Fetch attempt ${i + 1} failed:`, e.message)
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
    console.log('Fetched ownerships:', ownerships.value)
  } catch (e) {
    console.error('Ownerships olishda xatolik:', e.message)
    showNotification(t('fetch_ownerships_error'), 'error')
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
    console.log('Fetched repair classifications:', repairClassifications.value)
  } catch (e) {
    console.error('Repair classifications olishda xatolik:', e.message)
    showNotification(t('fetch_repair_classifications_error'), 'error')
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
    console.log('Fetched stations:', stations.value)
  } catch (e) {
    console.error('Stations olishda xatolik:', e.message)
    showNotification(t('fetch_stations_error'), 'error')
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
    filteredWagons.value = data.value // Initialize filteredWagons
    console.log('Fetched vagons:', data.value)
    page.value = 1

    // Calculate stats
    stats.value.total = data.value.length
    stats.value.released = data.value.filter((v) => v.operation === 'release').length
    stats.value.imported = data.value.filter((v) => v.operation === 'import').length
    stats.value.takenOut = data.value.filter((v) => v.operation === 'take_out').length
  } catch (e) {
    console.error("Ma'lumot olishda xatolik:", e.message)
    showNotification(t('fetch_error'), 'error')
    data.value = []
    filteredWagons.value = []
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
    showNotification(response.message || t('vagon_saved_success'))
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
    showNotification(errors.value.general || t('save_vagon_error'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Manage wagons operatsiyasini bajarish
async function processManageWagons() {
  console.log(
    'processManageWagons called, operation:',
    manageOperation.value,
    'selected:',
    selectedWagonsForManage.value,
  )
  manageErrors.value = {}

  if (!manageOperation.value) {
    manageErrors.value.operation = t('operation_required')
    return
  }

  if (selectedWagonsForManage.value.length === 0) {
    manageErrors.value.wagons = t('select_at_least_one')
    return
  }

  isSubmitting.value = true

  try {
    let url
    if (manageOperation.value === 'select') {
      url = `${API_BASE_URL}/select-vagons`
      const response = await fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify({ wagonIds: selectedWagonsForManage.value }),
      })
      showNotification(response.message || t('operation_success'))
    } else {
      url =
        manageOperation.value === 'import'
          ? `${API_BASE_URL}/import-vagons`
          : `${API_BASE_URL}/take-out-vagons`
      for (const wagonId of selectedWagonsForManage.value) {
        const response = await fetchWithRetry(url, {
          method: 'POST',
          body: JSON.stringify({ wagonId }),
        })
        showNotification(response.message || t('operation_success'))
      }
    }

    await fetchDataByDate(selectedDate.value)
    closeManageWagonsModal()
  } catch (e) {
    console.error('Manage wagons operation xatolik:', e.message)
    showNotification(e.message || t('manage_wagons_error'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Delete vagon
async function deleteVagon(id) {
  console.log('deleteVagon called, id:', id)
  if (!confirm(t('confirm_delete'))) return

  try {
    isLoading.value = true
    const response = await fetchWithRetry(`${API_BASE_URL}/released-vagons/${id}`, {
      method: 'DELETE',
    })
    await fetchDataByDate(selectedDate.value)
    showNotification(response.message || t('vagon_deleted_success'))
  } catch (e) {
    console.error("Vagon o'chirishda xatolik:", e.message)
    showNotification(e.message || t('delete_vagon_error'), 'error')
  } finally {
    isLoading.value = false
  }
}

// Modal functions
function openAddModal() {
  console.log('openAddModal called, showModal:', showModal.value)
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
  console.log('showModal set to:', showModal.value)
}

function openEditModal(vagon) {
  console.log('openEditModal called, vagon:', vagon)
  isEditing.value = true
  newVagon.value = {
    ...vagon,
    vagonNumber: String(vagon.vagonNumber),
    ownershipId: vagon.ownershipId || '',
    repairClassificationId: vagon.repairClassification?.id || '',
    stationId: vagon.station?.id || '',
  }
  showModal.value = true
  console.log('showModal set to:', showModal.value)
}

function closeModal() {
  console.log('closeModal called, showModal:', showModal.value)
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
  console.log('showModal set to:', showModal.value)
}

function openManageWagonsModal() {
  console.log('openManageWagonsModal called, showManageWagonsModal:', showManageWagonsModal.value)
  showManageWagonsModal.value = true
  manageOperation.value = ''
  selectedWagonsForManage.value = []
  wagonSearchQuery.value = { number: '', code: '' }
  filteredWagons.value = data.value
  manageErrors.value = {}
  console.log('showManageWagonsModal set to:', showManageWagonsModal.value)
}

function closeManageWagonsModal() {
  console.log('closeManageWagonsModal called, showManageWagonsModal:', showManageWagonsModal.value)
  showManageWagonsModal.value = false
  manageOperation.value = ''
  selectedWagonsForManage.value = []
  wagonSearchQuery.value = { number: '', code: '' }
  filteredWagons.value = data.value
  manageErrors.value = {}
  console.log('showManageWagonsModal set to:', showManageWagonsModal.value)
}

function toggleSelectAll() {
  console.log('toggleSelectAll called, selectAll:', selectAll.value)
  if (selectAll.value) {
    selectedWagons.value = pagedData.value.map((wagon) => wagon.id)
  } else {
    selectedWagons.value = []
  }
  console.log('selectedWagons:', selectedWagons.value)
}

// Debounced search
const debounceSearch = debounce(() => {
  page.value = 1
}, 300)

// Computed properties for pagination and filtering
const filteredData = computed(() => {
  return data.value.filter((row) => {
    const q = query.value.toLowerCase()
    const ownershipName = getOwnershipName(row.ownershipId)?.toLowerCase() || ''

    const matchesQuery =
      !q ||
      String(row.vagonNumber).includes(q) ||
      row.vagonCode.toLowerCase().includes(q) ||
      (row.vagonType && row.vagonType.toLowerCase().includes(q)) ||
      row.operation.toLowerCase().includes(q) ||
      (row.ownerType && row.ownerType.toLowerCase().includes(q)) ||
      (row.loadStatus && row.loadStatus.toLowerCase().includes(q)) ||
      (row.repairType && row.repairType.toLowerCase().includes(q)) ||
      ownershipName.includes(q) ||
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
      (!filters.value.ownershipId || row.ownershipId === filters.value.ownershipId) &&
      (!filters.value.repairClassificationId ||
        row.repairClassification?.id === filters.value.repairClassificationId) &&
      (!filters.value.stationId || row.station?.id === filters.value.stationId) &&
      (!filters.value.operation || row.operation === filters.value.operation)

    return matchesQuery && matchesFilters
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / perPage.value)))
const startIndex = computed(() => (page.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + perPage.value)
const pagedData = computed(() => filteredData.value.slice(startIndex.value, endIndex.value))

// Pagination functions
function prevPage() {
  console.log('prevPage called, page:', page.value)
  if (page.value > 1) page.value--
}

function nextPage() {
  console.log('nextPage called, page:', page.value)
  if (page.value < totalPages.value) page.value++
}

// Initial data fetch
onMounted(() => {
  console.log('Component mounted, fetching data for date:', selectedDate.value)
  fetchDataByDate(selectedDate.value)
  fetchOwnerships()
  fetchRepairClassifications()
  fetchStations()
})

// Watch for date changes
watch(selectedDate, (newDate) => {
  console.log('selectedDate changed, newDate:', newDate)
  fetchDataByDate(newDate)
})

// Watch for modal state changes (for debugging)
watch(showModal, (newVal) => {
  console.log('showModal changed to:', newVal)
})
watch(showManageWagonsModal, (newVal) => {
  console.log('showManageWagonsModal changed to:', newVal)
})
</script>
