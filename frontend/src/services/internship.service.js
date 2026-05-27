import api from './api'
export const internshipService = {
  list:      (params = {}) => api.get('/internships', { params }),
  detail:    (id)          => api.get(`/internships/${id}`),
  allSkills: ()            => api.get('/internships/skills'),
}