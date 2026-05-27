<template>
  <div class="onboarding-wrap">
    <div class="onboarding-brand">
      <span class="logo-icon">✦</span>
      <span class="logo-text">Internify</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
    </div>
    <div class="step-indicators">
      <div v-for="(s, i) in steps" :key="i" class="step-dot" :class="{ active: i === currentStep, done: i < currentStep }">
        <span v-if="i < currentStep">✓</span><span v-else>{{ i + 1 }}</span>
      </div>
    </div>
    <div class="onboarding-card">
      <Transition name="slide-up" mode="out-in">
        <!-- Step 0: Basic Info -->
        <div v-if="currentStep === 0" key="0">
          <h2 class="step-title">Tell us about yourself</h2>
          <p class="step-subtitle">Help companies know who you are</p>
          <div class="step-form">
            <div class="form-group"><label class="form-label">Headline</label><input v-model="profile.headline" class="form-control" placeholder="e.g. CS Student passionate about web development" /></div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Location</label><input v-model="profile.location" class="form-control" placeholder="e.g. Kuala Lumpur" /></div>
              <div class="form-group"><label class="form-label">Phone</label><input v-model="profile.phone" class="form-control" placeholder="+60 12-345 6789" /></div>
            </div>
            <div class="form-group"><label class="form-label">Bio</label><textarea v-model="profile.bio" class="form-control" rows="3" placeholder="A short intro about your background and interests…"></textarea></div>
          </div>
        </div>
        <!-- Step 1: Skills -->
        <div v-else-if="currentStep === 1" key="1">
          <h2 class="step-title">What are your skills?</h2>
          <p class="step-subtitle">Select all skills you're comfortable with</p>
          <div v-if="internshipStore.loading" class="loading-center" style="padding:2rem"><div class="spinner"></div></div>
          <div v-else>
            <div v-for="(cats, category) in internshipStore.skillsByCategory" :key="category" class="skill-category">
              <p class="section-title" style="text-transform:capitalize">{{ category }}</p>
              <div class="skill-grid">
                <button v-for="skill in cats" :key="skill.id" type="button" class="skill-chip" :class="{ selected: isSkillSelected(skill.id) }" @click="toggleSkill(skill)">{{ skill.name }}</button>
              </div>
            </div>
          </div>
          <div v-if="selectedSkills.length" class="selected-bar"><span class="text-sm font-semibold text-primary">{{ selectedSkills.length }} skills selected</span></div>
        </div>
        <!-- Step 2: Experience -->
        <div v-else-if="currentStep === 2" key="2">
          <h2 class="step-title">Your experience</h2>
          <p class="step-subtitle">This helps us calculate your match score</p>
          <div class="step-form">
            <div class="form-group">
              <label class="form-label">Years of experience: <strong>{{ profile.years_experience }}</strong></label>
              <input v-model.number="profile.years_experience" type="range" min="0" max="5" step="1" class="exp-slider" />
              <div class="exp-labels"><span v-for="n in [0,1,2,3,4,5]" :key="n" :class="{ active: profile.years_experience === n }">{{ n }}yr</span></div>
            </div>
            <div class="form-group"><label class="form-label">Preferred Role</label><input v-model="profile.preferred_role" class="form-control" placeholder="e.g. Frontend Developer, Data Analyst" /></div>
          </div>
        </div>
        <!-- Step 3: Preferences -->
        <div v-else-if="currentStep === 3" key="3">
          <h2 class="step-title">Work preferences</h2>
          <p class="step-subtitle">We'll use this to rank internship matches</p>
          <div class="step-form">
            <div class="form-group">
              <label class="form-label">Preferred Work Type</label>
              <div class="type-grid">
                <button v-for="type in workTypes" :key="type.value" type="button" class="type-chip" :class="{ selected: profile.preferred_type === type.value }" @click="profile.preferred_type = type.value">
                  <span class="type-icon">{{ type.icon }}</span><span>{{ type.label }}</span>
                </button>
              </div>
            </div>
            <div class="form-group"><label class="form-label">Preferred Location</label><input v-model="profile.preferred_location" class="form-control" placeholder="e.g. Kuala Lumpur, Remote, Anywhere" /></div>
            <div class="form-group"><label class="form-label">Expected Monthly Stipend (MYR)</label><input v-model.number="profile.expected_salary" type="number" class="form-control" placeholder="e.g. 2000" min="0" /></div>
          </div>
        </div>
        <!-- Step 4: Resume -->
        <div v-else-if="currentStep === 4" key="4">
          <h2 class="step-title">Upload your resume</h2>
          <p class="step-subtitle">PDF, DOC or DOCX — max 5MB</p>
          <div class="resume-drop" :class="{ dragover }" @dragover.prevent="dragover=true" @dragleave="dragover=false" @drop.prevent="handleDrop">
            <div v-if="!uploadedFile">
              <div style="font-size:2.5rem;margin-bottom:.75rem">📄</div>
              <p class="font-semibold">Drag & drop your resume here</p>
              <p class="text-sm text-muted">or</p>
              <label class="btn btn-outline" style="cursor:pointer;margin-top:.5rem">
                Browse files
                <input type="file" accept=".pdf,.doc,.docx" @change="handleFileChange" style="display:none" />
              </label>
            </div>
            <div v-else class="uploaded-file">
              <span style="font-size:2rem">📎</span>
              <div><p class="font-semibold text-sm">{{ uploadedFile.name }}</p><p class="text-xs text-muted">{{ (uploadedFile.size/1024).toFixed(0) }} KB</p></div>
              <button type="button" class="btn btn-ghost btn-sm" @click="uploadedFile=null">✕ Remove</button>
            </div>
          </div>
          <p class="text-xs text-muted" style="text-align:center;margin-top:1rem">You can also skip this and add it later in your profile.</p>
        </div>
      </Transition>

      <div class="step-actions">
        <button v-if="currentStep > 0" class="btn btn-ghost" @click="prev">← Back</button>
        <button v-if="currentStep < steps.length - 1" class="btn btn-primary" :disabled="saving" @click="next">
          <span v-if="saving" class="spinner"></span> Continue →
        </button>
        <button v-else class="btn btn-primary" :disabled="saving" @click="finish">
          <span v-if="saving" class="spinner"></span> {{ saving ? 'Saving…' : '🎉 Finish Setup' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore }       from '@/stores/auth.store'
import { useInternshipStore } from '@/stores/internship.store'
import { useNotificationStore } from '@/stores/notification.store'
import { userService }        from '@/services/user.service'

const router          = useRouter()
const authStore       = useAuthStore()
const internshipStore = useInternshipStore()
const notifStore      = useNotificationStore()

const currentStep  = ref(0)
const saving       = ref(false)
const dragover     = ref(false)
const uploadedFile = ref(null)
const steps        = ['Basic Info', 'Skills', 'Experience', 'Preferences', 'Resume']
const progressPct  = computed(() => (currentStep.value / (steps.length - 1)) * 100)

const profile = ref({ headline:'', bio:'', location:'', phone:'', years_experience:0, preferred_role:'', preferred_type:'any', preferred_location:'', expected_salary:null })
const selectedSkills = ref([])
const workTypes = [
  { value:'any', label:'Any', icon:'🌐' }, { value:'full-time', label:'Full-time', icon:'🏢' },
  { value:'remote', label:'Remote', icon:'🏠' }, { value:'hybrid', label:'Hybrid', icon:'🔀' },
  { value:'part-time', label:'Part-time', icon:'⏰' },
]

function isSkillSelected(id) { return selectedSkills.value.some(s => s.skill_id === id) }
function toggleSkill(skill) {
  const idx = selectedSkills.value.findIndex(s => s.skill_id === skill.id)
  if (idx >= 0) selectedSkills.value.splice(idx, 1)
  else selectedSkills.value.push({ skill_id: skill.id, proficiency: 'intermediate', years_used: 0 })
}
function handleFileChange(e) { const f = e.target.files[0]; if (f) uploadedFile.value = f }
function handleDrop(e) { dragover.value = false; const f = e.dataTransfer.files[0]; if (f) uploadedFile.value = f }

async function saveCurrentStep() {
  saving.value = true
  try {
    if (currentStep.value === 0) await authStore.updateProfile({ ...profile.value, onboarding_step: 1 })
    else if (currentStep.value === 1) { await authStore.updateSkills(selectedSkills.value); await authStore.updateProfile({ onboarding_step: 2 }) }
    else if (currentStep.value === 2) await authStore.updateProfile({ years_experience: profile.value.years_experience, preferred_role: profile.value.preferred_role, onboarding_step: 3 })
    else if (currentStep.value === 3) await authStore.updateProfile({ preferred_type: profile.value.preferred_type, preferred_location: profile.value.preferred_location, expected_salary: profile.value.expected_salary, onboarding_step: 4 })
    else if (currentStep.value === 4 && uploadedFile.value) await userService.uploadResume(uploadedFile.value)
  } finally { saving.value = false }
}

async function next()   { await saveCurrentStep(); currentStep.value++; window.scrollTo(0,0) }
function prev()          { currentStep.value-- }
async function finish()  {
  await saveCurrentStep()
  await authStore.updateProfile({ onboarding_complete: true })
  notifStore.toast('Profile complete! Finding your matches… 🎯', 'success')
  router.push('/dashboard')
}

onMounted(() => internshipStore.fetchSkills())
</script>

<style scoped>
.onboarding-wrap { min-height:100vh; background:var(--gray-50); display:flex; flex-direction:column; align-items:center; padding:2rem 1rem 4rem; }
.onboarding-brand { display:flex; align-items:center; gap:0.5rem; margin-bottom:2rem; }
.logo-icon { font-size:1.4rem; color:var(--brand-primary); } .logo-text { font-size:1.4rem; font-weight:800; color:var(--gray-900); letter-spacing:-0.03em; }
.progress-track { width:100%; max-width:520px; height:4px; background:var(--gray-200); border-radius:999px; overflow:hidden; margin-bottom:1rem; }
.progress-fill { height:100%; background:var(--brand-primary); border-radius:999px; transition:width 0.4s ease; }
.step-indicators { display:flex; gap:0.75rem; margin-bottom:2rem; }
.step-dot { width:28px; height:28px; border-radius:999px; background:var(--gray-200); color:var(--gray-500); font-size:0.72rem; font-weight:700; display:flex; align-items:center; justify-content:center; transition:var(--transition); }
.step-dot.active { background:var(--brand-primary); color:#fff; } .step-dot.done { background:var(--success); color:#fff; }
.onboarding-card { background:#fff; border-radius:var(--border-radius-lg); border:1px solid var(--gray-200); box-shadow:var(--shadow-lg); padding:2.5rem; width:100%; max-width:520px; }
.step-title { font-size:1.35rem; font-weight:800; color:var(--gray-900); letter-spacing:-0.02em; }
.step-subtitle { font-size:0.875rem; color:var(--gray-500); margin-top:0.25rem; margin-bottom:1.75rem; }
.step-form { display:flex; flex-direction:column; gap:1rem; }
.form-group { display:flex; flex-direction:column; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
.skill-category { margin-bottom:1.25rem; }
.skill-grid { display:flex; flex-wrap:wrap; gap:0.5rem; }
.skill-chip { padding:0.3rem 0.85rem; border-radius:999px; border:1.5px solid var(--gray-200); background:#fff; font-size:0.82rem; font-weight:500; color:var(--gray-600); transition:var(--transition); cursor:pointer; }
.skill-chip:hover { border-color:var(--brand-primary); color:var(--brand-primary); }
.skill-chip.selected { background:var(--brand-primary); border-color:var(--brand-primary); color:#fff; }
.selected-bar { margin-top:1rem; padding:0.6rem 0.875rem; background:var(--brand-primary-light); border-radius:var(--border-radius-sm); }
.exp-slider { width:100%; accent-color:var(--brand-primary); margin-top:0.5rem; }
.exp-labels { display:flex; justify-content:space-between; margin-top:0.4rem; }
.exp-labels span { font-size:0.72rem; color:var(--gray-400); }
.exp-labels span.active { color:var(--brand-primary); font-weight:700; }
.type-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.6rem; }
.type-chip { display:flex; flex-direction:column; align-items:center; gap:0.3rem; padding:0.75rem 0.5rem; border-radius:var(--border-radius-sm); border:1.5px solid var(--gray-200); background:#fff; font-size:0.82rem; font-weight:500; color:var(--gray-600); cursor:pointer; transition:var(--transition); }
.type-chip:hover { border-color:var(--brand-primary); }
.type-chip.selected { border-color:var(--brand-primary); background:var(--brand-primary-light); color:var(--brand-primary); }
.type-icon { font-size:1.2rem; }
.resume-drop { border:2px dashed var(--gray-300); border-radius:var(--border-radius); padding:2rem; text-align:center; transition:var(--transition); }
.resume-drop.dragover { border-color:var(--brand-primary); background:var(--brand-primary-light); }
.uploaded-file { display:flex; align-items:center; gap:1rem; justify-content:center; }
.step-actions { display:flex; justify-content:flex-end; gap:0.75rem; margin-top:2rem; padding-top:1.25rem; border-top:1px solid var(--gray-100); }
</style>