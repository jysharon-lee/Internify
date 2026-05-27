<template>
  <div>
    <h2 class="auth-heading">Welcome back</h2>
    <p class="auth-subheading">Sign in to your Internify account</p>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <div class="input-wrap">
          <input v-model="form.password" :type="showPw ? 'text' : 'password'" class="form-control" placeholder="••••••••" required />
          <button type="button" class="pw-toggle" @click="showPw = !showPw">{{ showPw ? '🙈' : '👁️' }}</button>
        </div>
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        <span>{{ loading ? 'Signing in…' : 'Sign In' }}</span>
      </button>
    </form>
    <p class="auth-switch">Don't have an account? <RouterLink to="/auth/register">Create one →</RouterLink></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
const router = useRouter(); const route = useRoute(); const authStore = useAuthStore()
const form = ref({ email: '', password: '' }); const showPw = ref(false); const loading = ref(false); const error = ref('')
async function handleLogin() {
  loading.value = true; error.value = ''
  try { await authStore.login(form.value); router.push(route.query.redirect || '/dashboard') }
  catch (err) { error.value = err.message || 'Invalid credentials.' }
  finally { loading.value = false }
}
</script>

<style scoped>
.auth-heading    { font-size:1.35rem; font-weight:800; color:var(--gray-900); letter-spacing:-0.02em; }
.auth-subheading { font-size:0.875rem; color:var(--gray-500); margin-top:0.25rem; margin-bottom:1.75rem; }
.auth-form       { display:flex; flex-direction:column; gap:1rem; }
.form-group      { display:flex; flex-direction:column; }
.input-wrap      { position:relative; }
.input-wrap .form-control { padding-right:2.5rem; }
.pw-toggle       { position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; font-size:1rem; }
.error-msg       { font-size:0.82rem; color:var(--danger); background:#FEF2F2; padding:0.5rem 0.75rem; border-radius:var(--border-radius-sm); border:1px solid #FECACA; }
.auth-switch     { text-align:center; font-size:0.875rem; color:var(--gray-500); margin-top:1.25rem; }
.auth-switch a   { color:var(--brand-primary); font-weight:600; }
</style>