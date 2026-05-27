<template>
  <div class="skill-match-list">
    <div class="score-bar-wrap">
      <div class="score-bar-labels">
        <span class="text-sm font-semibold">Skill Match</span>
        <span class="text-sm font-semibold" :style="{ color: scoreColor(breakdown?.skillScore || 0) }">{{ breakdown?.skillScore || 0 }}%</span>
      </div>
      <div class="score-bar"><div class="score-bar-fill" :style="{ width: (breakdown?.skillScore || 0) + '%', background: scoreColor(breakdown?.skillScore || 0) }"></div></div>
    </div>
    <div v-if="matchedSkills?.length" class="skill-section">
      <p class="skill-section-label matched">✅ Skills you have ({{ matchedSkills.length }})</p>
      <div class="skill-tags"><span v-for="skill in matchedSkills" :key="skill" class="skill-tag matched">{{ skill }}</span></div>
    </div>
    <div v-if="missingSkills?.length" class="skill-section">
      <p class="skill-section-label missing">❌ Missing required skills ({{ missingSkills.length }})</p>
      <div class="skill-tags"><span v-for="skill in missingSkills" :key="skill" class="skill-tag missing">{{ skill }}</span></div>
    </div>
    <div v-if="niceToHaveSkills?.length" class="skill-section">
      <p class="skill-section-label bonus">⭐ Bonus skills you have</p>
      <div class="skill-tags"><span v-for="skill in niceToHaveSkills" :key="skill" class="skill-tag">{{ skill }}</span></div>
    </div>
    <div v-if="!matchedSkills?.length && !missingSkills?.length" class="empty-state" style="padding:1rem"><p class="text-sm text-muted">No skill data available.</p></div>
  </div>
</template>

<script setup>
import { useMatchScore } from '@/composables/useMatchScore'
defineProps({ matchedSkills: { type: Array, default: () => [] }, missingSkills: { type: Array, default: () => [] }, niceToHaveSkills: { type: Array, default: () => [] }, breakdown: { type: Object, default: null } })
const { scoreColor } = useMatchScore()
</script>

<style scoped>
.skill-match-list { display:flex; flex-direction:column; gap:1.1rem; }
.score-bar-wrap { display:flex; flex-direction:column; gap:0.4rem; }
.score-bar-labels { display:flex; justify-content:space-between; }
.score-bar { height:8px; background:var(--gray-100); border-radius:999px; overflow:hidden; }
.score-bar-fill { height:100%; border-radius:999px; transition:width 0.6s ease; }
.skill-section { display:flex; flex-direction:column; gap:0.5rem; }
.skill-section-label { font-size:0.78rem; font-weight:600; }
.skill-section-label.matched { color:var(--success); } .skill-section-label.missing { color:var(--danger); } .skill-section-label.bonus { color:var(--brand-primary); }
.skill-tags { display:flex; flex-wrap:wrap; gap:0.4rem; }
</style>