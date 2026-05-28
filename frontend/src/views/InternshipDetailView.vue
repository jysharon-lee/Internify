<template>
  <div class="detail-page">
    <!-- Back -->
    <button class="btn btn-ghost btn-sm back-btn" @click="router.back()">← Back</button>

    <LoadingSpinner v-if="internshipStore.loading" label="Loading internship…" />

    <div v-else-if="!job" class="card" style="padding:3rem;text-align:center">
      <p class="text-muted">Internship not found.</p>
      <RouterLink to="/discover" class="btn btn-primary btn-sm" style="margin-top:1rem">Browse all →</RouterLink>
    </div>

    <div v-else class="detail-layout">
      <!-- Main content -->
      <div class="detail-main">
        <!-- Company + title -->
        <div class="card detail-header">
          <div class="dh-top">
            <img
              :src="job.logo_url || fallbackLogo"
              :alt="job.company_name + ' logo'"
              class="dh-logo"
              @error="$event.target.src = fallbackLogo"
            />
            <div class="dh-info">
              <p class="dh-company">{{ job.company_name }}</p>
              <h1 class="dh-title">{{ job.title }}</h1>
              <div class="dh-meta">
                <span class="meta-chip">📍 {{ job.location }}</span>
                <span class="meta-chip" :class="`type-${job.work_type}`">{{ WORK_LABELS[job.work_type] || job.work_type }}</span>
                <span class="meta-chip">⏱ {{ job.duration_months }} months</span>
                <span v-if="job.stipend_min" class="meta-chip">💰 MYR {{ job.stipend_min }}–{{ job.stipend_max }}/mo</span>
                <span v-if="job.application_deadline" class="meta-chip" :class="isUrgent ? 'chip-urgent' : ''">
                  {{ isUrgent ? '⚠️' : '📅' }} {{ deadlineText }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="card detail-section">
          <h2 class="ds-title">About this role</h2>
          <p class="ds-text">{{ job.description }}</p>
        </div>

        <!-- Responsibilities -->
        <div v-if="job.responsibilities" class="card detail-section">
          <h2 class="ds-title">Responsibilities</h2>
          <p class="ds-text">{{ job.responsibilities }}</p>
        </div>

        <!-- Requirements -->
        <div v-if="job.requirements" class="card detail-section">
          <h2 class="ds-title">Requirements</h2>
          <p class="ds-text">{{ job.requirements }}</p>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="detail-aside">
        <!-- Match score + apply -->
        <div class="card apply-card">
          <div v-if="job.match" class="match-section">
            <MatchScoreBadge :score="job.match.score" size="lg" />
            <div>
              <p class="font-semibold" :style="{ color: scoreColor(job.match.score) }">{{ scoreLabel(job.match.score) }} Match</p>
              <p class="text-xs text-muted">{{ job.match.explanation }}</p>
            </div>
          </div>

          <hr class="divider" />

          <div v-if="isApplied">
            <p class="text-sm text-muted" style="margin-bottom:0.5rem">Already in your tracker as:</p>
            <span class="stage-badge" :class="applicationStage">{{ STAGE_LABELS[applicationStage] }}</span>
            <div class="apply-actions" style="margin-top:0.875rem">
              <RouterLink to="/tracker" class="btn btn-outline btn-block">Open Tracker →</RouterLink>
              <a v-if="job.website" :href="job.website" target="_blank" rel="noopener" class="btn btn-ghost btn-block btn-sm" style="margin-top:0.5rem">🌐 Visit Company</a>
            </div>
          </div>
          <div v-else class="apply-actions">
            <button class="btn btn-primary btn-block btn-lg" :disabled="applying" @click="applyNow">
              <span v-if="applying" class="spinner"></span>
              🚀 Apply Now
            </button>
            <p class="text-xs text-muted" style="text-align:center;margin-top:0.25rem">Opens company page & marks as "Applied"</p>
            <hr class="divider" />
            <button class="btn btn-outline btn-block" :disabled="saving" @click="saveApp">
              <span v-if="saving" class="spinner"></span>
              🔖 Save for Later
            </button>
            <p class="text-xs text-muted" style="text-align:center;margin-top:0.25rem">Saves to "Saved" stage in your tracker</p>
          </div>
        </div>

        <!-- Skill match breakdown -->
        <div v-if="job.match" class="card" style="padding:1.25rem">
          <h2 class="ds-title" style="margin-bottom:1rem">Skill Breakdown</h2>
          <SkillMatchList
            :matched-skills="job.match.matchedSkills"
            :missing-skills="job.match.missingSkills"
            :nice-to-have-skills="job.match.niceToHaveSkills"
            :breakdown="{ skillScore: job.match.score }"
          />
        </div>

        <!-- Company info -->
        <div class="card" style="padding:1.25rem">
          <h2 class="ds-title" style="margin-bottom:0.75rem">About {{ job.company_name }}</h2>
          <p v-if="job.industry" class="text-sm text-muted">🏭 {{ job.industry }}</p>
          <p v-if="job.company_size" class="text-sm text-muted">👥 {{ job.company_size }}</p>
          <a v-if="job.website" :href="job.website" target="_blank" rel="noopener" class="text-sm text-primary" style="margin-top:0.5rem;display:block">
            🌐 {{ job.website }}
          </a>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useInternshipStore }   from '@/stores/internship.store'
