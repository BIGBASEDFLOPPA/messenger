<template>
  <div class="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
      <h2 class="text-2xl font-bold text-indigo-300">Космический чат</h2>
      <div class="flex items-center">
        <span class="text-sm text-gray-400 mr-3">Вы: <span class="font-medium text-indigo-200">{{ authStore.username }}</span></span>
      </div>
    </div>

    <div class="mb-4">
      <label for="select-user" class="block text-sm font-medium text-gray-400 mb-1">Выберите собеседника:</label>
      <select
        id="select-user"
        v-model="selectedUserId"
        class="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-200"
      >
        <option disabled value="" class="text-gray-500">-- Выберите пользователя --</option>
        <option
          v-for="user in authStore.users"
          :key="user._id"
          :value="user._id"
          class="text-gray-200"
        >
          {{ user.username }}
        </option>
      </select>
    </div>

    <div
      ref="messagesContainer"
      class="flex-grow border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800/30 overflow-y-auto shadow-inner backdrop-blur-sm"
    >
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="[
          'mb-4 p-3 rounded-lg max-w-[80%] transition-all duration-300',
          msg.from === authStore.userId
            ? 'ml-auto bg-gradient-to-r from-indigo-600/90 to-indigo-800/90 text-white'
            : 'mr-auto bg-gradient-to-r from-gray-700/80 to-gray-800/80 text-gray-200 border border-gray-600'
        ]"
      >
        <div class="font-semibold text-sm mb-1 flex items-center">
          <span>{{ msg.username }}</span>
          <span class="text-xs opacity-70 ml-2">
            {{ formatTimestamp(msg.timestamp) }}
          </span>
        </div>
        <div class="text-sm">{{ msg.text }}</div>
      </div>

      <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="mt-2">Выберите собеседника и начните общение</p>
      </div>
    </div>

    <div class="flex gap-2">
      <input
        v-model="messageText"
        placeholder="Введите сообщение..."
        @keyup.enter="sendMessage"
        class="flex-grow px-4 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800/50 text-gray-200 placeholder-gray-500"
        :disabled="!selectedUserId"
      />
      <button
        @click="sendMessage"
        :disabled="!selectedUserId || !messageText"
        class="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const messages = ref<{
  from: string;
  username: string;
  text: string;
  timestamp: Date
}[]>([])
const selectedUserId = ref('')
const messageText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

let socket: WebSocket

onMounted(async () => {
  await authStore.fetchUsers()

  socket = new WebSocket('ws://localhost:5000')

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
        timestamp: new Date()
      })
      scrollToBottom()
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
    timestamp: new Date()
  })

  messageText.value = ''
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatTimestamp(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Автоматическая прокрутка при изменении сообщений
watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(129, 140, 248, 0.5);
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
</style>
