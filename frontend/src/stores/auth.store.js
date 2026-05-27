import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import { userService } from '@/services/user.service'

export const useAuthStore = defineStore('auth', () => {
  const token   = ref(localStorage.getItem('internify_token') || null)
  const user    = ref(JSON.parse(localStorage.getItem('internify_user') || 'null'))
  const loading = ref(false)
  const error   = ref(null)

  const isAuthenticated  = computed(() => !!token.value)
  const isOnboardingDone = computed(() => user.value?.onboarding_complete)
  const fullName         = computed(() => user.value?.full_name || '')
  const userSkills       = computed(() => user.value?.skills || [])

  function _persist(newToken, newUser) {
    token.value = newToken
    user.value  = newUser
    localStorage.setItem('internify_token', newToken)
    localStorage.setItem('internify_user', JSON.stringify(newUser))
  }
  function _clear() {
    token.value = null; user.value = null
    localStorage.removeItem('internify_token')
    localStorage.removeItem('internify_user')
  }

  async function register(payload) {
    loading.value = true; error.value = null
    try { const res = await authService.register(payload); _persist(res.token, res.user); return res }
    catch (err) { error.value = err.message; throw err }
    finally { loading.value = false }
  }

  async function login(payload) {
    loading.value = true; error.value = null
    try { const res = await authService.login(payload); _persist(res.token, res.user); return res }
    catch (err) { error.value = err.message; throw err }
    finally { loading.value = false }
  }

  async function fetchMe() {
    try { const res = await authService.me(); user.value = res.user; localStorage.setItem('internify_user', JSON.stringify(res.user)); return res.user }
    catch { _clear() }
  }

  async function updateProfile(fields) {
    const res = await userService.updateProfile(fields)
    user.value = res.user
    localStorage.setItem('internify_user', JSON.stringify(res.user))
    return res.user
  }

  async function updateSkills(skills) {
    const res = await userService.updateSkills(skills)
    if (user.value) { user.value = { ...user.value, skills: res.skills }; localStorage.setItem('internify_user', JSON.stringify(user.value)) }
    return res.skills
  }

  function logout() { _clear() }

  return { token, user, loading, error, isAuthenticated, isOnboardingDone, fullName, userSkills, register, login, fetchMe, updateProfile, updateSkills, logout }
})