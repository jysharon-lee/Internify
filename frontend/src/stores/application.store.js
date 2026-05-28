import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { applicationService } from '@/services/application.service'

const STAGES = ['saved', 'applied', 'interview', 'offer', 'rejected']

export const useApplicationStore = defineStore('application', () => {
  const grouped = ref({ saved: [], applied: [], interview: [], offer: [], rejected: [] })
  const loading = ref(false)
  const error   = ref(null)

  const totalCount  = computed(() => STAGES.reduce((s, stage) => s + (grouped.value[stage]?.length || 0), 0))
  const activeCount = computed(() => ['applied','interview','offer'].reduce((s, stage) => s + (grouped.value[stage]?.length || 0), 0))

  async function fetchAll() {
    loading.value = true
    try { const res = await applicationService.list(); grouped.value = res.data }
    catch (err) { error.value = err.message }
    finally { loading.value = false }
  }

  async function save(internshipId, data = {}) {
    const res = await applicationService.create({ internship_id: internshipId, ...data })
    grouped.value.saved.unshift(res.data)
    return res.data
  }

  async function apply(internshipId, data = {}) {
    const res = await applicationService.create({ internship_id: internshipId, stage: 'applied', ...data })
    grouped.value.applied.unshift(res.data)
    return res.data
  }

  async function moveStage(appId, fromStage, toStage) {
    const fromList = grouped.value[fromStage]
    const idx = fromList.findIndex(a => a.id === appId)
    if (idx === -1) return
    const app = { ...fromList[idx] }
    fromList.splice(idx, 1)
    grouped.value[toStage].unshift({ ...app, stage: toStage })
    try { await applicationService.update(appId, { stage: toStage }) }
    catch (err) { grouped.value[toStage].shift(); fromList.splice(idx, 0, app); error.value = err.message; throw err }
  }

  async function updateApp(appId, stage, fields) {
    const res = await applicationService.update(appId, fields)
    const list = grouped.value[stage]
    const idx  = list.findIndex(a => a.id === appId)
    if (idx !== -1) list.splice(idx, 1, res.data)
    return res.data
  }

  async function remove(appId, stage) {
    await applicationService.delete(appId)
    const list = grouped.value[stage]
    const idx  = list.findIndex(a => a.id === appId)
    if (idx !== -1) list.splice(idx, 1)
  }

  function isApplied(internshipId) {
    return STAGES.some(s => grouped.value[s]?.some(a => a.internship_id === internshipId))
  }
  function getApplication(internshipId) {
    for (const stage of STAGES) { const app = grouped.value[stage]?.find(a => a.internship_id === internshipId); if (app) return app }
    return null
  }

  return { grouped, loading, error, totalCount, activeCount, fetchAll, save, apply, moveStage, updateApp, remove, isApplied, getApplication }
})