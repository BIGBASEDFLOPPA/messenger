<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4 relative overflow-hidden">
    <!-- Используем компонент звёздного фона -->
    <StarsBackground />

    <div class="bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-700 relative z-10">
      <div class="text-center mb-8">
        <div class="mx-auto bg-indigo-900/50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-indigo-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-indigo-200">
          {{ mode === 'login' ? 'Вход в систему' : 'Регистрация' }}
        </h2>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-5">
        <div>
          <input
            v-model="username"
            placeholder="Имя пользователя"
            class="w-full px-4 py-3 text-gray-200 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 transition"
          />
        </div>

        <div>
          <input
            v-model="password"
            type="password"
            placeholder="Пароль"
            class="w-full px-4 py-3 text-gray-200 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 transition"
          />
        </div>

        <button
          type="submit"
          class="w-full py-3.5 text-white rounded-lg font-medium transition-colors shadow-lg"
          :class="mode === 'login' ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900' : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900'"
        >
          {{ mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
        <span v-if="mode === 'login'">
          Нет аккаунта?
          <button @click="mode = 'register'" class="font-medium text-indigo-400 hover:text-indigo-300 ml-1 transition-colors">
            Зарегистрируйтесь
          </button>
        </span>
        <span v-else>
          Уже есть аккаунт?
          <button @click="mode = 'login'" class="font-medium text-purple-400 hover:text-purple-300 ml-1 transition-colors">
            Войти
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import StarsBackground from "@/components/StarsBackground.vue";


const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const mode = ref<'login' | 'register'>('login')

const onSubmit = async () => {
  try {
    if (mode.value === 'login') {
      await auth.login(username.value, password.value)
    } else {
      await auth.register(username.value, password.value)
    }
    router.push('/chat')
  } catch (e) {
    alert('Ошибка: ' + (e instanceof Error ? e.message : 'неизвестная'))
  }
}

onMounted(() => {
  if (auth.token) {
    router.replace('/chat')
  }
})
</script>
