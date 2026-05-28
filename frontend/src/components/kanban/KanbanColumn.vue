<template>
  <div
    class="kanban-col"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @drop.prevent="onDrop"
  >
    <div class="col-header" :class="`header-${stage}`">
      <span class="col-title">{{ LABELS[stage] }}</span>
      <span class="col-count">{{ cards.length }}</span>
    </div>

    <div class="col-cards">
      <KanbanCard
        v-for="app in cards"
        :key="app.id"
        :app="app"
        @open="$emit('open-app', $event)"
      />
      <div v-if="!cards.length" class="col-empty">
        <span>{{ EMPTY_ICONS[stage] }}</span>
        <p>Drop here</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import KanbanCard from './KanbanCard.vue'

const props = defineProps({
  stage: { type: String, required: true },
  cards: { type: Array,  default: () => [] },
})
const emit = defineEmits(['drop-card', 'open-app'])

const isDragOver = ref(false)

const LABELS = {
  saved: '🔖 Saved', applied: '📤 Applied', interview: '🗣 Interview',
  offer: '🎉 Offer', rejected: '✗ Rejected',
}
const EMPTY_ICONS = {
  saved: '🔖', applied: '📤', interview: '🗣', offer: '🎉', rejected: '✗',
}

function onDrop(e) {
  isDragOver.value = false
  const appId    = Number(e.dataTransfer.getData('appId'))
  const fromStage = e.dataTransfer.getData('fromStage')
  if (appId && fromStage !== props.stage) {
    emit('drop-card', { appId, fromStage, toStage: props.stage })
  }
}
</script>

<style scoped>
.kanban-col     { display:flex; flex-direction:column; min-width:280px; flex:1; background:var(--gray-50); border-radius:var(--border-radius); border:1px solid var(--gray-200); overflow:hidden; transition:var(--transition); }
.kanban-col.drag-over { border-color:var(--brand-primary); box-shadow:0 0 0 3px rgba(79,70,229,0.12); }
.col-header     { display:flex; align-items:center; justify-content:space-between; padding:0.7rem 0.875rem; border-bottom:2px solid transparent; }
.col-title      { font-size:0.82rem; font-weight:700; }
.col-count      { font-size:0.72rem; font-weight:700; background:rgba(0,0,0,0.08); border-radius:999px; padding:0.1rem 0.5rem; }
.header-saved     { border-bottom-color:var(--stage-saved);    background:#F5F3FF; color:var(--stage-saved); }
.header-applied   { border-bottom-color:var(--stage-applied);  background:#EFF6FF; color:var(--stage-applied); }
.header-interview { border-bottom-color:var(--stage-interview);background:#FFFBEB; color:var(--stage-interview); }
.header-offer     { border-bottom-color:var(--stage-offer);    background:#ECFDF5; color:var(--stage-offer); }
.header-rejected  { border-bottom-color:var(--stage-rejected); background:#FEF2F2; color:var(--stage-rejected); }
.col-cards      { flex:1; display:flex; flex-direction:column; gap:0.5rem; padding:0.75rem; overflow-y:auto; min-height:120px; }
.col-empty      { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.3rem; padding:1.5rem; color:var(--gray-300); font-size:0.78rem; border:2px dashed var(--gray-200); border-radius:var(--border-radius-sm); text-align:center; }
.col-empty span { font-size:1.35rem; }
</style>
