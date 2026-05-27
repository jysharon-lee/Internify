<template>
  <div class="donut-chart">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="donut-svg">
      <circle
        v-if="!total"
        :cx="cx" :cy="cy" :r="radius"
        fill="none" :stroke="emptyColor" :stroke-width="strokeWidth"
      />
      <circle
        v-for="(seg, i) in segments" :key="i"
        :cx="cx" :cy="cy" :r="radius"
        fill="none" :stroke="seg.color" :stroke-width="strokeWidth"
        :stroke-dasharray="seg.dash" :stroke-dashoffset="seg.offset"
        stroke-linecap="butt"
        style="transform-origin:center;transform:rotate(-90deg)"
      />
      <text :x="cx" :y="cy" text-anchor="middle" dominant-baseline="central" class="donut-total">
        {{ total }}
      </text>
    </svg>
    <div class="donut-legend">
      <div v-for="(item, i) in data" :key="i" class="legend-row">
        <span class="legend-dot" :style="{ background: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-val">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:        { type: Array,  default: () => [] }, // [{ label, value, color }]
  size:        { type: Number, default: 130 },
  strokeWidth: { type: Number, default: 18 },
  emptyColor:  { type: String, default: 'var(--gray-100)' },
})

const cx     = computed(() => props.size / 2)
const cy     = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circ   = computed(() => 2 * Math.PI * radius.value)
const total  = computed(() => props.data.reduce((s, d) => s + (d.value || 0), 0))

const segments = computed(() => {
  if (!total.value) return []
  let offset = 0
  return props.data.map(item => {
    const pct  = item.value / total.value
    const dash = `${pct * circ.value} ${circ.value}`
    const seg  = { color: item.color, dash, offset: circ.value - offset }
    offset += pct * circ.value
    return seg
  })
})
</script>

<style scoped>
.donut-chart  { display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; }
.donut-svg    { flex-shrink:0; overflow:visible; }
.donut-total  { font-size:1.1rem; font-weight:800; fill:var(--gray-800); font-family:var(--font-sans); }
.donut-legend { display:flex; flex-direction:column; gap:0.45rem; }
.legend-row   { display:flex; align-items:center; gap:0.5rem; }
.legend-dot   { width:10px; height:10px; border-radius:999px; flex-shrink:0; }
.legend-label { font-size:0.78rem; color:var(--gray-600); flex:1; }
.legend-val   { font-size:0.78rem; font-weight:700; color:var(--gray-800); }
</style>
