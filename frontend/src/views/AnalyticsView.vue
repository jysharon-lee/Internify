<template>
  <div class="analytics">
    <div class="page-header">
      <h1>Analytics</h1>
      <p>Insights into your internship search progress.</p>
    </div>

    <LoadingSpinner v-if="loading" label="Loading analytics…" />

    <template v-else>
      <!-- KPI row -->
      <div class="kpi-grid">
        <div class="card kpi-card" v-for="k in kpis" :key="k.label">
          <p class="kpi-label">{{ k.label }}</p>
          <p class="kpi-value" :style="{ color: k.color || 'var(--gray-900)' }">{{ k.value }}</p>
          <p class="kpi-sub">{{ k.sub }}</p>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">
        <!-- Weekly applications bar chart -->
        <div class="card chart-card">
          <h2 class="chart-title">Applications per Week</h2>
          <BarChart :data="weeklyData" bar-color="var(--brand-primary)" />
        </div>

        <!-- Stage distribution donut -->
        <div class="card chart-card">
          <h2 class="chart-title">By Stage</h2>
          <DonutChart :data="stageData" :size="140" />
        </div>

        <!-- Score by stage bar chart -->
        <div class="card chart-card">
          <h2 class="chart-title">Avg Match Score by Stage</h2>
          <BarChart :data="scoreData" bar-color="var(--brand-secondary)" :max-val="100" />
        </div>
      </div>

      <!-- Empty state if no data -->
      <EmptyState
        v-if="!summary || (summary.totalApplications ?? summary.total_applications ?? 0) === 0"
        icon="📊"
        title="No data yet"
        message="Start applying to internships to see your analytics."
      >
        <RouterLink to="/discover" class="btn btn-primary btn-sm">Browse Internships</RouterLink>
      </EmptyState>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { analyticsService } from '@/services/analytics.service'
import { useApplicationStore } from '@/stores/application.store'
import BarChart       from '@/components/charts/BarChart.vue'
import DonutChart     from '@/components/charts/DonutChart.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState     from '@/components/common/EmptyState.vue'

const appStore = useApplicationStore()

const loading  = ref(false)
const summary  = ref(null)
const weekly   = ref([])
const scoreDist = ref([])

const STAGE_COLORS = {
  saved: 'var(--stage-saved)', applied: 'var(--stage-applied)',
  interview: 'var(--stage-interview)', offer: 'var(--stage-offer)',
  rejected: 'var(--stage-rejected)',
}

// KPI cards
const kpis = computed(() => {
  const s = summary.value
  if (!s) return []
  const total         = s.totalApplications ?? s.total_applications ?? 0
  const interviewCnt  = s.byStage?.interview ?? 0
  const offerCnt      = s.byStage?.offers ?? s.byStage?.offer ?? 0
  const interviewRate = total ? Math.round((interviewCnt / total) * 100) : 0
  const offerRate     = total ? Math.round((offerCnt / total) * 100) : 0

  // Compute avg match score from scoreByStage data
  let avgScore = null
  if (scoreDist.value.length > 0) {
    let totalScore = 0, totalCount = 0
    for (const r of scoreDist.value) {
      const sc = r.avgScore ?? r.avg_score ?? 0
      const ct = r.count ?? 0
      totalScore += sc * ct
      totalCount += ct
    }
    if (totalCount > 0) avgScore = Math.round(totalScore / totalCount)
  }

  return [
    { label: 'Total Applications', value: total, sub: 'all time', color: 'var(--brand-primary)' },
    { label: 'Interview Rate',     value: interviewRate + '%',  sub: 'of applications', color: 'var(--stage-interview)' },
    { label: 'Offer Rate',         value: offerRate + '%',      sub: 'of applications', color: 'var(--stage-offer)' },
    { label: 'Avg Match Score',    value: avgScore !== null ? avgScore + '%' : '—', sub: 'across saved roles' },
  ]
})

// Bar chart: weekly applications
const weeklyData = computed(() =>
  weekly.value.map(w => ({ label: w.week_label || w.week_start || w.week, value: w.count || 0 }))
)

// Donut: stage distribution — computed from store so it works offline
const stageData = computed(() => {
  const stages = ['saved', 'applied', 'interview', 'offer', 'rejected']
  return stages
    .map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: appStore.grouped[s]?.length || 0, color: STAGE_COLORS[s] }))
    .filter(s => s.value > 0)
})

// Bar chart: avg match score per stage from API
const scoreData = computed(() =>
  scoreDist.value.map(r => ({ label: r.stage, value: Math.round(r.avgScore ?? r.avg_score ?? 0) }))
)

async function load() {
  loading.value = true
  try {
    const [summaryRes, weeklyRes, scoreRes] = await Promise.allSettled([
      analyticsService.summary(),
      analyticsService.perWeek(8),
      analyticsService.scoreByStage(),
    ])
    if (summaryRes.status === 'fulfilled') summary.value  = summaryRes.value.data
    if (weeklyRes.status  === 'fulfilled') weekly.value   = weeklyRes.value.data  || []
    if (scoreRes.status   === 'fulfilled') scoreDist.value = scoreRes.value.data   || []
  } finally {
    loading.value = false
  }
}

onMounted(() => { load(); appStore.fetchAll() })
</script>

<style scoped>
.analytics    { display:flex; flex-direction:column; gap:1.75rem; }
.kpi-grid     { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
.kpi-card     { padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:0.2rem; }
.kpi-label    { font-size:0.78rem; font-weight:600; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.05em; }
.kpi-value    { font-size:1.75rem; font-weight:800; letter-spacing:-0.02em; line-height:1; }
.kpi-sub      { font-size:0.72rem; color:var(--gray-400); }
.charts-row   { display:grid; grid-template-columns:2fr 1fr 1fr; gap:1rem; align-items:start; }
.chart-card   { padding:1.25rem; }
.chart-title  { font-size:0.875rem; font-weight:700; color:var(--gray-700); margin-bottom:1.1rem; }
@media(max-width:1100px){ .kpi-grid{ grid-template-columns:repeat(2,1fr); } .charts-row{ grid-template-columns:1fr; } }
@media(max-width:600px) { .kpi-grid{ grid-template-columns:1fr; } }
</style>
