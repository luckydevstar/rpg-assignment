<script setup lang="ts">
import { useSubscription } from '@vue/apollo-composable'
import { ref } from 'vue'
import { BLOG_PUBLISHED } from '@/graphql/operations'

type Toast = { id: string; message: string }

const toasts = ref<Toast[]>([])

const { onResult } = useSubscription(BLOG_PUBLISHED)

onResult((result) => {
  const blog = result.data?.blogPublished
  if (!blog) return
  const id = crypto.randomUUID()
  const preview =
    blog.content.length > 100
      ? `${blog.content.slice(0, 100)}…`
      : blog.content
  toasts.value = [
    ...toasts.value,
    { id, message: `New post · ${blog.author.email} — ${preview}` },
  ]
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 8500)
})
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" role="status">
        <span class="toast__pulse" aria-hidden="true" />
        <span class="toast__text">{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-width: min(26rem, calc(100vw - 2rem));
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem 1rem 0.85rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--header-bg);
  color: var(--header-text);
  font-size: 0.875rem;
  line-height: 1.45;
  box-shadow: var(--shadow-float);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.toast__pulse {
  flex-shrink: 0;
  width: 0.5rem;
  height: 0.5rem;
  margin-top: 0.35rem;
  border-radius: 999px;
  background: #4ade80;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.35);
  animation: pulse 1.5s ease-in-out infinite;
}

.toast__text {
  flex: 1;
  min-width: 0;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.toast-move {
  transition: transform 0.28s ease;
}
</style>
