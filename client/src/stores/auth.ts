// /client/src/stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'

interface User {
  _id: string
  username: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userId: localStorage.getItem('userId') || '',
    username: localStorage.getItem('username') || '',
    users: [] as User[],
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const res = await axios.post('/api/auth/login', { username, password })

        this.token = res.data.token
        this.userId = res.data.id
        this.username = res.data.username

        // Сохраняем в localStorage
        localStorage.setItem('token', this.token)
        localStorage.setItem('userId', this.userId)
        localStorage.setItem('username', this.username)

        // Применяем токен к axios
        axios.defaults.headers.common.Authorization = `Bearer ${this.token}`

        await router.push('/chat')
      } catch (err) {
        alert('Неверные данные для входа')
        console.error(err)
      }
    },

    async register(username: string, password: string) {
      try {
        await axios.post('/api/auth/register', { username, password })
        await this.login(username, password)
      } catch (err) {
        alert('Ошибка регистрации')
        console.error(err)
      }
    },

    logout() {
      this.token = ''
      this.userId = ''
      this.username = ''

      // Удаляем из localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')

      delete axios.defaults.headers.common.Authorization

      router.push('/login')
    },
  },
})
