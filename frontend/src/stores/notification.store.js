import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const toasts        = ref([])
  const notifications = ref([])
  let toastId = 0

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function toast(message, type = 'success', duration = 3500) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), duration)
    return id
  }
  function dismiss(id) { const idx = toasts.value.findIndex(t => t.id === id); if (idx !== -1) toasts.value.splice(idx, 1) }

  function push({ title, message, type = 'system', link = null }) {
    notifications.value.unshift({ id: Date.now(), title, message, type, link, read: false, created_at: new Date().toISOString() })
  }
  function markRead(id)  { const n = notifications.value.find(n => n.id === id); if (n) n.read = true }
  function markAllRead() { notifications.value.forEach(n => (n.read = true)) }

  function seedDemo() {
    if (notifications.value.length > 0) return
    push({ title: 'New match found!', message: 'Frontend Intern @ Grab — 89% match', type: 'new_match', link: '/internship/1' })
    push({ title: 'Deadline approaching', message: 'Shopee Data Analyst — 3 days left', type: 'deadline', link: '/internship/3' })
    push({ title: 'Welcome to Internify!', message: 'Complete your profile to see better matches.', type: 'system' })
  }

  return { toasts, notifications, unreadCount, toast, dismiss, push, markRead, markAllRead, seedDemo }
})