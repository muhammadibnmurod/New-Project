<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen shadow-md relative">
    <!-- Foydalanuvchi superadmin bo'lsa komponentni ko'rsat -->
    <div v-if="currentUserRole === 'superadmin'">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('user_page_title') }}</h2>
        <button
          @click="openAddUserModal"
          class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!isAuthenticated || isSubmitting"
        >
          {{ t('add_new_user') }}
        </button>
      </div>

      <!-- Toast Notifications -->
      <div class="fixed top-4 right-4 z-50 space-y-2">
        <div
          v-for="(notification, index) in notifications"
          :key="index"
          class="relative p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ease-out transform"
          :class="{
            'bg-green-50 dark:bg-green-900/80 border-l-4 border-green-500 text-green-800 dark:text-green-200':
              notification.type === 'success',
            'bg-red-50 dark:bg-red-900/80 border-l-4 border-red-500 text-red-800 dark:text-red-200':
              notification.type === 'error',
            'bg-yellow-50 dark:bg-yellow-900/80 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200':
              notification.type === 'auth_error',
          }"
          style="animation: slide-in 0.4s ease-out"
        >
          <div class="flex items-center gap-3">
            <svg
              v-if="notification.type === 'success'"
              class="w-6 h-6"
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
            <svg
              v-if="notification.type === 'error'"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-if="notification.type === 'auth_error'"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{{ notification.message }}</span>
          </div>
          <button
            @click="removeNotification(index)"
            class="absolute top-2 right-2 text-current hover:text-gray-600 dark:hover:text-gray-200"
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
      </div>

      <!-- Filter and Search -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
            t('search_by_username')
          }}</label>
          <input
            v-model="searchQuery"
            type="text"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :placeholder="t('search_username_placeholder')"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
            t('filter_by_role')
          }}</label>
          <select
            v-model="selectedRole"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">{{ t('all_roles') }}</option>
            <option value="superadmin">{{ t('superadmin') }}</option>
            <option value="moderator">{{ t('admin') }}</option>
            <option value="viewer">{{ t('viewer') }}</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-4 text-gray-600 dark:text-gray-300">
        {{ t('loading') }}
      </div>

      <!-- Users Table -->
      <div
        v-if="!isLoading"
        class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <table v-if="filteredUsers.length" class="min-w-full table-auto bg-white dark:bg-gray-800">
          <thead>
            <tr
              class="bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              <th class="p-4 text-left">#</th>
              <th class="p-4 text-left">{{ t('username') }}</th>
              <th class="p-4 text-left">{{ t('full_name') }}</th>
              <th class="p-4 text-left">{{ t('role') }}</th>
              <th class="p-4 text-left">{{ t('organization_name') }}</th>
              <th class="p-4 text-left">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(user, index) in paginatedUsers"
              :key="user.id"
              class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              <td class="p-4 text-gray-900 dark:text-gray-200">{{ startIndex + index + 1 }}</td>
              <td class="p-4 text-gray-900 dark:text-gray-200">{{ user.username }}</td>
              <td class="p-4 text-gray-900 dark:text-gray-200">{{ user.fullName || '—' }}</td>
              <td class="p-4 text-gray-900 dark:text-gray-200">{{ t(user.role) }}</td>
              <td class="p-4 text-gray-900 dark:text-gray-200">
                {{ getVchdName(user.vchdId) || '—' }}
              </td>
              <td class="p-4 flex space-x-2">
                <button
                  @click="openEditUserModal(user)"
                  class="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-150"
                  :disabled="!isAuthenticated || isSubmitting"
                  :title="t('edit')"
                >
                  <PencilIcon
                    class="w-5 h-5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  />
                </button>
                <button
                  @click="openDeleteConfirmModal(user)"
                  class="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150"
                  :disabled="!isAuthenticated || isSubmitting"
                  :title="t('delete')"
                >
                  <TrashIcon
                    class="w-5 h-5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-else
          class="p-4 text-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg"
        >
          {{ t('no_users_found') }}
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="!isLoading && totalPages > 1"
        class="flex items-center justify-between mt-6 text-sm font-medium text-gray-600 dark:text-gray-300"
      >
        <div class="flex items-center gap-2">
          <span
            >{{ t('showing') }} {{ startIndex + 1 }}-{{
              Math.min(startIndex + itemsPerPage, filteredUsers.length)
            }}
            {{ t('of') }} {{ filteredUsers.length }}</span
          >
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1 || isSubmitting"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('first') }}
          </button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1 || isSubmitting"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('previous') }}
          </button>

          <!-- Pagination sahifalari -->
          <div class="flex gap-1">
            <button
              v-for="page in displayedPages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'px-3 py-1.5 rounded-lg border',
                currentPage === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700',
                isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
              ]"
              :disabled="isSubmitting"
            >
              {{ page }}
            </button>
            <span v-if="showEndEllipsis" class="px-2 py-1.5">...</span>
          </div>

          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages || isSubmitting"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('next') }}
          </button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages || isSubmitting"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('last') }}
          </button>
        </div>
      </div>

      <!-- Add User Modal -->
      <div
        v-if="showAddUserModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ease-out"
        :class="{ 'opacity-100': showAddUserModal, 'opacity-0': !showAddUserModal }"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl p-6 sm:p-8 transform transition-all duration-300 ease-out"
          :class="{ 'scale-100': showAddUserModal, 'scale-95': !showAddUserModal }"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ t('add_new_user') }}
            </h3>
            <button
              @click="closeAddUserModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('username')
              }}</label>
              <div class="relative">
                <input
                  v-model="newUser.username"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  :class="{ 'border-red-500 dark:border-red-400': formErrors.username }"
                  :placeholder="t('username_placeholder')"
                />
                <svg
                  v-if="formErrors.username"
                  class="absolute right-3 top-3 w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                v-if="formErrors.username"
                class="text-red-600 dark:text-red-300 text-sm mt-1 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ formErrors.username }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('password')
              }}</label>
              <div class="relative">
                <input
                  v-model="newUser.password"
                  type="password"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  :class="{ 'border-red-500 dark:border-red-400': formErrors.password }"
                  :placeholder="t('password_placeholder')"
                />
                <svg
                  v-if="formErrors.password"
                  class="absolute right-3 top-3 w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                v-if="formErrors.password"
                class="text-red-600 dark:text-red-300 text-sm mt-1 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ formErrors.password }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('full_name')
              }}</label>
              <input
                v-model="newUser.fullName"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :placeholder="t('full_name_placeholder')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('role')
              }}</label>
              <div class="relative">
                <select
                  v-model="newUser.role"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  :class="{ 'border-red-500 dark:border-red-400': formErrors.role }"
                >
                  <option disabled value="">{{ t('select_role') }}</option>
                  <option value="superadmin">{{ t('superadmin') }}</option>
                  <option value="moderator">{{ t('admin') }}</option>
                  <option value="viewer">{{ t('viewer') }}</option>
                </select>
                <svg
                  v-if="formErrors.role"
                  class="absolute right-3 top-3 w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                v-if="formErrors.role"
                class="text-red-600 dark:text-red-300 text-sm mt-1 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ formErrors.role }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('organization_name')
              }}</label>
              <div class="relative">
                <select
                  v-model="newUser.vchdId"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  :class="{ 'border-red-500 dark:border-red-400': formErrors.vchdId }"
                >
                  <option value="">{{ t('select_vchd') }}</option>
                  <option v-for="vchd in vchds" :key="vchd.id" :value="vchd.id">
                    {{ vchd.name }}
                  </option>
                </select>
                <svg
                  v-if="formErrors.vchdId"
                  class="absolute right-3 top-3 w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                v-if="formErrors.vchdId"
                class="text-red-600 dark:text-red-300 text-sm mt-1 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ formErrors.vchdId }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8">
            <button
              @click="closeAddUserModal"
              class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              :disabled="isSubmitting"
            >
              {{ t('cancel') }}
            </button>
            <button
              @click="submitNewUser"
              class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting || !isAuthenticated || !isFormValid"
            >
              {{ isSubmitting ? t('saving') : t('save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit User Modal -->
      <div
        v-if="showEditUserModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ease-out"
        :class="{ 'opacity-100': showEditUserModal, 'opacity-0': !showEditUserModal }"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-xl p-6 sm:p-8 transform transition-all duration-300 ease-out"
          :class="{ 'scale-100': showEditUserModal, 'scale-95': !showEditUserModal }"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ t('edit_user') }}
            </h3>
            <button
              @click="closeEditUserModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('username')
              }}</label>
              <div class="relative">
                <input
                  v-model="editUser.username"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  :class="{ 'border-red-500 dark:border-red-400': formErrors.username }"
                  :placeholder="t('username_placeholder')"
                />
                <svg
                  v-if="formErrors.username"
                  class="absolute right-3 top-3 w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                v-if="formErrors.username"
                class="text-red-600 dark:text-red-300 text-sm mt-1 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ formErrors.username }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('full_name')
              }}</label>
              <input
                v-model="editUser.fullName"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :placeholder="t('full_name_placeholder')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('role')
              }}</label>
              <div class="relative">
                <select
                  v-model="editUser.role"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  :class="{ 'border-red-500 dark:border-red-400': formErrors.role }"
                >
                  <option disabled value="">{{ t('select_role') }}</option>
                  <option value="superadmin">{{ t('superadmin') }}</option>
                  <option value="moderator">{{ t('admin') }}</option>
                  <option value="viewer">{{ t('viewer') }}</option>
                </select>
                <svg
                  v-if="formErrors.role"
                  class="absolute right-3 top-3 w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                v-if="formErrors.role"
                class="text-red-600 dark:text-red-300 text-sm mt-1 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ formErrors.role }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{
                t('organization_name')
              }}</label>
              <div class="relative">
                <select
                  v-model="editUser.vchdId"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  :class="{ 'border-red-500 dark:border-red-400': formErrors.vchdId }"
                >
                  <option value="">{{ t('select_vchd') }}</option>
                  <option v-for="vchd in vchds" :key="vchd.id" :value="vchd.id">
                    {{ vchd.name }}
                  </option>
                </select>
                <svg
                  v-if="formErrors.vchdId"
                  class="absolute right-3 top-3 w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                v-if="formErrors.vchdId"
                class="text-red-600 dark:text-red-300 text-sm mt-1 flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ formErrors.vchdId }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8">
            <button
              @click="closeEditUserModal"
              class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              :disabled="isSubmitting"
            >
              {{ t('cancel') }}
            </button>
            <button
              @click="submitEditUser"
              class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting || !isAuthenticated || !isEditFormValid"
            >
              {{ isSubmitting ? t('saving') : t('save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteConfirmModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ease-out"
        :class="{ 'opacity-100': showDeleteConfirmModal, 'opacity-0': !showDeleteConfirmModal }"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all duration-300 ease-out"
          :class="{ 'scale-100': showDeleteConfirmModal, 'scale-95': !showDeleteConfirmModal }"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t('confirm_delete_user') }}
            </h3>
            <button
              @click="closeDeleteConfirmModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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

          <div class="space-y-4">
            <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <svg
                class="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>
                {{
                  t('confirm_delete_user_message', {
                    username: selectedUserForDelete?.username || '',
                  })
                }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-8">
            <button
              @click="closeDeleteConfirmModal"
              class="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              :disabled="isSubmitting"
            >
              {{ t('cancel') }}
            </button>
            <button
              @click="deleteUser(selectedUserForDelete?.id)"
              class="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting || !isAuthenticated"
            >
              {{ isSubmitting ? t('deleting') : t('delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Superadmin bo'lmasa ruxsat yo'qligi xabari -->
    <div
      v-else
      class="text-center py-6 text-lg font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      {{ t('access_denied') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { jwtDecode } from 'jwt-decode'
import { API } from '@/api/api' // sen oldin yozgan axios instance'ni shu yerda ishlatamiz

const { t } = useI18n()

// Ma'lumotlar uchun reaktiv o'zgaruvchilar
const users = ref([])
const vchds = ref([])
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDeleteConfirmModal = ref(false)
const selectedUserForDelete = ref(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isAuthenticated = ref(!!localStorage.getItem('accessToken'))
const currentUserRole = ref(null)
const searchQuery = ref('')
const selectedRole = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const formErrors = ref({})
const selectedUserId = ref(null)
const notifications = ref([])

// Pagination uchun hisoblangan xususiyatlar
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const paginatedUsers = computed(() => {
  const start = startIndex.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
})
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage.value)),
)
const displayedPages = computed(() => {
  const maxPagesToShow = 5
  const pages = []
  const startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2))
  const endPage = Math.min(totalPages.value, startPage + maxPagesToShow - 1)

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})
const showEndEllipsis = computed(() => {
  return displayedPages.value[displayedPages.value.length - 1] < totalPages.value
})

const isFormValid = computed(() => {
  formErrors.value = {}
  if (!newUser.value.username.trim()) {
    formErrors.value.username = t('username_required')
  }
  if (!newUser.value.password || newUser.value.password.length < 8) {
    formErrors.value.password = t('password_invalid')
  }
  if (!newUser.value.role) {
    formErrors.value.role = t('role_required')
  }
  return Object.keys(formErrors.value).length === 0
})

const isEditFormValid = computed(() => {
  formErrors.value = {}
  if (!editUser.value.username.trim()) {
    formErrors.value.username = t('username_required')
  }
  if (!editUser.value.role) {
    formErrors.value.role = t('role_required')
  }
  return Object.keys(formErrors.value).length === 0
})

const filteredUsers = computed(() => {
  let result = [...users.value]
  if (selectedRole.value) {
    result = result.filter((user) => user.role === selectedRole.value)
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter((user) => user.username.toLowerCase().includes(query))
  }
  return result
})

const newUser = ref({
  username: '',
  password: '',
  fullName: '',
  role: '',
  vchdId: '',
})

const editUser = ref({
  username: '',
  fullName: '',
  role: '',
  depoId: '',
})

const getVchdName = (vchdId) => {
  if (!vchdId) return null
  const vchd = vchds.value.find((v) => v.id === vchdId)
  return vchd ? vchd.name : null
}

// Bildirishnoma qo'shish
const addNotification = (message, type) => {
  if (type === 'error' && message.includes('500')) {
    console.error('Server xatosi:', message)
    return
  }
  notifications.value.push({ message, type })
  setTimeout(() => {
    removeNotification(0)
  }, 3000)
}

// Bildirishnomani o'chirish
const removeNotification = (index) => {
  notifications.value.splice(index, 1)
}

// Muvaffaqiyat xabarini ko'rsatish
const showSuccessMessage = (message) => {
  addNotification(message, 'success')
}

// Joriy foydalanuvchini olish
const fetchCurrentUser = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    isAuthenticated.value = false
    currentUserRole.value = null
    return
  }
  try {
    const decoded = jwtDecode(token)
    currentUserRole.value = decoded.role || null
    isAuthenticated.value = true
  } catch (e) {
    console.error(t('error'), e.message)
    addNotification(t('fetch_user_error_general'), 'error')
    isAuthenticated.value = false
    currentUserRole.value = null
    localStorage.removeItem('accessToken')
  }
}

