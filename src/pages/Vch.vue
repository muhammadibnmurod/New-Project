```vue
<template>
  <div class="p-4 sm:p-6 min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <div class="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <!-- Header with Stats -->
      <div class="p-4 bg-gray-50 dark:bg-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('released_vagons') }}
        </h2>
        <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
          <div v-for="n in 4" :key="n" class="bg-gray-200 dark:bg-gray-600 p-3 rounded h-16"></div>
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
            <p class="text-xs font-medium text-blue-600 dark:text-blue-300">{{ t('total_vagons') }}</p>
            <p class="text-lg font-bold text-blue-800 dark:text-blue-100">{{ stats.total }}</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded">
            <p class="text-xs font-medium text-green-600 dark:text-green-300">{{ t('released') }}</p>
            <p class="text-lg font-bold text-green-800 dark:text-green-100">{{ stats.released }}</p>
          </div>
          <div class="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded">
            <p class="text-xs font-medium text-yellow-600 dark:text-yellow-300">{{ t('imported') }}</p>
            <p class="text-lg font-bold text-yellow-800 dark:text-yellow-100">{{ stats.imported }}</p>
          </div>
          <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded">
            <p class="text-xs font-medium text-red-600 dark:text-red-300">{{ t('taken_out') }}</p>
            <p class="text-lg font-bold text-red-800 dark:text-red-100">{{ stats.takenOut }}</p>
          </div>
        </div>
      </div>

      <!-- Table Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-700">
        <div class="relative w-full sm:w-64">
          <div class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <input v-model="query" type="text" :placeholder="t('search_placeholder')"
            class="bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            @input="debounceSearch" aria-label="Search vagons" />
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="openManageWagonsModal"
            class="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            aria-label="Manage wagons">
            {{ t('manage_wagons') }}
          </button>
          <button @click="openAddModal"
            class="px-3 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            aria-label="Add new vagon">
            {{ t('add_vagon') }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr class="text-xs font-medium text-gray-700 dark:text-gray-200">
              <th class="p-3 text-left">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Select all vagons" />
              </th>
              <th class="p-3 text-left">{{ t('vagon_number') }}</th>
              <th class="p-3 text-left">{{ t('vagon_code') }}</th>
              <th class="p-3 text-left">{{ t('vagon_type') }}</th>
              <th class="p-3 text-left">{{ t('owner_type') }}</th>
              <th class="p-3 text-left">{{ t('load_status') }}</th>
              <th class="p-3 text-left">{{ t('repair_type') }}</th>
              <th class="p-3 text-left">{{ t('ownership') }}</th>
              <th class="p-3 text-left">{{ t('repair_classification') }}</th>
              <th class="p-3 text-left">{{ t('station') }}</th>
              <th class="p-3 text-left">{{ t('operation') }}</th>
              <th class="p-3 text-left">{{ t('actions') }}</th>
            </tr>
            <tr class="bg-gray-50 dark:bg-gray-600">
              <th class="p-2"></th>
              <th class="p-2">
                <input v-model="filters.vagonNumber" type="text"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  :placeholder="t('search_placeholder')" @input="debounceSearch" aria-label="Filter by vagon number" />
              </th>
              <th class="p-2">
                <input v-model="filters.vagonCode" type="text"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  :placeholder="t('search_placeholder')" @input="debounceSearch" aria-label="Filter by vagon code" />
              </th>
              <th class="p-2">
                <input v-model="filters.vagonType" type="text"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  :placeholder="t('search_placeholder')" @input="debounceSearch" aria-label="Filter by vagon type" />
              </th>
              <th class="p-2">
                <select v-model="filters.ownerType"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                  @change="debounceSearch" aria-label="Filter by owner type">
                  <option value="">{{ t('--------') }}</option>
                  <option value="invertar">{{ t('owner_uzbekistan_railways') }}</option>
                  <option value="private">{{ t('owner_private') }}</option>
                </select>
              </th>
              <th class="p-2">
                <select v-model="filters.loadStatus"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                  @change="debounceSearch" aria-label="Filter by load status">
                  <option value="">{{ t('--------') }}</option>
                  <option value="loaded">{{ t('load_loaded') }}</option>
                  <option value="unloaded">{{ t('load_unloaded') }}</option>
                </select>
              </th>
              <th class="p-2">
                <select v-model="filters.repairType"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                  @change="debounceSearch" aria-label="Filter by repair type">
                  <option value="">{{ t('--------') }}</option>
                  <option value="planned">{{ t('repair_planned') }}</option>
                  <option value="current">{{ t('repair_current') }}</option>
                </select>
              </th>
              <th class="p-2">
                <select v-model="filters.ownershipId"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                  @change="debounceSearch" aria-label="Filter by ownership">
                  <option value="">{{ t('--------') }}</option>
                  <option v-for="ownership in ownerships" :key="ownership.id" :value="ownership.id">
                    {{ ownership.ownershipName || 'Unknown' }}
                  </option>
                </select>
              </th>
              <th class="p-2">
                <select v-model="filters.repairClassificationId"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                  @change="debounceSearch" aria-label="Filter by repair classification">
                  <option value="">{{ t('--------') }}</option>
                  <option v-for="repair in repairClassifications" :key="repair.id" :value="repair.id">
                    {{ repair.shortDescription || 'Unknown' }}
                  </option>
                </select>
              </th>
              <th class="p-2">
                <select v-model="filters.stationId"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                  @change="debounceSearch" aria-label="Filter by station">
                  <option value="">{{ t('--------') }}</option>
                  <option v-for="station in stations" :key="station.id" :value="station.id">
                    {{ station.name || 'Unknown' }}
                  </option>
                </select>
              </th>
              <th class="p-2">
                <select v-model="filters.operation"
                  class="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500"
                  @change="debounceSearch" aria-label="Filter by operation">
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
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-8"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              </td>
              <td class="p-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
              </td>
            </tr>
            <tr v-else v-for="row in pagedData" :key="row.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="p-3">
                <input type="checkbox" v-model="selectedWagons" :value="row.id"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :aria-label="`Select vagon ${row.vagonNumber}`" />
              </td>
              <td class="p-3 text-sm text-gray-900 dark:text-white">{{ row.vagonNumber }}</td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ row.vagonCode }}</td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ row.vagonType || 'N/A' }}</td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ t(`owner_${row.ownerType}`) || 'N/A' }}</td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200': row.loadStatus === 'loaded',
                  'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300': row.loadStatus === 'unloaded',
                }">
                  <svg v-if="row.loadStatus === 'loaded'" class="w-3 h-3 text-green-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ t(`load_${row.loadStatus}`) || 'N/A' }}
                </span>
              </td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ t(`repair_${row.repairType}`) || 'N/A' }}</td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ row.ownership?.ownershipName || 'N/A' }}</td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ row.repairClassification?.shortDescription ||
                'N/A' }}</td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ row.station?.name || 'N/A' }}</td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">{{ t(`operation_${row.operation}`) || 'N/A' }}
              </td>
              <td class="p-3 text-sm text-gray-700 dark:text-gray-300">
                <div class="flex gap-2">
                  <button @click="openEditModal(row)"
                    class="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Edit" aria-label="Edit vagon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="openDeleteModal(row.id)"
                    class="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Delete"
                    aria-label="Delete vagon">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M7 7h10m-10 0V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!isLoading && filteredData.length === 0">
              <td colspan="12" class="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {{ t('no_data_found') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-700">
        <div class="text-sm text-gray-600 dark:text-gray-300">
          {{ t('showing') }} {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredData.length) }} / {{
            filteredData.length }}
        </div>
        <div class="flex items-center gap-2">
          <button @click="prevPage" :disabled="page === 1"
            class="px-3 py-2 rounded bg-gray-200 dark:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
            aria-label="Previous page">
            {{ t('prev') }}
          </button>
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ page }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="page === totalPages"
            class="px-3 py-2 rounded bg-gray-200 dark:bg-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
            aria-label="Next page">
            {{ t('next') }}
          </button>
        </div>
      </div>

      <!-- Manage Wagons Modal -->
      <div v-if="showManageWagonsModal" class="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 w-full max-w-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ t('manage_wagons') }}</h3>
            <button @click="closeManageWagonsModal" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close modal">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('select_vagon')
              }}</label>
            <select v-model="selectedWagon"
              class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
              @change="onWagonSelect" aria-label="Select vagon">
              <option value="">{{ t('select_vagon') }}</option>
              <option v-for="wagon in filteredWagons" :key="wagon.id" :value="wagon">
                {{ wagon.vagonNumber }} - {{ wagon.vagonCode }}
              </option>
            </select>
          </div>
          <div v-if="selectedWagon" class="mb-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('operation_type')
              }}</label>
            <div class="flex gap-2">
              <button @click="selectedOperation = 'import'" :class="{
                'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600': selectedOperation === 'import',
                'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500': selectedOperation !== 'import',
              }" class="px-3 py-2 rounded text-sm flex-1" aria-label="Import">
                {{ t('operation_import') }}
              </button>
              <button @click="selectedOperation = 'take_out'" :class="{
                'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600': selectedOperation === 'take_out',
                'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500': selectedOperation !== 'take_out',
              }" class="px-3 py-2 rounded text-sm flex-1" aria-label="Take out">
                {{ t('operation_take_out') }}
              </button>
            </div>
          </div>
          <div v-if="selectedOperation" class="mb-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ selectedOperation === 'import' ? t('imported_date') : t('taken_out_date') }}
            </label>
            <input v-model="selectedDate" type="date"
              class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
              :max="maxDate" aria-label="Select date" />
          </div>
          <div class="flex justify-end gap-2">
            <button @click="closeManageWagonsModal"
              class="px-3 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
              aria-label="Cancel">
              {{ t('cancel') }}
            </button>
            <button @click="saveWagonOperation" :disabled="!selectedWagon || !selectedOperation || !selectedDate"
              class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-sm"
              aria-label="Save">
              {{ t('save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add Vagon Modal -->
      <div v-if="showAddWagonModal" class="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-2xl">
          <!-- Header -->
          <div class="flex justify-between items-center mb-5 border-b pb-3">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t('add_vagon') }}
            </h3>
            <button @click="closeAddWagonModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close modal">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form id="addWagonForm" @submit.prevent="saveNewWagon" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Vagon number -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('vagon_number') }} *
              </label>
              <input v-model="newWagon.vagonNumber" type="number" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" required
                aria-label="Vagon number" />
              <p v-if="errors.vagonNumber" class="text-red-500 text-xs mt-1">{{ errors.vagonNumber }}</p>
            </div>

            <!-- Vagon code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('vagon_code') }} *
              </label>
              <input v-model="newWagon.vagonCode" type="text" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" required
                aria-label="Vagon code" />
              <p v-if="errors.vagonCode" class="text-red-500 text-xs mt-1">{{ errors.vagonCode }}</p>
            </div>

            <!-- Vagon type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('vagon_type')
                }}</label>
              <input v-model="newWagon.vagonType" type="text" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                aria-label="Vagon type" />
            </div>

            <!-- Owner type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('owner_type')
                }}</label>
              <select v-model="newWagon.ownerType" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                aria-label="Owner type">
                <option value="invertar">{{ t('owner_uzbekistan_railways') }}</option>
                <option value="private">{{ t('owner_private') }}</option>
              </select>
            </div>

            <!-- Load status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('load_status')
                }}</label>
              <select v-model="newWagon.loadStatus" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                aria-label="Load status">
                <option value="loaded">{{ t('load_loaded') }}</option>
                <option value="unloaded">{{ t('load_unloaded') }}</option>
              </select>
            </div>

            <!-- Repair type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('repair_type')
                }}</label>
              <select v-model="newWagon.repairType" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                aria-label="Repair type">
                <option value="planned">{{ t('repair_planned') }}</option>
                <option value="current">{{ t('repair_current') }}</option>
              </select>
            </div>

            <!-- Ownership -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('ownership')
                }}</label>
              <select v-model="newWagon.ownershipId" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                aria-label="Ownership">
                <option value="">{{ t('--------') }}</option>
                <option v-for="ownership in ownerships" :key="ownership.id" :value="ownership.id">
                  {{ ownership.ownershipName || 'Unknown' }}
                </option>
              </select>
            </div>

            <!-- Repair classification -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{
                t('repair_classification') }}</label>
              <select v-model="newWagon.repairClassificationId" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                aria-label="Repair classification">
                <option value="">{{ t('--------') }}</option>
                <option v-for="repair in repairClassifications" :key="repair.id" :value="repair.id">
                  {{ ` ${repair.code} - ${repair.shortDescription}` || 'Unknown' }}
                </option>
              </select>
            </div>

            <!-- Station -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('station') }}</label>
              <select v-model="newWagon.stationId" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm 
                       text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                aria-label="Station">
                <option value="">{{ t('--------') }}</option>
                <option v-for="station in stations" :key="station.id" :value="station.id">
                  {{ station.name || 'Unknown' }}
                </option>
              </select>
            </div>

            <!-- Transit Permit -->
            <div class="flex items-center col-span-2">
              <input v-model="newWagon.transitPermit" type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" id="transitPermit" />
              <label for="transitPermit" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {{ t('transit_permit') }}
              </label>
            </div>

            <!-- Errors -->
            <div v-if="errors.general" class="text-red-500 text-xs mt-2 col-span-2">{{ errors.general }}</div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 mt-6 col-span-2">
              <button type="button" @click="closeAddWagonModal" class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 
                       hover:bg-gray-300 dark:hover:bg-gray-500 text-sm">
                {{ t('cancel') }}
              </button>
              <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                       dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-sm" :disabled="isSubmitting">
                {{ isSubmitting ? t('saving') : t('save') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Vagon Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 w-full max-w-md">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ isEditing ? t('edit_vagon') : t('add_vagon') }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close modal">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form @submit.prevent="saveVagon" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('vagon_number') }}
                  *</label>
                <input v-model="newVagon.vagonNumber" type="number"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                  required aria-describedby="vagonNumberError" />
                <p v-if="errors.vagonNumber" id="vagonNumberError" class="text-red-500 text-xs mt-1">{{
                  errors.vagonNumber }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('vagon_code') }}
                  *</label>
                <input v-model="newVagon.vagonCode" type="text"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                  required aria-describedby="vagonCodeError" />
                <p v-if="errors.vagonCode" id="vagonCodeError" class="text-red-500 text-xs mt-1">{{ errors.vagonCode }}
                </p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('vagon_type')
                }}</label>
              <input v-model="newVagon.vagonType" type="text"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                aria-label="Vagon type" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('operation') }}
                *</label>
              <select v-model="newVagon.operation"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                required aria-label="Operation type">
                <option value="release">{{ t('operation_release') }}</option>
                <option value="import">{{ t('operation_import') }}</option>
                <option value="take_out">{{ t('operation_take_out') }}</option>
              </select>
              <p v-if="errors.operation" class="text-red-500 text-xs mt-1">{{ errors.operation }}</p>
            </div>
            <div v-if="newVagon.operation === 'take_out'" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('taken_out_date') }}
                  *</label>
                <input v-model="newVagon.takenOutDate" type="date"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                  required :max="maxDate" aria-label="Taken out date" />
              </div>
            </div>
            <div v-if="newVagon.operation === 'import'" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('imported_date') }}
                  *</label>
                <input v-model="newVagon.importedDate" type="date"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                  required :max="maxDate" aria-label="Imported date" />
              </div>
            </div>
            <div v-if="newVagon.operation === 'release'" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('release_date') }}
                  *</label>
                <input v-model="newVagon.releaseDate" type="date"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                  required :max="maxDate" aria-label="Release date" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('owner_type')
                  }}</label>
                <select v-model="newVagon.ownerType"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                  aria-label="Owner type">
                  <option value="invertar">{{ t('owner_uzbekistan_railways') }}</option>
                  <option value="private">{{ t('owner_private') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('load_status')
                  }}</label>
                <select v-model="newVagon.loadStatus"
                  class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                  aria-label="Load status">
                  <option value="loaded">{{ t('load_loaded') }}</option>
                  <option value="unloaded">{{ t('load_unloaded') }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('repair_type')
                }}</label>
              <select v-model="newVagon.repairType"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                aria-label="Repair type">
                <option value="planned">{{ t('repair_planned') }}</option>
                <option value="current">{{ t('repair_current') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('ownership')
                }}</label>
              <select v-model="newVagon.ownershipId"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                aria-label="Ownership">
                <option value="">{{ t('--------') }}</option>
                <option v-for="ownership in ownerships" :key="ownership.id" :value="ownership.id">
                  {{ ownership.ownershipName || 'Unknown' }}
                </option>
              </select>
              <p v-if="errors.ownershipId" class="text-red-500 text-xs mt-1">{{ errors.ownershipId }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{
                t('repair_classification') }}</label>
              <select v-model="newVagon.repairClassificationId"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                aria-label="Repair classification">
                <option value="">{{ t('--------') }}</option>
                <option v-for="repair in repairClassifications" :key="repair.id" :value="repair.id">
                  {{ ` ${repair.code} - ${repair.shortDescription}` || 'Unknown' }}
                </option>
              </select>
              <p v-if="errors.repairClassificationId" class="text-red-500 text-xs mt-1">{{ errors.repairClassificationId
                }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('station') }}</label>
              <select v-model="newVagon.stationId"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                aria-label="Station">
                <option value="">{{ t('--------') }}</option>
                <option v-for="station in stations" :key="station.id" :value="station.id">
                  {{ station.name || 'Unknown' }}
                </option>
              </select>
              <p v-if="errors.stationId" class="text-red-500 text-xs mt-1">{{ errors.stationId }}</p>
            </div>
            <div class="flex items-center">
              <input v-model="newVagon.transitPermit" type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" id="transitPermit" />
              <label for="transitPermit" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {{ t('transit_permit') }}
              </label>
            </div>
            <div v-if="errors.general" class="text-red-500 text-xs">{{ errors.general }}</div>
            <div class="flex justify-end gap-2">
              <button type="button" @click="closeModal"
                class="px-3 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
                aria-label="Cancel">
                {{ t('cancel') }}
              </button>
              <button type="submit"
                class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 text-sm"
                :disabled="isSubmitting" aria-label="Save vagon">
                {{ isSubmitting ? t('saving') : t('save') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 w-full max-w-sm">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ t('confirm_delete') }}</h3>
            <button @click="closeDeleteModal" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close modal">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">{{ t('delete_confirmation_message') }}</p>
          <div class="flex justify-end gap-2">
            <button @click="closeDeleteModal"
              class="px-3 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
              aria-label="Cancel">
              {{ t('cancel') }}
            </button>
            <button @click="confirmDelete"
              class="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-sm"
              aria-label="Confirm delete">
              {{ t('delete') }}
            </button>
          </div>
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
const showAddWagonModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const isLoading = ref(false)
const errors = ref({})
const ownerships = ref([])
const repairClassifications = ref([])
const stations = ref([])
const selectedWagons = ref([])
const selectAll = ref(false)
const wagonSearchQuery = ref('')
const filteredWagons = ref([])
const selectedWagon = ref(null)
const selectedOperation = ref('')
const deleteVagonId = ref(null)
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
  importedDate: '',
  takenOutDate: '',
  releaseDate: '',
})
const newWagon = ref({
  vagonNumber: '',
  vagonCode: '',
  vagonType: '',
  ownershipId: '',
  ownerType: 'private',
  repairClassificationId: '',
  repairType: 'current',
  transitPermit: true,
  loadStatus: 'loaded',
  stationId: '',
})
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

const API_BASE_URL = 'https://das-vagon-api.das-uty.uz/api/v1'

function getOwnershipName(ownershipId) {
  if (!ownershipId) return 'N/A'
  const ownership = ownerships.value.find((o) => o.id === ownershipId)
  return ownership?.ownershipName || 'N/A'
}

function filterWagons() {
  const number = wagonSearchQuery.value.toLowerCase()
  filteredWagons.value = data.value.filter((wagon) =>
    String(wagon.vagonNumber).toLowerCase().includes(number),
  )
}

function showNotification(message, type = 'success') {
  console.log(`${type}: ${message}`)
}

async function fetchWithRetry(url, options, retries = 3) {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    throw new Error('No access token found. Please log in again.')
  }
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
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
      if (i === retries - 1) {
        if (e.message.includes('Unauthorized')) {
          showNotification('Sizning sessiyangiz yaroqsiz yoki tugagan. Iltimos, qayta kiring.', 'error')
        } else {
          showNotification(e.message, 'error')
        }
        throw e
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

async function fetchOwnerships() {
  try {
    isLoading.value = true
    const response = await fetchWithRetry(`${API_BASE_URL}/ownerships`, {})
    ownerships.value = response.data || []
  } catch (e) {
    console.error('Ownerships olishda xatolik:', e.message)
    showNotification(t('fetch_ownerships_error'), 'error')
    ownerships.value = []
  } finally {
    isLoading.value = false
  }
}

async function fetchRepairClassifications() {
  try {
    isLoading.value = true
    const response = await fetchWithRetry(`${API_BASE_URL}/repair-classifications`, {})
    repairClassifications.value = response.data || []
  } catch (e) {
    console.error('Repair classifications olishda xatolik:', e.message)
    showNotification(t('fetch_repair_classifications_error'), 'error')
    repairClassifications.value = []
  } finally {
    isLoading.value = false
  }
}

async function fetchStations() {
  try {
    isLoading.value = true
    const response = await fetchWithRetry(`${API_BASE_URL}/stations`, {})
    stations.value = response || []
  } catch (e) {
    console.error('Stations olishda xatolik:', e.message)
    showNotification(t('fetch_stations_error'), 'error')
    stations.value = []
  } finally {
    isLoading.value = false
  }
}

async function fetchDataByDate(date) {
  try {
    isLoading.value = true
    const response = await fetchWithRetry(`${API_BASE_URL}/released-vagons?date=${date}`, {})
    data.value = response.data || []
    filteredWagons.value = data.value
    stats.value.total = data.value.length
    stats.value.released = data.value.filter((v) => v.operation === 'release').length
    stats.value.imported = data.value.filter((v) => v.operation === 'import').length
    stats.value.takenOut = data.value.filter((v) => v.operation === 'take_out').length
    page.value = 1
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

async function saveVagon() {
  errors.value = {}
  if (!newVagon.value.vagonNumber) errors.value.vagonNumber = t('vagon_number_required')
  if (!newVagon.value.vagonCode) errors.value.vagonCode = t('vagon_code_required')
  if (!newVagon.value.operation) errors.value.operation = t('operation_required')
  if (newVagon.value.operation === 'take_out' && !newVagon.value.takenOutDate)
    errors.value.takenOutDate = t('taken_out_date_required')
  if (newVagon.value.operation === 'import' && !newVagon.value.importedDate)
    errors.value.importedDate = t('imported_date_required')
  if (newVagon.value.operation === 'release' && !newVagon.value.releaseDate)
    errors.value.releaseDate = t('release_date_required')
  if (Object.keys(errors.value).length) return

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
    takenOutDate: newVagon.value.takenOutDate || null,
    importedDate: newVagon.value.importedDate || null,
    releaseDate: newVagon.value.releaseDate || null,
  }

  try {
    const url = isEditing.value
      ? `${API_BASE_URL}/released-vagons/${newVagon.value.id}`
      : `${API_BASE_URL}/released-vagons`
    const method = isEditing.value ? 'PUT' : 'POST'

    const response = await fetchWithRetry(url, {
      method,
      body: JSON.stringify(payload),
    })
    showNotification(t(isEditing.value ? 'vagon_updated' : 'vagon_added'))
    closeModal()
    await fetchDataByDate(maxDate)
    resetNewVagon()
  } catch (e) {
    console.error('Vagon saqlashda xatolik:', e.message)
    showNotification(t('save_error'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

async function saveNewWagon() {
  errors.value = {}
  if (!newWagon.value.vagonNumber) errors.value.vagonNumber = t('vagon_number_required')
  if (!newWagon.value.vagonCode) errors.value.vagonCode = t('vagon_code_required')
  if (Object.keys(errors.value).length) return

  isSubmitting.value = true
  const payload = {
    vagonNumber: Number(newWagon.value.vagonNumber),
    vagonCode: newWagon.value.vagonCode,
    vagonType: newWagon.value.vagonType || null,
    ownershipId: newWagon.value.ownershipId || null,
    ownerType: newWagon.value.ownerType,
    repairClassificationId: newWagon.value.repairClassificationId || null,
    repairType: newWagon.value.repairType || null,
    transitPermit: newWagon.value.transitPermit,
    loadStatus: newWagon.value.loadStatus || null,
    stationId: newWagon.value.stationId || null,
    operation: 'release',
  }

  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/released-vagons`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    showNotification(t('vagon_added'))
    closeAddWagonModal()
    await fetchDataByDate(maxDate)
    resetNewWagon()
  } catch (e) {
    console.error("Yangi vagon qo'shishda xatolik:", e.message)
    showNotification(t('save_error') + ': ' + e.message, 'error')
  } finally {
    isSubmitting.value = false
  }
}

