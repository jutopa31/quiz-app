import { formatPercentage, getScoreColor, getScoreBgColor } from '../../utils/formatters'

interface ScoreBadgeProps {
  score: number
  total: number
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ score, total, size = 'md' }: ScoreBadgeProps) {
  const percentage = formatPercentage(score, total)
  const colorClass = getScoreColor(percentage)
  const bgClass = getScoreBgColor(percentage)

  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl'
  }

  return (
    <div
      className={`${sizes[size]} ${bgClass} rounded-full flex items-center justify-center font-bold ${colorClass}`}
    >
      {percentage}%
    </div>
  )
}
