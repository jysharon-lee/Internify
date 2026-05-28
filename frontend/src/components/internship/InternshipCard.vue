<template>
  <div class="internship-card" @click="$emit('click')" tabindex="0" @keydown.enter.prevent="$emit('click')">
    <div class="card-top">
      <div class="company-info">
        <img :src="internship.logo_url || fallbackLogo" :alt="internship.company_name + ' logo'" class="company-logo" @error="$event.target.src = fallbackLogo" />
        <div>
          <p class="company-name">{{ internship.company_name }}</p>
          <p class="text-xs text-muted">{{ internship.industry }}</p>
        </div>
      </div>
      <MatchScoreBadge v-if="internship.match" :score="internship.match.score" size="sm" />
    </div>
    <h3 class="card-title">{{ internship.title }}</h3>
    <div class="card-meta">
      <span class="meta-chip">📍 {{ internship.location }}</span>
      <span class="meta-chip" :class="`type-${internship.work_type}`">{{ workTypeLabel(internship.work_type) }}</span>
      <span class="meta-chip">⏱ {{ internship.duration_months }}mo</span>
      <span v-if="internship.stipend_min" class="meta-chip">💰 MYR {{ internship.stipend_min }}–{{ internship.stipend_max }}/mo</span>
    </div>
    <div class="card-skills" v-if="requiredSkills.length">
      <span v-for="skill in requiredSkills.slice(0,4)" :key="skill.skill_id" class="skill-tag" :class="isMatched(skill) ? 'matched' : ''">{{ skill.name }}</span>
      <span v-if="requiredSkills.length > 4" class="skill-tag" style="opacity:0.6">+{{ requiredSkills.length - 4 }} more</span>
    </div>
    <div class="card-footer">
      <span v-if="internship.application_deadline" class="text-xs" :class="isUrgent ? 'text-danger font-semibold' : 'text-muted'">
        {{ isUrgent ? '⚠️ ' : '📅 ' }}{{ deadlineText }}
      </span>
      <div class="card-actions">
        <template v-if="isApplied">
          <button class="btn btn-sm" :class="`stage-btn-${applicationStage}`" @click.stop>{{ stageLabel }}</button>
        </template>
        <template v-else>
          <button class="btn btn-primary btn-sm" @click.stop="$emit('apply-now', internship)" title="Apply & open company site" :aria-label="'Apply to ' + internship.title">Apply</button>
          <button class="btn btn-outline btn-sm" @click.stop="$emit('apply', internship)" title="Save for later" :aria-label="'Save ' + internship.title">Save</button>
        </template>
      </div>
    </div>
    <div v-if="internship.match?.explanation" class="match-hint text-xs text-muted">
      {{ internship.match.explanation.slice(0, 90) }}{{ internship.match.explanation.length > 90 ? '…' : '' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MatchScoreBadge from './MatchScoreBadge.vue'
import { useApplicationStore } from '@/stores/application.store'
const props = defineProps({ internship: { type: Object, required: true } })
defineEmits(['click','apply','apply-now'])
const appStore = useApplicationStore()
const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(props.internship.company_name||'C')}&background=4F46E5&color=fff&size=48`
const requiredSkills  = computed(() => (props.internship.skills||[]).filter(s => s.is_required))
const matchedSkillIds = computed(() => new Set((props.internship.match?.matchedSkills||[]).map(n=>n)))
function isMatched(skill) { return matchedSkillIds.value.has(skill.name) }
const isApplied        = computed(() => appStore.isApplied(props.internship.id))
const applicationStage = computed(() => appStore.getApplication(props.internship.id)?.stage||'saved')
const STAGE_LABELS = { saved:'🔖 Saved', applied:'📤 Applied', interview:'🗣 Interview', offer:'🎉 Offer', rejected:'✗ Rejected' }
const stageLabel = computed(() => STAGE_LABELS[applicationStage.value]||applicationStage.value)
function workTypeLabel(type) { return {'full-time':'🏢 Full-time','part-time':'⏰ Part-time','remote':'🏠 Remote','hybrid':'🔀 Hybrid'}[type]||type }
const deadlineDays = computed(() => { if (!props.internship.application_deadline) return null; return Math.ceil((new Date(props.internship.application_deadline)-new Date())/86400000) })
const isUrgent     = computed(() => deadlineDays.value !== null && deadlineDays.value <= 7)
const deadlineText = computed(() => { if (deadlineDays.value===null) return ''; if (deadlineDays.value<=0) return 'Deadline passed'; if (deadlineDays.value===1) return '1 day left'; if (deadlineDays.value<=7) return `${deadlineDays.value} days left`; return `Deadline: ${new Date(props.internship.application_deadline).toLocaleDateString('en-MY',{month:'short',day:'numeric'})}` })
</script>

<style scoped>
.internship-card { background:var(--surface); border:1px solid var(--gray-200); border-radius:var(--border-radius); padding:1.25rem; cursor:pointer; transition:var(--transition); display:flex; flex-direction:column; gap:0.75rem; }
.internship-card:hover { border-color:var(--brand-primary); box-shadow:var(--shadow-md); transform:translateY(-2px); }
.card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:0.75rem; }
.company-info { display:flex; align-items:center; gap:0.6rem; min-width:0; }
.company-logo { width:36px; height:36px; border-radius:8px; border:1px solid var(--gray-100); object-fit:contain; flex-shrink:0; background:var(--gray-50); }
.company-name { font-size:0.82rem; font-weight:600; color:var(--gray-700); line-height:1.2; }
.card-title { font-size:0.975rem; font-weight:700; color:var(--gray-900); line-height:1.3; letter-spacing:-0.01em; }
.card-meta { display:flex; flex-wrap:wrap; gap:0.4rem; }
.meta-chip { font-size:0.72rem; font-weight:500; padding:0.2rem 0.55rem; background:var(--gray-100); color:var(--gray-600); border-radius:999px; white-space:nowrap; }
.meta-chip.type-remote { background:#ECFDF5; color:var(--success); } .meta-chip.type-hybrid { background:#EFF6FF; color:var(--info); }
.card-skills { display:flex; flex-wrap:wrap; gap:0.35rem; }
.card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:auto; }
.card-actions { display:flex; gap:0.35rem; }
.stage-btn-saved { background:#EEF2FF; color:var(--stage-saved); border-color:transparent; }
.stage-btn-applied { background:#EFF6FF; color:var(--stage-applied); border-color:transparent; }
.stage-btn-interview { background:#FFFBEB; color:var(--stage-interview); border-color:transparent; }
.stage-btn-offer { background:#ECFDF5; color:var(--stage-offer); border-color:transparent; }
.match-hint { padding-top:0.5rem; border-top:1px dashed var(--gray-100); line-height:1.4; font-style:italic; }
</style>