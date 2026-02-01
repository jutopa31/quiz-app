import type { QuestionOption } from '../../types/quiz'

interface OptionButtonProps {
  option: QuestionOption
  isSelected: boolean
  isCorrect?: boolean
  isWrong?: boolean
  onClick: () => void
  disabled?: boolean
}

export function OptionButton({
  option,
  isSelected,
  isCorrect,
  isWrong,
  onClick,
  disabled
}: OptionButtonProps) {
  let bgClass = 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
  let textClass = 'text-gray-700'

  if (isSelected && !isCorrect && !isWrong) {
    bgClass = 'bg-emerald-50 border-emerald-500'
    textClass = 'text-emerald-700'
  }

  if (isCorrect) {
    bgClass = 'bg-emerald-100 border-emerald-500'
    textClass = 'text-emerald-800'
  }

  if (isWrong) {
    bgClass = 'bg-red-100 border-red-500'
    textClass = 'text-red-800'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${bgClass} ${textClass} ${
        disabled ? 'cursor-default' : 'active:scale-[0.98]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isSelected
              ? isCorrect
                ? 'border-emerald-500 bg-emerald-500'
                : isWrong
                ? 'border-red-500 bg-red-500'
                : 'border-emerald-500 bg-emerald-500'
              : isCorrect
              ? 'border-emerald-500 bg-emerald-500'
              : 'border-gray-300'
          }`}
        >
          {(isSelected || isCorrect) && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="font-medium">{option.text}</span>
      </div>
    </button>
  )
}
