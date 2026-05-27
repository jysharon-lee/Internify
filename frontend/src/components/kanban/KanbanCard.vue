<template>
  <div
    class="kanban-card"
    draggable="true"
    @dragstart="onDragStart"
    @click="$emit('open', app)"
  >
    <div class="kcard-top">
      <img
        :src="logoUrl"
        :alt="app.company_name"
        class="kcard-logo"
        @error="$event.target.src = fallbackLogo"
      />
      <span class="stage-badge" :class="app.stage">{{ STAGE_LABELS[app.stage] }}</span>
    </div>

    <p class="kcard-title">{{ app.internship_title }}</p>
    <p class="kcard-company">{{ app.company_name }}</p>

    <div class="kcard-meta">
      <span v-if="app.match_score != null" class="kcard-score" :style="{ color: scoreColor(app.match_score) }">
        ● {{ app.match_score }}% match
      </span>
      <span v-if="app.interview_date" class="kcard-date">
        🗓 {{ formatDate(app.interview_date) }}
      </span>
    </div>

    <div v-if="app.notes" class="kcard-notes">{{ app.notes }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMatchScore } from '@/composables/useMatchScore'

const props = defineProps({
  app: { type: Object, required: true },
})
defineEmits(['open'])

const { scoreColor } = useMatchScore()

const STAGE_LABELS = {
  saved: 'Saved', applied: 'Applied', interview: 'Interview',
  offer: 'Offer', rejected: 'Rejected',
}

const fallbackLogo = computed(
  () => `https://ui-avatars.com/api/?name=${encodeURIComponent(props.app.company_name || 'C')}&background=4F46E5&color=fff&size=40`
)
const logoUrl = computed(() => props.app.logo_url || fallbackLogo.value)

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
}

function onDragStart(e) {
  e.dataTransfer.setData('appId', String(props.app.id))
  e.dataTransfer.setData('fromStage', props.app.stage)
  e.dataTransfer.effectAllowed = 'move'
}
</script>

<style scoped>
.kanban-card   { background:#fff; border:1px solid var(--gray-200); border-radius:var(--border-radius-sm); padding:0.875rem; cursor:grab; transition:var(--transition); display:flex; flex-direction:column; gap:0.45rem; }
.kanban-card:active { cursor:grabbing; opacity:0.8; }
.kanban-card:hover  { box-shadow:var(--shadow-md); border-color:var(--brand-primary); }
.kcard-top     { display:flex; align-items:center; justify-content:space-between; gap:0.5rem; }
.kcard-logo    { width:24px; height:24px; border-radius:6px; object-fit:contain; border:1px solid var(--gray-100); background:var(--gray-50); flex-shrink:0; }
.kcard-title   { font-size:0.835rem; font-weight:700; color:var(--gray-900); line-height:1.3; }
.kcard-company { font-size:0.75rem; color:var(--gray-500); }
.kcard-meta    { display:flex; flex-wrap:wrap; gap:0.4rem; }
.kcard-score   { font-size:0.72rem; font-weight:600; }
.kcard-date    { font-size:0.72rem; color:var(--gray-500); }
.kcard-notes   { font-size:0.75rem; color:var(--gray-500); background:var(--gray-50); border-radius:var(--border-radius-sm); padding:0.4rem 0.6rem; line-height:1.4; white-space:pre-wrap; word-break:break-word; }
</style>
