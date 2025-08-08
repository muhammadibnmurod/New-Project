import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import HomePage from '../components/HomePage.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import Vagon from '../pages/Vagon.vue'
import Vchd from '../pages/Vch.vue'
import VagonDetail from '../pages/vagonDetails.vue'
import User from '../pages/Users.vue'

const routes = [
  {
    path: '/auth',
    name: 'LoginPage',
    component: LoginPage,
  },
  {
    path: '/',
    name: 'DefaultLayout',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'HomePage',
        component: HomePage,
      },
      {
        path: '/vagon',
        name: 'Vagon',
        component: Vagon,
      },
      {
        path: '/vchd',
        name: 'Vchd',
        component: Vchd,
      },
      {
        path: '/vagon/:id',
        name: 'VagonDetail',
        component: VagonDetail,
      },
      {
        path: '/user',
        name: 'User',
        component: User,
      },
    ],
    meta: {
      private: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  console.log(token)
  console.log(to)
  if (to.path === '/' && token) {
    next('/vchd')
  } else if (to.meta.private && !token) {
    next('/auth')
  } else {
    next()
  }
})

export default router
