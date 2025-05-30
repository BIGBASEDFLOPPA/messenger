<template>
  <div class="chat-page">
    <div class="chat-box">
      <div class="messages" ref="messagesContainer">
        <div
          v-for="msg in messages"
          :key="msg._id || msg.timestamp"
          :class="['message', msg.from === auth.userId ? 'sent' : 'received']"
        >
          <span class="username">{{ msg.from === auth.userId ? 'Вы' : 'Друг' }}:</span>
          <span class="text">{{ msg.text }}</span>
        </div>
      </div>
      <form @submit.prevent="sendMessage" class="input-box">
        <input v-model="newMessage" placeholder="Введите сообщение..." />
        <button type="submit">Отправить</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const newMessage = ref('')
const messages = ref<any[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
let socket: WebSocket

function scrollToBottom() {
  nextTick(() => {
    messagesContainer.value?.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  })
}

onMounted(() => {
  if (!auth.token) {
    router.push('/login')
    return
  }

  socket = new WebSocket('ws://localhost:5000')

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'auth', userId: auth.userId }))
  })

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)

    if (data.type === 'message') {
      // Добавляем сообщение только если оно от другого пользователя
      if (data.from !== auth.userId) {
        messages.value.push({
          from: data.from,
          text: data.text,
          timestamp: Date.now(),
        })
        scrollToBottom()
      }
    }
  })
})

function sendMessage() {
  if (!newMessage.value.trim() || socket.readyState !== WebSocket.OPEN) return

  const message = {
    type: 'message',
    to: '683a00d34e03b32604551089', // Временно жёстко, заменим позже
    text: newMessage.value,
  }

  socket.send(JSON.stringify(message))

  // Добавляем сообщение отправителю локально
  messages.value.push({
    from: auth.userId,
    text: newMessage.value,
    timestamp: Date.now(),
  })

  newMessage.value = ''
  scrollToBottom()
}
</script>

<style scoped>
.chat-page {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.chat-box {
  width: 500px;
  border: 1px solid #ccc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
}

.messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f9f9f9;
}

.message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 70%;
}

.sent {
  align-self: flex-end;
  background: #dcf8c6;
}

.received {
  align-self: flex-start;
  background: #e6e6e6;
}

.username {
  font-weight: bold;
  margin-right: 6px;
}

.input-box {
  display: flex;
  padding: 12px;
  border-top: 1px solid #ccc;
  background: white;
}

input {
  flex: 1;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-right: 8px;
}

button {
  padding: 8px 16px;
  font-size: 16px;
  border: none;
  background: #409eff;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}
</style>
