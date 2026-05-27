<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
        <div class="modal-box" role="dialog" aria-modal="true">
          <div class="modal-icon">{{ icon }}</div>
          <h3 class="modal-title">{{ title }}</h3>
          <p class="modal-msg">{{ message }}</p>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="$emit('cancel')">{{ cancelLabel }}</button>
            <button class="btn" :class="danger ? 'btn-danger' : 'btn-primary'" @click="$emit('confirm')">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show:         { type: Boolean, default: false },
  title:        { type: String,  default: 'Are you sure?' },
  message:      { type: String,  default: 'This action cannot be undone.' },
  icon:         { type: String,  default: '⚠️' },
  confirmLabel: { type: String,  default: 'Confirm' },
  cancelLabel:  { type: String,  default: 'Cancel' },
  danger:       { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-overlay  { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:8000; display:flex; align-items:center; justify-content:center; padding:1rem; }
.modal-box      { background:#fff; border-radius:var(--border-radius-lg); box-shadow:var(--shadow-xl); padding:2rem; max-width:400px; width:100%; text-align:center; }
.modal-icon     { font-size:2.25rem; margin-bottom:0.75rem; line-height:1; }
.modal-title    { font-size:1.05rem; font-weight:800; color:var(--gray-900); margin-bottom:0.4rem; letter-spacing:-0.01em; }
.modal-msg      { font-size:0.875rem; color:var(--gray-500); line-height:1.5; margin-bottom:1.5rem; }
.modal-actions  { display:flex; gap:0.75rem; justify-content:center; }
</style>
