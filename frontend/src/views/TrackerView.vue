<template>
  <div class="tracker">
    <div class="page-header">
      <h1>Application Tracker</h1>
      <p>Drag and drop cards between columns to update your application status.</p>
    </div>

    <!-- Summary badges -->
    <div class="tracker-summary">
      <span v-for="s in STAGES" :key="s" class="stage-count" :class="`count-${s}`">
        {{ STAGE_LABELS[s] }} <strong>{{ appStore.grouped[s]?.length || 0 }}</strong>
      </span>
    </div>

    <LoadingSpinner v-if="appStore.loading" label="Loading applications…" />

    <EmptyState
      v-else-if="appStore.totalCount === 0"
      icon="📋"
      title="No applications yet"
      message="Browse internships and save the ones you like — they'll appear here."
    >
      <RouterLink to="/discover" class="btn btn-primary btn-sm">Browse Internships →</RouterLink>
    </EmptyState>

    <KanbanBoard v-else />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useApplicationStore } from '@/stores/application.store'
import KanbanBoard    from '@/components/kanban/KanbanBoard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState     from '@/components/common/EmptyState.vue'

const appStore = useApplicationStore()

const STAGES = ['saved', 'applied', 'interview', 'offer', 'rejected']
const STAGE_LABELS = {
  saved: '🔖 Saved', applied: '📤 Applied', interview: '🗣 Interview',
  offer: '🎉 Offer', rejected: '✗ Rejected',
}

onMounted(() => appStore.fetchAll())
</script>

<style scoped>
.tracker         { display:flex; flex-direction:column; gap:1.5rem; }
.tracker-summary { display:flex; flex-wrap:wrap; gap:0.5rem; }
.stage-count     { display:inline-flex; align-items:center; gap:0.4rem; padding:0.3rem 0.875rem; border-radius:999px; font-size:0.78rem; font-weight:500; }
.count-saved     { background:#EEF2FF; color:var(--stage-saved); }
.count-applied   { background:#EFF6FF; color:var(--stage-applied); }
.count-interview { background:#FFFBEB; color:var(--stage-interview); }
.count-offer     { background:#ECFDF5; color:var(--stage-offer); }
.count-rejected  { background:#FEF2F2; color:var(--stage-rejected); }
</style>
