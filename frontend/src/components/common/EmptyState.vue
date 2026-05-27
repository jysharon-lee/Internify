<template>
  <div class="empty-state">
    <div class="empty-icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p v-if="message">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon:    { type: String, default: '📭' },
  title:   { type: String, default: 'Nothing here yet' },
  message: { type: String, default: '' },
})
</script>

<style scoped>
.empty-state    { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3.5rem 2rem; text-align:center; }
.empty-icon     { font-size:2.75rem; margin-bottom:1rem; line-height:1; }
.empty-state h3 { font-size:1rem; font-weight:700; color:var(--gray-700); margin-bottom:0.375rem; }
.empty-state p  { font-size:0.875rem; color:var(--gray-500); max-width:280px; line-height:1.5; margin-bottom:1.25rem; }
</style>
