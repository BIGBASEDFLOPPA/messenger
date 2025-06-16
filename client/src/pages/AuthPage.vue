<template>
  <div class="p-4 max-w-sm mx-auto">
    <h2 class="text-xl font-bold mb-4">{{ mode === 'login' ? 'Вход' : 'Регистрация' }}</h2>

    <form @submit.prevent="onSubmit">
      <input
        v-model="username"
        placeholder="Имя пользователя"
        class="border p-2 mb-2 block w-full"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Пароль"
        class="border p-2 mb-4 block w-full"
        required
      />
      <button
        type="submit"
        :class="mode === 'login' ? 'bg-green-500' : 'bg-blue-500'"
        class="text-white px-4 py-2 w-full"
      >
        {{ mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-gray-600">
      <span v-if="mode === 'login'">
        Нет аккаунта?
        <button @click="mode = 'register'" class="text-blue-500 underline">
          Зарегистрируйтесь
        </button>
      </span>
      <span v-else>
        Уже есть аккаунт?
        <button @click="mode = 'login'" class="text-green-500 underline">Войдите</button>
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

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
