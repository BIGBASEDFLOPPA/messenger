import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/tailwind.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'


const app = createApp(App)
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

app.use(createPinia())
app.use(router)

app.mount('#app')