// Foydalanuvchilarni olish
const fetchUsers = async () => {
  isLoading.value = true
  try {
    const res = await API.get('/users')
    users.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error(t('error'), e.message)
    addNotification(e.message || t('fetch_users_error_general'), 'error')
  } finally {
    isLoading.value = false
  }
}

// vchd larni olish
const fetchVchds = async () => {
  isLoading.value = true
  try {
    const res = await API.get('/wagon-depots')
    vchds.value = Array.isArray(res.data.data)
      ? res.data.data.map((item) => ({ id: item.id, name: item.name }))
      : []
  } catch (e) {
    addNotification(t('vchd_fetch_error'), 'error')
    console.error('vchd larni olish xatosi:', e.message)
  } finally {
    isLoading.value = false
  }
}

// Yangi foydalanuvchi qo'shish
const submitNewUser = async () => {
  if (!isFormValid.value) {
    addNotification(t('required_fields_error'), 'error')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      username: newUser.value.username.trim(),
      password: newUser.value.password,
      fullName: newUser.value.fullName.trim() || undefined,
      role: newUser.value.role,
      vchdId: newUser.value.vchdId || undefined,
    }
    await API.post('/auth/register', payload)
    closeAddUserModal()
    await fetchUsers()
    showSuccessMessage(t('add_user_success'))
  } catch (e) {
    console.error('Yuborish xatosi:', e.message)
    addNotification(e.message || t('create_user_error_general'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Foydalanuvchi tahrirlash
const submitEditUser = async () => {
  if (!isEditFormValid.value) {
    addNotification(t('required_fields_error'), 'error')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      username: editUser.value.username.trim(),
      fullName: editUser.value.fullName.trim() || undefined,
      role: editUser.value.role,
      vchdId: editUser.value.vchdId || undefined,
    }
    await API.patch(`/users/${selectedUserId.value}`, payload)
    closeEditUserModal()
    await fetchUsers()
    showSuccessMessage(t('edit_user_success'))
  } catch (e) {
    console.error('Tahrirlash xatosi:', e.message)
    addNotification(e.message || t('edit_user_error_general'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Foydalanuvchini o'chirish
const deleteUser = async (userId) => {
  isSubmitting.value = true
  try {
    await API.delete(`/users/${userId}`)
    closeDeleteConfirmModal()
    await fetchUsers()
    showSuccessMessage(t('delete_user_success'))
  } catch (e) {
    console.error("O'chirish xatosi:", e.message)
    addNotification(e.message || t('delete_user_error_general'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// --- Modal funksiyalar (o‘zgarishsiz qoldi) ---
const openAddUserModal = () => {
  if (!isAuthenticated.value) {
    addNotification(t('auth_error'), 'auth_error')
    return
  }
  showAddUserModal.value = true
  newUser.value = { username: '', password: '', fullName: '', role: '', vchdId: '' }
  formErrors.value = {}
}
const closeAddUserModal = () => {
  showAddUserModal.value = false
  formErrors.value = {}
}
const openEditUserModal = (user) => {
  if (!isAuthenticated.value) {
    addNotification(t('auth_error'), 'auth_error')
    return
  }
  selectedUserId.value = user.id
  editUser.value = {
    username: user.username,
    fullName: user.fullName || '',
    role: user.role,
    vchdId: user.vchdId || '',
  }
  showEditUserModal.value = true
  formErrors.value = {}
}
const closeEditUserModal = () => {
  showEditUserModal.value = false
  selectedUserId.value = null
  formErrors.value = {}
}
const openDeleteConfirmModal = (user) => {
  if (!isAuthenticated.value) {
    addNotification(t('auth_error'), 'auth_error')
    return
  }
  selectedUserForDelete.value = user
  showDeleteConfirmModal.value = true
}
const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
  selectedUserForDelete.value = null
}

// Komponent yuklanganda
onMounted(() => {
  fetchCurrentUser()
  if (currentUserRole.value === 'superadmin') {
    fetchUsers()
    fetchVchds()
  }
})
</script>
