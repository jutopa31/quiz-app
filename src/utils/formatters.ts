export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (remainingSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainingSeconds}s`
}

export function formatPercentage(score: number, total: number): number {
  if (total === 0) return 0
  return Math.round((score / total) * 100)
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-emerald-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-emerald-100'
  if (percentage >= 60) return 'bg-yellow-100'
  return 'bg-red-100'
}
