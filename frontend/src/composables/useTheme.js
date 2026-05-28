import { ref } from 'vue'

// Module-level singleton — all components share the same isDark ref
const isDark = ref(false)

export function useTheme() {
  function apply(dark) {
    isDark.value = dark
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('internify_theme', dark ? 'dark' : 'light')
  }

  function toggle() {
    apply(!isDark.value)
  }

  function init() {
    const saved      = localStorage.getItem('internify_theme')
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    apply(saved ? saved === 'dark' : prefersDark)
  }

  return { isDark, toggle, init }
}
