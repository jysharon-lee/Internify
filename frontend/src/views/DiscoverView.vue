<template>
  <div class="discover">
    <!-- Header + filters -->
    <div class="page-header">
      <h1>Discover Internships</h1>
      <p>Ranked by your skill match score — the best fits appear first.</p>
    </div>

    <div class="filter-bar">
      <input
        v-model="searchRaw"
        class="form-control search-input"
        placeholder="🔍  Search by title, company or skill…"
      />
      <div class="type-filters">
        <button
          v-for="t in WORK_TYPES"
          :key="t.value"
          class="type-btn"
          :class="{ active: internshipStore.filters.work_type === t.value }"
          @click="setType(t.value)"
        >{{ t.label }}</button>
      </div>
    </div>

    <!-- Results meta -->
    <div class="results-meta" v-if="!internshipStore.loading">
      <span class="text-sm text-muted">{{ internshipStore.internships.length }} internship{{ internshipStore.internships.length !== 1 ? 's' : '' }} found</span>
      <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm" @click="clearFilters">✕ Clear filters</button>
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="internshipStore.loading" label="Finding your best matches…" />

    <!-- Empty -->
    <EmptyState
      v-else-if="!internshipStore.internships.length"
      icon="🔍"
      title="No internships match your filters"
      message="Try adjusting your search or removing a filter."
    >
      <button class="btn btn-outline btn-sm" @click="clearFilters">Clear filters</button>
    </EmptyState>

    <!-- Grid -->
    <div v-else class="internship-grid">
      <InternshipCard
        v-for="item in internshipStore.internships"
        :key="item.id"
        :internship="item"
        @click="router.push({ name: 'internship-detail', params: { id: item.id } })"
        @apply="saveInternship(item)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="internshipStore.meta.totalPages > 1" class="pagination">
      <button
        class="btn btn-outline btn-sm"
        :disabled="internshipStore.meta.page <= 1"
        @click="changePage(internshipStore.meta.page - 1)"
      >← Prev</button>
      <span class="text-sm text-muted">
        Page {{ internshipStore.meta.page }} of {{ internshipStore.meta.totalPages }}
      </span>
      <button
        class="btn btn-outline btn-sm"
        :disabled="internshipStore.meta.page >= internshipStore.meta.totalPages"
        @click="changePage(internshipStore.meta.page + 1)"
      >Next →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInternshipStore }   from '@/stores/internship.store'
import { useApplicationStore }  from '@/stores/application.store'
import { useNotificationStore } from '@/stores/notification.store'
import { useDebounce }          from '@/composables/useDebounce'
import InternshipCard from '@/components/internship/InternshipCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState     from '@/components/common/EmptyState.vue'

const router          = useRouter()
const internshipStore = useInternshipStore()
const appStore        = useApplicationStore()
const notifStore      = useNotificationStore()

const WORK_TYPES = [
  { value: 'all',       label: 'All' },
  { value: 'hybrid',    label: '🔀 Hybrid' },
  { value: 'remote',    label: '🏠 Remote' },
  { value: 'full-time', label: '🏢 Full-time' },
  { value: 'part-time', label: '⏰ Part-time' },
]

const searchRaw  = ref(internshipStore.filters.search)
const debouncedQ = useDebounce(searchRaw)

const hasActiveFilters = computed(() =>
  internshipStore.filters.search || internshipStore.filters.work_type !== 'all'
)

watch(debouncedQ, (val) => {
  internshipStore.setFilter('search', val)
  internshipStore.fetchAll({ page: 1 })
})

function setType(val) {
  internshipStore.setFilter('work_type', val)
  internshipStore.fetchAll({ page: 1 })
}

function clearFilters() {
  searchRaw.value = ''
  internshipStore.resetFilters()
  internshipStore.fetchAll({ page: 1 })
}

function changePage(page) {
  internshipStore.fetchAll({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function saveInternship(item) {
  try {
    await appStore.save(item.id)
    notifStore.toast(`Saved "${item.title}"`, 'success')
  } catch (err) {
    notifStore.toast(err.message || 'Could not save', 'error')
  }
}

onMounted(() => internshipStore.fetchAll())
</script>

<style scoped>
.discover       { display:flex; flex-direction:column; gap:1.5rem; }
.filter-bar     { display:flex; flex-wrap:wrap; align-items:center; gap:0.75rem; }
.search-input   { flex:1; min-width:200px; max-width:420px; }
.type-filters   { display:flex; flex-wrap:wrap; gap:0.4rem; }
.type-btn       { padding:0.35rem 0.9rem; border-radius:999px; border:1.5px solid var(--gray-200); background:#fff; font-size:0.82rem; font-weight:500; color:var(--gray-600); cursor:pointer; transition:var(--transition); }
.type-btn:hover { border-color:var(--brand-primary); color:var(--brand-primary); }
.type-btn.active{ background:var(--brand-primary); border-color:var(--brand-primary); color:#fff; }
.results-meta   { display:flex; align-items:center; justify-content:space-between; }
.internship-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1rem; }
.pagination     { display:flex; align-items:center; justify-content:center; gap:1rem; margin-top:0.5rem; }
@media(max-width:600px){ .search-input{ max-width:100%; width:100%; } }
</style>
