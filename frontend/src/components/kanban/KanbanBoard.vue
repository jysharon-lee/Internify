<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="stage in STAGES"
      :key="stage"
      :stage="stage"
      :cards="appStore.grouped[stage] || []"
      @drop-card="handleDrop"
      @open-app="openModal"
    />
  </div>

  <ApplicationModal
    :show="!!selectedApp"
    :app="selectedApp || {}"
    :saving="saving"
    @close="selectedApp = null"
    @save="handleSave"
    @remove="handleRemove"
  />

  <ConfirmModal
    :show="confirmDelete"
    title="Remove application?"
    message="This will permanently delete the application from your tracker."
    confirm-label="Remove"
    :danger="true"
    @confirm="confirmRemove"
    @cancel="confirmDelete = false"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useApplicationStore }  from '@/stores/application.store'
import { useNotificationStore } from '@/stores/notification.store'
import KanbanColumn     from './KanbanColumn.vue'
import ApplicationModal from './ApplicationModal.vue'
import ConfirmModal     from '@/components/common/ConfirmModal.vue'

const appStore   = useApplicationStore()
const notifStore = useNotificationStore()

const STAGES = ['saved', 'applied', 'interview', 'offer', 'rejected']

const selectedApp   = ref(null)
const saving        = ref(false)
const confirmDelete = ref(false)
const toRemove      = ref(null)

function openModal(app) {
  selectedApp.value = { ...app }
}

async function handleDrop({ appId, fromStage, toStage }) {
  try {
    await appStore.moveStage(appId, fromStage, toStage)
    notifStore.toast(`Moved to ${toStage}`, 'success', 2000)
  } catch {
    notifStore.toast('Could not move card', 'error')
  }
}

async function handleSave(fields) {
  if (!selectedApp.value) return
  saving.value = true
  try {
    const { id, stage: oldStage } = selectedApp.value
    // if stage changed, move first
    if (fields.stage !== oldStage) {
      await appStore.moveStage(id, oldStage, fields.stage)
    }
    // update remaining fields
    await appStore.updateApp(id, fields.stage, {
      notes:          fields.notes,
      interview_date: fields.interview_date || null,
      offer_amount:   fields.offer_amount   || null,
    })
    notifStore.toast('Application updated', 'success')
    selectedApp.value = null
  } catch {
    notifStore.toast('Could not save changes', 'error')
  } finally {
    saving.value = false
  }
}

function handleRemove(app) {
  toRemove.value = app
  confirmDelete.value = true
}

async function confirmRemove() {
  if (!toRemove.value) return
  confirmDelete.value = false
  try {
    await appStore.remove(toRemove.value.id, toRemove.value.stage)
    notifStore.toast('Application removed', 'info')
    selectedApp.value = null
  } catch {
    notifStore.toast('Could not remove application', 'error')
  } finally {
    toRemove.value = null
  }
}
</script>

<style scoped>
.kanban-board { display:flex; gap:0.875rem; align-items:flex-start; overflow-x:auto; padding-bottom:1rem; min-height:520px; }
</style>
