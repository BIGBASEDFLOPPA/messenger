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
    async fetchUsers() {
      try {
        const res = await axios.get('/api/auth/users')
        this.users = res.data
      } catch (err) {
        console.error('Ошибка получения пользователей', err)
      }
    },

    async login(username: string, password: string) {
      try {
        const res = await axios.post('/api/auth/login', { username, password })

        this.token = res.data.token
        this.userId = res.data.id
        this.username = res.data.username

        localStorage.setItem('token', this.token)
        localStorage.setItem('userId', this.userId)
        localStorage.setItem('username', this.username)

        axios.defaults.headers.common.Authorization = `Bearer ${this.token}`

        await this.fetchUsers()
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
      this.users = []

      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')

      delete axios.defaults.headers.common.Authorization

      router.push('/login')
    },
  },
})
