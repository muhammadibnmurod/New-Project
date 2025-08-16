import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

import LoginPage from '../components/LoginPage.vue'
import HomePage from '../components/HomePage.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import Vagon from '../pages/Vagon.vue'
import Vchd from '../pages/Vch.vue'
import VagonDetail from '../pages/vagonDetails.vue'
import User from '../pages/Users.vue'
import VchUserOutcome from '@/components/views/Vagon_User/Outcame_relesed/VagonUserDefault.vue'
import ImportTakenOut from '../components/views/Vagon_User/Import Taken Out/ImportTakenOutDefault.vue'
import PlannedTakenOut from '../components/views/PlannedTakenOutWagons.vue'
import getTakenOutVagons from '../components/views/getTakenOutVagons.vue'

const routes = [
  {
    path: '/auth',
    name: 'LoginPage',
    component: LoginPage,
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { private: true },
    children: [
      {
        path: '',
        name: 'HomePage',
        component: HomePage,
        meta: { roles: ['moderator, superadmin'] },
      },
      {
        path: '/vagon',
        name: 'Vagon',
        component: Vagon,
        meta: { roles: ['moderator'] },
      },
      {
        path: '/vchd',
        name: 'Vchd',
        component: Vchd,
        meta: { roles: ['moderator'] },
      },
      {
        path: '/vagon/:id',
        name: 'VagonDetail',
        component: VagonDetail,
        meta: { roles: ['moderator'] },
      },
      {
        path: '/user',
        name: 'User',
        component: User,
        meta: { roles: ['superadmin'] },
      },
      {
        path: '/vagon_user',
        name: 'VchUser',
        component: VchUserOutcome,
        meta: { roles: ['moderator', 'viewer'] },
      },
      {
        path: '/import_taken_out',
        name: 'ImportTakenOut',
        component: ImportTakenOut,
        meta: { roles: ['moderator', 'viewer'] },
      },
      {
        path: '/planned_taken_out',
        name: 'PlannedTakenOut',
        component: PlannedTakenOut,
        meta: { roles: ['moderator', 'viewer'] },
      },
      {
        path: '/get_taken_out',
        name: 'getTakenOutVagons',
        component: getTakenOutVagons,
        meta: { roles: ['moderator', 'viewer'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  const userRole = localStorage.getItem('role')
  console.log(
    'userRole, token',
    userRole,
    to.meta.private,
    to.meta.roles,
    to.meta.roles?.includes(userRole),
    !to.meta.roles?.includes(userRole),
  )
  if (to.path === '/' && token) {
    console.log('log 1')
    if (userRole === 'viewer') {
      console.log('log 2')
      return next('/vagon_user')
    } else {
      console.log('log 3')
      return next('/vchd')
    }
  }
  if (to.meta.private && !token) {
    console.log('log 4')
    return next('/auth')
  }

  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    console.log('log 5')
    return next('/vchd')
  }

  next()
})

export default router
