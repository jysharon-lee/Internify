<template>
  <div class="match-badge" :class="`badge-${size}`" :title="`Match score: ${score}%`">
    <svg class="ring-svg" viewBox="0 0 36 36">
      <circle class="ring-bg" cx="18" cy="18" :r="radius" />
      <circle class="ring-fill" cx="18" cy="18" :r="radius" :stroke="color"
        :stroke-dasharray="`${circumference} ${circumference}`"
        :stroke-dashoffset="dashOffset" />
    </svg>
    <div class="badge-inner">
      <span class="badge-score">{{ score }}</span>
      <span class="badge-pct">%</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMatchScore } from '@/composables/useMatchScore'
const props = defineProps({ score: { type: Number, required: true }, size: { type: String, default: 'md' } })
const { scoreColor } = useMatchScore()
const radius = 15
const circumference = computed(() => 2 * Math.PI * radius)
const dashOffset = computed(() => circumference.value - (props.score / 100) * circumference.value)
const color = computed(() => scoreColor(props.score))
</script>

<style scoped>
.match-badge { position:relative; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
.ring-svg { width:100%; height:100%; transform:rotate(-90deg); position:absolute; top:0; left:0; }
.ring-bg { fill:none; stroke:var(--gray-200); stroke-width:2.5; }
.ring-fill { fill:none; stroke-width:2.5; stroke-linecap:round; transition:stroke-dashoffset 0.6s ease,stroke 0.3s ease; }
.badge-inner { display:flex; align-items:baseline; gap:1px; z-index:1; line-height:1; }
.badge-score { font-weight:800; line-height:1; font-family:var(--font-sans); }
.badge-pct { font-weight:600; opacity:0.75; }
.badge-sm { width:44px; height:44px; } .badge-sm .badge-score { font-size:0.78rem; } .badge-sm .badge-pct { font-size:0.55rem; }
.badge-md { width:58px; height:58px; } .badge-md .badge-score { font-size:1rem; }   .badge-md .badge-pct { font-size:0.62rem; }
.badge-lg { width:80px; height:80px; } .badge-lg .badge-score { font-size:1.35rem; } .badge-lg .badge-pct { font-size:0.75rem; }
</style>