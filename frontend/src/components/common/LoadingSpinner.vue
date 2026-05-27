<template>
  <div class="spinner-wrap" :class="fullPage ? 'full-page' : 'inline'">
    <div class="spinner" :style="size ? `width:${size}px;height:${size}px` : ''"></div>
    <p v-if="label" class="spinner-label">{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({
  fullPage: { type: Boolean, default: false },
  label:    { type: String,  default: '' },
  size:     { type: Number,  default: 0 },
})
</script>

<style scoped>
.spinner-wrap        { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.75rem; }
.spinner-wrap.inline { padding:2rem; }
.spinner-wrap.full-page { position:fixed; inset:0; background:rgba(255,255,255,0.85); z-index:9000; }
.spinner-label       { font-size:0.875rem; color:var(--gray-500); font-weight:500; }
</style>
