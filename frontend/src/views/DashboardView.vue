<template>
  <div class="dashboard">
    <!-- Stats row -->
    <div class="stats-grid">
      <StatsCard icon="📋" label="Total Applications" :value="appStore.totalCount" sub="across all stages" />
      <StatsCard icon="🚀" label="Active" :value="appStore.activeCount" sub="applied + interview" bg-color="#ECFDF5" />
      <StatsCard icon="🗣" label="Interviews" :value="interviewCount" sub="scheduled" bg-color="#FFFBEB" />
      <StatsCard icon="⭐" label="Avg Match Score" :value="avgScore ? avgScore + '%' : '—'" sub="across saved roles" bg-color="#EFF6FF" />
    </div>

    <div class="dashboard-body">
      <!-- Top matches -->
      <section class="dash-section">
        <div class="section-header">
          <h2 class="section-heading">Top Matches</h2>
          <RouterLink to="/discover" class="btn btn-ghost btn-sm">View all →</RouterLink>
        </div>

        <LoadingSpinner v-if="internshipStore.loading" />

        <EmptyState
          v-else-if="!topMatches.length"
          icon="🔍"
          title="No internships found"
          message="Complete your profile so we can calculate your match scores."
        >
          <RouterLink to="/profile" class="btn btn-primary btn-sm">Go to Profile</RouterLink>
        </EmptyState>

        <div v-else class="matches-list">
          <InternshipCard
            v-for="item in topMatches"
            :key="item.id"
            :internship="item"
            @click="router.push({ name: 'internship-detail', params: { id: item.id } })"
            @apply="saveInternship(item)"
          />
        </div>
      </section>

      <!-- Activity feed -->
      <aside class="dash-aside">
        <div class="section-header">
          <h2 class="section-heading">Recent Activity</h2>
          <button v-if="notifStore.unreadCount" class="btn btn-ghost btn-sm" @click="notifStore.markAllRead()">Mark all read</button>
        </div>
        <div class="card" style="overflow:hidden">
          <ActivityFeed :items="notifStore.notifications.slice(0, 8)" />
        </div>

        <!-- Quick links -->
        <div class="quick-links">
          <RouterLink to="/discover" class="quick-link">
            <span>🔍</span><span>Browse Internships</span>
          </RouterLink>
          <RouterLink to="/tracker" class="quick-link">
            <span>📋</span><span>View Tracker</span>
          </RouterLink>
          <RouterLink to="/analytics" class="quick-link">
            <span>📊</span><span>See Analytics</span>
          </RouterLink>
          <RouterLink to="/profile" class="quick-link">
            <span>👤</span><span>Edit Profile</span>
          </RouterLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useInternshipStore }   from '@/stores/internship.store'
import { useApplicationStore }  from '@/stores/application.store'
import { useNotificationStore } from '@/stores/notification.store'
import StatsCard    from '@/components/dashboard/StatsCard.vue'
import ActivityFeed from '@/components/dashboard/ActivityFeed.vue'
import InternshipCard from '@/components/internship/InternshipCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState     from '@/components/common/EmptyState.vue'

const router          = useRouter()
const internshipStore = useInternshipStore()
const appStore        = useApplicationStore()
const notifStore      = useNotificationStore()

const topMatches = computed(() =>
  [...internshipStore.internships]
    .filter(i => i.match?.score != null)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3)
)

const interviewCount = computed(() => appStore.grouped.interview?.length || 0)

const avgScore = computed(() => {
  const all = Object.values(appStore.grouped).flat().filter(a => a.match_score != null)
  if (!all.length) return null
  return Math.round(all.reduce((s, a) => s + a.match_score, 0) / all.length)
})

async function saveInternship(item) {
  try {
    await appStore.save(item.id)
    notifStore.toast(`Saved "${item.title}" to tracker`, 'success')
  } catch (err) {
    notifStore.toast(err.message || 'Could not save', 'error')
  }
}

onMounted(() => {
  internshipStore.fetchAll()
  notifStore.seedDemo()
})
</script>

<style scoped>
.dashboard     { display:flex; flex-direction:column; gap:2rem; }
.stats-grid    { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
.dashboard-body{ display:grid; grid-template-columns:1fr 320px; gap:1.75rem; align-items:start; }
.dash-section  { display:flex; flex-direction:column; gap:1rem; }
.dash-aside    { display:flex; flex-direction:column; gap:1rem; }
.section-header{ display:flex; align-items:center; justify-content:space-between; }
.section-heading{ font-size:1rem; font-weight:700; color:var(--gray-900); }
.matches-list  { display:flex; flex-direction:column; gap:0.75rem; }
.quick-links   { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; }
.quick-link    { display:flex; align-items:center; gap:0.5rem; padding:0.75rem; background:var(--surface); border:1px solid var(--gray-200); border-radius:var(--border-radius-sm); font-size:0.82rem; font-weight:600; color:var(--gray-700); transition:var(--transition); text-decoration:none; }
.quick-link:hover { border-color:var(--brand-primary); color:var(--brand-primary); background:var(--brand-primary-light); }
@media(max-width:1100px){ .stats-grid{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:900px) { .dashboard-body{ grid-template-columns:1fr; } }
@media(max-width:600px) { .stats-grid{ grid-template-columns:1fr; } }
</style>
