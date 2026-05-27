import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { internshipService } from '@/services/internship.service'

export const useInternshipStore = defineStore('internship', () => {
  const internships = ref([])
  const current     = ref(null)
  const allSkills   = ref([])
  const loading     = ref(false)
  const error       = ref(null)
  const meta        = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const filters     = ref({ search: '', work_type: 'all', location: '' })

  const skillsByCategory = computed(() => {
    const map = {}
    for (const sk of allSkills.value) {
      if (!map[sk.category]) map[sk.category] = []
      map[sk.category].push(sk)
    }
    return map
  })

  async function fetchAll(params = {}) {
    loading.value = true; error.value = null
    try {
      const res = await internshipService.list({ ...filters.value, ...params })
      internships.value = res.data; meta.value = res.meta
    } catch (err) { error.value = err.message }
    finally { loading.value = false }
  }

  async function fetchOne(id) {
    loading.value = true; error.value = null
    try { const res = await internshipService.detail(id); current.value = res.data; return res.data }
    catch (err) { error.value = err.message; throw err }
    finally { loading.value = false }
  }

  async function fetchSkills() {
    if (allSkills.value.length > 0) return
    const res = await internshipService.allSkills()
    allSkills.value = res.data
  }

  function setFilter(key, value) { filters.value[key] = value }
  function resetFilters() { filters.value = { search: '', work_type: 'all', location: '' } }

  return { internships, current, allSkills, loading, error, meta, filters, skillsByCategory, fetchAll, fetchOne, fetchSkills, setFilter, resetFilters }
})