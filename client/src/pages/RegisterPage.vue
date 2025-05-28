<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-2">Регистрация</h2>
    <form @submit.prevent="onRegister">
      <input v-model="username" placeholder="Имя пользователя" class="border p-2 mb-2 block w-full" />
      <input v-model="password" type="password" placeholder="Пароль" class="border p-2 mb-2 block w-full" />
      <button type="submit" class="bg-blue-500 text-white px-4 py-2">Зарегистрироваться</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

const onRegister = async () => {
  try {
    await auth.register(username.value, password.value);
    router.push('/chat');
  } catch (err) {
    alert('Ошибка регистрации');
  }
};
</script>
