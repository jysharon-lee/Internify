export function useMatchScore() {
  function scoreColor(score) {
    if (score >= 85) return 'var(--score-excellent)'
    if (score >= 70) return 'var(--score-good)'
    if (score >= 50) return 'var(--score-fair)'
    return 'var(--score-low)'
  }
  function scoreLabel(score) {
    if (score >= 85) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Low'
  }
  function scoreBadgeClass(score) {
    if (score >= 85) return 'badge-success'
    if (score >= 70) return 'badge-primary'
    if (score >= 50) return 'badge-warning'
    return 'badge-danger'
  }
  return { scoreColor, scoreLabel, scoreBadgeClass }
}