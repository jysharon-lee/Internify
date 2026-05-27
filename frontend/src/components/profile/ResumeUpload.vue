<template>
  <div
    class="resume-upload"
    :class="{ dragover, 'has-file': file }"
    @dragover.prevent="dragover = true"
    @dragleave="dragover = false"
    @drop.prevent="handleDrop"
  >
    <!-- No file state -->
    <div v-if="!file && !currentUrl" class="drop-content">
      <div class="drop-icon">📄</div>
      <p class="font-semibold text-sm">Drag &amp; drop your resume here</p>
      <p class="text-xs text-muted" style="margin:0.25rem 0 0.75rem">or</p>
      <label class="btn btn-outline btn-sm" style="cursor:pointer">
        Browse files
        <input type="file" accept=".pdf,.doc,.docx" @change="handleChange" style="display:none" />
      </label>
      <p class="text-xs text-muted" style="margin-top:0.75rem">PDF, DOC, DOCX — max 5 MB</p>
    </div>

    <!-- Existing resume (no new file chosen) -->
    <div v-else-if="!file && currentUrl" class="file-info">
      <span class="file-icon">📎</span>
      <div>
        <p class="font-semibold text-sm">Resume on file</p>
        <a :href="currentUrl" target="_blank" rel="noopener" class="text-xs text-primary">View current resume →</a>
      </div>
      <label class="btn btn-ghost btn-sm" style="cursor:pointer;margin-left:auto">
        Replace
        <input type="file" accept=".pdf,.doc,.docx" @change="handleChange" style="display:none" />
      </label>
    </div>

    <!-- New file chosen -->
    <div v-else class="file-info">
      <span class="file-icon">📎</span>
      <div>
        <p class="font-semibold text-sm">{{ file.name }}</p>
        <p class="text-xs text-muted">{{ (file.size / 1024).toFixed(0) }} KB — ready to upload</p>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" style="margin-left:auto" @click="clear">✕</button>
    </div>

    <!-- Upload progress -->
    <div v-if="uploading" class="upload-progress">
      <div class="spinner"></div>
      <span class="text-sm text-muted">Uploading…</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  currentUrl: { type: String, default: '' },
  uploading:  { type: Boolean, default: false },
})
const emit = defineEmits(['change'])

const dragover = ref(false)
const file     = ref(null)

function handleChange(e) {
  const f = e.target.files[0]
  if (f) { file.value = f; emit('change', f) }
}
function handleDrop(e) {
  dragover.value = false
  const f = e.dataTransfer.files[0]
  if (f) { file.value = f; emit('change', f) }
}
function clear() { file.value = null; emit('change', null) }
</script>

<style scoped>
.resume-upload   { border:2px dashed var(--gray-300); border-radius:var(--border-radius); padding:1.75rem; text-align:center; transition:var(--transition); background:#fff; }
.resume-upload.dragover { border-color:var(--brand-primary); background:var(--brand-primary-light); }
.resume-upload.has-file { border-style:solid; border-color:var(--success); }
.drop-content    { display:flex; flex-direction:column; align-items:center; gap:0.1rem; }
.drop-icon       { font-size:2.25rem; margin-bottom:0.5rem; line-height:1; }
.file-info       { display:flex; align-items:center; gap:0.875rem; text-align:left; }
.file-icon       { font-size:1.75rem; flex-shrink:0; }
.upload-progress { display:flex; align-items:center; gap:0.75rem; justify-content:center; margin-top:1rem; }
</style>
