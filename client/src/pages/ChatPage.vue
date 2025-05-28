<template>
  <div>
    <h2>Chat</h2>
    <div style="display: flex;">
      <!-- Список пользователей -->
      <div style="width: 200px; border-right: 1px solid #ccc;">
        <div
          v-for="u in auth.users"
          :key="u._id"
          @click="selectUser(u)"
          :style="{ cursor: 'pointer', padding: '5px', background: selectedUser?._id === u._id ? '#eef' : '' }"
        >
          {{ u.username }}
        </div>
      </div>

      <!-- Чат -->
      <div style="flex: 1; padding-left: 10px;">
        <div v-if="selectedUser">
          <h3>Chat with {{ selectedUser.username }}</h3>
          <div v-for="msg in messages" :key="msg.timestamp">
            <strong>{{ msg.from === auth.userId ? 'You' : selectedUser.username }}:</strong> {{ msg.text }}
          </div>
          <input v-model="message" @keyup.enter="sendMessage" placeholder="Type a message..." />
        </div>
        <div v-else>
          <p>Select a user to start chatting</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const message = ref('')
const messages = ref<any[]>([])
const selectedUser = ref<any | null>(null)
let socket: WebSocket

function selectUser(user: any) {
  selectedUser.value = user
  messages.value = [] // Пока без истории
}

onMounted(async () => {
  await auth.fetchUsers()

  socket = new WebSocket('ws://localhost:5000')

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'auth', userId: auth.userId }))
  })

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'message') {
      if (data.from === selectedUser.value?._id || data.to === selectedUser.value?._id) {
        messages.value.push(data)
      }
    }
  })
})

function sendMessage() {
  if (!message.value || !selectedUser.value) return
  socket.send(JSON.stringify({
    type: 'message',
    from: auth.userId,
    to: selectedUser.value._id,
    text: message.value
  }))
  message.value = ''
}
</script>