import { useApplicationStore }  from '@/stores/application.store'
import { useNotificationStore } from '@/stores/notification.store'
import { useMatchScore }        from '@/composables/useMatchScore'
import MatchScoreBadge from '@/components/internship/MatchScoreBadge.vue'
import SkillMatchList  from '@/components/internship/SkillMatchList.vue'
import LoadingSpinner  from '@/components/common/LoadingSpinner.vue'

const route           = useRoute()
const router          = useRouter()
const internshipStore = useInternshipStore()
const appStore        = useApplicationStore()
const notifStore      = useNotificationStore()
const { scoreColor, scoreLabel } = useMatchScore()

const saving   = ref(false)
const applying = ref(false)
const job = computed(() => internshipStore.current)

const WORK_LABELS  = { 'full-time':'🏢 Full-time', 'part-time':'⏰ Part-time', remote:'🏠 Remote', hybrid:'🔀 Hybrid' }
const STAGE_LABELS = { saved:'🔖 Saved', applied:'📤 Applied', interview:'🗣 Interview', offer:'🎉 Offer', rejected:'✗ Rejected' }

const fallbackLogo = computed(() =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(job.value?.company_name || 'C')}&background=4F46E5&color=fff&size=64`
)

const isApplied        = computed(() => appStore.isApplied(job.value?.id))
const applicationStage = computed(() => appStore.getApplication(job.value?.id)?.stage || 'saved')

const deadlineDays = computed(() => {
  if (!job.value?.application_deadline) return null
  return Math.ceil((new Date(job.value.application_deadline) - new Date()) / 86400000)
})
const isUrgent    = computed(() => deadlineDays.value !== null && deadlineDays.value <= 7)
const deadlineText = computed(() => {
  if (deadlineDays.value === null) return ''
  if (deadlineDays.value <= 0)     return 'Deadline passed'
  if (deadlineDays.value === 1)    return '1 day left'
  if (deadlineDays.value <= 7)     return `${deadlineDays.value} days left`
  return `Deadline: ${new Date(job.value.application_deadline).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}`
})

async function saveApp() {
  saving.value = true
  try {
    await appStore.save(job.value.id)
    notifStore.toast(`Saved "${job.value.title}" to tracker`, 'success')
  } catch (err) {
    notifStore.toast(err.message || 'Could not save', 'error')
  } finally {
    saving.value = false
  }
}

async function applyNow() {
  applying.value = true
  try {
    // 1. Open company website in new tab
    const url = job.value.website
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    // 2. Create application as 'applied'
    await appStore.apply(job.value.id)
    notifStore.toast(`Applied to "${job.value.title}" — moved to Applied in tracker`, 'success')
  } catch (err) {
    notifStore.toast(err.message || 'Could not apply', 'error')
  } finally {
    applying.value = false
  }
}

onMounted(() => internshipStore.fetchOne(route.params.id))
</script>

<style scoped>
.detail-page   { display:flex; flex-direction:column; gap:1.25rem; }
.back-btn      { align-self:flex-start; }
.detail-layout { display:grid; grid-template-columns:1fr 320px; gap:1.5rem; align-items:start; }
.detail-main   { display:flex; flex-direction:column; gap:1rem; }
.detail-aside  { display:flex; flex-direction:column; gap:1rem; position:sticky; top:calc(var(--navbar-height) + 1rem); }
.detail-header { padding:1.5rem; }
.dh-top        { display:flex; gap:1rem; align-items:flex-start; }
.dh-logo       { width:56px; height:56px; border-radius:12px; object-fit:contain; border:1px solid var(--gray-100); background:var(--gray-50); flex-shrink:0; }
.dh-info       { flex:1; min-width:0; }
.dh-company    { font-size:0.82rem; font-weight:600; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.04em; }
.dh-title      { font-size:1.35rem; font-weight:800; color:var(--gray-900); letter-spacing:-0.02em; margin:0.2rem 0 0.75rem; }
.dh-meta       { display:flex; flex-wrap:wrap; gap:0.4rem; }
.meta-chip     { font-size:0.75rem; font-weight:500; padding:0.25rem 0.65rem; background:var(--gray-100); color:var(--gray-600); border-radius:999px; }
.meta-chip.type-remote { background:#ECFDF5; color:var(--success); }
.meta-chip.type-hybrid { background:#EFF6FF; color:var(--info); }
.chip-urgent   { background:#FEF2F2; color:var(--danger); }
.detail-section{ padding:1.25rem; }
.ds-title      { font-size:0.875rem; font-weight:700; color:var(--gray-700); margin-bottom:0.6rem; }
.ds-text       { font-size:0.9rem; color:var(--gray-600); line-height:1.7; white-space:pre-wrap; }
.apply-card    { padding:1.25rem; display:flex; flex-direction:column; gap:0.875rem; }
.match-section { display:flex; align-items:center; gap:1rem; }
@media(max-width:900px){ .detail-layout{ grid-template-columns:1fr; } .detail-aside{ position:static; } }
</style>
