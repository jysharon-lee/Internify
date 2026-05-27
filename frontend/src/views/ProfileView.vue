<template>
  <div class="profile">
    <div class="page-header">
      <h1>My Profile</h1>
      <p>Keep your profile up to date to get the best match scores.</p>
    </div>

    <!-- Tabs -->
    <div class="tab-bar">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- ─── Tab: Personal Info ─── -->
    <div v-if="activeTab === 'info'" class="card tab-card">
      <div class="profile-hero">
        <div class="avatar-circle">{{ initials }}</div>
        <div>
          <p class="hero-name">{{ authStore.fullName }}</p>
          <p class="hero-headline">{{ form.headline || 'No headline set' }}</p>
        </div>
      </div>
      <hr class="divider" />
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input v-model="form.full_name" class="form-control" placeholder="Your full name" />
        </div>
        <div class="form-group">
          <label class="form-label">Headline</label>
          <input v-model="form.headline" class="form-control" placeholder="e.g. CS Student passionate about web dev" />
        </div>
        <div class="form-group">
          <label class="form-label">Location</label>
          <input v-model="form.location" class="form-control" placeholder="e.g. Kuala Lumpur" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input v-model="form.phone" class="form-control" placeholder="+60 12-345 6789" />
        </div>
        <div class="form-group span-2">
          <label class="form-label">Bio</label>
          <textarea v-model="form.bio" class="form-control" rows="4" placeholder="A short intro about your background and interests…"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" :disabled="saving" @click="saveInfo">
          <span v-if="saving" class="spinner"></span>
          Save Changes
        </button>
      </div>
    </div>

    <!-- ─── Tab: Skills ─── -->
    <div v-else-if="activeTab === 'skills'" class="card tab-card">
      <div class="tab-header">
        <div>
          <h2 class="tab-heading">Your Skills</h2>
          <p class="text-sm text-muted">Select all skills you're comfortable with.</p>
        </div>
        <button class="btn btn-primary" :disabled="saving" @click="saveSkills">
          <span v-if="saving" class="spinner"></span>
          Save Skills
        </button>
      </div>
      <hr class="divider" />
      <SkillsEditor v-model="selectedSkills" />
    </div>

    <!-- ─── Tab: Preferences ─── -->
    <div v-else-if="activeTab === 'prefs'" class="card tab-card">
      <h2 class="tab-heading">Work Preferences</h2>
      <p class="text-sm text-muted" style="margin-bottom:1.5rem">We use these to rank internship matches for you.</p>

      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Preferred Work Type</label>
          <div class="type-grid">
            <button
              v-for="t in WORK_TYPES"
              :key="t.value"
              type="button"
              class="type-chip"
              :class="{ selected: form.preferred_type === t.value }"
              @click="form.preferred_type = t.value"
            >
              <span>{{ t.icon }}</span><span>{{ t.label }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Preferred Role</label>
          <input v-model="form.preferred_role" class="form-control" placeholder="e.g. Frontend Developer" />
        </div>
        <div class="form-group">
          <label class="form-label">Preferred Location</label>
          <input v-model="form.preferred_location" class="form-control" placeholder="e.g. Kuala Lumpur, Remote" />
        </div>
        <div class="form-group">
          <label class="form-label">Years of Experience: <strong>{{ form.years_experience }}</strong></label>
          <input v-model.number="form.years_experience" type="range" min="0" max="10" step="1" class="exp-slider" />
        </div>
        <div class="form-group">
          <label class="form-label">Expected Monthly Stipend (MYR)</label>
          <input v-model.number="form.expected_salary" type="number" class="form-control" placeholder="e.g. 2000" min="0" />
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" :disabled="saving" @click="savePrefs">
          <span v-if="saving" class="spinner"></span>
          Save Preferences
        </button>
      </div>
    </div>

    <!-- ─── Tab: Resume ─── -->
    <div v-else-if="activeTab === 'resume'" class="card tab-card">
      <h2 class="tab-heading">Resume</h2>
      <p class="text-sm text-muted" style="margin-bottom:1.5rem">Upload your latest resume. PDF, DOC, or DOCX — max 5 MB.</p>
      <ResumeUpload
        :current-url="authStore.user?.resume_url ? '/uploads/' + authStore.user.resume_url : ''"
        :uploading="uploading"
        @change="handleResumeFile"
      />
      <div class="form-actions" style="margin-top:1.25rem">
        <button class="btn btn-primary" :disabled="!pendingResume || uploading" @click="uploadResume">
          <span v-if="uploading" class="spinner"></span>
          {{ uploading ? 'Uploading…' : 'Upload Resume' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore }       from '@/stores/auth.store'
import { useNotificationStore } from '@/stores/notification.store'
import { userService }        from '@/services/user.service'
import SkillsEditor from '@/components/profile/SkillsEditor.vue'
import ResumeUpload from '@/components/profile/ResumeUpload.vue'

const authStore  = useAuthStore()
const notifStore = useNotificationStore()

const activeTab    = ref('info')
const saving       = ref(false)
const uploading    = ref(false)
const pendingResume = ref(null)

const TABS = [
  { key: 'info',   label: '👤 Personal Info' },
  { key: 'skills', label: '🛠 Skills' },
  { key: 'prefs',  label: '⚙️ Preferences' },
  { key: 'resume', label: '📄 Resume' },
]

const WORK_TYPES = [
  { value: 'any',       label: 'Any',       icon: '🌐' },
  { value: 'full-time', label: 'Full-time', icon: '🏢' },
  { value: 'remote',    label: 'Remote',    icon: '🏠' },
  { value: 'hybrid',    label: 'Hybrid',    icon: '🔀' },
  { value: 'part-time', label: 'Part-time', icon: '⏰' },
]

const form = ref({
  full_name: '', headline: '', bio: '', location: '', phone: '',
  years_experience: 0, preferred_role: '', preferred_type: 'any',
  preferred_location: '', expected_salary: null,
})

// Skills: [{ skill_id, proficiency, years_used }]
const selectedSkills = ref([])

const initials = computed(() =>
  (authStore.fullName || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
)

function populateForm(user) {
  if (!user) return
  form.value = {
    full_name:          user.full_name          || '',
    headline:           user.headline           || '',
    bio:                user.bio                || '',
    location:           user.location           || '',
    phone:              user.phone              || '',
    years_experience:   user.years_experience   || 0,
    preferred_role:     user.preferred_role     || '',
    preferred_type:     user.preferred_type     || 'any',
    preferred_location: user.preferred_location || '',
    expected_salary:    user.expected_salary    || null,
  }
  selectedSkills.value = (user.skills || []).map(s => ({
    skill_id:   s.skill_id || s.id,
    proficiency: s.proficiency || 'intermediate',
    years_used:  s.years_used  || 0,
  }))
}

async function saveInfo() {
  saving.value = true
  try {
    await authStore.updateProfile({
      full_name: form.value.full_name,
      headline:  form.value.headline,
      bio:       form.value.bio,
      location:  form.value.location,
      phone:     form.value.phone,
    })
    notifStore.toast('Personal info saved!', 'success')
  } catch (err) {
    notifStore.toast(err.message || 'Could not save', 'error')
  } finally {
    saving.value = false
  }
}

async function saveSkills() {
  saving.value = true
  try {
    await authStore.updateSkills(selectedSkills.value)
    notifStore.toast('Skills updated!', 'success')
  } catch (err) {
    notifStore.toast(err.message || 'Could not save skills', 'error')
  } finally {
    saving.value = false
  }
}

async function savePrefs() {
  saving.value = true
  try {
    await authStore.updateProfile({
      years_experience:   form.value.years_experience,
      preferred_role:     form.value.preferred_role,
      preferred_type:     form.value.preferred_type,
      preferred_location: form.value.preferred_location,
      expected_salary:    form.value.expected_salary,
    })
    notifStore.toast('Preferences saved!', 'success')
  } catch (err) {
    notifStore.toast(err.message || 'Could not save', 'error')
  } finally {
    saving.value = false
  }
}

function handleResumeFile(file) {
  pendingResume.value = file
}

async function uploadResume() {
  if (!pendingResume.value) return
  uploading.value = true
  try {
    await userService.uploadResume(pendingResume.value)
    await authStore.fetchMe()
    pendingResume.value = null
    notifStore.toast('Resume uploaded!', 'success')
  } catch (err) {
    notifStore.toast(err.message || 'Upload failed', 'error')
  } finally {
    uploading.value = false
  }
}

onMounted(async () => {
  const user = await authStore.fetchMe().catch(() => authStore.user)
  populateForm(user || authStore.user)
})
</script>

<style scoped>
.profile       { display:flex; flex-direction:column; gap:1.5rem; }
.tab-bar       { display:flex; gap:0.25rem; border-bottom:1px solid var(--gray-200); }
.tab-btn       { padding:0.6rem 1rem; font-size:0.875rem; font-weight:600; color:var(--gray-500); background:none; border:none; border-bottom:2px solid transparent; transition:var(--transition); cursor:pointer; margin-bottom:-1px; white-space:nowrap; }
.tab-btn:hover { color:var(--gray-800); }
.tab-btn.active{ color:var(--brand-primary); border-bottom-color:var(--brand-primary); }
.tab-card      { padding:1.75rem; }
.tab-header    { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
.tab-heading   { font-size:1rem; font-weight:700; color:var(--gray-900); }
.profile-hero  { display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem; }
.avatar-circle { width:56px; height:56px; border-radius:999px; background:var(--brand-primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:800; flex-shrink:0; }
.hero-name     { font-size:1.05rem; font-weight:800; color:var(--gray-900); }
.hero-headline { font-size:0.875rem; color:var(--gray-500); margin-top:2px; }
.form-grid     { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.form-group    { display:flex; flex-direction:column; }
.span-2        { grid-column:span 2; }
.form-actions  { display:flex; justify-content:flex-end; margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--gray-100); }
.exp-slider    { width:100%; accent-color:var(--brand-primary); margin-top:0.5rem; }
.type-grid     { display:grid; grid-template-columns:repeat(5,1fr); gap:0.5rem; margin-top:0.375rem; }
.type-chip     { display:flex; flex-direction:column; align-items:center; gap:0.25rem; padding:0.6rem 0.25rem; border-radius:var(--border-radius-sm); border:1.5px solid var(--gray-200); background:#fff; font-size:0.75rem; font-weight:500; color:var(--gray-600); cursor:pointer; transition:var(--transition); }
.type-chip:hover   { border-color:var(--brand-primary); }
.type-chip.selected{ border-color:var(--brand-primary); background:var(--brand-primary-light); color:var(--brand-primary); }
@media(max-width:700px){ .form-grid{ grid-template-columns:1fr; } .span-2{ grid-column:span 1; } .type-grid{ grid-template-columns:repeat(3,1fr); } }
</style>
