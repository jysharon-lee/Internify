import api from './api'
export const analyticsService = {
  summary:      ()      => api.get('/analytics/summary'),
  perWeek:      (weeks) => api.get('/analytics/applications-per-week', { params: { weeks } }),
  scoreByStage: ()      => api.get('/analytics/score-distribution'),
  fullReport:   ()      => api.get('/analytics/full-report'),
}