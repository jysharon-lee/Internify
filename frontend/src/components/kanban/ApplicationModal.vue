<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-box">
          <!-- Header -->
          <div class="modal-header">
            <div>
              <p class="modal-company">{{ app.company_name }}</p>
              <h3 class="modal-title">{{ app.internship_title }}</h3>
            </div>
            <button class="btn btn-ghost btn-sm" @click="$emit('close')">✕</button>
          </div>

          <!-- Stage selector -->
          <div class="stage-row">
            <label class="form-label" style="margin:0">Stage</label>
            <div class="stage-chips">
              <button
                v-for="s in STAGES"
                :key="s"
                type="button"
                class="stage-chip"
                :class="{ active: form.stage === s, [`chip-${s}`]: true }"
                @click="form.stage = s"
              >{{ STAGE_LABELS[s] }}</button>
            </div>
          </div>

          <!-- Fields -->
          <div class="modal-fields">
            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea v-model="form.notes" class="form-control" rows="3" placeholder="Add your notes, contacts, or links…"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Interview Date</label>
                <input v-model="form.interview_date" type="date" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Offer Amount (MYR)</label>
                <input v-model.number="form.offer_amount" type="number" class="form-control" placeholder="e.g. 2500" min="0" />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button class="btn btn-danger btn-sm" @click="$emit('remove', app)">🗑 Remove</button>
            <div style="display:flex;gap:0.5rem;margin-left:auto">
              <button class="btn btn-ghost" @click="$emit('close')">Cancel</button>
              <button class="btn btn-primary" :disabled="saving" @click="save">
                <span v-if="saving" class="spinner"></span>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show:  { type: Boolean, required: true },
  app:   { type: Object,  default: () => ({}) },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'save', 'remove'])

const STAGES = ['saved', 'applied', 'interview', 'offer', 'rejected']
const STAGE_LABELS = {
  saved: '🔖 Saved', applied: '📤 Applied', interview: '🗣 Interview',
  offer: '🎉 Offer', rejected: '✗ Rejected',
}

const form = ref({ stage: 'saved', notes: '', interview_date: '', offer_amount: null })

watch(() => props.app, (a) => {
  if (a) {
    form.value = {
      stage:          a.stage || 'saved',
      notes:          a.notes || '',
      interview_date: a.interview_date ? a.interview_date.slice(0, 10) : '',
      offer_amount:   a.offer_amount || null,
    }
  }
}, { immediate: true })

function save() {
  emit('save', { ...form.value })
}
</script>

<style scoped>
.modal-overlay  { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:8000; display:flex; align-items:center; justify-content:center; padding:1rem; }
.modal-box      { background:var(--surface-raised); border-radius:var(--border-radius-lg); box-shadow:var(--shadow-xl); padding:1.75rem; width:100%; max-width:480px; display:flex; flex-direction:column; gap:1.25rem; }
.modal-header   { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
.modal-company  { font-size:0.78rem; color:var(--gray-500); font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }
.modal-title    { font-size:1rem; font-weight:800; color:var(--gray-900); letter-spacing:-0.01em; margin-top:2px; }
.stage-row      { display:flex; flex-direction:column; gap:0.5rem; }
.stage-chips    { display:flex; flex-wrap:wrap; gap:0.4rem; }
.stage-chip     { padding:0.3rem 0.8rem; border-radius:999px; border:1.5px solid var(--gray-200); background:#fff; font-size:0.78rem; font-weight:600; color:var(--gray-500); cursor:pointer; transition:var(--transition); }
.stage-chip.active.chip-saved     { background:#EEF2FF; border-color:var(--stage-saved);    color:var(--stage-saved); }
.stage-chip.active.chip-applied   { background:#EFF6FF; border-color:var(--stage-applied);  color:var(--stage-applied); }
.stage-chip.active.chip-interview { background:#FFFBEB; border-color:var(--stage-interview);color:var(--stage-interview); }
.stage-chip.active.chip-offer     { background:#ECFDF5; border-color:var(--stage-offer);    color:var(--stage-offer); }
.stage-chip.active.chip-rejected  { background:#FEF2F2; border-color:var(--stage-rejected); color:var(--stage-rejected); }
.modal-fields   { display:flex; flex-direction:column; gap:0.875rem; }
.form-group     { display:flex; flex-direction:column; }
.form-row       { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.modal-actions  { display:flex; align-items:center; border-top:1px solid var(--gray-100); padding-top:1rem; }
</style>
