<template>
  <div class="skills-editor">
    <!-- Search -->
    <input
      v-model="search"
      class="form-control"
      placeholder="Search skills (e.g. Vue.js, Python…)"
    />

    <!-- Category groups -->
    <div v-if="internshipStore.loading" class="loading-center" style="padding:1.5rem">
      <div class="spinner"></div>
    </div>
    <div v-else class="category-list">
      <div
        v-for="(cats, category) in filteredByCategory"
        :key="category"
        class="skill-category"
      >
        <p class="section-title" style="text-transform:capitalize">{{ category }}</p>
        <div class="skill-grid">
          <button
            v-for="skill in cats"
            :key="skill.id"
            type="button"
            class="skill-chip"
            :class="{ selected: isSelected(skill.id) }"
            @click="toggle(skill)"
          >
            {{ skill.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Selected summary -->
    <div v-if="selected.length" class="selected-bar">
      <span class="text-sm font-semibold text-primary">{{ selected.length }} skill{{ selected.length !== 1 ? 's' : '' }} selected</span>
      <button type="button" class="btn btn-ghost btn-sm" @click="$emit('update:modelValue', [])">Clear all</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInternshipStore } from '@/stores/internship.store'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }, // [{ skill_id, proficiency, years_used }]
})
const emit = defineEmits(['update:modelValue'])

const internshipStore = useInternshipStore()
const search = ref('')

const selected = computed(() => props.modelValue)

function isSelected(id) {
  return selected.value.some(s => s.skill_id === id)
}

function toggle(skill) {
  const idx = selected.value.findIndex(s => s.skill_id === skill.id)
  if (idx >= 0) {
    const next = [...selected.value]
    next.splice(idx, 1)
    emit('update:modelValue', next)
  } else {
    emit('update:modelValue', [...selected.value, { skill_id: skill.id, proficiency: 'intermediate', years_used: 0 }])
  }
}

const filteredByCategory = computed(() => {
  const q = search.value.toLowerCase().trim()
  const map = {}
  for (const [cat, skills] of Object.entries(internshipStore.skillsByCategory)) {
    const filtered = q ? skills.filter(s => s.name.toLowerCase().includes(q)) : skills
    if (filtered.length) map[cat] = filtered
  }
  return map
})

onMounted(() => internshipStore.fetchSkills())
</script>

<style scoped>
.skills-editor   { display:flex; flex-direction:column; gap:1rem; }
.category-list   { display:flex; flex-direction:column; gap:1.25rem; max-height:320px; overflow-y:auto; padding-right:0.25rem; }
.skill-grid      { display:flex; flex-wrap:wrap; gap:0.45rem; margin-top:0.5rem; }
.skill-chip      { padding:0.3rem 0.875rem; border-radius:999px; border:1.5px solid var(--gray-200); background:#fff; font-size:0.82rem; font-weight:500; color:var(--gray-600); transition:var(--transition); cursor:pointer; }
.skill-chip:hover { border-color:var(--brand-primary); color:var(--brand-primary); }
.skill-chip.selected { background:var(--brand-primary); border-color:var(--brand-primary); color:#fff; }
.selected-bar    { display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.875rem; background:var(--brand-primary-light); border-radius:var(--border-radius-sm); }
</style>
