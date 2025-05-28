import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import ChatPage from '../pages/ChatPage.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  {
    path: '/chat',
    component: ChatPage,
    meta: { requiresAuth: true },
  },
  { path: '/', redirect: '/chat' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    return '/login'
  }
})

export default router
