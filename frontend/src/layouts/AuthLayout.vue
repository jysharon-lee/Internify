<template>
  <div class="auth-layout">
    <div class="auth-brand">
      <div class="auth-logo">
        <span class="logo-icon">✦</span>
        <span class="logo-text">Internify</span>
      </div>
      <p class="auth-tagline">Find your perfect internship match</p>
    </div>
    <div class="auth-card"><RouterView /></div>
    <p class="auth-footer">© 2025 Internify · Built for aspiring professionals</p>
  </div>
</template>
<script setup>
import { RouterView } from 'vue-router'
</script>
<style scoped>
.auth-layout { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem 1rem; background:linear-gradient(135deg,#667eea0d 0%,#764ba20d 100%); }
.auth-brand  { text-align:center; margin-bottom:2rem; }
.auth-logo   { display:flex; align-items:center; justify-content:center; gap:0.5rem; margin-bottom:0.5rem; }
.logo-icon   { font-size:1.5rem; color:var(--brand-primary); }
.logo-text   { font-size:1.75rem; font-weight:800; color:var(--gray-900); letter-spacing:-0.04em; }
.auth-tagline{ font-size:0.9rem; color:var(--gray-500); }
.auth-card   { background:#fff; border-radius:var(--border-radius-lg); border:1px solid var(--gray-200); box-shadow:var(--shadow-xl); padding:2.5rem; width:100%; max-width:440px; }
.auth-footer { margin-top:2rem; font-size:0.78rem; color:var(--gray-400); }
@media(max-width:480px){ .auth-card{ padding:1.75rem 1.25rem; } }
</style>