async function saveWagonOperation() {
  if (!selectedWagon.value || !selectedOperation.value || !selectedDate.value) {
    showNotification(t('select_wagon_operation_date'), 'error')
    return
  }

  isSubmitting.value = true
  const payload = {
    wagonId: selectedWagon.value.id,
    [selectedOperation.value === 'import' ? 'importedDate' : 'takenOutDate']: selectedDate.value,
  }
  const endpoint =
    selectedOperation.value === 'import'
      ? `${API_BASE_URL}/import-vagons`
      : `${API_BASE_URL}/take-out-vagons`

  try {
    await fetchWithRetry(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    showNotification(t('operation_saved'))
    closeManageWagonsModal()
    await fetchDataByDate(maxDate)
  } catch (e) {
    console.error('Operatsiya saqlashda xatolik:', e.message)
    showNotification(t('save_error') + ': ' + e.message, 'error')
  } finally {
    isSubmitting.value = false
  }
}

async function deleteVagon(id) {
  try {
    isLoading.value = true
    await fetchWithRetry(`${API_BASE_URL}/released-vagons/${id}`, {
      method: 'DELETE',
    })
    showNotification(t('vagon_deleted'))
    await fetchDataByDate(maxDate)
  } catch (e) {
    console.error("Vagon o'chirishda xatolik:", e.message)
    showNotification(t('delete_error'), 'error')
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  showAddWagonModal.value = true
  isEditing.value = false
  resetNewWagon()
}

function openManageWagonsModal() {
  showManageWagonsModal.value = true
  filterWagons()
}

function openEditModal(row) {
  isEditing.value = true
  newVagon.value = { ...row, id: row.id }
  showModal.value = true
}

function openDeleteModal(id) {
  deleteVagonId.value = id
  showDeleteModal.value = true
}

function closeModal() {
  showModal.value = false
  isEditing.value = false
  errors.value = {}
  resetNewVagon()
}

function closeManageWagonsModal() {
  showManageWagonsModal.value = false
  selectedWagon.value = null
  selectedOperation.value = ''
  selectedDate.value = maxDate
}

function closeAddWagonModal() {
  showAddWagonModal.value = false
  errors.value = {}
  resetNewWagon()
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteVagonId.value = null
}

function confirmDelete() {
  if (deleteVagonId.value) {
    deleteVagon(deleteVagonId.value)
    closeDeleteModal()
  }
}

function resetNewVagon() {
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
    importedDate: '',
    takenOutDate: '',
    releaseDate: '',
  }
  newWagon.value = {
    vagonNumber: '',
    vagonCode: '',
    vagonType: '',
    ownershipId: '',
    ownerType: 'private',
    repairClassificationId: '',
    repairType: 'current',
    transitPermit: true,
    loadStatus: 'loaded',
    stationId: '',
  }
}

function onWagonSelect() {
  selectedOperation.value = ''
  selectedDate.value = maxDate
}

function toggleSelectAll() {
  selectedWagons.value = selectAll.value ? pagedData.value.map((row) => row.id) : []
}

const filteredData = computed(() => {
  let result = data.value
  if (query.value) {
    result = result.filter(
      (item) =>
        item.vagonNumber.toString().toLowerCase().includes(query.value.toLowerCase()) ||
        item.vagonCode.toLowerCase().includes(query.value.toLowerCase()),
    )
  }
  for (const key in filters.value) {
    if (filters.value[key] && key !== 'id') {
      result = result.filter((item) => {
        if (key === 'vagonNumber' || key === 'vagonCode' || key === 'vagonType') {
          return item[key]?.toString().toLowerCase().includes(filters.value[key].toLowerCase())
        }
        return item[key] === filters.value[key]
      })
    }
  }
  return result
})

const pagedData = computed(() => {
  const start = (page.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredData.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / perPage.value))
const startIndex = computed(() => (page.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + pagedData.value.length)

function prevPage() {
  if (page.value > 1) page.value--
}

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

const debounceSearch = debounce(() => {
  page.value = 1
}, 300)

watch(showAddWagonModal, (newValue) => {
  console.log('showAddWagonModal changed to:', newValue)
})

watch(showManageWagonsModal, (newValue) => {
  console.log('showManageWagonsModal changed to:', newValue)
})

watch(showDeleteModal, (newValue) => {
  console.log('showDeleteModal changed to:', newValue)
})

watch(
  () => filters.value,
  debounce(() => {
    page.value = 1
  }, 300),
  { deep: true },
)

watch(selectedWagons, (newVal) => {
  selectAll.value = newVal.length === pagedData.value.length && pagedData.value.length > 0
})

onMounted(async () => {
  await Promise.all([fetchOwnerships(), fetchRepairClassifications(), fetchStations()])
  await fetchDataByDate(maxDate)
})
</script>

<style scoped>
table {
  border-collapse: collapse;
}

th,
td {
  border: none;
}

input:focus,
select:focus,
button:focus {
  outline: none;
}
</style>
```