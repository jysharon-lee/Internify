import api from './api'
export const userService = {
  getProfile:    ()     => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  updateSkills:  (skills) => api.put('/user/skills', { skills }),
  uploadResume:  (file) => {
    const form = new FormData()
    form.append('resume', file)
    return api.post('/user/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}