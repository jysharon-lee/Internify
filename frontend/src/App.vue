<template>
  <RouterView />
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in notifStore.toasts"
          :key="t.id"
          class="toast-msg"
          :class="`toast-${t.type}`"
          @click="notifStore.dismiss(t.id)"
        >
          <span>{{ t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️' }}</span>
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useNotificationStore } from '@/stores/notification.store'
const notifStore = useNotificationStore()
</script>

<style>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}
.toast-msg {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.1rem;
  background: var(--gray-900);
  color: #fff;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: var(--shadow-xl);
  pointer-events: all;
  cursor: pointer;
  max-width: 320px;
  border-left: 3px solid transparent;
}
.toast-success { border-left-color: var(--success); }
.toast-error   { border-left-color: var(--danger); }
.toast-warning { border-left-color: var(--warning); }
.toast-info    { border-left-color: var(--info); }
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(30px); }
</style>