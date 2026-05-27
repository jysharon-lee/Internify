<template>
  <div class="bar-chart">
    <div class="chart-area">
      <div class="y-axis">
        <span v-for="tick in yTicks" :key="tick">{{ tick }}</span>
      </div>
      <div class="bars-wrap">
        <div v-for="(item, i) in data" :key="i" class="bar-col">
          <div class="bar-outer" :title="`${item.label}: ${item.value}`">
            <div
              class="bar-fill"
              :style="{ height: barHeight(item.value) + '%', background: barColor }"
            ></div>
          </div>
          <span class="bar-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data:     { type: Array,  default: () => [] }, // [{ label, value }]
  barColor: { type: String, default: 'var(--brand-primary)' },
  maxVal:   { type: Number, default: 0 },
})

const maxValue = computed(() => props.maxVal || Math.max(...props.data.map(d => d.value), 1))

const yTicks = computed(() => {
  const m = maxValue.value
  const step = Math.ceil(m / 4)
  const ticks = []
  for (let i = 4; i >= 0; i--) ticks.push(i * step)
  return ticks
})

function barHeight(val) {
  return Math.round((val / maxValue.value) * 100)
}
</script>

<style scoped>
.bar-chart   { width:100%; }
.chart-area  { display:flex; gap:0.5rem; align-items:stretch; height:180px; }
.y-axis      { display:flex; flex-direction:column; justify-content:space-between; padding-bottom:1.5rem; }
.y-axis span { font-size:0.68rem; color:var(--gray-400); text-align:right; line-height:1; min-width:24px; }
.bars-wrap   { flex:1; display:flex; align-items:flex-end; gap:0.4rem; border-left:1px solid var(--gray-200); border-bottom:1px solid var(--gray-200); padding:0 0.25rem; }
.bar-col     { flex:1; display:flex; flex-direction:column; align-items:center; gap:0.3rem; height:100%; }
.bar-outer   { flex:1; width:100%; display:flex; align-items:flex-end; cursor:default; }
.bar-fill    { width:100%; border-radius:4px 4px 0 0; min-height:2px; transition:height 0.5s cubic-bezier(0.4,0,0.2,1); }
.bar-label   { font-size:0.65rem; color:var(--gray-400); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; text-align:center; }
</style>
