<template>
  <div class="stars-container absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div
      v-for="(star, index) in stars"
      :key="index"
      class="star"
      :style="star.style"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  count?: number
  minSize?: number
  maxSize?: number
  minDuration?: number
  maxDuration?: number
}>(), {
  count: 25,
  minSize: 1,
  maxSize: 4,
  minDuration: 4,
  maxDuration: 12
})

const stars = ref<any[]>([])

onMounted(() => {
  createStars()
})

function createStars() {
  const newStars = []

  for (let i = 0; i < props.count; i++) {
    const size = Math.random() * (props.maxSize - props.minSize) + props.minSize
    const duration = Math.random() * (props.maxDuration - props.minDuration) + props.minDuration
    const delay = Math.random() * 10
    const left = Math.random() * 100
    const top = Math.random() * 100
    const hue = Math.random() * 60 + 200 // голубые/фиолетовые оттенки
    const brightness = Math.random() * 30 + 70
    const color = `hsl(${hue}, 100%, ${brightness}%)`

    let animationName = 'twinkle'
    if (i % 3 === 0) animationName = 'twinkle-rotate'
    if (i % 5 === 0) animationName = 'twinkle-color'

    newStars.push({
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity: Math.random() * 0.8 + 0.2,
        boxShadow: `0 0 ${size * 2}px ${size}px ${color}`,
        background: color,
        filter: 'blur(0.5px)',
        animationName: animationName,
        willChange: 'transform, opacity, box-shadow, filter',
      }
    })
  }

  stars.value = newStars
}
</script>

<style scoped>
.star {
  position: absolute;
  border-radius: 50%;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  transform: scale(1);
  pointer-events: none;
  transform-origin: center;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
    box-shadow: 0 0 5px 2px currentColor;
    filter: blur(0.5px);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
    box-shadow: 0 0 20px 10px currentColor;
    filter: blur(1px);
  }
}

@keyframes twinkle-rotate {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8) rotate(0deg);
    box-shadow: 0 0 5px 2px currentColor;
  }
  50% {
    opacity: 1;
    transform: scale(1.5) rotate(180deg);
    box-shadow: 0 0 20px 10px currentColor;
  }
}

@keyframes twinkle-color {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
    box-shadow: 0 0 5px 2px currentColor;
    filter: hue-rotate(0deg) blur(0.5px);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
    box-shadow: 0 0 20px 10px currentColor;
    filter: hue-rotate(45deg) blur(1px);
  }
}

/* Для далеких звезд */
.star:nth-child(2n) {
  animation-duration: 15s;
  box-shadow: 0 0 2px 1px currentColor;
}
</style>
