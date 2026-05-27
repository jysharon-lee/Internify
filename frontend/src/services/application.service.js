import api from './api'
export const applicationService = {
  list:   ()         => api.get('/applications'),
  detail: (id)       => api.get(`/applications/${id}`),
  create: (data)     => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id)       => api.delete(`/applications/${id}`),
}