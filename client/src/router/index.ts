import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../pages/AuthPage.vue'), meta: { guestOnly: true } },
  { path:'/register',component:()=> import('../pages/AuthPage.vue'), meta: { guestOnly: true } },
  { path: '/chat', component: () => import('../pages/ChatPage.vue'), meta: { requiresAuth: true } },
  { path: '/', redirect: '/chat' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  } else if (to.meta.guestOnly && auth.token) {
    next('/chat')
  } else {
    next()
  }
})

export default router
