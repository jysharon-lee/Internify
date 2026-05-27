<template>
  <div class="stats-card card">
    <div class="stats-icon" :style="{ background: bgColor }">{{ icon }}</div>
    <div class="stats-body">
      <p class="stats-label">{{ label }}</p>
      <p class="stats-value">{{ value }}</p>
      <p v-if="sub" class="stats-sub">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon:    { type: String, required: true },
  label:   { type: String, required: true },
  value:   { type: [String, Number], required: true },
  sub:     { type: String, default: '' },
  bgColor: { type: String, default: 'var(--brand-primary-light)' },
})
</script>

<style scoped>
.stats-card  { display:flex; align-items:center; gap:1rem; padding:1.25rem 1.5rem; }
.stats-icon  { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
.stats-body  { min-width:0; }
.stats-label { font-size:0.78rem; font-weight:600; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.2rem; }
.stats-value { font-size:1.5rem; font-weight:800; color:var(--gray-900); letter-spacing:-0.02em; line-height:1; }
.stats-sub   { font-size:0.75rem; color:var(--gray-400); margin-top:0.2rem; }
</style>
