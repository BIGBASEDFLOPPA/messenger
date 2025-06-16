<template>
  <div>
    <h2>Чат</h2>

    <label for="select-user">Кому отправить:</label>
    <select id="select-user" v-model="selectedUserId">
      <option disabled value="">Выберите пользователя</option>
      <option v-for="user in authStore.users" :key="user._id" :value="user._id">
        {{ user.username }}
      </option>
    </select>

    <div class="chat-messages" style="border:1px solid #ccc; height: 300px; overflow-y: auto; margin: 10px 0;">
      <div v-for="(msg, index) in messages" :key="index">
        <b>{{ msg.username }}:</b> {{ msg.text }}
      </div>
    </div>

    <input
      v-model="messageText"
      placeholder="Введите сообщение"
      @keyup.enter="sendMessage"
    />
    <button @click="sendMessage" :disabled="!selectedUserId || !messageText">
      Отправить
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const messages = ref<{ from: string; username: string; text: string }[]>([])
const selectedUserId = ref('')
const messageText = ref('')

let socket: WebSocket

onMounted(async () => {
  await authStore.fetchUsers()

  socket = new WebSocket('ws://localhost:5000') // замени на свой адрес

  socket.onopen = () => {
    socket.send(JSON.stringify({
      type: 'auth',
      userId: authStore.userId,
    }))
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'message') {
      messages.value.push({
        from: data.from,
        username: data.username,
        text: data.text,
      })
    }
  }

  socket.onclose = () => {
    console.log('Соединение закрыто')
  }
})

function sendMessage() {
  if (!selectedUserId.value || !messageText.value) return

  socket.send(JSON.stringify({
    type: 'message',
    to: selectedUserId.value,
    text: messageText.value,
    username: authStore.username,
  }))

  messages.value.push({
    from: authStore.userId,
    username: authStore.username,
    text: messageText.value,
  })

  messageText.value = ''
}
</script>
