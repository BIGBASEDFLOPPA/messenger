import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'

interface User {
  _id: string
  username: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    username: '',
    userId: '',
    users: [] as User[],
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const res = await axios.post('/api/auth/login', { username, password })

        this.token = res.data.token
        this.userId = res.data.id
        this.username = res.data.username
        localStorage.setItem('token', this.token)

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
      this.username = ''
      this.userId = ''
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
      router.push('/login')
    },
  },
})
