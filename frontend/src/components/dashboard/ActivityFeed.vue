<template>
  <div class="activity-feed">
    <div v-if="!items.length" class="feed-empty">
      <span>🔔</span>
      <p>No recent activity yet.</p>
    </div>
    <div v-for="item in items" :key="item.id" class="feed-item" :class="{ unread: !item.read }">
      <span class="feed-dot" :class="item.type"></span>
      <div class="feed-body">
        <p class="feed-title">{{ item.title }}</p>
        <p class="feed-msg">{{ item.message }}</p>
        <p class="feed-time">{{ formatTime(item.created_at) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
})

function formatTime(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (diff < 1)  return 'Just now'
  if (diff < 60) return `${diff}m ago`
  const h = Math.floor(diff / 60)
  if (h < 24)   return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
</script>

<style scoped>
.activity-feed   { display:flex; flex-direction:column; gap:0; }
.feed-empty      { display:flex; flex-direction:column; align-items:center; padding:2rem; gap:0.5rem; color:var(--gray-400); font-size:0.875rem; }
.feed-empty span { font-size:1.5rem; }
.feed-item       { display:flex; align-items:flex-start; gap:0.75rem; padding:0.875rem 1rem; border-bottom:1px solid var(--gray-100); transition:var(--transition); }
.feed-item:last-child { border-bottom:none; }
.feed-item.unread { background:var(--brand-primary-light); }
.feed-dot        { width:8px; height:8px; border-radius:999px; flex-shrink:0; margin-top:5px; background:var(--gray-300); }
.feed-dot.new_match { background:var(--success); }
.feed-dot.deadline  { background:var(--warning); }
.feed-dot.status_change { background:var(--info); }
.feed-dot.system    { background:var(--brand-primary); }
.feed-body       { flex:1; min-width:0; }
.feed-title      { font-size:0.835rem; font-weight:600; color:var(--gray-800); line-height:1.3; }
.feed-msg        { font-size:0.78rem; color:var(--gray-500); margin-top:2px; line-height:1.3; }
.feed-time       { font-size:0.7rem; color:var(--gray-400); margin-top:4px; }
</style>
